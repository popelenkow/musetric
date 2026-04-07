import { type api } from '@musetric/api';
import {
  createWaveformMainPort,
  getCanvasSize,
  resizeCanvas,
  subscribeResizeObserver,
  type WaveformMainPort,
} from '@musetric/audio';
import { create } from 'zustand';
import { usePlayerStore } from '../player/store.js';
import { useSettingsStore } from '../settings/store.js';
import waveformWorkerUrl from './waveform.worker.ts?worker&url';

export type WaveformState = {
  port?: WaveformMainPort;
  status: 'pending' | 'error' | 'success';
};

type Unmount = () => void;
export type WaveformActions = {
  mount: () => Unmount;
  init: (
    projectId: number,
    type: api.wave.Type,
    canvas: HTMLCanvasElement,
  ) => Unmount;
};

type State = WaveformState & WaveformActions;
export const useWaveformStore = create<State>((set, get) => {
  usePlayerStore.subscribe(
    (state) => state.trackProgress,
    (trackProgress) => {
      get().port?.methods.trackProgress({
        trackProgress,
      });
    },
  );

  useSettingsStore.subscribe(
    (state) => state.colors,
    (colors) => {
      get().port?.methods.colors({
        colors,
      });
    },
  );

  const ref: State = {
    status: 'pending',
    mount: () => {
      const port = createWaveformMainPort(waveformWorkerUrl);
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
    init: (projectId, type, canvas) => {
      resizeCanvas(canvas);
      const viewSize = getCanvasSize(canvas);
      const offscreenCanvas = canvas.transferControlToOffscreen();

      get().port?.methods.mount({
        projectId,
        waveType: type,
        trackProgress: usePlayerStore.getState().trackProgress,
        canvas: offscreenCanvas,
        colors: useSettingsStore.getState().colors,
        viewSize,
      });

      const unsubscribeResizeObserver = subscribeResizeObserver(canvas, () => {
        get().port?.methods.resize({
          viewSize: getCanvasSize(canvas),
        });
      });

      return () => {
        unsubscribeResizeObserver();
        get().port?.methods.unmount();
        set({ status: 'pending' });
      };
    },
  };
  return ref;
});
