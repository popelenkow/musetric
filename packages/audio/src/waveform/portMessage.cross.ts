import type { ViewColors } from '../common/colors.es.js';
import type { ViewSize } from '../common/viewSize.es.js';

export type WaveType = 'lead' | 'backing' | 'instrumental';

export type ToWaveformWorkerMessage =
  | {
      type: 'init';
      projectId: number;
      waveType: WaveType;
      progress: number;
      canvas: OffscreenCanvas;
      colors: ViewColors;
      viewSize: ViewSize;
    }
  | {
      type: 'deinit';
    }
  | {
      type: 'progress';
      progress: number;
    }
  | {
      type: 'colors';
      colors: ViewColors;
    }
  | {
      type: 'resize';
      viewSize: ViewSize;
    };

export type FromWaveformWorkerMessage = {
  type: 'state';
  status: 'error' | 'success';
};
