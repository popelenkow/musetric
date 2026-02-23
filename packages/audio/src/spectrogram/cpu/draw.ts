import {
  createGradient,
  parseHexColor,
  type ViewColors,
  type ViewGradients,
} from '../../common/colors.js';
import { type CpuMarker } from '../../common/timer/index.js';
import { type ExtPipelineConfig } from '../pipeline.js';

type Config = Pick<
  ExtPipelineConfig,
  'visibleTimeBefore' | 'visibleTimeAfter' | 'viewSize' | 'colors'
>;

const createGradients = (colors: ViewColors): ViewGradients => ({
  played: createGradient(
    parseHexColor(colors.background),
    parseHexColor(colors.played),
  ),
  unplayed: createGradient(
    parseHexColor(colors.background),
    parseHexColor(colors.unplayed),
  ),
});

export type Draw = {
  run: (view: Uint8Array) => void;
  configure: (config: Config) => void;
};

export const createDraw = (
  canvas: HTMLCanvasElement,
  marker?: CpuMarker,
): Draw => {
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Context 2D not available on the canvas');
  }

  // eslint-disable-next-line @typescript-eslint/init-declarations
  let config: Config;
  // eslint-disable-next-line @typescript-eslint/init-declarations
  let progress: number;
  // eslint-disable-next-line @typescript-eslint/init-declarations
  let image: ImageData;
  // eslint-disable-next-line @typescript-eslint/init-declarations
  let gradients: ViewGradients;

  const ref: Draw = {
    run: (view) => {
      const { width, height } = config.viewSize;
      const played = Math.floor(progress * width);
      for (let x = 0; x < width; x++) {
        const columnOffset = x * height;
        for (let y = 0; y < height; y++) {
          const value = view[columnOffset + y];
          const idx = (y * width + x) * 4;
          const gradient = x < played ? gradients.played : gradients.unplayed;
          image.data[idx] = gradient.red[value];
          image.data[idx + 1] = gradient.green[value];
          image.data[idx + 2] = gradient.blue[value];
          image.data[idx + 3] = 255;
        }
      }
      context.putImageData(image, 0, 0);
    },
    configure: (newConfig) => {
      config = newConfig;
      const { visibleTimeBefore, visibleTimeAfter, viewSize, colors } = config;
      const { width, height } = viewSize;
      progress = visibleTimeBefore / (visibleTimeBefore + visibleTimeAfter);
      image = context.createImageData(width, height);
      gradients = createGradients(colors);
    },
  };
  ref.run = marker?.(ref.run) ?? ref.run;
  return ref;
};
