import { create } from 'zustand';
import { useDecoderStore } from '../decoder/store.js';
import { useSettingsStore } from '../settings/store.js';
import { analyzeWindowedWave, type SpectralAnalysis } from './analyze.js';

export type SpectralAnalysisState = {
  analysis?: SpectralAnalysis;
};

type State = SpectralAnalysisState;
export const useSpectralAnalysisStore = create<State>(() => {
  useDecoderStore.subscribe(
    (state) => state.channels?.[0],
    (wave) => {
      if (!wave) {
        useSpectralAnalysisStore.setState({ analysis: undefined });
        return;
      }
      const { sampleRate } = useSettingsStore.getState();
      const analysis = analyzeWindowedWave(wave, sampleRate);
      useSpectralAnalysisStore.setState({ analysis });
    },
  );

  return {
    analysis: undefined,
  };
});
