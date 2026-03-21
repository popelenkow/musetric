import { createResourceCell } from '@musetric/resource-utils';
import { type FourierConfig } from '../config.js';

export type FourierParams = {
  windowSize: number;
  windowCount: number;
};
export type StateParams = {
  value: FourierParams;
  buffer: GPUBuffer;
};

export const createParamsCell = (device: GPUDevice) =>
  createResourceCell({
    create: (config: FourierConfig): StateParams => {
      const value: FourierParams = config;
      const array = new Uint32Array(2);
      array[0] = value.windowSize;
      array[1] = value.windowCount;

      const buffer = device.createBuffer({
        label: 'fft2-params-buffer',
        size: array.byteLength,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      });
      device.queue.writeBuffer(buffer, 0, array);

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
      current.windowCount === next.windowCount,
  });
