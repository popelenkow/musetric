import { createResourceCell } from '@musetric/resource-utils';
import { utilsRadix2 } from '../utilsRadix2.js';

export const createReverseTableCell = (device: GPUDevice) =>
  createResourceCell({
    create: (windowSize: number): GPUBuffer => {
      const array = utilsRadix2.createReverseTable(windowSize);
      const buffer = device.createBuffer({
        label: 'fft2-reverse-table-buffer',
        size: array.byteLength,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
      });
      device.queue.writeBuffer(buffer, 0, array);
      return buffer;
    },
    dispose: (buffer) => {
      buffer.destroy();
    },
    equals: (current, next) => current === next,
  });
