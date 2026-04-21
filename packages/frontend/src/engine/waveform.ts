import { waveformChannel, type WaveType } from '@musetric/audio';
import {
  type ControlledPromise,
  createControlledPromise,
} from '@musetric/resource-utils';
import {
  getCanvasSize,
  resizeCanvas,
  subscribeResizeObserver,
} from '@musetric/resource-utils/dom';
import type { Store } from '../common/store.js';
import { type EngineState, getTrackProgress } from './state.js';
import waveformWorkerUrl from './waveform.worker.ts?worker&url';

type Unmount = () => void;

export type EngineWaveform = {
  port: ReturnType<typeof waveformChannel.outbound<Worker>>;
  boot: () => Promise<void>;
  mount: (options: {
    projectId: number;
    type: WaveType;
    canvas: HTMLCanvasElement;
  }) => Unmount;
};

export const createEngineWaveform = (
  store: Store<EngineState>,
): EngineWaveform => {
  const worker = new Worker(waveformWorkerUrl, { type: 'module' });
  const port = waveformChannel.outbound(worker);
  const bootPromise: ControlledPromise<void> = createControlledPromise<void>();

  port.instance.onerror = () => {
    store.update((state) => {
      state.statuses.waveform = {
        lead: 'error',
        backing: 'error',
        instrumental: 'error',
      };
    });
  };

  port.bindHandlers({
    booted: () => {
      bootPromise.resolve();
    },
    setState: (message) => {
      store.update((state) => {
        state.statuses.waveform[message.waveType] = message.status;
      });
    },
  });

  store.subscribe(getTrackProgress, (trackProgress) => {
    port.methods.setTrackProgress({
      trackProgress,
    });
  });

  store.subscribe(
    (state) => state.colors,
    (colors) => {
      port.methods.setColors({
        colors,
      });
    },
  );

  return {
    port,
    boot: async () => {
      port.methods.boot();

      return bootPromise.promise;
    },
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
          waveType: type,
          viewSize: getCanvasSize(canvas),
        });
      });

      return () => {
        unsubscribeResizeObserver();
        port.methods.unmount({
          waveType: type,
        });
        store.update((state) => {
          state.statuses.waveform[type] = 'pending';
        });
      };
    },
  };
};
