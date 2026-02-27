import { createGpuFftRadix2 } from './gpuFftRadix2/index.js';
import { createGpuFftRadix4 } from './gpuFftRadix4/index.js';

export const gpuFouriers = {
  gpuFftRadix2: createGpuFftRadix2,
  gpuFftRadix4: createGpuFftRadix4,
} as const;

export const fouriers = {
  ...gpuFouriers,
};

export type FourierMode = keyof typeof gpuFouriers;
// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
export const allFourierModes = Object.keys(gpuFouriers) as FourierMode[];
