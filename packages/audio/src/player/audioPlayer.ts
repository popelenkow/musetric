import { defaultSampleRate } from '@musetric/resource-utils';
import { createPortMessageHandler } from '@musetric/resource-utils/cross/messagePort';
import {
  createPlayerNode,
  getPlayerPort,
  type PlayerMainPort,
} from './port.js';

export type AudioPlayer = {
  context: AudioContext;
  port: PlayerMainPort;
  play: (frameCount: number, startFrame: number) => Promise<void>;
  pause: () => void;
  destroy: () => Promise<void>;
};

export type AudioPlayerOptions = {
  progress?: (progress: number) => void;
  end?: () => void;
};

export const createAudioPlayer = async (
  options: AudioPlayerOptions = {},
): Promise<AudioPlayer> => {
  const context = new AudioContext({ sampleRate: defaultSampleRate });
  const node = await createPlayerNode(context);
  const port = getPlayerPort(node);

  port.onmessage = createPortMessageHandler({
    ended: () => options.end?.(),
  });

  let totalFrameCount: number | undefined = undefined;
  let playStartFrame = 0;
  let startTime = 0;
  let raf = 0;

  const tick = () => {
    if (!totalFrameCount) return;
    const frame =
      playStartFrame +
      Math.floor((context.currentTime - startTime) * context.sampleRate);
    const progress = Math.min(frame / totalFrameCount, 1);
    options.progress?.(progress);
    raf = requestAnimationFrame(tick);
  };

  return {
    context,
    port,
    play: async (frameCount, startFrame) => {
      totalFrameCount = frameCount;
      playStartFrame = startFrame;
      if (context.state === 'suspended') {
        await context.resume();
      }
      port.postMessage({ type: 'play', startFrame });
      startTime = context.currentTime;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(tick);
    },
    pause: () => {
      port.postMessage({ type: 'pause' });
      cancelAnimationFrame(raf);
    },
    destroy: async () => {
      totalFrameCount = undefined;
      cancelAnimationFrame(raf);
      port.postMessage({ type: 'pause' });
      port.onmessage = () => undefined;
      node.port.close();
      node.disconnect();
      await context.close();
    },
  };
};
