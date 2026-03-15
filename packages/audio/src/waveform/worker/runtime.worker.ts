import { createPortMessageHandler } from '@musetric/resource-utils/cross/messagePort';
import type { ViewColors } from '../../common/colors.es.js';
import { setOffscreenCanvasSize } from '../../common/offscreenCanvas.cross.js';
import { createWaveformPipeline, type WaveformPipeline } from '../pipeline.js';
import {
  type ToWaveformWorkerMessage,
  type WaveType,
} from '../portMessage.cross.js';
import { createWaveformWorkerPort } from './port.worker.js';

export type WaveformWorkerState = {
  canvas?: OffscreenCanvas;
  wave?: Float32Array;
  pipeline?: WaveformPipeline;
  progress: number;
  colors?: ViewColors;
};

export const createWaveformWorkerRuntime = (
  getWave: (projectId: number, waveType: WaveType) => Promise<Float32Array>,
) => {
  const state: WaveformWorkerState = {
    progress: 0,
  };
  const port = createWaveformWorkerPort();

  const render = (): boolean => {
    const { wave, pipeline, progress } = state;
    if (!wave || !pipeline) return false;
    pipeline.render(wave, progress);
    return true;
  };

  port.onmessage = createPortMessageHandler<ToWaveformWorkerMessage>({
    init: async (message) => {
      try {
        const { progress, projectId, waveType, canvas, colors, viewSize } =
          message;
        state.progress = progress;
        state.canvas = canvas;
        state.colors = colors;
        setOffscreenCanvasSize(state.canvas, viewSize);
        state.pipeline = createWaveformPipeline(canvas, colors);

        const wave = await getWave(projectId, waveType);
        state.wave = wave;
        render();
        port.postMessage({
          type: 'state',
          status: 'success',
        });
      } catch (error) {
        console.error('Failed to load project wave', error);
        port.postMessage({
          type: 'state',
          status: 'error',
        });
      }
    },
    deinit: () => {
      state.wave = undefined;
    },
    progress: (message) => {
      state.progress = message.progress;
      render();
    },
    colors: (message) => {
      state.colors = message.colors;
      state.pipeline?.setColors(message.colors);
      render();
    },
    resize: (message) => {
      if (!state.canvas) return;
      setOffscreenCanvasSize(state.canvas, message.viewSize);
      render();
    },
  });

  return {
    state,
    port,
  };
};
