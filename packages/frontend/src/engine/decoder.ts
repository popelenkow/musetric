import { createDecoderMainPort, type DecoderMainPort } from '@musetric/audio';
import type { Store } from '../common/store.js';
import decoderWorkerUrl from './decoder.worker.ts?worker&url';
import type { EngineState } from './state.js';

type Unmount = () => void;

export type EngineDecoder = {
  port: DecoderMainPort;
  mount: (projectId: number) => Unmount;
};

export type CreateEngineDecoderOptions = {
  store: Store<EngineState>;
  sampleRate: number;
  playerPort: MessagePort;
  spectrogramPort: MessagePort;
};

export const createEngineDecoder = (
  options: CreateEngineDecoderOptions,
): EngineDecoder => {
  const { store, sampleRate, playerPort, spectrogramPort } = options;
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
        state.frameCount = message.frameCount;
        state.duration = message.frameCount / sampleRate;
      });
    },
    unmounted: () => {
      store.update((state) => {
        state.statuses.decoder = 'pending';
        state.frameCount = undefined;
        state.duration = 0;
      });
    },
  });

  port.methods.boot({
    playerPort,
    spectrogramPort,
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
