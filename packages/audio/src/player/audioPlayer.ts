import { defaultSampleRate } from '@musetric/resource-utils';
import {
  createPlayerNode,
  getPlayerPort,
  type PlayerMainPort,
} from './port.js';

export type AudioPlayer = {
  context: AudioContext;
  port: PlayerMainPort;
  play: (frameCount: number, frameIndex: number) => Promise<void>;
  pause: () => void;
  destroy: () => Promise<void>;
};

export type AudioPlayerOptions = {
  playerWorkletUrl: string;
  trackProgress?: (trackProgress: number) => void;
  end?: () => void;
};

export const createAudioPlayer = async (
  options: AudioPlayerOptions,
): Promise<AudioPlayer> => {
  const { playerWorkletUrl } = options;
  const context = new AudioContext({ sampleRate: defaultSampleRate });
  const node = await createPlayerNode(context, playerWorkletUrl);
  const port = getPlayerPort(node);

  port.bindMethods({
    ended: () => options.end?.(),
  });

  let totalFrameCount: number | undefined = undefined;
  let playStartFrameIndex = 0;
  let playbackStartTime = 0;
  let raf = 0;

  const tick = () => {
    if (!totalFrameCount) return;
    const currentFrameIndex =
      playStartFrameIndex +
      Math.floor(
        (context.currentTime - playbackStartTime) * context.sampleRate,
      );
    const trackProgress = Math.min(currentFrameIndex / totalFrameCount, 1);
    options.trackProgress?.(trackProgress);
    raf = requestAnimationFrame(tick);
  };

  return {
    context,
    port,
    play: async (frameCount, frameIndex) => {
      totalFrameCount = frameCount;
      playStartFrameIndex = frameIndex;
      if (context.state === 'suspended') {
        await context.resume();
      }
      port.methods.play({ frameIndex });
      playbackStartTime = context.currentTime;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(tick);
    },
    pause: () => {
      port.methods.pause();
      cancelAnimationFrame(raf);
    },
    destroy: async () => {
      port.methods.pause();
      port.methods.deinit();
      port.instance.onmessage = () => undefined;
      port.instance.close();
      node.disconnect();
      await context.close();
    },
  };
};
