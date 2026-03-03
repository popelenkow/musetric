import { type ChannelArrays, decodeMp4 } from '@musetric/audio';
import { createSingletonManager } from '@musetric/resource-utils';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export type DecoderState = {
  channels?: ChannelArrays<SharedArrayBuffer>;
  frameCount?: number;
  duration: number;
  status: 'pending' | 'success' | 'error';
};

const initialState: DecoderState = {
  channels: undefined,
  frameCount: undefined,
  duration: 0,
  status: 'pending',
};

type Unmount = () => void;
export type DecoderActions = {
  mount: (
    encodedBuffer: Uint8Array<ArrayBuffer>,
    sampleRate: number,
  ) => Unmount;
};

type State = DecoderState & DecoderActions;
export const useDecoderStore = create<State>()(
  subscribeWithSelector((set) => {
    const singletonManager = createSingletonManager(
      async (encodedBuffer: Uint8Array<ArrayBuffer>, sampleRate: number) => {
        try {
          const decoded = await decodeMp4(encodedBuffer.buffer, sampleRate);
          set({
            channels: decoded.channels,
            frameCount: decoded.frameCount,
            duration: decoded.frameCount / sampleRate,
            status: 'success',
          });
        } catch (error) {
          console.error('Failed to decode project audio track', error);
          set({ status: 'error' });
        }
      },
      async () => {
        set(initialState);
        return Promise.resolve();
      },
    );

    return {
      ...initialState,
      mount: (encodedBuffer, sampleRate) => {
        void singletonManager.create(encodedBuffer, sampleRate);
        return () => {
          void singletonManager.destroy();
        };
      },
    };
  }),
);
