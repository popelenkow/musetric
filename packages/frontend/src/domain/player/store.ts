import { type AudioPlayer, createAudioPlayer } from '@musetric/audio';
import { createSingletonManager } from '@musetric/resource-utils';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { useDecoderStore } from '../decoder/store.js';

export type PlayerState = {
  player?: AudioPlayer;
  playing: boolean;
  progress: number;
  startFrame: number;
  startTime: number;
  status: 'pending' | 'success' | 'error';
};

export const initialState: PlayerState = {
  player: undefined,
  playing: false,
  progress: 0,
  startFrame: 0,
  startTime: 0,
  status: 'pending',
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
    const singletonManager = createSingletonManager(
      async () => {
        const player = await createAudioPlayer({
          progress: (progress) => {
            set({ progress });
          },
          end: () => {
            set({ playing: false, progress: 0, startFrame: 0, startTime: 0 });
          },
        });
        set({
          player,
          playing: false,
          progress: 0,
          startFrame: 0,
          startTime: 0,
          status: 'success',
        });
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
        const { frameCount, channels } = useDecoderStore.getState();
        if (!player || !frameCount || !channels) return;
        await player.play(channels, frameCount, startFrame);
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
        const { frameCount, channels } = useDecoderStore.getState();
        if (!frameCount || !player || !channels) return;
        const context = player.context;
        const newStartFrame = Math.floor(frameCount * fraction);
        set({ startFrame: newStartFrame, progress: fraction });
        if (playing) {
          await player.play(channels, frameCount, newStartFrame);
          set({ startTime: context.currentTime });
        }
      },
    };
  }),
);
