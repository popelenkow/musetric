import { type ViewColors, type WaveType } from '@musetric/audio';

export type PortStatus = 'pending' | 'success' | 'error';

export type WaveformStatuses = Record<WaveType, PortStatus>;

export type EngineStatuses = {
  decoder: PortStatus;
  spectrogram: PortStatus;
  waveform: WaveformStatuses;
};

export type EngineState = {
  statuses: EngineStatuses;
  frameCount?: number;
  colors: ViewColors;
  duration: number;
  playing: boolean;
  frameIndex: number;
};

export const getTrackProgress = (
  state: Pick<EngineState, 'frameCount' | 'frameIndex'>,
): number => {
  if (!state.frameCount) return 0;
  return state.frameIndex / state.frameCount;
};
