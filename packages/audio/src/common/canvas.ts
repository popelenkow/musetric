import { type ViewSize } from './viewSize.js';

export const getCanvasSize = (canvas: HTMLCanvasElement): ViewSize => ({
  width: canvas.clientWidth,
  height: canvas.clientHeight,
});

export const resizeCanvas = (canvas: HTMLCanvasElement): ViewSize => {
  const viewSize = getCanvasSize(canvas);
  canvas.width = viewSize.width;
  canvas.height = viewSize.height;
  return viewSize;
};
