import { type ViewColors } from '../common/colors.js';
import { type ViewSize } from '../common/viewSize.js';
import { type WindowName } from './windowFunction.js';

export type ZeroPaddingFactor = 1 | 2 | 4;

export type PipelineConfig = {
  windowSize: number;
  sampleRate: number;
  visibleTimeBefore: number;
  visibleTimeAfter: number;
  zeroPaddingFactor: ZeroPaddingFactor;
  windowName: WindowName;
  minDecibel: number;
  minFrequency: number;
  maxFrequency: number;
  viewSize: ViewSize;
  colors: ViewColors;
};
export type ExtPipelineConfig = PipelineConfig & {
  windowCount: number;
};
export const defaultConfig: PipelineConfig = {
  windowSize: 1024 * 4,
  sampleRate: 44100,
  visibleTimeBefore: 2.0,
  visibleTimeAfter: 2.0,
  zeroPaddingFactor: 2,
  windowName: 'hamming',
  minDecibel: -40,
  minFrequency: 120,
  maxFrequency: 4000,
  viewSize: {
    width: 800,
    height: 400,
  },
  colors: {
    background: '#000000',
    played: '#ffffff',
    unplayed: '#888888',
  },
};
export type Pipeline = {
  render: (wave: Float32Array, progress: number) => Promise<void>;
  configure: (config: PipelineConfig) => void;
  destroy: () => void;
};
