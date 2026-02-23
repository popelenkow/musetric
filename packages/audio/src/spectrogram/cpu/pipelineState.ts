import {
  type ComplexArray,
  createComplexArray,
} from '../../common/complexArray.js';
import { type CpuMarker } from '../../common/timer/index.js';
import { type ExtPipelineConfig } from '../pipeline.js';

export type PipelineArrays = {
  config: ExtPipelineConfig;
  signal: ComplexArray;
  view: Uint8Array;
  configure: () => void;
  zerofyImag: () => void;
};
export const createPipelineState = (marker?: CpuMarker): PipelineArrays => {
  const ref: PipelineArrays = {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    config: undefined!,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    signal: undefined!,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    view: undefined!,
    configure: () => {
      const { windowSize, windowCount, zeroPaddingFactor, viewSize } =
        ref.config;
      const { height } = viewSize;
      const paddedWindowSize = windowSize * zeroPaddingFactor;
      const windowLength = paddedWindowSize * windowCount;
      ref.signal = createComplexArray(windowLength);
      ref.view = new Uint8Array(windowCount * height);
    },
    zerofyImag: () => {
      ref.signal.imag.fill(0);
    },
  };
  ref.zerofyImag = marker?.(ref.zerofyImag) ?? ref.zerofyImag;
  return ref;
};
