export type SpectrogramAssessmentTone =
  | 'hit'
  | 'near'
  | 'miss'
  | 'extra'
  | 'missing'
  | 'rest';

export type SpectrogramAssessmentFrame = {
  frameIndex: number;
  targetFrequency?: number;
  recordingFrequency?: number;
  cents?: number;
  targetEnergy: number;
  recordingEnergy: number;
  targetConfidence: number;
  recordingConfidence: number;
  tone: SpectrogramAssessmentTone;
};

export type SpectrogramAssessmentScore = {
  overall: number;
  pitch: number;
  timing: number;
  stability: number;
  vibrato: number;
  processedFrameCount: number;
};

export type SpectrogramAssessmentPatch = {
  revision: number;
  frames: SpectrogramAssessmentFrame[];
  score: SpectrogramAssessmentScore;
  reset?: true;
};

export const emptySpectrogramAssessmentScore: SpectrogramAssessmentScore = {
  overall: 0,
  pitch: 0,
  timing: 0,
  stability: 0,
  vibrato: 0,
  processedFrameCount: 0,
};

export const emptySpectrogramAssessmentPatch: SpectrogramAssessmentPatch = {
  revision: 0,
  frames: [],
  score: emptySpectrogramAssessmentScore,
};
