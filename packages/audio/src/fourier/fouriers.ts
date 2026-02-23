import { createCpuFftRadix4 } from './cpuFftRadix4/index.js';
import { createGpuFftRadix2 } from './gpuFftRadix2/index.js';
import { createGpuFftRadix4 } from './gpuFftRadix4/index.js';

export const cpuFouriers = {
  cpuFftRadix4: createCpuFftRadix4,
} as const;

export const gpuFouriers = {
  gpuFftRadix2: createGpuFftRadix2,
  gpuFftRadix4: createGpuFftRadix4,
} as const;

export const fouriers = {
  ...cpuFouriers,
  ...gpuFouriers,
};

export type CpuFourierMode = keyof typeof cpuFouriers;
export type GpuFourierMode = keyof typeof gpuFouriers;

export type FourierMode = CpuFourierMode | GpuFourierMode;

// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
export const allCpuFourierModes = Object.keys(cpuFouriers) as CpuFourierMode[];
// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
export const allGpuFourierModes = Object.keys(gpuFouriers) as GpuFourierMode[];
export const allFourierModes: FourierMode[] = [
  ...allGpuFourierModes,
  ...allCpuFourierModes,
];

export const isGpuFourierMode = (mode: FourierMode): mode is GpuFourierMode => {
  return mode in gpuFouriers;
};
