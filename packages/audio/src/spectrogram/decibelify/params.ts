import { type Config } from './state.js';

export type DecibelifyParams = {
  halfSize: number;
  windowCount: number;
  decibelFactor: number;
};

const toParams = (config: Config): DecibelifyParams => ({
  halfSize: (config.windowSize * config.zeroPaddingFactor) / 2,
  windowCount: config.windowCount,
  decibelFactor: (20 * Math.LOG10E) / -config.minDecibel,
});

export type StateParams = {
  value: DecibelifyParams;
  buffer: GPUBuffer;
  write: (config: Config) => void;
  destroy: () => void;
};
export const createParams = (device: GPUDevice) => {
  const array = new DataView(new ArrayBuffer(12));
  const buffer = device.createBuffer({
    label: 'decibelify-params-buffer',
    size: array.buffer.byteLength,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  const ref: StateParams = {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    value: undefined!,
    buffer,
    write: (config) => {
      ref.value = toParams(config);
      array.setUint32(0, ref.value.halfSize, true);
      array.setUint32(4, ref.value.windowCount, true);
      array.setFloat32(8, ref.value.decibelFactor, true);
      device.queue.writeBuffer(buffer, 0, array.buffer);
    },
    destroy: () => {
      buffer.destroy();
    },
  };
  return ref;
};
