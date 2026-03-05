import type { FourierMode } from '../fourier/fouriers.js';
import type { SpectrogramConfig } from './config.js';

export type ToSpectrogramWorkerMessage =
  | {
      type: 'init';
      canvas: OffscreenCanvas;
      config: SpectrogramConfig;
      progress: number;
      waveBuffer?: SharedArrayBuffer;
      fourierMode: FourierMode;
      profiling: boolean;
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
  status: 'pending' | 'error' | 'success';
};
