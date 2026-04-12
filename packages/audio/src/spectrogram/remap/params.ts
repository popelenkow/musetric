import { createResourceCell } from '@musetric/resource-utils';
import type { SpectrogramConfig } from '../config.cross.js';

export type RemapParams = {
  halfSize: number;
  width: number;
  height: number;
  minBin: number;
  maxBin: number;
  logMin: number;
  logRange: number;
};

const toParams = (config: SpectrogramConfig): RemapParams => {
  const {
    sampleRate,
    zeroPaddingFactor,
    minFrequency,
    maxFrequency,
    viewSize,
  } = config;
  const { width, height } = viewSize;
  const windowSize = config.windowSize * zeroPaddingFactor;
  const halfSize = windowSize / 2;
  const maxBin = Math.min(
    Math.floor((maxFrequency / sampleRate) * windowSize),
    halfSize,
  );
  const minBin = Math.max(
    Math.floor((minFrequency / sampleRate) * windowSize),
    0,
  );
  const logMin = Math.log(minBin + 1);
  const logRange = Math.log(maxBin + 1) - logMin;
  return {
    halfSize,
    width,
    height,
    minBin,
    maxBin,
    logMin,
    logRange,
  };
};

export type StateParams = {
  value: RemapParams;
  buffer: GPUBuffer;
};

export const createParamsCell = (device: GPUDevice) =>
  createResourceCell({
    create: (config: SpectrogramConfig): StateParams => {
      const value = toParams(config);
      const array = new DataView(new ArrayBuffer(28));
      array.setUint32(0, value.halfSize, true);
      array.setUint32(4, value.width, true);
      array.setUint32(8, value.height, true);
      array.setUint32(12, value.minBin, true);
      array.setUint32(16, value.maxBin, true);
      array.setFloat32(20, value.logMin, true);
      array.setFloat32(24, value.logRange, true);

      const buffer = device.createBuffer({
        label: 'remap-params-buffer',
        size: array.byteLength,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      });
      device.queue.writeBuffer(buffer, 0, array.buffer);

      return {
        value,
        buffer,
      };
    },
    dispose: (params) => {
      params.buffer.destroy();
    },
    equals: (current, next) =>
      current.windowSize === next.windowSize &&
      current.sampleRate === next.sampleRate &&
      current.zeroPaddingFactor === next.zeroPaddingFactor &&
      current.minFrequency === next.minFrequency &&
      current.maxFrequency === next.maxFrequency &&
      current.viewSize.width === next.viewSize.width &&
      current.viewSize.height === next.viewSize.height,
  });
