import {
  type SpectrogramAssessmentFrame,
  type SpectrogramAssessmentScore,
  type StemType,
  type ViewColors,
} from '@musetric/audio';

export type PortStatus = 'pending' | 'success' | 'error';

export type WaveformStatuses = Record<StemType, PortStatus> & {
  recording: PortStatus;
};

export type EngineStatuses = {
  decoder: PortStatus;
  realtime: PortStatus;
  spectrogram: PortStatus;
  waveform: WaveformStatuses;
};

export type EngineState = {
  statuses: EngineStatuses;
  frameCount?: number;
  colors: ViewColors;
  duration: number;
  playing: boolean;
  frozen: boolean;
  recording: boolean;
  frameIndex: number;
  seekRevision: number;
  transposeSemitones: number;
  sourceTempoBpm: number;
  tempoBpm: number;
  microphoneDeviceId?: string;
  microphoneLatencyFrameCount: number;
  microphoneLatencyUserSet: boolean;
  recordingGain: number;
  trackVolumes: Record<StemType, number> & {
    recording: number;
  };
  vocalAssessment: {
    revision: number;
    frames: SpectrogramAssessmentFrame[];
    score: SpectrogramAssessmentScore;
  };
};

export const getTrackProgress = (
  state: Pick<EngineState, 'frameCount' | 'frameIndex'>,
): number => {
  if (!state.frameCount) return 0;
  return state.frameIndex / state.frameCount;
};
