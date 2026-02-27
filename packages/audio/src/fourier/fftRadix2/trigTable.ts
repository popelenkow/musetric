import { utilsRadix2 } from '../utilsRadix2.js';

export type StateTrigTable = {
  buffer: GPUBuffer;
  resize: (windowSize: number) => void;
  destroy: () => void;
};
export const createTrigTable = (device: GPUDevice) => {
  const ref: StateTrigTable = {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    buffer: undefined!,
    resize: (windowSize) => {
      const array = utilsRadix2.createTrigTable(windowSize);
      const buffer = device.createBuffer({
        label: 'fft2-trig-table-buffer',
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
