import { createPortMessageHandler } from '@musetric/resource-utils/cross/messagePort';
import { getGpuDevice } from '../common/gpuDevice.js';
import { type ToSpectrogramWorkerMessage } from '../portMessage.cross.js';
import {
  createSpectrogramProcessor,
  type SpectrogramProcessor,
} from '../processor.js';
import { createSpectrogramWorkerPort } from './port.worker.js';

export type SpectrogramWorkerState = {
  processor: SpectrogramProcessor;
  wave?: Float32Array<SharedArrayBuffer>;
  progress: number;
  initialized: boolean;
};

export const createSpectrogramWorkerRuntime = async (profiling?: boolean) => {
  const device = await getGpuDevice(profiling);

  const createProcessor = () =>
    createSpectrogramProcessor({
      device,
      onMetrics: profiling
        ? (metrics) => {
            console.table(metrics);
          }
        : undefined,
    });

  const state: SpectrogramWorkerState = {
    processor: createProcessor(),
    progress: 0,
    initialized: false,
  };

  const port = createSpectrogramWorkerPort();

  const render = async () => {
    const { processor, wave, progress } = state;
    if (!wave) return;
    const ok = await processor.render(wave, progress);
    if (ok && !state.initialized) {
      state.initialized = true;
      port.postMessage({
        type: 'state',
        status: 'success',
      });
    }
  };

  port.onmessage = createPortMessageHandler<ToSpectrogramWorkerMessage>({
    init: async (message) => {
      state.processor.updateConfig(message.config);
      state.progress = message.progress;
      state.wave = message.waveBuffer
        ? new Float32Array(message.waveBuffer)
        : undefined;
      await render();
    },
    deinit: () => {
      state.processor.dispose();
      state.wave = undefined;
      state.progress = 0;
      state.initialized = false;
      state.processor = createProcessor();
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
      state.processor?.updateConfig(message.patch);
      await render();
    },
  });

  return {
    state,
    port,
  };
};
