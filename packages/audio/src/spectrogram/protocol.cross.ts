import type { SpectrogramConfig } from './config.cross.js';

export type SpectrogramCommandMethods = {
  mount: (message: {
    config: Partial<SpectrogramConfig>;
    progress: number;
    waveBuffer?: SharedArrayBuffer;
  }) => void;
  unmount: () => void;
  wave: (message: { waveBuffer: SharedArrayBuffer }) => void;
  progress: (message: { progress: number }) => void;
  config: (message: { patch: Partial<SpectrogramConfig> }) => void;
};

export type SpectrogramEventMethods = {
  state: (message: { status: 'error' | 'success' }) => void;
};
