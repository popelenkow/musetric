import {
  createSpectrogramMainPort,
  extractSpectrogramConfig,
  type FromSpectrogramWorkerMessage,
  getCanvasSize,
  type SpectrogramMainPort,
  subscribeResizeObserver,
} from '@musetric/audio';
import { createPortMessageHandler } from '@musetric/resource-utils/cross/messagePort';
import { create } from 'zustand';
import { useDecoderStore } from '../decoder/store.js';
import { usePlayerStore } from '../player/store.js';
import { useSettingsStore } from '../settings/store.js';
import spectrogramWorkerUrl from './spectrogram.worker.js?worker&url';

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
  useSettingsStore.subscribe(
    (state) => state,
    (state) => {
      get().port?.postMessage({
        type: 'config',
        patch: extractSpectrogramConfig(state),
      });
    },
  );

  return {
    status: 'pending',
    mount: () => {
      const port = createSpectrogramMainPort(spectrogramWorkerUrl);
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
          config: extractSpectrogramConfig({
            ...settings,
            canvas: offscreenCanvas,
            viewSize,
          }),
          progress,
          waveBuffer: channels?.[0]?.buffer,
          fourierMode: settings.fourierMode,
        },
        [offscreenCanvas],
      );
      const unsubscribeResizeObserver = subscribeResizeObserver(canvas, () => {
        get().port?.postMessage({
          type: 'config',
          patch: { viewSize: getCanvasSize(canvas) },
        });
      });

      return () => {
        unsubscribeResizeObserver();
        get().port?.postMessage({
          type: 'deinit',
        });
        set({ status: 'pending' });
      };
    },
  };
});
