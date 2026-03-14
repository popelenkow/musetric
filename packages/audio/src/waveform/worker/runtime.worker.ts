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

  const initializePipeline = () => {
    const { canvas, colors } = state;
    if (!canvas || !colors) return;
    state.pipeline = createWaveformPipeline(canvas, colors);
  };

  const render = (): boolean => {
    const { wave, pipeline, progress } = state;
    if (!wave || !pipeline) return false;
    pipeline.render(wave, progress);
    return true;
  };

  const loadWave = async (projectId: number, waveType: WaveType) => {
    try {
      const wave = await getWave(projectId, waveType);
      state.wave = wave;
      port.postMessage({
        type: 'state',
        status: 'success',
      });
      render();
    } catch (error) {
      console.error('Failed to load project wave', error);
      port.postMessage({
        type: 'state',
        status: 'error',
      });
    }
  };

  port.onmessage = createPortMessageHandler<ToWaveformWorkerMessage>({
    init: async (message) => {
      state.colors = message.colors;
      state.progress = message.progress;
      await loadWave(message.projectId, message.waveType);
    },
    attachCanvas: (message) => {
      state.canvas = message.canvas;
      initializePipeline();
      render();
    },
    progress: (message) => {
      state.progress = message.progress;
      render();
    },
    colors: (message) => {
      state.colors = message.colors;
      initializePipeline();
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
