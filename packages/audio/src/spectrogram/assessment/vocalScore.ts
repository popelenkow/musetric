import {
  emptySpectrogramAssessmentScore,
  type SpectrogramAssessmentFrame,
  type SpectrogramAssessmentScore,
  type SpectrogramAssessmentTone,
} from './report.cross.js';

const centFactor = 1200;
const hitCentThreshold = 25;
const nearCentThreshold = 50;
const missCentLimit = 200;

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.max(minimum, Math.min(maximum, value));

const toPercent = (value: number) => Math.round(clamp(value, 0, 1) * 100);

export const getCents = (recordingFrequency: number, targetFrequency: number) =>
  centFactor * Math.log2(recordingFrequency / targetFrequency);

export const getAssessmentTone = (
  targetFrequency: number | undefined,
  recordingFrequency: number | undefined,
  cents: number | undefined,
): SpectrogramAssessmentTone => {
  if (targetFrequency === undefined && recordingFrequency === undefined) {
    return 'rest';
  }

  if (targetFrequency === undefined) {
    return 'extra';
  }

  if (recordingFrequency === undefined || cents === undefined) {
    return 'missing';
  }

  const absoluteCents = Math.abs(cents);
  if (absoluteCents <= hitCentThreshold) {
    return 'hit';
  }

  if (absoluteCents <= nearCentThreshold) {
    return 'near';
  }

  return 'miss';
};

const getPitchFrameScore = (frame: SpectrogramAssessmentFrame) => {
  if (frame.targetFrequency === undefined) {
    return undefined;
  }

  if (frame.recordingFrequency === undefined || frame.cents === undefined) {
    return 0;
  }

  const absoluteCents = Math.abs(frame.cents);
  if (absoluteCents <= hitCentThreshold) {
    return 1;
  }

  if (absoluteCents <= nearCentThreshold) {
    return 0.75 + ((nearCentThreshold - absoluteCents) / 25) * 0.25;
  }

  return clamp(
    0.75 -
      ((absoluteCents - nearCentThreshold) /
        (missCentLimit - nearCentThreshold)) *
        0.75,
    0,
    0.75,
  );
};

const getTimingFrameScore = (frame: SpectrogramAssessmentFrame) => {
  const targetActive = frame.targetFrequency !== undefined;
  const recordingActive = frame.recordingFrequency !== undefined;
  if (!targetActive && !recordingActive) {
    return undefined;
  }

  return targetActive === recordingActive ? 1 : 0;
};

const average = (sum: number, count: number) => (count > 0 ? sum / count : 0);

export const calculateAssessmentScore = (
  frames: SpectrogramAssessmentFrame[],
): SpectrogramAssessmentScore => {
  let pitchSum = 0;
  let pitchCount = 0;
  let timingSum = 0;
  let timingCount = 0;
  let stabilitySum = 0;
  let stabilityCount = 0;
  let vibratoSum = 0;
  let vibratoCount = 0;
  let previousComparedFrame: SpectrogramAssessmentFrame | undefined = undefined;

  for (const frame of frames) {
    const pitchScore = getPitchFrameScore(frame);
    if (pitchScore !== undefined) {
      pitchSum += pitchScore;
      pitchCount += 1;
    }

    const timingScore = getTimingFrameScore(frame);
    if (timingScore !== undefined) {
      timingSum += timingScore;
      timingCount += 1;
    }

    if (
      frame.targetFrequency !== undefined &&
      frame.recordingFrequency !== undefined &&
      frame.cents !== undefined
    ) {
      if (
        previousComparedFrame?.targetFrequency !== undefined &&
        previousComparedFrame.recordingFrequency !== undefined &&
        previousComparedFrame.cents !== undefined
      ) {
        const centsChange = Math.abs(frame.cents - previousComparedFrame.cents);
        stabilitySum += 1 - clamp(centsChange / 80, 0, 1);
        stabilityCount += 1;

        const targetChange = getCents(
          frame.targetFrequency,
          previousComparedFrame.targetFrequency,
        );
        const recordingChange = getCents(
          frame.recordingFrequency,
          previousComparedFrame.recordingFrequency,
        );
        vibratoSum +=
          1 - clamp(Math.abs(recordingChange - targetChange) / 120, 0, 1);
        vibratoCount += 1;
      }

      previousComparedFrame = frame;
    }
  }

  if (pitchCount === 0 && timingCount === 0) {
    return emptySpectrogramAssessmentScore;
  }

  const pitch = average(pitchSum, pitchCount);
  const timing = average(timingSum, timingCount);
  const stability =
    stabilityCount > 0 ? average(stabilitySum, stabilityCount) : pitch;
  const vibrato =
    vibratoCount > 0 ? average(vibratoSum, vibratoCount) : stability;
  const overall =
    pitch * 0.45 + timing * 0.25 + stability * 0.15 + vibrato * 0.15;

  return {
    overall: toPercent(overall),
    pitch: toPercent(pitch),
    timing: toPercent(timing),
    stability: toPercent(stability),
    vibrato: toPercent(vibrato),
    processedFrameCount: frames.length,
  };
};
