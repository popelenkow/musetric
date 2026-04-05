import {
  type ChannelArrays,
  createDecoderMainPort,
  type DecoderMainPort,
} from '@musetric/audio';
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
        port.instance.onerror = () => {
          set({ status: 'error' });
        };
        port.bindMethods({
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
          get().port?.instance.terminate();
          set({ port: undefined, ...initialState });
        };
      },
      init: (projectId, sampleRate) => {
        get().port?.methods.mount({
          projectId,
          sampleRate,
        });
        return () => {
          get().port?.methods.unmount();
          set(initialState);
        };
      },
    };
  }),
);
