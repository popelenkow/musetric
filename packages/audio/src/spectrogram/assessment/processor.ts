import { detectPitch, type PitchDetection } from './pitchDetection.js';
import type {
  SpectrogramAssessmentFrame,
  SpectrogramAssessmentPatch,
} from './report.cross.js';
import {
  calculateAssessmentScore,
  getAssessmentTone,
  getCents,
} from './vocalScore.js';

export type VocalAssessmentProcessor = {
  mount: (options: VocalAssessmentMountOptions) => void;
  patchRecording: (options: VocalAssessmentRecordingPatch) => void;
  reset: () => void;
};

export type VocalAssessmentMountOptions = {
  leadSamples: Float32Array<SharedArrayBuffer>;
  recordingSamples?: Float32Array<SharedArrayBuffer>;
  sampleRate: number;
};

export type VocalAssessmentRecordingPatch = {
  frameIndex: number;
  samples: Float32Array<ArrayBuffer>;
};

export type CreateVocalAssessmentProcessorOptions = {
  onPatch: (patch: SpectrogramAssessmentPatch) => void;
};

const hopFrameCount = 2048;
const detectionWindowFrameCount = 6144;
const initialScanBatchFrameCount = 12;
const activeSampleThreshold = 0.004;

const getDetectionFrequency = (detection: PitchDetection) =>
  detection.frequency;

const createAssessmentFrame = (
  frameIndex: number,
  targetDetection: PitchDetection,
  recordingDetection: PitchDetection,
): SpectrogramAssessmentFrame => {
  const targetFrequency = getDetectionFrequency(targetDetection);
  const recordingFrequency = getDetectionFrequency(recordingDetection);
  const cents =
    targetFrequency !== undefined && recordingFrequency !== undefined
      ? getCents(recordingFrequency, targetFrequency)
      : undefined;

  return {
    frameIndex,
    targetFrequency,
    recordingFrequency,
    cents,
    targetEnergy: targetDetection.energy,
    recordingEnergy: recordingDetection.energy,
    targetConfidence: targetDetection.confidence,
    recordingConfidence: recordingDetection.confidence,
    tone: getAssessmentTone(targetFrequency, recordingFrequency, cents),
  };
};

const getFirstActiveFrameIndex = (samples: Float32Array) => {
  for (let index = 0; index < samples.length; index += 1) {
    if (Math.abs(samples[index] ?? 0) >= activeSampleThreshold) {
      return index;
    }
  }

  return undefined;
};

const getLastActiveFrameIndex = (samples: Float32Array) => {
  for (let index = samples.length - 1; index >= 0; index -= 1) {
    if (Math.abs(samples[index] ?? 0) >= activeSampleThreshold) {
      return index;
    }
  }

  return undefined;
};

const getFrameRange = (frameIndex: number, frameCount: number) => {
  const start = Math.max(
    0,
    Math.floor((frameIndex - detectionWindowFrameCount) / hopFrameCount) *
      hopFrameCount,
  );
  const end = Math.max(
    start,
    Math.ceil(
      (frameIndex + frameCount + detectionWindowFrameCount) / hopFrameCount,
    ) * hopFrameCount,
  );
  return {
    start,
    end,
  };
};

