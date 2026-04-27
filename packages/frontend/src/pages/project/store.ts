import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export type DetailsMode = 'mixer' | 'subtitles';
export type VisualizationMode = 'spectrogram' | 'waveform';

export type ProjectState = {
  visualizationMode: VisualizationMode;
  detailsMode: DetailsMode;
};

const initialState: ProjectState = {
  visualizationMode: 'spectrogram',
  detailsMode: 'mixer',
};

export type ProjectActions = {
  setVisualizationMode: (value: VisualizationMode) => void;
  setDetailsMode: (value: DetailsMode) => void;
};

type State = ProjectState & ProjectActions;

export const useProjectStore = create<State>()(
  subscribeWithSelector((set) => {
    return {
      ...initialState,
      setVisualizationMode: (visualizationMode) => set({ visualizationMode }),
      setDetailsMode: (detailsMode) => set({ detailsMode }),
    };
  }),
);
