import { createResourceCell } from '@musetric/resource-utils';
import { utilsRadix4 } from '../utilsRadix4.js';

export const createTrigTableCell = (device: GPUDevice) =>
  createResourceCell({
    create: (windowSize: number): GPUBuffer => {
      const array = utilsRadix4.createTrigTable(windowSize);
      const buffer = device.createBuffer({
        label: 'fft4-trig-table',
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
