import { type ViewSize } from './viewSize.js';

export const resizeCanvas = (canvas: HTMLCanvasElement): ViewSize => {
  const viewSize = {
    width: canvas.clientWidth,
    height: canvas.clientHeight,
  };
  canvas.width = viewSize.width;
  canvas.height = viewSize.height;
  return viewSize;
};
