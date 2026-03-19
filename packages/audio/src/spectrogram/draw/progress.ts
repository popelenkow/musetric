import { createResourceCell } from '@musetric/resource-utils';
import { type SpectrogramDrawConfig } from './index.js';

export type StateProgress = {
  buffer: GPUBuffer;
};

export const createStateProgressCell = (device: GPUDevice) =>
  createResourceCell({
    create: (config: SpectrogramDrawConfig): StateProgress => {
      const array = new Float32Array([1]);
      const { visibleTimeBefore, visibleTimeAfter } = config;
      const progress =
        visibleTimeBefore / (visibleTimeBefore + visibleTimeAfter);
      array[0] = progress;
      const buffer = device.createBuffer({
        label: 'pipeline-progress-buffer',
        size: array.byteLength,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      });
      device.queue.writeBuffer(buffer, 0, array);

      return {
        buffer,
      };
    },
    dispose: (state) => {
      state.buffer.destroy();
    },
    equals: (current, next) =>
      current.visibleTimeBefore === next.visibleTimeBefore &&
      current.visibleTimeAfter === next.visibleTimeAfter,
  });
