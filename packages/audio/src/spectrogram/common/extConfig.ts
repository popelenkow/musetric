import type { SpectrogramConfig } from '../config.es.js';

export type ExtSpectrogramConfig = SpectrogramConfig & {
  windowCount: number;
};
