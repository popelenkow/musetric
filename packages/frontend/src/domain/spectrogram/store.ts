import {
  type FourierMode,
  resizeCanvas,
  type spectrogram,
  subscribeResizeObserver,
  type ViewSize,
} from '@musetric/audio-view';
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
    const { channelBuffers, progress } = usePlayerStore.getState();
    if (!pipeline || !channelBuffers || !isConfigured) return;
    const buffer = new Float32Array(channelBuffers[0]);
    await pipeline.render(buffer, progress);
  };

  const singletonManager = createSingletonManager(
    async (canvas: HTMLCanvasElement, fourierMode: FourierMode) => {
      const pipeline = await createSpectrogramPipeline(canvas, fourierMode);
      set({ pipeline, viewSize: resizeCanvas(canvas) });
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
    {
      equalityFn: (a, b) => a.fourierMode !== b.fourierMode,
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
        a.channelBuffers === b.channelBuffers && a.progress === b.progress,
    },
  );

  const ref: State = {
    mount: (canvas) => {
      const { fourierMode } = useSettingsStore.getState();

      void singletonManager.create(canvas, fourierMode);
      const unsubscribeResizeObserver = subscribeResizeObserver(
        canvas,
        async () => {
          set({ viewSize: resizeCanvas(canvas) });
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
