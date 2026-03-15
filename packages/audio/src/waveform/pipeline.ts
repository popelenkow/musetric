import { type ViewColors } from '../common/colors.es.js';
import { createWaveformDraw } from './draw.js';
import { generateWaveformSegments } from './generateSegments.js';

const barStep = 3;

export type WaveformPipeline = {
  setColors: (colors: ViewColors) => void;
  render: (wave: Float32Array, progress: number) => void;
};
export const createWaveformPipeline = (
  canvas: OffscreenCanvas,
  presetColors: ViewColors,
): WaveformPipeline => {
  const draw = createWaveformDraw(canvas);
  let colors = presetColors;

  return {
    setColors: (nextColors) => {
      colors = nextColors;
    },
    render: (wave, progress) => {
      const segmentCount = Math.floor(canvas.width / barStep);
      const segments = generateWaveformSegments(wave, segmentCount);
      draw.run(segments, progress, colors);
    },
  };
};
