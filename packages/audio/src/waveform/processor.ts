import { type ViewColors } from '../common/colors.es.js';
import { createWaveformDraw } from './draw.js';
import { generateWaveformSegments } from './generateSegments.js';

const barStep = 3;

export type WaveformProcessor = {
  setColors: (colors: ViewColors) => void;
  render: (wave: Float32Array, trackProgress: number) => void;
};

export const createWaveformProcessor = (
  canvas: OffscreenCanvas,
  presetColors: ViewColors,
): WaveformProcessor => {
  const draw = createWaveformDraw(canvas);
  let colors = presetColors;

  return {
    setColors: (nextColors) => {
      colors = nextColors;
    },
    render: (wave, trackProgress) => {
      const segmentCount = Math.floor(canvas.width / barStep);
      const segments = generateWaveformSegments(wave, segmentCount);
      draw.run(segments, trackProgress, colors);
    },
  };
};
