import { engine } from '../../../engine/engine.js';

const subtitleSeekLeadSeconds = 0.15;

export const seekSubtitlePlaybackTime = (playbackTime: number) => {
  const { duration, frameCount } = engine.store.get();
  if (!frameCount || duration <= 0) {
    return;
  }

  const seekTime = Math.max(0, playbackTime - subtitleSeekLeadSeconds);
  const frameIndex = Math.floor((seekTime / duration) * frameCount);
  engine.player.seek(frameIndex);
};
