import {
  type FourierMode,
  getCanvasSize,
  spectrogram,
  subscribeResizeObserver,
} from '@musetric/audio';
import {
  createSingletonManager,
  defaultSampleRate,
} from '@musetric/resource-utils';
import { create } from 'zustand';
import { envs } from '../../common/envs.js';
import { getGpuDevice } from '../../common/gpu.js';
import { usePlayerStore } from '../player/store.js';
import { type SettingsState, useSettingsStore } from '../settings/store.js';

export type SpectrogramState = {
  pipeline?: spectrogram.Pipeline;
  canvas?: HTMLCanvasElement;
};

type Unmount = () => void;
export type SpectrogramActions = {
  mount: (canvas: HTMLCanvasElement) => Unmount;
};

type State = SpectrogramState & SpectrogramActions;
export const useSpectrogramStore = create<State>((set, get) => {
  const render = async () => {
    const { pipeline } = get();
    const { channels, progress } = usePlayerStore.getState();
    if (!pipeline || !channels) return;
    await pipeline.render(channels[0], progress);
  };

  const singletonManager = createSingletonManager(
    async (
      canvas: HTMLCanvasElement,
      offscreenCanvas: OffscreenCanvas,
      fourierMode: FourierMode,
    ) => {
      const profiling = envs.spectrogramProfiling;
      const device = await getGpuDevice(profiling);
      const settings = useSettingsStore.getState();
      const { sampleRate = defaultSampleRate } = usePlayerStore.getState();
      const config: spectrogram.PipelineConfig = {
        ...settings,
        viewSize: getCanvasSize(canvas),
        sampleRate,
      };

      const pipeline = spectrogram.createPipeline({
        device,
        fourierMode,
        canvas: offscreenCanvas,
        config,
        onMetrics: profiling
          ? (metrics) => {
              console.table(metrics);
            }
          : undefined,
      });
      set({ pipeline, canvas });
      await render();
      return pipeline;
    },
    async (pipeline) => {
      set({ pipeline: undefined, canvas: undefined });
      pipeline.destroy();
      return Promise.resolve();
    },
  );

  usePlayerStore.subscribe(
    (state) => state.sampleRate,
    (sampleRate) => {
      if (!sampleRate) return;
      get().pipeline?.updateConfig({ sampleRate });
      void render();
    },
  );

  const subscribeSettingPatch = (key: keyof SettingsState) => {
    useSettingsStore.subscribe(
      (state) => state[key],
      (value) => {
        get().pipeline?.updateConfig({
          [key]: value,
        });
        void render();
      },
    );
  };
  subscribeSettingPatch('windowSize');
  subscribeSettingPatch('visibleTimeBefore');
  subscribeSettingPatch('visibleTimeAfter');
  subscribeSettingPatch('zeroPaddingFactor');
  subscribeSettingPatch('windowName');
  subscribeSettingPatch('minDecibel');
  subscribeSettingPatch('minFrequency');
  subscribeSettingPatch('maxFrequency');
  subscribeSettingPatch('colors');

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
      const offscreenCanvas = canvas.transferControlToOffscreen();

      void singletonManager.create(canvas, offscreenCanvas, fourierMode);
      const unsubscribeResizeObserver = subscribeResizeObserver(
        canvas,
        async () => {
          get().pipeline?.updateConfig({ viewSize: getCanvasSize(canvas) });
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
