import { type ViewColors } from '@musetric/audio';

export type PortStatus = 'pending' | 'success' | 'error';
export type EngineStatusKey = 'decoder' | 'spectrogram' | 'waveform';

export type EngineState = {
  statuses: Record<EngineStatusKey, PortStatus>;
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
