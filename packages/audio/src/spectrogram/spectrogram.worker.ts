import { createSingletonManager } from '@musetric/resource-utils';
import { createPortMessageHandler } from '@musetric/resource-utils/cross/messagePort';
import { getGpuDevice } from './common/gpuDevice.js';
import {
  createSpectrogramPipeline,
  type SpectrogramPipeline,
} from './pipeline.js';
import { createSpectrogramWorkerScope } from './port.worker.js';
import { type ToSpectrogramWorkerMessage } from './portMessage.cross.js';

type State = {
  pipeline?: SpectrogramPipeline;
  wave?: Float32Array<SharedArrayBuffer>;
  progress: number;
};

const state: State = {
  progress: 0,
};

const port = createSpectrogramWorkerScope();

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
    void render();
    return pipeline;
  },
  async (pipeline) => {
    pipeline.destroy();
    state.pipeline = undefined;
    return Promise.resolve();
  },
);

port.onmessage = createPortMessageHandler<ToSpectrogramWorkerMessage>({
  init: (message) => {
    state.progress = message.progress;
    if (message.waveBuffer) {
      state.wave = new Float32Array(message.waveBuffer);
    }
    void singletonManager.create(message);
  },
  wave: (message) => {
    state.wave = new Float32Array(message.waveBuffer);
    void render();
  },
  progress: (message) => {
    state.progress = message.progress;
    void render();
  },
  config: (message) => {
    state.pipeline?.updateConfig(message.patch);
    void render();
  },
});
