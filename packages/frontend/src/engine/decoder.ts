import { createDecoderMainPort, type DecoderMainPort } from '@musetric/audio';
import type { Store } from '../common/store.js';
import decoderWorkerUrl from './decoder.worker.ts?worker&url';
import type { EngineState } from './state.js';

type Unmount = () => void;

export type EngineDecoder = {
  port: DecoderMainPort;
  mount: (projectId: number) => Unmount;
};

export const createEngineDecoder = (
  store: Store<EngineState>,
  sampleRate: number,
): EngineDecoder => {
  const port = createDecoderMainPort(decoderWorkerUrl);

  port.instance.onerror = () => {
    store.update((state) => {
      state.statuses.decoder = 'error';
    });
  };

  port.bindMethods({
    state: (message) => {
      store.update((state) => {
        state.statuses.decoder = message.status;
      });
    },
    mounted: (message) => {
      store.update((state) => {
        state.statuses.decoder = 'success';
        state.channels = message.channels;
        state.frameCount = message.frameCount;
        state.duration = message.frameCount / sampleRate;
      });
    },
    unmounted: () => {
      store.update((state) => {
        state.statuses.decoder = 'pending';
        state.channels = undefined;
        state.frameCount = undefined;
        state.duration = 0;
      });
    },
  });

  return {
    port,
    mount: (projectId) => {
      port.methods.mount({
        projectId,
        sampleRate,
      });

      return () => {
        port.methods.unmount();
      };
    },
  };
};
