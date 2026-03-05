import {
  type ChannelArrays,
  createDecoderMainPort,
  type FromDecoderWorkerMessage,
} from '@musetric/audio';
import { createSingletonManager } from '@musetric/resource-utils';
import { createPortMessageHandler } from '@musetric/resource-utils/cross/messagePort';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import decoderWorkerUrl from './decoder.worker.ts?worker&url';

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
  mount: (projectId: number, sampleRate: number) => Unmount;
};

type State = DecoderState & DecoderActions;
export const useDecoderStore = create<State>()(
  subscribeWithSelector((set) => {
    const singletonManager = createSingletonManager(
      async (projectId: number, sampleRate: number) => {
        const port = createDecoderMainPort(decoderWorkerUrl);
        port.onerror = () => {
          set({ status: 'error' });
        };

        port.onmessage = createPortMessageHandler<FromDecoderWorkerMessage>({
          state: (message) => {
            set({ status: message.status });
          },
          decoded: (message) => {
            set({
              channels: message.channels,
              frameCount: message.frameCount,
              duration: message.duration,
              status: 'success',
            });
          },
        });

        port.postMessage({
          type: 'init',
          projectId,
          sampleRate,
        });

        set(initialState);
        await Promise.resolve();
        return port;
      },
      async (port) => {
        port.terminate();
        set(initialState);
        return Promise.resolve();
      },
    );

    return {
      ...initialState,
      mount: (projectId, sampleRate) => {
        void singletonManager.create(projectId, sampleRate);
        return () => {
          void singletonManager.destroy();
        };
      },
    };
  }),
);
