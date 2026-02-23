import { type Config } from './state.js';

export type SliceWaveParams = {
  windowSize: number;
  paddedWindowSize: number;
  windowCount: number;
  visibleSamples: number;
  step: number;
};

const toParams = (config: Config): SliceWaveParams => {
  const {
    windowSize,
    windowCount,
    sampleRate,
    visibleTimeBefore,
    visibleTimeAfter,
    zeroPaddingFactor,
  } = config;
  const paddedWindowSize = windowSize * zeroPaddingFactor;
  const beforeSamples = visibleTimeBefore * sampleRate + windowSize;
  const afterSamples = visibleTimeAfter * sampleRate;
  const visibleSamples = Math.ceil(beforeSamples + afterSamples);
  const step = (visibleSamples - windowSize) / (windowCount - 1);
  return {
    windowSize,
    paddedWindowSize,
    windowCount,
    visibleSamples,
    step,
  };
};

export type StateParams = {
  value: SliceWaveParams;
  buffer: GPUBuffer;
  write: (config: Config) => void;
  destroy: () => void;
};

export const createParams = (device: GPUDevice): StateParams => {
  const array = new DataView(new ArrayBuffer(20));
  const buffer = device.createBuffer({
    label: 'slice-wave-params-buffer',
    size: array.byteLength,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  const ref: StateParams = {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    value: undefined!,
    buffer,
    write: (config) => {
      ref.value = toParams(config);
      array.setUint32(0, ref.value.windowSize, true);
      array.setUint32(4, ref.value.paddedWindowSize, true);
      array.setUint32(8, ref.value.windowCount, true);
      array.setUint32(12, ref.value.visibleSamples, true);
      array.setFloat32(16, ref.value.step, true);
      device.queue.writeBuffer(buffer, 0, array.buffer);
    },
    destroy: () => {
      buffer.destroy();
    },
  };
  return ref;
};
