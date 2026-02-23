import { type ViewColors } from '../common/colors.js';
import { createDraw } from './draw.js';
import { generateSegments } from './generateSegments.js';

const barStep = 3;

export type Pipeline = {
  render: (wave: Float32Array<ArrayBuffer>, progress: number) => void;
};
export const createPipeline = (
  canvas: OffscreenCanvas,
  colors: ViewColors,
): Pipeline => {
  const draw = createDraw(canvas);

  return {
    render: (wave, progress) => {
      const segmentCount = Math.floor(canvas.width / barStep);
      const segments = generateSegments(wave, segmentCount);
      draw.run(segments, progress, colors);
    },
  };
};
