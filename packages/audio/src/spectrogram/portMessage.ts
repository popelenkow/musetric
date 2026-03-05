import type { FourierMode } from '../fourier/fouriers.js';
import type { PipelineConfig } from './config.js';

export type ToSpectrogramWorkerMessage =
  | {
      type: 'init';
      canvas: OffscreenCanvas;
      config: PipelineConfig;
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
      patch: Partial<PipelineConfig>;
    };

export type FromSpectrogramWorkerMessage = {
  type: 'state';
  status: 'pending' | 'error' | 'success';
};
