import { type FourierConfig } from '../config.js';

type FourierParams = {
  windowSize: number;
  windowCount: number;
};
export type StateParams = {
  value: FourierParams;
  buffer: GPUBuffer;
  write: (config: FourierConfig) => void;
  destroy: () => void;
};
export const createParams = (device: GPUDevice) => {
  const array = new Uint32Array(2);
  const buffer = device.createBuffer({
    label: 'fft2-params-buffer',
    size: array.byteLength,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  const ref: StateParams = {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    value: undefined!,
    buffer,
    write: (config) => {
      ref.value = config;
      array[0] = ref.value.windowSize;
      array[1] = ref.value.windowCount;
      device.queue.writeBuffer(buffer, 0, array);
    },
    destroy: () => {
      buffer.destroy();
    },
  };
  return ref;
};
