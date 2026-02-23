import {
  type AudioPlayer,
  type ChannelArrays,
  createAudioPlayer,
  decodeMp4,
} from '@musetric/audio';
import { createSingletonManager } from '@musetric/resource-utils';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export type PlayerState = {
  player?: AudioPlayer;
  channels?: ChannelArrays;
  frameCount?: number;
  duration: number;
  sampleRate?: number;
  playing: boolean;
  progress: number;
  startFrame: number;
  startTime: number;
  status: 'pending' | 'success' | 'error';
};

export const initialState: PlayerState = {
  player: undefined,
  channels: undefined,
  frameCount: undefined,
  duration: 0,
  playing: false,
  progress: 0,
  startFrame: 0,
  startTime: 0,
  status: 'pending',
};

type Unmount = () => void;

export type PlayerActions = {
  mount: (encodedBuffer: Uint8Array<ArrayBuffer>) => Unmount;
  play: () => Promise<void>;
  pause: () => void;
  seek: (fraction: number) => Promise<void>;
};

type State = PlayerState & PlayerActions;
export const usePlayerStore = create<State>()(
  subscribeWithSelector((set, get) => {
    const singletonManager = createSingletonManager(
      async (encodedBuffer: Uint8Array<ArrayBuffer>) => {
        const player = await createAudioPlayer({
          progress: (progress) => {
            set({ progress });
          },
          end: () => {
            set({ playing: false, progress: 0, startFrame: 0, startTime: 0 });
          },
        });
        try {
          const { sampleRate } = player.context;
          const decoded = await decodeMp4(encodedBuffer.buffer, sampleRate);
          set({
            player,
            channels: decoded.channels,
            frameCount: decoded.frameCount,
            duration: decoded.frameCount / sampleRate,
            sampleRate,
            playing: false,
            progress: 0,
            startFrame: 0,
            startTime: 0,
            status: 'success',
          });
        } catch (error) {
          console.error('Failed to decode project audio track', error);
          set({
            status: 'error',
          });
          return player;
        }

        return player;
      },
      async (player) => {
        await player.destroy();
        set(initialState);
        return Promise.resolve();
      },
    );

    return {
      ...initialState,
      mount: (encodedBuffer) => {
        void singletonManager.create(encodedBuffer);
        return () => {
          void singletonManager.destroy();
        };
      },
      play: async () => {
        const { player, frameCount, channels, startFrame } = get();
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
        const { frameCount, player, channels, playing } = get();
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
