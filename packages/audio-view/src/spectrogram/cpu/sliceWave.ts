import { type CpuMarker } from '../../common/timer/index.js';
import { type ExtPipelineConfig } from '../pipeline.js';

type Config = Pick<
  ExtPipelineConfig,
  | 'windowSize'
  | 'windowCount'
  | 'sampleRate'
  | 'visibleTimeBefore'
  | 'visibleTimeAfter'
  | 'zeroPaddingFactor'
>;

export const sliceWave = (
  wave: Float32Array,
  signal: Float32Array<ArrayBuffer>,
  progress: number,
  config: Config,
): void => {
  const {
    windowSize,
    windowCount,
    sampleRate,
    visibleTimeBefore,
    visibleTimeAfter,
    zeroPaddingFactor,
  } = config;
  const paddedWindowSize = windowSize * zeroPaddingFactor;

  const beforeSamples = visibleTimeBefore * sampleRate + windowSize;
  const afterSamples = visibleTimeAfter * sampleRate;
  const visibleSamples = beforeSamples + afterSamples;

  const startOffset = progress * wave.length - beforeSamples;
  const step = (visibleSamples - windowSize) / (windowCount - 1);

  for (let i = 0; i < windowCount; i++) {
    const windowOffset = i * paddedWindowSize;
    const start = Math.floor(startOffset + i * step);
    const end = start + windowSize;

    signal.fill(0, windowOffset + windowSize, windowOffset + paddedWindowSize);
    if (start >= 0 && end < wave.length) {
      const slice = wave.subarray(start, end);
      signal.set(slice, windowOffset);
      continue;
    }
    for (let j = 0; j < windowSize; j++) {
      const index = start + j;
      const value = index >= 0 && index < wave.length ? wave[index] : 0;
      signal[windowOffset + j] = value;
    }
  }
};

export type SliceWave = {
  run: (
    wave: Float32Array,
    waves: Float32Array<ArrayBuffer>,
    progress: number,
  ) => void;
  configure: (config: Config) => void;
};
export const createSliceWave = (marker?: CpuMarker): SliceWave => {
  // eslint-disable-next-line @typescript-eslint/init-declarations
  let config: Config;

  const ref: SliceWave = {
    run: (wave, signal, progress) => {
      sliceWave(wave, signal, progress, config);
    },
    configure: (newConfig) => {
      config = newConfig;
    },
  };
  ref.run = marker?.(ref.run) ?? ref.run;
  return ref;
};
