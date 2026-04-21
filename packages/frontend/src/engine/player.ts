import {
  playerChannel,
  playerProcessorName,
  type WaveType,
} from '@musetric/audio';
import {
  type ControlledPromise,
  createControlledPromise,
} from '@musetric/resource-utils';
import type { Store } from '../common/store.js';
import playerWorkletUrl from './player.worklet.ts?worker&url';
import { type EngineState } from './state.js';

export type EnginePlayer = {
  boot: () => Promise<void>;
  play: () => Promise<void>;
  pause: () => void;
  seek: (frameIndex: number) => void;
  setTrackVolume: (waveType: WaveType, volume: number) => void;
};

export const createEngineStubPlayer = (): EnginePlayer => ({
  boot: async () => {
    // nothing
  },
  play: async () => {
    // nothing
  },
  pause: () => {
    // nothing
  },
  seek: () => {
    // nothing
  },
  setTrackVolume: () => {
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
  await context.audioWorklet.addModule(playerWorkletUrl);
  const node = new AudioWorkletNode(context, playerProcessorName, {
    numberOfOutputs: 1,
    outputChannelCount: [2],
  });
  node.connect(context.destination);
  const port = playerChannel.outbound(node.port);
  const bootPromise: ControlledPromise<void> = createControlledPromise<void>();

  port.bindHandlers({
    booted: () => {
      bootPromise.resolve();
    },
    setPlaying: (message) => {
      store.update((state) => {
        state.playing = message.playing;
        state.frameIndex = message.frameIndex;
      });
    },
    setFrameIndex: (message) => {
      store.update((state) => {
        state.frameIndex = message.frameIndex;
      });
    },
  });

  const ref: EnginePlayer = {
    boot: async () => {
      port.methods.boot({
        dataPort: decoderPort,
      });

      return bootPromise.promise;
    },
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
    setTrackVolume: (waveType, volume) => {
      port.methods.setTrackVolume({
        waveType,
        volume,
      });
    },
  };

  return ref;
};
