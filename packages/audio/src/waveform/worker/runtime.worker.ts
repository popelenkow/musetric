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
  trackProgress: number;
};

export const createWaveformWorkerRuntime = (
  getWave: (projectId: number, waveType: WaveType) => Promise<Float32Array>,
) => {
  const state: WaveformWorkerState = {
    trackProgress: 0,
  };
  const port = createWaveformWorkerPort();

  const render = (): boolean => {
    const { wave, processor, trackProgress } = state;
    if (!wave || !processor) return false;
    processor.render(wave, trackProgress);
    return true;
  };

  port.bindMethods({
    mount: async (message) => {
      state.trackProgress = message.trackProgress;
      state.canvas = message.canvas;

      try {
        setOffscreenCanvasSize(message.canvas, message.viewSize);
        state.processor = createWaveformProcessor(
          message.canvas,
          message.colors,
        );

        state.wave = await getWave(message.projectId, message.waveType);
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
      state.canvas = undefined;
      state.wave = undefined;
      state.processor = undefined;
      state.trackProgress = 0;
    },
    trackProgress: (message) => {
      state.trackProgress = message.trackProgress;
      render();
    },
    colors: (message) => {
      state.processor?.setColors(message.colors);
      render();
    },
    resize: (message) => {
      if (!state.canvas) {
        return;
      }

      setOffscreenCanvasSize(state.canvas, message.viewSize);
      render();
    },
  });
};
