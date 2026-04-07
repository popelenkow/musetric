import {
  createSpectrogramMainPort,
  extractSpectrogramConfig,
  getCanvasSize,
  type SpectrogramMainPort,
  subscribeResizeObserver,
} from '@musetric/audio';
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
      get().port?.methods.wave({
        waveBuffer,
      });
    },
  );

  usePlayerStore.subscribe(
    (state) => state.trackProgress,
    (trackProgress) => {
      get().port?.methods.trackProgress({
        trackProgress,
      });
    },
  );
  useSettingsStore.subscribe(
    (state) => state,
    (state) => {
      get().port?.methods.config({
        patch: extractSpectrogramConfig(state),
      });
    },
  );

  return {
    status: 'pending',
    mount: () => {
      const port = createSpectrogramMainPort(spectrogramWorkerUrl);
      set({ port });
      port.instance.onerror = () => {
        set({ status: 'error' });
      };
      port.bindMethods({
        state: (message) => {
          set({ status: message.status });
        },
      });

      return () => {
        get().port?.instance.terminate();
        set({ port: undefined, status: 'pending' });
      };
    },
    init: (canvas) => {
      const viewSize = getCanvasSize(canvas);
      const offscreenCanvas = canvas.transferControlToOffscreen();
      const settings = useSettingsStore.getState();
      const { channels } = useDecoderStore.getState();
      const { trackProgress } = usePlayerStore.getState();
      get().port?.methods.mount({
        config: extractSpectrogramConfig({
          ...settings,
          canvas: offscreenCanvas,
          viewSize,
        }),
        trackProgress,
        waveBuffer: channels?.[0]?.buffer,
      });
      const unsubscribeResizeObserver = subscribeResizeObserver(canvas, () => {
        get().port?.methods.config({
          patch: { viewSize: getCanvasSize(canvas) },
        });
      });

      return () => {
        unsubscribeResizeObserver();
        get().port?.methods.unmount();
        set({ status: 'pending' });
      };
    },
  };
});
