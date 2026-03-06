import {
  allSpectrogramConfigKeys,
  createSpectrogramMainPort,
  type FromSpectrogramWorkerMessage,
  getCanvasSize,
  type SpectrogramConfig,
  type SpectrogramMainPort,
  subscribeResizeObserver,
  type ViewSize,
} from '@musetric/audio';
import { createPortMessageHandler } from '@musetric/resource-utils/cross/messagePort';
import { create } from 'zustand';
import { envs } from '../../common/envs.js';
import { useDecoderStore } from '../decoder/store.js';
import { usePlayerStore } from '../player/store.js';
import { type SettingsState, useSettingsStore } from '../settings/store.js';

const getWorkerConfig = (
  state: SettingsState & { viewSize: ViewSize },
): SpectrogramConfig =>
  allSpectrogramConfigKeys.reduce(
    (config, key) => ({ ...config, [key]: state[key] }),
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    {} as SpectrogramConfig,
  );

export type SpectrogramState = {
  port?: SpectrogramMainPort;
  status: 'pending' | 'error' | 'success';
};

type Unmount = () => void;
export type SpectrogramActions = {
  mount: (canvas: HTMLCanvasElement) => Unmount | undefined;
};

type State = SpectrogramState & SpectrogramActions;
export const useSpectrogramStore = create<State>((set, get) => {
  useDecoderStore.subscribe(
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
      const port = createSpectrogramMainPort();
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
      const { channels } = useDecoderStore.getState();
      const { progress } = usePlayerStore.getState();
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
