import {
  type FourierMode,
  type spectrogram,
  type ViewColors,
} from '@musetric/audio';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export type SettingsState = {
  fourierMode: FourierMode;
  open: boolean;
} & Omit<spectrogram.PipelineConfig, 'sampleRate' | 'viewSize'>;

const initialState: SettingsState = {
  windowSize: 1024 * 4,
  visibleTimeBefore: 2.0,
  visibleTimeAfter: 2.0,
  zeroPaddingFactor: 2,
  windowName: 'hamming',
  minDecibel: -40,
  minFrequency: 120,
  maxFrequency: 4000,
  colors: {
    background: '#000000',
    played: '#ffffff',
    unplayed: '#888888',
  },
  fourierMode: 'fftRadix4',
  open: false,
};

export type SettingsActions = {
  setFourierMode: (value: FourierMode) => void;
  setWindowName: (value: spectrogram.WindowName) => void;
  setWindowSize: (value: number) => void;
  setMinFrequency: (value: number) => void;
  setMaxFrequency: (value: number) => void;
  setMinDecibel: (value: number) => void;
  setVisibleTimeBefore: (value: number) => void;
  setVisibleTimeAfter: (value: number) => void;
  setZeroPaddingFactor: (value: spectrogram.ZeroPaddingFactor) => void;
  setOpen: (value: boolean) => void;
  setColors: (value: ViewColors) => void;
};

type State = SettingsState & SettingsActions;
export const useSettingsStore = create<State>()(
  subscribeWithSelector((set) => ({
    ...initialState,
    setFourierMode: (fourierMode) => set({ fourierMode }),
    setWindowName: (windowName) => set({ windowName }),
    setWindowSize: (windowSize) => set({ windowSize }),
    setMinFrequency: (minFrequency) => set({ minFrequency }),
    setMaxFrequency: (maxFrequency) => set({ maxFrequency }),
    setMinDecibel: (minDecibel) => set({ minDecibel }),
    setVisibleTimeBefore: (visibleTimeBefore) => set({ visibleTimeBefore }),
    setVisibleTimeAfter: (visibleTimeAfter) => set({ visibleTimeAfter }),
    setZeroPaddingFactor: (zeroPaddingFactor) => set({ zeroPaddingFactor }),
    setOpen: (open) => set({ open }),
    setColors: (colors) => set({ colors }),
  })),
);
