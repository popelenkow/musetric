import { type ComplexArray } from '../../common/complexArray.js';
import { type CpuMarker } from '../../common/timer/index.js';
import { type ExtPipelineConfig } from '../pipeline.js';

type Config = Pick<
  ExtPipelineConfig,
  'windowSize' | 'windowCount' | 'zeroPaddingFactor'
>;

export const magnitudify = (signal: ComplexArray, config: Config): void => {
  const { windowSize, windowCount, zeroPaddingFactor } = config;
  const paddedWindowSize = windowSize * zeroPaddingFactor;
  const halfSize = paddedWindowSize / 2;

  for (let windowIndex = 0; windowIndex < windowCount; windowIndex++) {
    const windowOffset = windowIndex * paddedWindowSize;
    const halfOffset = windowIndex * halfSize;
    for (let i = 0; i < halfSize; i++) {
      const real = signal.real[windowOffset + i];
      const imag = signal.imag[windowOffset + i];
      signal.real[halfOffset + i] = Math.hypot(real, imag);
    }
  }
};

export type Magnitudify = {
  run: (signal: ComplexArray) => void;
  configure: (config: Config) => void;
};
export const createMagnitudify = (marker?: CpuMarker): Magnitudify => {
  // eslint-disable-next-line @typescript-eslint/init-declarations
  let config: Config;

  const ref: Magnitudify = {
    run: (signal) => magnitudify(signal, config),
    configure: (newConfig) => {
      config = newConfig;
    },
  };
  ref.run = marker?.(ref.run) ?? ref.run;
  return ref;
};
