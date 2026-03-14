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
  mount: (projectId: number, type: api.wave.Type) => Unmount;
  attachCanvas: (canvas: HTMLCanvasElement) => Unmount | undefined;
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
    port: undefined,
    status: 'pending',
    mount: (projectId, type) => {
      const port = createWaveformMainPort(waveformWorkerUrl);

      port.onmessage = createPortMessageHandler({
        state: (message) => {
          set({ status: message.status });
        },
      });
      port.onerror = () => {
        set({ status: 'error' });
      };

      port.postMessage({
        type: 'init',
        projectId,
        waveType: type,
        colors: useSettingsStore.getState().colors,
        progress: usePlayerStore.getState().progress,
      });
      set({ port });

      return () => {
        port.terminate();
        set({ port: undefined, status: 'pending' });
      };
    },
    attachCanvas: (canvas) => {
      const { port } = get();
      if (!port) return;

      resizeCanvas(canvas);
      const offscreenCanvas = canvas.transferControlToOffscreen();

      port.postMessage(
        {
          type: 'attachCanvas',
          canvas: offscreenCanvas,
        },
        [offscreenCanvas],
      );

      const unsubscribeResizeObserver = subscribeResizeObserver(canvas, () => {
        const viewSize = getCanvasSize(canvas);
        port.postMessage({
          type: 'resize',
          viewSize,
        });
      });

      return unsubscribeResizeObserver;
    },
  };
  return ref;
});
