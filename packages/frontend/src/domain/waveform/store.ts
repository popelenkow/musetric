import { type api } from '@musetric/api';
import { resizeCanvas, subscribeResizeObserver } from '@musetric/audio';
import { createSingletonManager } from '@musetric/resource-utils';
import {
  createPortMessageHandler,
  type TypedMessagePort,
} from '@musetric/resource-utils/cross/messagePort';
import { create } from 'zustand';
import { usePlayerStore } from '../player/store.js';
import { useSettingsStore } from '../settings/store.js';
import { createWaveformWorker } from './port.js';
import {
  type FromWaveformWorkerMessage,
  type ToWaveformWorkerMessage,
} from './protocol.es.js';

export type WaveformState = {
  worker?: TypedMessagePort<
    Worker,
    FromWaveformWorkerMessage,
    ToWaveformWorkerMessage
  >;
  status: 'pending' | 'error' | 'success';
};

type Unmount = () => void;
export type WaveformActions = {
  mount: (projectId: number, type: api.wave.Type) => Unmount;
  attachCanvas: (canvas: HTMLCanvasElement) => void;
};

type State = WaveformState & WaveformActions;
export const useWaveformStore = create<State>((set, get) => {
  let unsubscribeResizeObserver: (() => void) | undefined = undefined;

  const singletonManager = createSingletonManager(
    async (projectId: number, type: api.wave.Type) => {
      const port = createWaveformWorker();

      port.onmessage = createPortMessageHandler<FromWaveformWorkerMessage>({
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

      set({ worker: port, status: 'pending' });
      await Promise.resolve();
      return port;
    },
    async (port) => {
      port.terminate();
      set({ worker: undefined, status: 'pending' });
      return Promise.resolve();
    },
  );

  const ref: State = {
    worker: undefined,
    status: 'pending',
    mount: (projectId, type) => {
      void singletonManager.create(projectId, type);

      const unsubscribeProgress = usePlayerStore.subscribe(
        (state) => state.progress,
        (progress) => {
          const worker = get().worker;
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
          const worker = get().worker;
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
        unsubscribeResizeObserver?.();
        unsubscribeResizeObserver = undefined;
        void singletonManager.destroy();
      };
    },
    attachCanvas: (canvas) => {
      const worker = get().worker;
      if (!worker || unsubscribeResizeObserver) return;

      resizeCanvas(canvas);
      const offscreenCanvas = canvas.transferControlToOffscreen();

      worker.postMessage(
        {
          type: 'attachCanvas',
          canvas: offscreenCanvas,
        },
        [offscreenCanvas],
      );

      unsubscribeResizeObserver = subscribeResizeObserver(canvas, async () => {
        const viewSize = resizeCanvas(canvas);
        worker.postMessage({
          type: 'resize',
          viewSize,
        });
        return Promise.resolve();
      });
    },
  };
  return ref;
});
