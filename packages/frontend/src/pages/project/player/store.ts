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
  trackProgress: number;
  frameIndex: number;
  playbackStartTime: number;
};

export const initialState: PlayerState = {
  player: undefined,
  playing: false,
  trackProgress: 0,
  frameIndex: 0,
  playbackStartTime: 0,
};

type Unmount = () => void;

export type PlayerActions = {
  mount: () => Unmount;
  play: () => Promise<void>;
  pause: () => void;
  seek: (trackProgress: number) => Promise<void>;
};

type State = PlayerState & PlayerActions;
export const usePlayerStore = create<State>()(
  subscribeWithSelector((set, get) => {
    useDecoderStore.subscribe(
      (state) => state.channels,
      (channels) => {
        if (!channels) return;
        get().player?.port.methods.init({
          buffers: toChannelBuffers(channels),
        });
      },
    );

    const singletonManager = createSingletonManager(
      async () => {
        const player = await createAudioPlayer({
          playerWorkletUrl,
          trackProgress: (trackProgress) => {
            set({ trackProgress });
          },
          end: () => {
            set({
              playing: false,
              trackProgress: 0,
              frameIndex: 0,
              playbackStartTime: 0,
            });
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
        const { player, frameIndex } = get();
        const { frameCount } = useDecoderStore.getState();
        if (!player || !frameCount) return;
        await player.play(frameCount, frameIndex);
        set({ playing: true, playbackStartTime: player.context.currentTime });
      },
      pause: () => {
        const { player, playbackStartTime, frameIndex } = get();
        if (!player) return;
        player.pause();
        const context = player.context;
        const newFrameIndex =
          frameIndex +
          Math.floor(
            (context.currentTime - playbackStartTime) * context.sampleRate,
          );
        set({ playing: false, frameIndex: newFrameIndex });
      },
      seek: async (trackProgress) => {
        const { player, playing } = get();
        const { frameCount } = useDecoderStore.getState();
        if (!frameCount || !player) return;
        const context = player.context;
        const newFrameIndex = Math.floor(frameCount * trackProgress);
        set({ frameIndex: newFrameIndex, trackProgress });
        if (playing) {
          await player.play(frameCount, newFrameIndex);
          set({ playbackStartTime: context.currentTime });
        }
      },
    };
  }),
);
