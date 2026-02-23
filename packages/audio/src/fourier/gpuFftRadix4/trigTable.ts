import { utilsRadix4 } from '../utilsRadix4.js';

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
      const array = utilsRadix4.createTrigTable(windowSize);
      const buffer = device.createBuffer({
        label: 'fft4-trig-table',
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
