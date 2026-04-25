import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export type ProjectState = {
  isWaveformVisible: boolean;
  isVolumeMixerVisible: boolean;
};

const initialState: ProjectState = {
  isWaveformVisible: false,
  isVolumeMixerVisible: true,
};

export type ProjectActions = {
  setWaveformVisible: (value: boolean) => void;
  toggleWaveformVisible: () => void;
  setVolumeMixerVisible: (value: boolean) => void;
  toggleVolumeMixerVisible: () => void;
};

type State = ProjectState & ProjectActions;

export const useProjectStore = create<State>()(
  subscribeWithSelector((set) => {
    return {
      ...initialState,
      setWaveformVisible: (isWaveformVisible) => set({ isWaveformVisible }),
      toggleWaveformVisible: () =>
        set((state) => ({
          isWaveformVisible: !state.isWaveformVisible,
        })),
      setVolumeMixerVisible: (isVolumeMixerVisible) =>
        set({ isVolumeMixerVisible }),
      toggleVolumeMixerVisible: () =>
        set((state) => ({
          isVolumeMixerVisible: !state.isVolumeMixerVisible,
        })),
    };
  }),
);
