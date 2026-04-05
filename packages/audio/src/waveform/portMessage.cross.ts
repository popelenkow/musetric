import type { ViewColors } from '../common/colors.es.js';
import type { ViewSize } from '../common/viewSize.es.js';

export type WaveType = 'lead' | 'backing' | 'instrumental';

export type WaveformCommandMethods = {
  init: (message: {
    projectId: number;
    waveType: WaveType;
    progress: number;
    canvas: OffscreenCanvas;
    colors: ViewColors;
    viewSize: ViewSize;
  }) => void;
  deinit: () => void;
  progress: (message: { progress: number }) => void;
  colors: (message: { colors: ViewColors }) => void;
  resize: (message: { viewSize: ViewSize }) => void;
};

export type WaveformEventMethods = {
  state: (message: { status: 'error' | 'success' }) => void;
};
