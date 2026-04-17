import { type WaveType } from '@musetric/audio';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { engine } from '../../engine/engine.js';

export type ProjectState = {
  isWaveformVisible: boolean;
  isVolumeMixerVisible: boolean;
  trackVolumes: Record<WaveType, number>;
};

const initialState: ProjectState = {
  isWaveformVisible: false,
  isVolumeMixerVisible: true,
  trackVolumes: {
    lead: 1,
    backing: 1,
    instrumental: 1,
  },
};

export type ProjectActions = {
  setWaveformVisible: (value: boolean) => void;
  toggleWaveformVisible: () => void;
  setVolumeMixerVisible: (value: boolean) => void;
  toggleVolumeMixerVisible: () => void;
  setTrackVolume: (waveType: WaveType, volume: number) => void;
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
      setTrackVolume: (waveType, volume) =>
        set((state) => ({
          trackVolumes: {
            ...state.trackVolumes,
            [waveType]: volume,
          },
        })),
    };
  }),
);

export const subscribeProjectStore = () =>
  useProjectStore.subscribe(
    (state) => state.trackVolumes,
    (trackVolumes) => {
      engine.player.setTrackVolume('lead', trackVolumes.lead);
      engine.player.setTrackVolume('backing', trackVolumes.backing);
      engine.player.setTrackVolume('instrumental', trackVolumes.instrumental);
    },
  );
