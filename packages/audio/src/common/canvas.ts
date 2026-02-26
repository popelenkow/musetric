import { type ViewSize } from './viewSize.js';

export const getCanvasSize = (canvas: HTMLCanvasElement): ViewSize => ({
  width: canvas.width,
  height: canvas.height,
});

export const resizeCanvas = (canvas: HTMLCanvasElement): ViewSize => {
  const viewSize = getCanvasSize(canvas);
  canvas.width = viewSize.width;
  canvas.height = viewSize.height;
  return viewSize;
};
