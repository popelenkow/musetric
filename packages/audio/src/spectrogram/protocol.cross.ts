import type { SpectrogramConfig } from './config.cross.js';

export type SpectrogramCommandMethods = {
  boot: (message: { decoderPort: MessagePort }) => void;
  mount: (message: {
    config: Partial<SpectrogramConfig>;
    trackProgress: number;
  }) => void;
  unmount: () => void;
  trackProgress: (message: { trackProgress: number }) => void;
  config: (message: { patch: Partial<SpectrogramConfig> }) => void;
};

export type SpectrogramEventMethods = {
  state: (message: { status: 'pending' | 'error' | 'success' }) => void;
};

export type SpectrogramDataMethods = {
  wave: (message: { waveBuffer: SharedArrayBuffer }) => void;
  clear: () => void;
};
