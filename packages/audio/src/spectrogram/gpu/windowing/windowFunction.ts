import { windowFunctions } from '../../windowFunction.js';
import { type Config } from './state.js';

export type StateWindowFunction = {
  buffer: GPUBuffer;
  configure: (config: Config) => void;
  destroy: () => void;
};
export const createWindowFunction = (
  device: GPUDevice,
): StateWindowFunction => {
  const ref: StateWindowFunction = {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    buffer: undefined!,
    configure: (config) => {
      const { windowSize, windowName } = config;
      const array = windowFunctions[windowName](windowSize);
      const buffer = device.createBuffer({
        label: 'windowing-window-function-buffer',
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
