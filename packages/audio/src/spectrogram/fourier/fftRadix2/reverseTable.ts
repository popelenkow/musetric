import { utilsRadix2 } from '../utilsRadix2.js';

export type StateReverseTable = {
  buffer: GPUBuffer;
  resize: (windowSize: number) => void;
  destroy: () => void;
};
export const createReverseTable = (device: GPUDevice) => {
  const ref: StateReverseTable = {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    buffer: undefined!,
    resize: (windowSize) => {
      const array = utilsRadix2.createReverseTable(windowSize);

      const buffer = device.createBuffer({
        label: 'fft2-reverse-table-buffer',
        size: array.byteLength,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
      });
      device.queue.writeBuffer(buffer, 0, array);

      ref.buffer?.destroy();
      ref.buffer = buffer;
    },
    destroy: () => {
      ref.buffer?.destroy();
    },
  };
  return ref;
};
