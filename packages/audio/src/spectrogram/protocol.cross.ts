import type { SpectrogramConfig } from './config.cross.js';

export type SpectrogramCommandMethods = {
  mount: (message: {
    config: Partial<SpectrogramConfig>;
    trackProgress: number;
    waveBuffer?: SharedArrayBuffer;
  }) => void;
  unmount: () => void;
  wave: (message: { waveBuffer: SharedArrayBuffer }) => void;
  trackProgress: (message: { trackProgress: number }) => void;
  config: (message: { patch: Partial<SpectrogramConfig> }) => void;
};

export type SpectrogramEventMethods = {
  state: (message: { status: 'error' | 'success' }) => void;
};
