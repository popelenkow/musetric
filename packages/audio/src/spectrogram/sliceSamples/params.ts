import { createResourceCell } from '@musetric/resource-utils';
import type { ExtSpectrogramConfig } from '../common/extConfig.js';

export type SliceSamplesParams = {
  windowSize: number;
  paddedWindowSize: number;
  windowCount: number;
  visibleSamples: number;
  step: number;
};

const toParams = (config: ExtSpectrogramConfig): SliceSamplesParams => {
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
  value: SliceSamplesParams;
  buffer: GPUBuffer;
};

export const createParamsCell = (device: GPUDevice) =>
  createResourceCell({
    create: (config: ExtSpectrogramConfig): StateParams => {
      const value = toParams(config);
      const array = new DataView(new ArrayBuffer(20));
      array.setUint32(0, value.windowSize, true);
      array.setUint32(4, value.paddedWindowSize, true);
      array.setUint32(8, value.windowCount, true);
      array.setUint32(12, value.visibleSamples, true);
      array.setFloat32(16, value.step, true);

      const buffer = device.createBuffer({
        label: 'slice-samples-params-buffer',
        size: array.byteLength,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      });
      device.queue.writeBuffer(buffer, 0, array.buffer);

      return {
        value,
        buffer,
      };
    },
    dispose: (params) => {
      params.buffer.destroy();
    },
    equals: (current, next) =>
      current.windowSize === next.windowSize &&
      current.windowCount === next.windowCount &&
      current.sampleRate === next.sampleRate &&
      current.visibleTimeBefore === next.visibleTimeBefore &&
      current.visibleTimeAfter === next.visibleTimeAfter &&
      current.zeroPaddingFactor === next.zeroPaddingFactor,
  });
