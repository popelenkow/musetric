import { type ComplexGpuBuffer } from '../common/complexArray.js';
import { type ExtSpectrogramConfig } from '../common/extConfig.js';
import { createSignalBuffer } from './signal.js';
import { createStateTexture, type StateTexture } from './texture.js';

export type SpectrogramProcessorState = {
  signal: ComplexGpuBuffer;
  texture: StateTexture;
  configure: (config: ExtSpectrogramConfig) => void;
  zerofyImag: (encoder: GPUCommandEncoder) => void;
  destroy: () => void;
};

export const createSpectrogramProcessorState = (device: GPUDevice) => {
  const ref: SpectrogramProcessorState = {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    signal: undefined!,
    texture: createStateTexture(device),
    configure: (config) => {
      const { windowSize, windowCount, viewSize, zeroPaddingFactor } = config;
      const paddedWindowSize = windowSize * zeroPaddingFactor;
      ref.signal?.real.destroy();
      ref.signal?.imag.destroy();
      ref.signal = createSignalBuffer(device, paddedWindowSize, windowCount);
      ref.texture.resize(viewSize);
    },
    zerofyImag: (encoder) => {
      encoder.clearBuffer(ref.signal.imag);
    },
    destroy: () => {
      ref.signal?.real.destroy();
      ref.signal?.imag.destroy();
      ref.texture.destroy();
    },
  };
  return ref;
};
