import { type FourierMode, type spectrogram } from '@musetric/audio';

export type InitConfig = Omit<spectrogram.PipelineConfig, 'viewSize'>;

export type ToSpectrogramWorkerMessage =
  | {
      type: 'init';
      canvas: OffscreenCanvas;
      config: spectrogram.PipelineConfig;
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
      patch: Partial<spectrogram.PipelineConfig>;
    };

export type FromSpectrogramWorkerMessage = {
  type: 'state';
  status: 'pending' | 'error' | 'success';
};
