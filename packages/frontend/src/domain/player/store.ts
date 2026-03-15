import {
  type AudioPlayer,
  createAudioPlayer,
  toChannelBuffers,
} from '@musetric/audio';
import { createSingletonManager } from '@musetric/resource-utils';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { useDecoderStore } from '../decoder/store.js';
import playerWorkletUrl from './player.worklet.ts?worker&url';

export type PlayerState = {
  player?: AudioPlayer;
  playing: boolean;
  progress: number;
  startFrame: number;
  startTime: number;
};

export const initialState: PlayerState = {
  player: undefined,
  playing: false,
  progress: 0,
  startFrame: 0,
  startTime: 0,
};

type Unmount = () => void;

export type PlayerActions = {
  mount: () => Unmount;
  play: () => Promise<void>;
  pause: () => void;
  seek: (fraction: number) => Promise<void>;
};

type State = PlayerState & PlayerActions;
export const usePlayerStore = create<State>()(
  subscribeWithSelector((set, get) => {
    useDecoderStore.subscribe(
      (state) => state.channels,
      (channels) => {
        if (!channels) return;
        get().player?.port.postMessage({
          type: 'init',
          buffers: toChannelBuffers(channels),
        });
      },
    );

    const singletonManager = createSingletonManager(
      async () => {
        const player = await createAudioPlayer({
          playerWorkletUrl,
          progress: (progress) => {
            set({ progress });
          },
          end: () => {
            set({ playing: false, progress: 0, startFrame: 0, startTime: 0 });
          },
        });
        set({ player });
        return player;
      },
      async (player) => {
        await player.destroy();
        set(initialState);
      },
    );

    return {
      ...initialState,
      mount: () => {
        void singletonManager.create();
        return () => {
          void singletonManager.destroy();
        };
      },
      play: async () => {
        const { player, startFrame } = get();
        const { frameCount } = useDecoderStore.getState();
        if (!player || !frameCount) return;
        await player.play(frameCount, startFrame);
        set({ playing: true, startTime: player.context.currentTime });
      },
      pause: () => {
        const { player, startTime, startFrame } = get();
        if (!player) return;
        player.pause();
        const context = player.context;
        const newStartFrame =
          startFrame +
          Math.floor((context.currentTime - startTime) * context.sampleRate);
        set({ playing: false, startFrame: newStartFrame });
      },
      seek: async (fraction) => {
        const { player, playing } = get();
        const { frameCount } = useDecoderStore.getState();
        if (!frameCount || !player) return;
        const context = player.context;
        const newStartFrame = Math.floor(frameCount * fraction);
        set({ startFrame: newStartFrame, progress: fraction });
        if (playing) {
          await player.play(frameCount, newStartFrame);
          set({ startTime: context.currentTime });
        }
      },
    };
  }),
);
