import { createSingletonManager } from '@musetric/resource-utils';
import { createPortMessageHandler } from '@musetric/resource-utils/cross/messagePort';
import { getGpuDevice } from '../common/gpuDevice.js';
import {
  createSpectrogramPipeline,
  type SpectrogramPipeline,
} from '../pipeline.js';
import { type ToSpectrogramWorkerMessage } from '../portMessage.cross.js';
import { createSpectrogramWorkerPort } from './port.worker.js';

export type SpectrogramWorkerState = {
  pipeline?: SpectrogramPipeline;
  wave?: Float32Array<SharedArrayBuffer>;
  progress: number;
};

export const createSpectrogramWorkerRuntime = () => {
  const state: SpectrogramWorkerState = {
    progress: 0,
  };

  const port = createSpectrogramWorkerPort();

  const render = async () => {
    const { pipeline, wave, progress } = state;
    if (!pipeline || !wave) return;
    await pipeline.render(wave, progress);
  };

  const singletonManager = createSingletonManager(
    async (message: ToSpectrogramWorkerMessage & { type: 'init' }) => {
      const device = await getGpuDevice(message.profiling);
      const pipeline = createSpectrogramPipeline({
        device,
        canvas: message.canvas,
        fourierMode: message.fourierMode,
        config: message.config,
        onMetrics: message.profiling
          ? (metrics) => {
              console.table(metrics);
            }
          : undefined,
      });
      state.pipeline = pipeline;
      port.postMessage({
        type: 'state',
        status: 'success',
      });
      await render();
      return pipeline;
    },
    (pipeline) => {
      pipeline.destroy();
      state.pipeline = undefined;
    },
  );

  port.onmessage = createPortMessageHandler<ToSpectrogramWorkerMessage>({
    init: async (message) => {
      state.progress = message.progress;
      if (message.waveBuffer) {
        state.wave = new Float32Array(message.waveBuffer);
      }
      await singletonManager.create(message);
    },
    wave: async (message) => {
      state.wave = new Float32Array(message.waveBuffer);
      await render();
    },
    progress: async (message) => {
      state.progress = message.progress;
      await render();
    },
    config: async (message) => {
      state.pipeline?.updateConfig(message.patch);
      await render();
    },
  });

  return {
    state,
    port,
  };
};
