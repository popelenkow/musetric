import {
  type FourierMode,
  type spectrogram,
  type ViewColors,
} from '@musetric/audio';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { usePlayerStore } from '../player/store.js';

export type SettingsState = {
  fourierMode: FourierMode;
  open: boolean;
} & Omit<spectrogram.PipelineConfig, 'viewSize'>;

const initialState: SettingsState = {
  fourierMode: 'fftRadix4',
  windowSize: 1024 * 4,
  sampleRate: 44100,
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
  setColors: (value: ViewColors) => void;
  setOpen: (value: boolean) => void;
};

type State = SettingsState & SettingsActions;
export const useSettingsStore = create<State>()(
  subscribeWithSelector((set) => {
    usePlayerStore.subscribe(
      (state) => state.player,
      (player) => {
        if (!player) return;
        set({ sampleRate: player.context.sampleRate });
      },
    );

    return {
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
      setColors: (colors) => set({ colors }),
      setOpen: (open) => set({ open }),
    };
  }),
);
