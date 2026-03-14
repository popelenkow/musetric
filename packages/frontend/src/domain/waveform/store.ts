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
  status: 'pending' | 'error' | 'success';
};

type Unmount = () => void;
export type WaveformActions = {
  mount: () => Unmount;
  init: (projectId: number, type: api.wave.Type) => Unmount;
  attachCanvas: (canvas: HTMLCanvasElement) => Unmount;
};

type State = WaveformState & WaveformActions;
export const useWaveformStore = create<State>((set) => {
  let port: WaveformMainPort | undefined = undefined;

  usePlayerStore.subscribe(
    (state) => state.progress,
    (progress) => {
      port?.postMessage({
        type: 'progress',
        progress,
      });
    },
  );

  useSettingsStore.subscribe(
    (state) => state.colors,
    (colors) => {
      port?.postMessage({
        type: 'colors',
        colors,
      });
    },
  );

  const ref: State = {
    status: 'pending',
    mount: () => {
      port = createWaveformMainPort(waveformWorkerUrl);
      port.onerror = () => {
        set({ status: 'error' });
      };
      port.onmessage = createPortMessageHandler({
        state: (message) => {
          set({ status: message.status });
        },
      });

      return () => {
        port?.terminate();
        port = undefined;
        set({ status: 'pending' });
      };
    },
    init: (projectId, type) => {
      port?.postMessage({
        type: 'init',
        projectId,
        waveType: type,
        progress: usePlayerStore.getState().progress,
      });
      return () => {
        port?.postMessage({
          type: 'deinit',
        });
        set({ status: 'pending' });
      };
    },
    attachCanvas: (canvas) => {
      resizeCanvas(canvas);
      const offscreenCanvas = canvas.transferControlToOffscreen();

      port?.postMessage(
        {
          type: 'attachCanvas',
          canvas: offscreenCanvas,
          colors: useSettingsStore.getState().colors,
        },
        [offscreenCanvas],
      );

      const unsubscribeResizeObserver = subscribeResizeObserver(canvas, () => {
        const viewSize = getCanvasSize(canvas);
        port?.postMessage({
          type: 'resize',
          viewSize,
        });
      });

      return unsubscribeResizeObserver;
    },
  };
  return ref;
});
