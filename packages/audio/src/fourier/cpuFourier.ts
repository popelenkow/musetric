import { type ComplexArray } from '../common/complexArray.js';
import { type CpuMarker } from '../common/timer/index.js';
import { type FourierConfig } from './config.js';

export type CpuFourier = {
  forward: (signal: ComplexArray) => void;
  inverse: (signal: ComplexArray) => void;
  configure: (config: FourierConfig) => void;
};

export type CreateCpuFourier = (marker?: CpuMarker) => CpuFourier;
