import { type CpuMarker } from '../../common/timer/index.js';
import { type ExtPipelineConfig } from '../pipeline.js';

type Config = Pick<
  ExtPipelineConfig,
  | 'windowSize'
  | 'sampleRate'
  | 'zeroPaddingFactor'
  | 'minFrequency'
  | 'maxFrequency'
  | 'viewSize'
>;

export const remap = (
  signal: Float32Array<ArrayBuffer>,
  view: Uint8Array,
  config: Config,
) => {
  const {
    windowSize,
    sampleRate,
    zeroPaddingFactor,
    minFrequency,
    maxFrequency,
    viewSize,
  } = config;
  const { width, height } = viewSize;
  const paddedWindowSize = windowSize * zeroPaddingFactor;

  const halfSize = paddedWindowSize / 2;
  const maxBin = Math.min(
    Math.floor((maxFrequency / sampleRate) * paddedWindowSize),
    halfSize,
  );
  const minBin = Math.max(
    Math.floor((minFrequency / sampleRate) * paddedWindowSize),
    0,
  );
  const logMin = Math.log(minBin + 1);
  const logRange = Math.log(maxBin + 1) - logMin;

  for (let x = 0; x < width; x++) {
    const windowOffset = x * halfSize;
    const columnOffset = x * height;
    for (let y = 0; y < height; y++) {
      const ratio = 1 - y / (height - 1);
      const raw = Math.exp(logMin + logRange * ratio);
      const idx = Math.max(minBin, Math.min(Math.floor(raw) - 1, maxBin - 1));
      const magnitude = signal[windowOffset + idx];
      view[columnOffset + y] = Math.round(magnitude * 255);
    }
  }
};

export type Remap = {
  run: (signal: Float32Array<ArrayBuffer>, view: Uint8Array) => void;
  configure: (config: Config) => void;
};
export const createRemap = (marker?: CpuMarker): Remap => {
  // eslint-disable-next-line @typescript-eslint/init-declarations
  let config: Config;

  const ref: Remap = {
    run: (signal, view) => remap(signal, view, config),
    configure: (newConfig) => {
      config = newConfig;
    },
  };
  ref.run = marker?.(ref.run) ?? ref.run;
  return ref;
};
