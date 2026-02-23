import { utilsRadix4 } from '../utilsRadix4.js';

export type StateReverseTable = {
  buffer: GPUBuffer;
  resize: (reverseWidth: number) => void;
  destroy: () => void;
};
export const createReverseTable = (device: GPUDevice) => {
  const ref: StateReverseTable = {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    buffer: undefined!,
    resize: (reverseWidth) => {
      const array = utilsRadix4.createReverseTable(reverseWidth);
      const buffer = device.createBuffer({
        label: 'fft4-reverse-table',
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
