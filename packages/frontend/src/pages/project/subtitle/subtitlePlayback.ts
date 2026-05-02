import { type EngineState, getTrackProgress } from '../../../engine/state.js';

export const getSubtitlePlaybackTimeFromState = (state: EngineState) => {
  return state.duration * getTrackProgress(state);
};
