import { type ViewColors } from '../common/colors.es.js';
import { type ViewSize } from '../common/viewSize.es.js';

export type SpectrogramZeroPaddingFactor = 1 | 2 | 4;

export const allFourierModes = ['fftRadix2', 'fftRadix4'] as const;
export type FourierMode = (typeof allFourierModes)[number];

export const allSpectrogramWindowNames = [
  'bartlett',
  'bartlettHann',
  'blackman',
  'cosine',
  'gauss',
  'hamming',
  'hann',
  'lanczoz',
  'rectangular',
  'triangular',
] as const;
export type SpectrogramWindowName = (typeof allSpectrogramWindowNames)[number];

export type SpectrogramConfig = {
  windowSize: number;
  sampleRate: number;
  visibleTimeBefore: number;
  visibleTimeAfter: number;
  zeroPaddingFactor: SpectrogramZeroPaddingFactor;
  windowName: SpectrogramWindowName;
  minDecibel: number;
  minFrequency: number;
  maxFrequency: number;
  viewSize: ViewSize;
  colors: ViewColors;
};
