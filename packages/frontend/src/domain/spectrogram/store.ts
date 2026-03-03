import {
  getCanvasSize,
  type spectrogram,
  subscribeResizeObserver,
  type ViewSize,
} from '@musetric/audio';
import {
  createPortMessageHandler,
  type TypedMessagePort,
} from '@musetric/resource-utils/cross/messagePort';
import { create } from 'zustand';
import { envs } from '../../common/envs.js';
import { usePlayerStore } from '../player/store.js';
import { type SettingsState, useSettingsStore } from '../settings/store.js';
import { createSpectrogramWorker } from './port.js';
import {
  type FromSpectrogramWorkerMessage,
  type ToSpectrogramWorkerMessage,
} from './protocol.es.js';

const configKeys = [
  'windowSize',
  'sampleRate',
  'visibleTimeBefore',
  'visibleTimeAfter',
  'zeroPaddingFactor',
  'windowName',
  'minDecibel',
  'minFrequency',
  'maxFrequency',
  'viewSize',
  'colors',
] as const satisfies (keyof spectrogram.PipelineConfig)[];

const getWorkerConfig = (
  state: SettingsState & { viewSize: ViewSize },
): spectrogram.PipelineConfig =>
  configKeys.reduce(
    (config, key) => ({ ...config, [key]: state[key] }),
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    {} as spectrogram.PipelineConfig,
  );

export type SpectrogramState = {
  port?: TypedMessagePort<
    Worker,
    FromSpectrogramWorkerMessage,
    ToSpectrogramWorkerMessage
  >;
  status: 'pending' | 'error' | 'success';
};

type Unmount = () => void;
export type SpectrogramActions = {
  mount: (canvas: HTMLCanvasElement) => Unmount | undefined;
};

type State = SpectrogramState & SpectrogramActions;
export const useSpectrogramStore = create<State>((set, get) => {
  usePlayerStore.subscribe(
    (state) => state.channels?.[0]?.buffer,
    (waveBuffer) => {
      if (!waveBuffer) return;
      get().port?.postMessage({
        type: 'wave',
        waveBuffer,
      });
    },
  );

  usePlayerStore.subscribe(
    (state) => state.progress,
    (progress) => {
      get().port?.postMessage({
        type: 'progress',
        progress,
      });
    },
  );

  return {
    port: undefined,
    status: 'pending',
    mount: (canvas) => {
      const port = createSpectrogramWorker();
      set({ port });

      port.onmessage = createPortMessageHandler<FromSpectrogramWorkerMessage>({
        state: (message) => {
          set({ status: message.status });
        },
      });
      port.onerror = () => {
        set({ status: 'error' });
      };

      const viewSize = getCanvasSize(canvas);
      const offscreenCanvas = canvas.transferControlToOffscreen();
      const settings = useSettingsStore.getState();
      const { channels, progress } = usePlayerStore.getState();
      port.postMessage(
        {
          type: 'init',
          canvas: offscreenCanvas,
          config: getWorkerConfig({ ...settings, viewSize }),
          progress,
          waveBuffer: channels?.[0]?.buffer,
          fourierMode: settings.fourierMode,
          profiling: envs.spectrogramProfiling,
        },
        [offscreenCanvas],
      );

      const unsubscribeResizeObserver = subscribeResizeObserver(
        canvas,
        async () => {
          port.postMessage({
            type: 'config',
            patch: { viewSize: getCanvasSize(canvas) },
          });
          return Promise.resolve();
        },
      );
      const unsubscribeSettings = useSettingsStore.subscribe(
        (state) => state,
        (state) => {
          port.postMessage({
            type: 'config',
            patch: getWorkerConfig({
              ...state,
              viewSize: getCanvasSize(canvas),
            }),
          });
        },
      );

      return () => {
        unsubscribeSettings();
        unsubscribeResizeObserver();
        port.terminate();
        set({ port: undefined, status: 'pending' });
      };
    },
  };
});
