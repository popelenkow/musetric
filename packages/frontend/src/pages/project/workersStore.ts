import { create } from 'zustand';
import { useDecoderStore } from './decoder/store.js';
import { usePlayerStore } from './player/store.js';
import { useSpectrogramStore } from './spectrogram/store.js';
import { useWaveformStore } from './waveform/store.js';

type Unmount = () => void;
export type WorkersActions = {
  mount: () => Unmount;
};

export const useWorkersStore = create<WorkersActions>(() => {
  return {
    mount: () => {
      const unmounts = [
        usePlayerStore.getState().mount(),
        useSpectrogramStore.getState().mount(),
        useWaveformStore.getState().mount(),
        useDecoderStore.getState().mount(),
      ];
      return () => {
        unmounts.forEach((unmount) => unmount());
      };
    },
  };
});
