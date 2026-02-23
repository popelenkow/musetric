import { type ViewColors } from '../common/colors.js';
import { type WaveSegment } from './generateSegments.js';

export type Draw = {
  run: (segments: WaveSegment[], progress: number, colors: ViewColors) => void;
};
export const createDraw = (canvas: OffscreenCanvas): Draw => {
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Context 2D not available on the canvas');
  }

  const ref: Draw = {
    run: (segments, progress, colors) => {
      const width = canvas.width;
      const height = canvas.height;

      context.clearRect(0, 0, width, height);

      const clampedProgress = Math.max(0, Math.min(progress, 1));
      const playedCount = Math.floor(clampedProgress * segments.length);

      const segmentWidth = width / segments.length;
      const barWidth = segmentWidth * 0.9;

      context.fillStyle = colors.unplayed;
      for (let i = 0; i < segments.length; i++) {
        const { min, max } = segments[i];
        const x = i * segmentWidth;
        const yStart = height * ((1 - max) / 2);
        const yEnd = height * ((1 - min) / 2);
        const barHeight = yEnd - yStart;
        context.fillRect(x, yStart, barWidth, barHeight);
      }

      context.fillStyle = colors.played;
      for (let i = 0; i < playedCount; i++) {
        const { min, max } = segments[i];
        const x = i * segmentWidth;
        const yStart = height * ((1 - max) / 2);
        const yEnd = height * ((1 - min) / 2);
        const barHeight = yEnd - yStart;
        context.fillRect(x, yStart, barWidth, barHeight);
      }
    },
  };
  return ref;
};
