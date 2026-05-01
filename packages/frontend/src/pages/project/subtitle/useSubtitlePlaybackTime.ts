import { useSyncExternalStore } from 'react';
import { engine } from '../../../engine/engine.js';
import { getSubtitlePlaybackTimeFromState } from './subtitlePlayback.js';

const subscribeSubtitlePlaybackTime = (callback: () => void) => {
  return engine.store.subscribe(getSubtitlePlaybackTimeFromState, () => {
    callback();
  });
};

const getSubtitlePlaybackTimeSnapshot = () => {
  return getSubtitlePlaybackTimeFromState(engine.store.get());
};

export const useSubtitlePlaybackTime = () => {
  return useSyncExternalStore(
    subscribeSubtitlePlaybackTime,
    getSubtitlePlaybackTimeSnapshot,
    getSubtitlePlaybackTimeSnapshot,
  );
};
