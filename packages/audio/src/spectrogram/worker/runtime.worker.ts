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
};

export const createSpectrogramWorkerRuntime = async (profiling?: boolean) => {
  const device = await getGpuDevice(profiling);

  const state: SpectrogramWorkerState = {
    processor: createSpectrogramProcessor({
      device,
      onMetrics: profiling
        ? (metrics) => {
            console.table(metrics);
          }
        : undefined,
    }),
    progress: 0,
  };

  const port = createSpectrogramWorkerPort();

  const render = async () => {
    const { processor, wave, progress } = state;
    if (!wave) return;
    await processor.render(wave, progress);
  };

  port.onmessage = createPortMessageHandler<ToSpectrogramWorkerMessage>({
    init: async (message) => {
      state.processor.updateConfig(message.config);
      state.progress = message.progress;
      state.wave = message.waveBuffer
        ? new Float32Array(message.waveBuffer)
        : undefined;
      port.postMessage({
        type: 'state',
        status: 'success',
      });
      await render();
    },
    deinit: () => {
      state.processor.dispose();
      state.wave = undefined;
      state.progress = 0;
      state.processor = createSpectrogramProcessor({
        device,
        onMetrics: profiling
          ? (metrics) => {
              console.table(metrics);
            }
          : undefined,
      });
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
