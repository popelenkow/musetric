import type { ResourceCell } from '@musetric/resource-utils';
import { type ComplexGpuBuffer } from '../common/complexArray.js';
import { type ExtSpectrogramConfig } from '../common/extConfig.js';
import { createSignalBufferCell } from './signal.js';
import { createStateTextureCell, type StateTexture } from './texture.js';

export type SpectrogramState = {
  signal: ComplexGpuBuffer;
  texture: StateTexture;
  zerofyImag: (encoder: GPUCommandEncoder) => void;
};
export const createSpectrogramStateCell = (
  device: GPUDevice,
): ResourceCell<ExtSpectrogramConfig, SpectrogramState> => {
  const signalCell = createSignalBufferCell(device);
  const textureCell = createStateTextureCell(device);

  return {
    get: (config) => {
      const signal = signalCell.get({
        windowSize: config.windowSize * config.zeroPaddingFactor,
        windowCount: config.windowCount,
      });
      const texture = textureCell.get(config.viewSize);
      return {
        signal,
        texture,
        zerofyImag: (encoder: GPUCommandEncoder) => {
          encoder.clearBuffer(signal.imag);
        },
      };
    },
    dispose: () => {
      signalCell.dispose();
      textureCell.dispose();
    },
  };
};
