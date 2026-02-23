import { type FourierConfig } from '../config.js';
import { utilsRadix4 } from '../utilsRadix4.js';

export type GpuFftRadix4Params = {
  windowSize: number;
  windowCount: number;
  reverseWidth: number;
};

const toParams = (config: FourierConfig): GpuFftRadix4Params => ({
  windowSize: config.windowSize,
  windowCount: config.windowCount,
  reverseWidth: utilsRadix4.getReverseWidth(config.windowSize),
});

export type StateParams = {
  value: GpuFftRadix4Params;
  buffer: GPUBuffer;
  write: (config: FourierConfig) => void;
  destroy: () => void;
};
export const createParams = (device: GPUDevice) => {
  const array = new Uint32Array(3);
  const buffer = device.createBuffer({
    label: 'fft4-params',
    size: array.byteLength,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  const ref: StateParams = {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    value: undefined!,
    buffer,
    write: (config) => {
      ref.value = toParams(config);
      array[0] = ref.value.windowSize;
      array[1] = ref.value.windowCount;
      array[2] = ref.value.reverseWidth;
      device.queue.writeBuffer(buffer, 0, array);
    },
    destroy: () => {
      buffer.destroy();
    },
  };
  return ref;
};
