import {
  type SpectrogramAssessmentFrame,
  type SpectrogramAssessmentPatch,
  spectrogramChannel,
  type SpectrogramConfig,
} from '@musetric/audio';
import {
  type ControlledPromise,
  createControlledPromise,
} from '@musetric/resource-utils';
import {
  getCanvasSize,
  subscribeResizeObserver,
} from '@musetric/resource-utils/dom';
import type { Store } from '../common/store.js';
import spectrogramWorkerUrl from './spectrogram.worker.ts?worker&url';
import { type EngineState, getTrackProgress } from './state.js';

type Unmount = () => void;

const upsertAssessmentFrames = (
  currentFrames: SpectrogramAssessmentFrame[],
  patchFrames: SpectrogramAssessmentFrame[],
) => {
  const frameIndexes = new Map<number, number>();
  const frames = [...currentFrames];
  for (let index = 0; index < frames.length; index += 1) {
    const frame = frames[index];
    frameIndexes.set(frame.frameIndex, index);
  }

  for (const patchFrame of patchFrames) {
    const index = frameIndexes.get(patchFrame.frameIndex);
    if (index === undefined) {
      frameIndexes.set(patchFrame.frameIndex, frames.length);
      frames.push(patchFrame);
      continue;
    }
    frames[index] = patchFrame;
  }

  return frames.sort((a, b) => a.frameIndex - b.frameIndex);
};

const applyAssessmentPatch = (
  state: EngineState,
  patch: SpectrogramAssessmentPatch,
) => {
  state.vocalAssessment.revision = patch.revision;
  state.vocalAssessment.score = patch.score;
  state.vocalAssessment.frames = patch.reset
    ? patch.frames
    : upsertAssessmentFrames(state.vocalAssessment.frames, patch.frames);
};

export type EngineSpectrogram = {
  port: ReturnType<typeof spectrogramChannel.outbound<Worker>>;
  boot: () => Promise<void>;
  mount: (
    canvas: HTMLCanvasElement,
    config: Partial<SpectrogramConfig>,
  ) => Unmount;
  setConfig: (patch: Partial<SpectrogramConfig>) => void;
};

export type CreateEngineSpectrogramOptions = {
  store: Store<EngineState>;
  sampleRate: number;
  decoderPort: MessagePort;
};

export const createEngineSpectrogram = (
  options: CreateEngineSpectrogramOptions,
): EngineSpectrogram => {
  const { store, sampleRate, decoderPort } = options;
  const worker = new Worker(spectrogramWorkerUrl, { type: 'module' });
  const port = spectrogramChannel.outbound(worker);
  const bootPromise: ControlledPromise<void> = createControlledPromise<void>();
  port.instance.onerror = () => {
    store.update((state) => {
      state.statuses.spectrogram = 'error';
    });
  };

  port.bindHandlers({
    booted: () => {
      bootPromise.resolve();
    },
    setState: (message) => {
      store.update((state) => {
        state.statuses.spectrogram = message.status;
      });
    },
    patchAssessment: (message) => {
      store.update((state) => {
        applyAssessmentPatch(state, message.patch);
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
      port.methods.updateConfig({
        patch: { colors },
      });
    },
  );

  return {
    port,
    boot: async () => {
      port.methods.boot({
        dataPort: decoderPort,
      });

      return bootPromise.promise;
    },
    mount: (canvas, config) => {
      const viewSize = getCanvasSize(canvas);
      const offscreenCanvas = canvas.transferControlToOffscreen();

      port.methods.mount({
        config: {
          ...config,
          canvas: offscreenCanvas,
          viewSize,
          colors: store.get().colors,
          sampleRate,
        },
        trackProgress: getTrackProgress(store.get()),
      });

      const unsubscribeResizeObserver = subscribeResizeObserver(canvas, () => {
        port.methods.updateConfig({
          patch: { viewSize: getCanvasSize(canvas) },
        });
      });

      return () => {
        unsubscribeResizeObserver();
        port.methods.unmount();
        store.update((state) => {
          state.statuses.spectrogram = 'pending';
        });
      };
    },
    setConfig: (patch) => {
      port.methods.updateConfig({
        patch,
      });
    },
  };
};
