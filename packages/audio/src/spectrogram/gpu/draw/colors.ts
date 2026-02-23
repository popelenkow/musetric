import { parseHexColor } from '../../../common/colors.js';
import { type Config } from './index.js';

const toVec4 = (hex: string): [number, number, number, number] => {
  const { red, green, blue } = parseHexColor(hex);
  return [red / 255, green / 255, blue / 255, 1];
};

export type StateColors = {
  buffer: GPUBuffer;
  write: (config: Config) => void;
  destroy: () => void;
};
export const createColors = (device: GPUDevice): StateColors => {
  const array = new Float32Array(12);
  const buffer = device.createBuffer({
    label: 'draw-colors-buffer',
    size: array.byteLength,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  const ref: StateColors = {
    buffer,
    write: (config: Config) => {
      const { colors } = config;
      array.set([
        ...toVec4(colors.played),
        ...toVec4(colors.unplayed),
        ...toVec4(colors.background),
      ]);
      device.queue.writeBuffer(buffer, 0, array);
    },
    destroy: () => {
      buffer.destroy();
    },
  };
  return ref;
};
