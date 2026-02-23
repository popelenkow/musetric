import { createPortMessageHandler } from '@musetric/resource-utils/cross/messagePort';
import { type ChannelBuffers } from '../common/channelBuffers.es.js';
import { createPlayerNode, getPlayerPort } from './port.js';

export type AudioPlayer = {
  context: AudioContext;
  play: (
    buffers: ChannelBuffers,
    length: number,
    offset: number,
  ) => Promise<void>;
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
  const context = new AudioContext();
  const node = await createPlayerNode(context);
  const port = getPlayerPort(node);

  port.onmessage = createPortMessageHandler({
    ended: () => options.end?.(),
  });

  let bufferLength: number | undefined = undefined;
  let offset = 0;
  let startTime = 0;
  let raf = 0;

  const tick = () => {
    if (!bufferLength) return;
    const frame =
      offset +
      Math.floor((context.currentTime - startTime) * context.sampleRate);
    const progress = Math.min(frame / bufferLength, 1);
    options.progress?.(progress);
    raf = requestAnimationFrame(tick);
  };

  return {
    context,
    play: async (buffers, length, startOffset) => {
      bufferLength = length;
      offset = startOffset;
      if (context.state === 'suspended') {
        await context.resume();
      }
      port.postMessage({ type: 'play', buffers, offset: startOffset });
      startTime = context.currentTime;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(tick);
    },
    pause: () => {
      port.postMessage({ type: 'pause' });
      cancelAnimationFrame(raf);
    },
    destroy: async () => {
      bufferLength = undefined;
      cancelAnimationFrame(raf);
      port.postMessage({ type: 'pause' });
      port.onmessage = () => undefined;
      node.port.close();
      node.disconnect();
      await context.close();
    },
  };
};
