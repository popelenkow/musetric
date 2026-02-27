import {
  type FourierMode,
  getCanvasSize,
  resizeCanvas,
  setCanvasSize,
  type spectrogram,
  subscribeResizeObserver,
  type ViewSize,
} from '@musetric/audio';
import { createSingletonManager } from '@musetric/resource-utils';
import { create } from 'zustand';
import { usePlayerStore } from '../player/store.js';
import { useSettingsStore } from '../settings/store.js';
import { createSpectrogramPipeline } from './pipeline.js';

export type SpectrogramState = {
  pipeline?: spectrogram.Pipeline;
  viewSize?: ViewSize;
  isConfigured?: boolean;
};

type Unmount = () => void;
export type SpectrogramActions = {
  mount: (canvas: HTMLCanvasElement) => Unmount;
};

type State = SpectrogramState & SpectrogramActions;
export const useSpectrogramStore = create<State>((set, get) => {
  const configure = () => {
    const { pipeline, viewSize } = get();
    const { sampleRate } = usePlayerStore.getState();
    const settings = useSettingsStore.getState();
    if (!pipeline || !sampleRate || !viewSize) return;

    const config: spectrogram.PipelineConfig = {
      ...settings,
      viewSize,
      sampleRate,
    };
    pipeline.configure(config);
    set({ isConfigured: true });
  };

  const render = async () => {
    const { pipeline, isConfigured } = get();
    const { channels, progress } = usePlayerStore.getState();
    if (!pipeline || !channels || !isConfigured) return;
    await pipeline.render(channels[0], progress);
  };

  const singletonManager = createSingletonManager(
    async (
      canvas: OffscreenCanvas,
      fourierMode: FourierMode,
      viewSize: ViewSize,
    ) => {
      const pipeline = await createSpectrogramPipeline(canvas, fourierMode);
      set({ pipeline, viewSize });
      configure();
      await render();
      return pipeline;
    },
    async (pipeline) => {
      set({ pipeline: undefined, viewSize: undefined, isConfigured: false });
      pipeline.destroy();
      return Promise.resolve();
    },
  );

  useSettingsStore.subscribe(
    (state) => state,
    () => {
      configure();
      void render();
    },
  );

  usePlayerStore.subscribe(
    (state) => state.sampleRate,
    () => {
      configure();
      void render();
    },
  );

  usePlayerStore.subscribe(
    (state) => state,
    () => {
      void render();
    },
    {
      equalityFn: (a, b) =>
        a.channels === b.channels && a.progress === b.progress,
    },
  );

  const ref: State = {
    mount: (canvas) => {
      const { fourierMode } = useSettingsStore.getState();
      const initViewSize = resizeCanvas(canvas);
      const offscreenCanvas = canvas.transferControlToOffscreen();

      void singletonManager.create(offscreenCanvas, fourierMode, initViewSize);
      const unsubscribeResizeObserver = subscribeResizeObserver(
        canvas,
        async () => {
          const viewSize = getCanvasSize(canvas);
          setCanvasSize(offscreenCanvas, viewSize);
          set({ viewSize });
          configure();
          await render();
        },
      );
      return () => {
        unsubscribeResizeObserver();
        void singletonManager.destroy();
      };
    },
  };
  return ref;
});
