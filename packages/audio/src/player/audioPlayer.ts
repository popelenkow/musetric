import { defaultSampleRate } from '@musetric/resource-utils';
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
  playerWorkletUrl: string;
  progress?: (progress: number) => void;
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
      port.methods.play({ startFrame });
      startTime = context.currentTime;
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
