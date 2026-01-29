import { waveform, subscribeResizeObserver } from '@musetric/audio-view';
import { createCallLatest } from '@musetric/resource-utils/callLatest';
import { create } from 'zustand';
import { usePlayerStore } from './player.js';
import { useSettingsStore } from './settings.js';

type WaveformPipeline = {
  render: (progress: number) => void;
};

export type WaveformState = {
  pipeline?: WaveformPipeline;
  segments?: waveform.WaveSegment[];
};

export const initialState: WaveformState = {};

export type WaveformActions = {
  mount: (canvas: HTMLCanvasElement) => void;
  unmount: () => void;
  setSegments: (data?: Uint8Array) => void;
};

type State = WaveformState & WaveformActions;
export const useWaveformStore = create<State>((set, get) => {
  let canvas: HTMLCanvasElement | undefined = undefined;
  let unsubscribeResizeObserver: (() => void) | undefined = undefined;
  const barStep = 3;

  const createPipeline = () => {
    unsubscribeResizeObserver?.();
    unsubscribeResizeObserver = undefined;
    set({ pipeline: undefined });
    if (!canvas) return undefined;
    const draw = waveform.createDraw(canvas);
    return {
      render: (progress: number) => {
        const { segments } = get();
        const { buffer } = usePlayerStore.getState();
        const { colors } = useSettingsStore.getState();
        if (segments) {
          draw.run(segments, progress, colors);
          return;
        }
        if (!buffer) return;
        const data = buffer.getChannelData(0);
        const segmentCount = Math.max(
          1,
          Math.floor(canvas.clientWidth / barStep),
        );
        const generated = waveform.generateSegments(data, segmentCount);
        draw.run(generated, progress, colors);
      },
    };
  };

  const mount = createCallLatest(async () => {
    const pipeline = createPipeline();
    set({ pipeline });
    return Promise.resolve();
  });

  const render = () => {
    const { pipeline } = get();
    const { progress } = usePlayerStore.getState();
    if (!pipeline) return;
    pipeline.render(progress);
  };

  useSettingsStore.subscribe(
    (state) => state.colors,
    () => {
      void render();
    },
  );

  usePlayerStore.subscribe(
    (state) => state,
    () => {
      void render();
    },
    {
      equalityFn: (a, b) => a.buffer === b.buffer && a.progress === b.progress,
    },
  );

  const ref: State = {
    ...initialState,
    mount: async (newCanvas) => {
      canvas = newCanvas;
      await mount();
      unsubscribeResizeObserver = subscribeResizeObserver(
        newCanvas,
        async () => {
          render();
          return Promise.resolve();
        },
      );
      render();
    },
    unmount: async () => {
      canvas = undefined;
      await mount();
    },
    setSegments: (data) => {
      if (!data) {
        set({ segments: undefined });
        render();
        return;
      }
      const floatView = new Float32Array(
        data.buffer,
        data.byteOffset,
        Math.floor(data.byteLength / 4),
      );
      const segments: waveform.WaveSegment[] = [];
      for (let i = 0; i + 1 < floatView.length; i += 2) {
        segments.push({ min: floatView[i], max: floatView[i + 1] });
      }
      set({ segments });
      render();
    },
  };
  return ref;
});
