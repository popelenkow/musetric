import { type Config } from './state.js';

export type RemapParams = {
  halfSize: number;
  width: number;
  height: number;
  minBin: number;
  maxBin: number;
  logMin: number;
  logRange: number;
};

const toParams = (config: Config): RemapParams => {
  const {
    sampleRate,
    zeroPaddingFactor,
    minFrequency,
    maxFrequency,
    viewSize,
  } = config;
  const { width, height } = viewSize;
  const windowSize = config.windowSize * zeroPaddingFactor;
  const halfSize = windowSize / 2;
  const maxBin = Math.min(
    Math.floor((maxFrequency / sampleRate) * windowSize),
    halfSize,
  );
  const minBin = Math.max(
    Math.floor((minFrequency / sampleRate) * windowSize),
    0,
  );
  const logMin = Math.log(minBin + 1);
  const logRange = Math.log(maxBin + 1) - logMin;
  return {
    halfSize,
    width,
    height,
    minBin,
    maxBin,
    logMin,
    logRange,
  };
};

export type StateParams = {
  value: RemapParams;
  buffer: GPUBuffer;
  write: (config: Config) => void;
  destroy: () => void;
};

export const createParams = (device: GPUDevice) => {
  const array = new DataView(new ArrayBuffer(28));

  const buffer = device.createBuffer({
    label: 'remap-params-buffer',
    size: array.byteLength,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  const ref: StateParams = {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    value: undefined!,
    buffer,
    write: (config) => {
      ref.value = toParams(config);
      array.setUint32(0, ref.value.halfSize, true);
      array.setUint32(4, ref.value.width, true);
      array.setUint32(8, ref.value.height, true);
      array.setUint32(12, ref.value.minBin, true);
      array.setUint32(16, ref.value.maxBin, true);
      array.setFloat32(20, ref.value.logMin, true);
      array.setFloat32(24, ref.value.logRange, true);
      device.queue.writeBuffer(buffer, 0, array.buffer);
    },
    destroy: () => {
      buffer.destroy();
    },
  };
  return ref;
};
