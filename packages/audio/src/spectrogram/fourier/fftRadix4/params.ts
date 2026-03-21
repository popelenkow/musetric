import { createResourceCell } from '@musetric/resource-utils';
import { type FourierConfig } from '../config.js';
import { utilsRadix4 } from '../utilsRadix4.js';

export type FftRadix4Params = {
  windowSize: number;
  windowCount: number;
  reverseWidth: number;
};

const toParams = (config: FourierConfig): FftRadix4Params => ({
  windowSize: config.windowSize,
  windowCount: config.windowCount,
  reverseWidth: utilsRadix4.getReverseWidth(config.windowSize),
});

export type StateParams = {
  value: FftRadix4Params;
  buffer: GPUBuffer;
};

export const createParamsCell = (device: GPUDevice) =>
  createResourceCell({
    create: (config: FourierConfig): StateParams => {
      const value = toParams(config);
      const array = new Uint32Array(3);
      array[0] = value.windowSize;
      array[1] = value.windowCount;
      array[2] = value.reverseWidth;

      const buffer = device.createBuffer({
        label: 'fft4-params',
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
