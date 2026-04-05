import type { ViewColors } from '../../common/colors.es.js';
import { setOffscreenCanvasSize } from '../../common/offscreenCanvas.cross.js';
import {
  createWaveformProcessor,
  type WaveformProcessor,
} from '../processor.js';
import { type WaveType } from '../protocol.cross.js';
import { createWaveformWorkerPort } from './port.worker.js';

export type WaveformWorkerState = {
  canvas?: OffscreenCanvas;
  wave?: Float32Array;
  processor?: WaveformProcessor;
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
    const { wave, processor, progress } = state;
    if (!wave || !processor) return false;
    processor.render(wave, progress);
    return true;
  };

  port.bindMethods({
    mount: async (message) => {
      try {
        const { progress, projectId, waveType, canvas, colors, viewSize } =
          message;
        state.progress = progress;
        state.canvas = canvas;
        state.colors = colors;
        setOffscreenCanvasSize(state.canvas, viewSize);
        state.processor = createWaveformProcessor(canvas, colors);

        const wave = await getWave(projectId, waveType);
        state.wave = wave;
        render();
        port.methods.state({
          status: 'success',
        });
      } catch (error) {
        console.error('Failed to load project wave', error);
        port.methods.state({
          status: 'error',
        });
      }
    },
    unmount: () => {
      state.wave = undefined;
    },
    progress: (message) => {
      state.progress = message.progress;
      render();
    },
    colors: (message) => {
      state.colors = message.colors;
      state.processor?.setColors(message.colors);
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
