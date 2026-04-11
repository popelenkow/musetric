import {
  createSpectrogramMainPort,
  getCanvasSize,
  type SpectrogramConfig,
  type SpectrogramMainPort,
  subscribeResizeObserver,
} from '@musetric/audio';
import type { Store } from '../common/store.js';
import spectrogramWorkerUrl from './spectrogram.worker.ts?worker&url';
import { type EngineState, getTrackProgress } from './state.js';

type Unmount = () => void;

export type EngineSpectrogram = {
  port: SpectrogramMainPort;
  mount: (
    canvas: HTMLCanvasElement,
    config: Partial<SpectrogramConfig>,
  ) => Unmount;
  setConfig: (patch: Partial<SpectrogramConfig>) => void;
};

export type CreateEngineSpectrogramOptions = {
  store: Store<EngineState>;
  sampleRate: number;
  decoderPort: MessagePort;
};

export const createEngineSpectrogram = (
  options: CreateEngineSpectrogramOptions,
): EngineSpectrogram => {
  const { store, sampleRate, decoderPort } = options;
  const port = createSpectrogramMainPort(spectrogramWorkerUrl);
  port.instance.onerror = () => {
    store.update((state) => {
      state.statuses.spectrogram = 'error';
    });
  };

  port.bindMethods({
    state: (message) => {
      store.update((state) => {
        state.statuses.spectrogram = message.status;
      });
    },
  });

  store.subscribe(getTrackProgress, (trackProgress) => {
    port.methods.trackProgress({
      trackProgress,
    });
  });

  store.subscribe(
    (state) => state.colors,
    (colors) => {
      port.methods.config({
        patch: { colors },
      });
    },
  );

  port.methods.boot({
    decoderPort,
  });

  return {
    port,
    mount: (canvas, config) => {
      const viewSize = getCanvasSize(canvas);
      const offscreenCanvas = canvas.transferControlToOffscreen();

      port.methods.mount({
        config: {
          ...config,
          canvas: offscreenCanvas,
          viewSize,
          colors: store.get().colors,
          sampleRate,
        },
        trackProgress: getTrackProgress(store.get()),
      });

      const unsubscribeResizeObserver = subscribeResizeObserver(canvas, () => {
        port.methods.config({
          patch: { viewSize: getCanvasSize(canvas) },
        });
      });

      return () => {
        unsubscribeResizeObserver();
        port.methods.unmount();
        store.update((state) => {
          state.statuses.spectrogram = 'pending';
        });
      };
    },
    setConfig: (patch) => {
      port.methods.config({
        patch,
      });
    },
  };
};
