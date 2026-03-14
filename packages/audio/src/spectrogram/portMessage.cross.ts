import type { FourierMode, SpectrogramConfig } from './config.es.js';

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
