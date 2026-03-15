import { type api } from '@musetric/api';
import {
  createWaveformMainPort,
  getCanvasSize,
  resizeCanvas,
  subscribeResizeObserver,
  type WaveformMainPort,
} from '@musetric/audio';
import { createPortMessageHandler } from '@musetric/resource-utils/cross/messagePort';
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
    (state) => state.progress,
    (progress) => {
      get().port?.postMessage({
        type: 'progress',
        progress,
      });
    },
  );

  useSettingsStore.subscribe(
    (state) => state.colors,
    (colors) => {
      get().port?.postMessage({
        type: 'colors',
        colors,
      });
    },
  );

  const ref: State = {
    status: 'pending',
    mount: () => {
      const port = createWaveformMainPort(waveformWorkerUrl);
      set({ port });
      port.onerror = () => {
        set({ status: 'error' });
      };
      port.onmessage = createPortMessageHandler({
        state: (message) => {
          set({ status: message.status });
        },
      });

      return () => {
        get().port?.terminate();
        set({ port: undefined, status: 'pending' });
      };
    },
    init: (projectId, type, canvas) => {
      resizeCanvas(canvas);
      const viewSize = getCanvasSize(canvas);
      const offscreenCanvas = canvas.transferControlToOffscreen();

      get().port?.postMessage(
        {
          type: 'init',
          projectId,
          waveType: type,
          progress: usePlayerStore.getState().progress,
          canvas: offscreenCanvas,
          colors: useSettingsStore.getState().colors,
          viewSize,
        },
        [offscreenCanvas],
      );

      const unsubscribeResizeObserver = subscribeResizeObserver(canvas, () => {
        const nextViewSize = getCanvasSize(canvas);
        get().port?.postMessage({
          type: 'resize',
          viewSize: nextViewSize,
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
  return ref;
});
