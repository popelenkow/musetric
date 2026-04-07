import { createResourceCell } from '@musetric/resource-utils';
import { type SpectrogramDrawConfig } from './index.js';

export type StatePlayheadRatio = {
  buffer: GPUBuffer;
};

export const createStatePlayheadRatioCell = (device: GPUDevice) =>
  createResourceCell({
    create: (config: SpectrogramDrawConfig): StatePlayheadRatio => {
      const array = new Float32Array([1]);
      const { visibleTimeBefore, visibleTimeAfter } = config;
      const playheadRatio =
        visibleTimeBefore / (visibleTimeBefore + visibleTimeAfter);
      array[0] = playheadRatio;
      const buffer = device.createBuffer({
        label: 'pipeline-playhead-ratio-buffer',
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
