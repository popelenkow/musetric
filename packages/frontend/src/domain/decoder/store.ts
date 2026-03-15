import {
  type ChannelArrays,
  createDecoderMainPort,
  type DecoderMainPort,
  type FromDecoderWorkerMessage,
} from '@musetric/audio';
import { createPortMessageHandler } from '@musetric/resource-utils/cross/messagePort';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import decoderWorkerUrl from './decoder.worker.ts?worker&url';

export type DecoderState = {
  port?: DecoderMainPort;
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
  mount: () => Unmount;
  init: (projectId: number, sampleRate: number) => Unmount | undefined;
};

type State = DecoderState & DecoderActions;
export const useDecoderStore = create<State>()(
  subscribeWithSelector((set, get) => {
    return {
      ...initialState,
      mount: () => {
        const port = createDecoderMainPort(decoderWorkerUrl);
        set({ port });
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

        return () => {
          get().port?.terminate();
          set({ port: undefined, status: 'pending' });
        };
      },
      init: (projectId, sampleRate) => {
        get().port?.postMessage({
          type: 'init',
          projectId,
          sampleRate,
        });
        return () => {
          get().port?.postMessage({
            type: 'deinit',
          });
          set({ port: undefined, status: 'pending' });
        };
      },
    };
  }),
);
