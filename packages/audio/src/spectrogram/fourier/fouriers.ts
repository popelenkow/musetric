import { createFftRadix2 } from './fftRadix2/index.js';
import { createFftRadix4 } from './fftRadix4/index.js';

export const fouriers = {
  fftRadix2: createFftRadix2,
  fftRadix4: createFftRadix4,
} as const;

export type FourierMode = keyof typeof fouriers;
// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
export const allFourierModes = Object.keys(fouriers) as FourierMode[];
