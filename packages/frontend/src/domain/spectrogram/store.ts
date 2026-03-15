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
  mount: () => Unmount;
  init: (canvas: HTMLCanvasElement) => Unmount;
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
    status: 'pending',
    mount: () => {
      const port = createSpectrogramMainPort();
      set({ port });
      port.onerror = () => {
        set({ status: 'error' });
      };
      port.onmessage = createPortMessageHandler<FromSpectrogramWorkerMessage>({
        state: (message) => {
          set({ status: message.status });
        },
      });

      return () => {
        get().port?.terminate();
        set({ port: undefined, status: 'pending' });
      };
    },
    init: (canvas) => {
      const viewSize = getCanvasSize(canvas);
      const offscreenCanvas = canvas.transferControlToOffscreen();
      const settings = useSettingsStore.getState();
      const { channels } = useDecoderStore.getState();
      const { progress } = usePlayerStore.getState();
      get().port?.postMessage(
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

      const unsubscribeResizeObserver = subscribeResizeObserver(canvas, () => {
        get().port?.postMessage({
          type: 'config',
          patch: { viewSize: getCanvasSize(canvas) },
        });
      });

      const unsubscribeSettings = useSettingsStore.subscribe(
        (state) => state,
        (state) => {
          get().port?.postMessage({
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
        get().port?.postMessage({
          type: 'deinit',
        });
        set({ port: undefined, status: 'pending' });
      };
    },
  };
});
