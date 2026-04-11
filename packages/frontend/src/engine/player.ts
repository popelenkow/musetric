import { createPlayerNode, getPlayerPort } from '@musetric/audio';
import type { Store } from '../common/store.js';
import playerWorkletUrl from './player.worklet.ts?worker&url';
import { type EngineState } from './state.js';

export type EnginePlayer = {
  play: () => Promise<void>;
  pause: () => void;
  seek: (frameIndex: number) => void;
};

export const createEngineStubPlayer = (): EnginePlayer => ({
  play: async () => {
    // nothing
  },
  pause: () => {
    // nothing
  },
  seek: () => {
    // nothing
  },
});

export type CreateEnginePlayerOptions = {
  context: AudioContext;
  store: Store<EngineState>;
  decoderPort: MessagePort;
};

export const createEnginePlayer = async (
  options: CreateEnginePlayerOptions,
): Promise<EnginePlayer> => {
  const { context, store, decoderPort } = options;
  const node = await createPlayerNode(context, playerWorkletUrl);
  const port = getPlayerPort(node);

  port.bindMethods({
    playing: (message) => {
      store.update((state) => {
        state.playing = message.playing;
        state.frameIndex = message.frameIndex;
      });
    },
    frameIndex: (message) => {
      store.update((state) => {
        state.frameIndex = message.frameIndex;
      });
    },
  });
  port.methods.boot({
    decoderPort,
  });

  const ref: EnginePlayer = {
    play: async () => {
      if (context.state === 'suspended') {
        await context.resume();
      }
      port.methods.play();
    },
    pause: () => {
      port.methods.pause();
    },
    seek: (nextFrameIndex) => {
      port.methods.seek({
        frameIndex: nextFrameIndex,
      });
    },
  };

  return ref;
};
