import { getGpuDevice } from '../common/gpuDevice.js';
import {
  createSpectrogramProcessor,
  type SpectrogramProcessor,
} from '../processor.js';
import type {
  SpectrogramDecoderDataPort,
  SpectrogramWorkerPort,
} from './port.worker.js';

export type SpectrogramWorkerState = {
  processor: SpectrogramProcessor;
  wave?: Float32Array<SharedArrayBuffer>;
  trackProgress: number;
};

export type CreateSpectrogramRuntimeOptions = {
  port: SpectrogramWorkerPort;
  dataPort: SpectrogramDecoderDataPort;
  profiling?: boolean;
};

export const createSpectrogramRuntime = async (
  options: CreateSpectrogramRuntimeOptions,
) => {
  const { port, dataPort, profiling } = options;

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
    trackProgress: 0,
  };

  const render = async () => {
    const { processor, wave, trackProgress } = state;
    if (!wave) {
      return;
    }

    const ok = await processor.render(wave, trackProgress);
    if (!ok) {
      return;
    }
    port.methods.state({
      status: 'success',
    });
  };

  dataPort.bindMethods({
    wave: async (message) => {
      state.wave = new Float32Array(message.waveBuffer);
      await render();
    },
    clear: () => {
      state.wave = undefined;
      port.methods.state({
        status: 'pending',
      });
    },
  });

  port.bindMethods({
    mount: async (message) => {
      try {
        state.trackProgress = message.trackProgress;
        state.processor = createProcessor();
        state.processor.updateConfig(message.config);
        await render();
      } catch (error) {
        console.error('Failed to render spectrogram', error);
        port.methods.state({
          status: 'error',
        });
      }
    },
    unmount: () => {
      state.processor.dispose();
      state.processor = createProcessor();
      state.wave = undefined;
      state.trackProgress = 0;
      port.methods.state({
        status: 'pending',
      });
    },
    trackProgress: async (message) => {
      state.trackProgress = message.trackProgress;
      await render();
    },
    config: async (message) => {
      state.processor.updateConfig(message.patch);
      await render();
    },
  });
};
