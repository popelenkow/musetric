import { createResourceCell } from '@musetric/resource-utils';
import { type Config } from './state.js';

export type StateWave = {
  buffer: GPUBuffer;
  array: Float32Array;
  write: (wave: Float32Array, progress: number, config: Config) => void;
};

export const createStateWaveCell = (device: GPUDevice) =>
  createResourceCell({
    create: (visibleSamples: number): StateWave => {
      const array = new Float32Array(visibleSamples);
      const buffer = device.createBuffer({
        label: 'pipeline-wave-buffer',
        size: array.byteLength,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
      });

      return {
        buffer,
        array,
        write: (wave, progress, config) => {
          const {
            windowSize,
            sampleRate,
            visibleTimeBefore,
            visibleTimeAfter,
          } = config;
          const beforeSamples = visibleTimeBefore * sampleRate + windowSize;
          const afterSamples = visibleTimeAfter * sampleRate;
          const totalVisibleSamples = beforeSamples + afterSamples;
          const startIndex = Math.floor(progress * wave.length - beforeSamples);

          const from = Math.max(0, -startIndex);
          const to = Math.min(totalVisibleSamples, wave.length - startIndex);

          if (from > 0) {
            array.fill(0, 0, from);
          }
          if (to > from) {
            const slice = wave.subarray(startIndex + from, startIndex + to);
            array.set(slice, from);
          }
          if (to < array.length) {
            array.fill(0, to, array.length);
          }
          device.queue.writeBuffer(buffer, 0, array);
        },
      };
    },
    dispose: (wave) => {
      wave.buffer.destroy();
    },
    equals: (current, next) => current === next,
  });
