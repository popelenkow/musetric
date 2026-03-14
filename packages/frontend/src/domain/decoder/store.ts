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
  subscribeWithSelector((set) => {
    let port: DecoderMainPort | undefined = undefined;

    return {
      ...initialState,
      mount: () => {
        port = createDecoderMainPort(decoderWorkerUrl);
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
          port?.terminate();
          port = undefined;
          set(initialState);
        };
      },
      init: (projectId, sampleRate) => {
        port?.postMessage({
          type: 'init',
          projectId,
          sampleRate,
        });
        return () => {
          port?.postMessage({
            type: 'deinit',
          });
          set(initialState);
        };
      },
    };
  }),
);
