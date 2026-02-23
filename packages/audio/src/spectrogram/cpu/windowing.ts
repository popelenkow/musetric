import { type CpuMarker } from '../../common/timer/index.js';
import { type ExtPipelineConfig } from '../pipeline.js';
import { windowFunctions } from '../windowFunction.js';

type Config = Pick<
  ExtPipelineConfig,
  'windowSize' | 'windowCount' | 'zeroPaddingFactor' | 'windowName'
>;

export type Windowing = {
  run: (signal: Float32Array<ArrayBuffer>) => void;
  configure: (config: Config) => void;
};

export const createWindowing = (marker?: CpuMarker): Windowing => {
  // eslint-disable-next-line @typescript-eslint/init-declarations
  let config: Config;
  // eslint-disable-next-line @typescript-eslint/init-declarations
  let windowFunction: Float32Array<ArrayBuffer>;

  const ref: Windowing = {
    run: (signal) => {
      const { windowSize, windowCount, zeroPaddingFactor } = config;
      const paddedWindowSize = windowSize * zeroPaddingFactor;
      for (let windowIndex = 0; windowIndex < windowCount; windowIndex++) {
        const windowOffset = paddedWindowSize * windowIndex;
        for (let i = 0; i < windowSize; i++) {
          const weight = windowFunction[i];
          signal[windowOffset + i] *= weight;
        }
      }
    },
    configure: (newConfig) => {
      config = newConfig;
      const { windowSize, windowName } = config;
      windowFunction = windowFunctions[windowName](windowSize);
    },
  };
  ref.run = marker?.(ref.run) ?? ref.run;
  return ref;
};
