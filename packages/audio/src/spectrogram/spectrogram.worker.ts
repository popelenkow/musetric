import { createSingletonManager } from '@musetric/resource-utils';
import { createPortMessageHandler } from '@musetric/resource-utils/cross/messagePort';
import { getGpuDevice } from '../common/gpuDevice.js';
import { createPipeline, type Pipeline } from './pipeline.js';
import { createPort } from './port.worker.js';
import { type ToSpectrogramWorkerMessage } from './portMessage.js';

type State = {
  pipeline?: Pipeline;
  wave?: Float32Array<SharedArrayBuffer>;
  progress: number;
};

const state: State = {
  progress: 0,
};

const port = createPort();

const render = async () => {
  const { pipeline, wave, progress } = state;
  if (!pipeline || !wave) return;
  await pipeline.render(wave, progress);
};

const singletonManager = createSingletonManager(
  async (message: ToSpectrogramWorkerMessage & { type: 'init' }) => {
    const device = await getGpuDevice(message.profiling);
    const pipeline = createPipeline({
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
