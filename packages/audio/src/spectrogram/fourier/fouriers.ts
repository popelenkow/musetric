import type { FourierMode } from '../config.es.js';
import { createFftRadix2 } from './fftRadix2/index.js';
import { createFftRadix4 } from './fftRadix4/index.js';
import type { CreateFourier } from './types.js';

export const fouriers: Record<FourierMode, CreateFourier> = {
  fftRadix2: createFftRadix2,
  fftRadix4: createFftRadix4,
};
