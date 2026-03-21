import type { FourierMode, SpectrogramConfig } from './config.cross.js';

export type ToSpectrogramWorkerMessage =
  | {
      type: 'init';
      config: Partial<SpectrogramConfig>;
      progress: number;
      waveBuffer?: SharedArrayBuffer;
      fourierMode: FourierMode;
    }
  | {
      type: 'deinit';
    }
  | {
      type: 'wave';
      waveBuffer: SharedArrayBuffer;
    }
  | {
      type: 'progress';
      progress: number;
    }
  | {
      type: 'config';
      patch: Partial<SpectrogramConfig>;
    };

export type FromSpectrogramWorkerMessage = {
  type: 'state';
  status: 'error' | 'success';
};
