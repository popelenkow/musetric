import {
  createWaveformMainPort,
  getCanvasSize,
  resizeCanvas,
  subscribeResizeObserver,
  type WaveformMainPort,
  type WaveType,
} from '@musetric/audio';
import type { Store } from '../common/store.js';
import { type EngineState, getTrackProgress } from './state.js';
import waveformWorkerUrl from './waveform.worker.ts?worker&url';

type Unmount = () => void;

export type EngineWaveform = {
  port: WaveformMainPort;
  mount: (options: {
    projectId: number;
    type: WaveType;
    canvas: HTMLCanvasElement;
  }) => Unmount;
};

export const createEngineWaveform = (
  store: Store<EngineState>,
): EngineWaveform => {
  const port = createWaveformMainPort(waveformWorkerUrl);

  port.instance.onerror = () => {
    store.update((state) => {
      state.statuses.waveform = 'error';
    });
  };

  port.bindMethods({
    state: (message) => {
      store.update((state) => {
        state.statuses.waveform = message.status;
      });
    },
  });

  store.subscribe(getTrackProgress, (trackProgress) => {
    port.methods.trackProgress({
      trackProgress,
    });
  });

  store.subscribe(
    (state) => state.colors,
    (colors) => {
      port.methods.colors({
        colors,
      });
    },
  );

  return {
    port,
    mount: (options) => {
      const { projectId, type, canvas } = options;

      resizeCanvas(canvas);
      const viewSize = getCanvasSize(canvas);
      const offscreenCanvas = canvas.transferControlToOffscreen();

      port.methods.mount({
        projectId,
        waveType: type,
        trackProgress: getTrackProgress(store.get()),
        canvas: offscreenCanvas,
        colors: store.get().colors,
        viewSize,
      });

      const unsubscribeResizeObserver = subscribeResizeObserver(canvas, () => {
        port.methods.resize({
          viewSize: getCanvasSize(canvas),
        });
      });

      return () => {
        unsubscribeResizeObserver();
        port.methods.unmount();
        store.update((state) => {
          state.statuses.waveform = 'pending';
        });
      };
    },
  };
};
