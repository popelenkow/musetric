import { type CpuMarker } from '../../common/timer/index.js';
import { type ExtPipelineConfig } from '../pipeline.js';

type Config = Pick<
  ExtPipelineConfig,
  'windowSize' | 'windowCount' | 'zeroPaddingFactor' | 'minDecibel'
>;

export const decibelify = (
  signal: Float32Array<ArrayBuffer>,
  config: Config,
): void => {
  const { windowSize, windowCount, zeroPaddingFactor, minDecibel } = config;
  const paddedWindowSize = windowSize * zeroPaddingFactor;
  const halfSize = paddedWindowSize / 2;

  const epsilon = 1e-12;
  const decibelFactor = (20 * Math.LOG10E) / -minDecibel;

  for (let windowIndex = 0; windowIndex < windowCount; windowIndex++) {
    const windowOffset = windowIndex * halfSize;
    let maxMagnitude = Math.sqrt(halfSize);
    for (let i = 0; i < halfSize; i++) {
      const amplitude = signal[windowOffset + i];
      if (amplitude > maxMagnitude) maxMagnitude = amplitude;
    }

    const inverseMax = 1 / maxMagnitude;
    for (let i = 0; i < halfSize; i++) {
      const idx = windowOffset + i;
      const magnitude = signal[idx] * inverseMax + epsilon;
      const decibel = Math.log(magnitude) * decibelFactor + 1;
      signal[idx] = decibel > 0 ? decibel : 0;
    }
  }
};

export type Decibelify = {
  run: (signal: Float32Array<ArrayBuffer>) => void;
  configure: (config: Config) => void;
};
export const createDecibelify = (marker?: CpuMarker): Decibelify => {
  // eslint-disable-next-line @typescript-eslint/init-declarations
  let config: Config;

  const ref: Decibelify = {
    run: (signal) => decibelify(signal, config),
    configure: (newConfig) => {
      config = newConfig;
    },
  };
  ref.run = marker?.(ref.run) ?? ref.run;
  return ref;
};
