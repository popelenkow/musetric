import { type api } from '@musetric/api';
import {
  createWaveformMainPort,
  getCanvasSize,
  resizeCanvas,
  subscribeResizeObserver,
  type WaveformMainPort,
} from '@musetric/audio';
import { createSingletonManager } from '@musetric/resource-utils';
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
  const singletonManager = createSingletonManager(
    async (projectId: number, type: api.wave.Type) => {
      const port = createWaveformMainPort(waveformWorkerUrl);

      port.onmessage = createPortMessageHandler({
        state: (message) => {
          set({ status: message.status });
        },
      });
      port.onerror = () => {
        set({ status: 'error' });
      };

      const { colors } = useSettingsStore.getState();
      const { progress } = usePlayerStore.getState();
      port.postMessage({
        type: 'init',
        projectId,
        waveType: type,
        colors,
        progress,
      });

      set({ port, status: 'pending' });
      await Promise.resolve();
      return port;
    },
    async (port) => {
      port.terminate();
      set({ port: undefined, status: 'pending' });
      return Promise.resolve();
    },
  );

  const ref: State = {
    port: undefined,
    status: 'pending',
    mount: (projectId, type) => {
      void singletonManager.create(projectId, type);

      const unsubscribeProgress = usePlayerStore.subscribe(
        (state) => state.progress,
        (progress) => {
          const { port: worker } = get();
          if (!worker) return;
          worker.postMessage({
            type: 'progress',
            progress,
          });
        },
      );

      const unsubscribeColors = useSettingsStore.subscribe(
        (state) => state.colors,
        (colors) => {
          const { port: worker } = get();
          if (!worker) return;
          worker.postMessage({
            type: 'colors',
            colors,
          });
        },
      );

      return () => {
        unsubscribeProgress();
        unsubscribeColors();
        void singletonManager.destroy();
      };
    },
    attachCanvas: (canvas) => {
      const { port: worker } = get();
      if (!worker) return;

      resizeCanvas(canvas);
      const offscreenCanvas = canvas.transferControlToOffscreen();

      worker.postMessage(
        {
          type: 'attachCanvas',
          canvas: offscreenCanvas,
        },
        [offscreenCanvas],
      );

      const unsubscribeResizeObserver = subscribeResizeObserver(
        canvas,
        async () => {
          const viewSize = getCanvasSize(canvas);
          worker.postMessage({
            type: 'resize',
            viewSize,
          });
          return Promise.resolve();
        },
      );

      return unsubscribeResizeObserver;
    },
  };
  return ref;
});
