import { type ViewColors } from '../common/colors.es.js';
import { type ViewSize } from '../common/viewSize.es.js';

export type SpectrogramZeroPaddingFactor = 1 | 2 | 4;
export type FourierMode = 'fftRadix2' | 'fftRadix4';
export type SpectrogramWindowName =
  | 'bartlett'
  | 'bartlettHann'
  | 'blackman'
  | 'cosine'
  | 'gauss'
  | 'hamming'
  | 'hann'
  | 'lanczoz'
  | 'rectangular'
  | 'triangular';

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
