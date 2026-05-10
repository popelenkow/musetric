import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export type VisualizationMode = 'spectrogram' | 'tracks';

export type ProjectState = {
  visualizationMode: VisualizationMode;
  subtitlesOpen: boolean;
  transposeAnchorEl?: HTMLElement;
  tempoAnchorEl?: HTMLElement;
};

const initialState: ProjectState = {
  visualizationMode: 'spectrogram',
  subtitlesOpen: true,
};

export type ProjectActions = {
  setVisualizationMode: (value: VisualizationMode) => void;
  setSubtitlesOpen: (value: boolean) => void;
  setTransposeAnchorEl: (anchorEl: HTMLElement | undefined) => void;
  setTempoAnchorEl: (anchorEl: HTMLElement | undefined) => void;
};

type State = ProjectState & ProjectActions;

export const useProjectStore = create<State>()(
  subscribeWithSelector((set) => {
    return {
      ...initialState,
      setVisualizationMode: (visualizationMode) => set({ visualizationMode }),
      setSubtitlesOpen: (subtitlesOpen) => set({ subtitlesOpen }),
      setTransposeAnchorEl: (transposeAnchorEl) =>
        set({
          transposeAnchorEl,
        }),
      setTempoAnchorEl: (tempoAnchorEl) =>
        set({
          tempoAnchorEl,
        }),
    };
  }),
);