export const createVocalAssessmentProcessor = (
  options: CreateVocalAssessmentProcessorOptions,
): VocalAssessmentProcessor => {
  const { onPatch } = options;
  const frames: SpectrogramAssessmentFrame[] = [];
  const frameIndexes = new Map<number, number>();
  const targetDetections = new Map<number, PitchDetection>();
  let leadSamples: Float32Array<SharedArrayBuffer> | undefined = undefined;
  let recordingSamples: Float32Array<SharedArrayBuffer> | undefined = undefined;
  let sampleRate = 0;
  let revision = 0;
  let initialScanGeneration = 0;

  const emitPatch = (
    changedFrames: SpectrogramAssessmentFrame[],
    reset?: true,
  ) => {
    revision += 1;
    onPatch({
      revision,
      frames: changedFrames,
      score: calculateAssessmentScore(frames),
      reset,
    });
  };

  const clear = () => {
    frames.splice(0, frames.length);
    frameIndexes.clear();
    targetDetections.clear();
    initialScanGeneration += 1;
  };

  const getTargetDetection = (centerFrameIndex: number) => {
    const cached = targetDetections.get(centerFrameIndex);
    if (cached) {
      return cached;
    }

    if (!leadSamples) {
      return {
        confidence: 0,
        energy: 0,
      };
    }

    const detection = detectPitch({
      samples: leadSamples,
      centerFrameIndex,
      sampleRate,
    });
    targetDetections.set(centerFrameIndex, detection);
    return detection;
  };

  const upsertFrame = (frame: SpectrogramAssessmentFrame) => {
    const existingIndex = frameIndexes.get(frame.frameIndex);
    if (existingIndex !== undefined) {
      frames[existingIndex] = frame;
      return;
    }

    frameIndexes.set(frame.frameIndex, frames.length);
    frames.push(frame);
  };

  const sortFrames = () => {
    frames.sort((a, b) => a.frameIndex - b.frameIndex);
    frameIndexes.clear();
    for (let index = 0; index < frames.length; index += 1) {
      const frame = frames[index];
      frameIndexes.set(frame.frameIndex, index);
    }
  };

  const processFrame = (centerFrameIndex: number) => {
    const currentRecordingSamples = recordingSamples;
    if (!currentRecordingSamples) {
      return undefined;
    }

    const targetDetection = getTargetDetection(centerFrameIndex);
    const recordingDetection = detectPitch({
      samples: currentRecordingSamples,
      centerFrameIndex,
      sampleRate,
    });
    const frame = createAssessmentFrame(
      centerFrameIndex,
      targetDetection,
      recordingDetection,
    );
    upsertFrame(frame);
    return frame;
  };

  const processRange = (start: number, end: number) => {
    const changedFrames: SpectrogramAssessmentFrame[] = [];
    for (
      let centerFrameIndex = start;
      centerFrameIndex <= end;
      centerFrameIndex += hopFrameCount
    ) {
      const frame = processFrame(centerFrameIndex);
      if (frame) {
        changedFrames.push(frame);
      }
    }
    if (changedFrames.length > 0) {
      sortFrames();
    }
    return changedFrames;
  };

  const scanInitialRecording = (
    generation: number,
    start: number,
    end: number,
  ) => {
    if (generation !== initialScanGeneration) {
      return;
    }

    const nextEnd = Math.min(
      end,
      start + hopFrameCount * (initialScanBatchFrameCount - 1),
    );
    const changedFrames = processRange(start, nextEnd);
    if (changedFrames.length > 0) {
      emitPatch(changedFrames);
    }

    const nextStart = nextEnd + hopFrameCount;
    if (nextStart <= end) {
      setTimeout(() => {
        scanInitialRecording(generation, nextStart, end);
      });
    }
  };

  const startInitialScan = () => {
    const currentRecordingSamples = recordingSamples;
    if (!currentRecordingSamples) {
      return;
    }

    const firstFrameIndex = getFirstActiveFrameIndex(currentRecordingSamples);
    const lastFrameIndex = getLastActiveFrameIndex(currentRecordingSamples);
    if (firstFrameIndex === undefined || lastFrameIndex === undefined) {
      return;
    }

    const range = getFrameRange(
      firstFrameIndex,
      lastFrameIndex - firstFrameIndex,
    );
    const generation = initialScanGeneration;
    setTimeout(() => {
      scanInitialRecording(generation, range.start, range.end);
    });
  };

  return {
    mount: (mountOptions) => {
      clear();
      leadSamples = mountOptions.leadSamples;
      recordingSamples = mountOptions.recordingSamples;
      sampleRate = mountOptions.sampleRate;
      emitPatch([], true);
      startInitialScan();
    },
    patchRecording: (patch) => {
      const currentRecordingSamples = recordingSamples;
      if (!currentRecordingSamples || patch.frameIndex < 0) {
        return;
      }

      if (patch.frameIndex < currentRecordingSamples.length) {
        currentRecordingSamples.set(
          patch.samples.subarray(
            0,
            currentRecordingSamples.length - patch.frameIndex,
          ),
          patch.frameIndex,
        );
      }

      const range = getFrameRange(patch.frameIndex, patch.samples.length);
      const changedFrames = processRange(range.start, range.end);
      if (changedFrames.length > 0) {
        emitPatch(changedFrames);
      }
    },
    reset: () => {
      clear();
      leadSamples = undefined;
      recordingSamples = undefined;
      sampleRate = 0;
      emitPatch([], true);
    },
  };
};
