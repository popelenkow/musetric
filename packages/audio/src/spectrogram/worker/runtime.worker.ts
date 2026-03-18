import { createSingletonManager } from '@musetric/resource-utils';
import { createPortMessageHandler } from '@musetric/resource-utils/cross/messagePort';
import { getGpuDevice } from '../common/gpuDevice.js';
import { type ToSpectrogramWorkerMessage } from '../portMessage.cross.js';
import {
  createSpectrogramProcessor,
  type SpectrogramProcessor,
} from '../processor.js';
import { createSpectrogramWorkerPort } from './port.worker.js';

export type SpectrogramWorkerState = {
  processor?: SpectrogramProcessor;
  wave?: Float32Array<SharedArrayBuffer>;
  progress: number;
};

export const createSpectrogramWorkerRuntime = async (profiling?: boolean) => {
  const device = await getGpuDevice(profiling);

  const state: SpectrogramWorkerState = {
    progress: 0,
  };

  const port = createSpectrogramWorkerPort();

  const render = async () => {
    const { processor, wave, progress } = state;
    if (!processor || !wave) return;
    await processor.render(wave, progress);
  };

  const singletonManager = createSingletonManager(
    async (message: Extract<ToSpectrogramWorkerMessage, { type: 'init' }>) => {
      try {
        state.progress = message.progress;
        state.wave = message.waveBuffer
          ? new Float32Array(message.waveBuffer)
          : undefined;

        const processor = createSpectrogramProcessor({
          device,
          canvas: message.canvas,
          fourierMode: message.fourierMode,
          config: message.config,
          onMetrics: profiling
            ? (metrics) => {
                console.table(metrics);
              }
            : undefined,
        });
        state.processor = processor;
        port.postMessage({
          type: 'state',
          status: 'success',
        });
        await render();
        return processor;
      } catch (error) {
        console.error('Failed to init spectrogram processor', error);
        port.postMessage({
          type: 'state',
          status: 'error',
        });
        return undefined;
      }
    },
    (processor) => {
      processor?.destroy();
      state.processor = undefined;
      state.wave = undefined;
    },
  );

  port.onmessage = createPortMessageHandler<ToSpectrogramWorkerMessage>({
    init: singletonManager.create,
    deinit: singletonManager.destroy,
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
