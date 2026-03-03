import { spectrogram } from '@musetric/audio';
import { createSingletonManager } from '@musetric/resource-utils';
import {
  createPortMessageHandler,
  wrapMessagePort,
} from '@musetric/resource-utils/cross/messagePort';
import { getGpuDevice } from '../../common/gpu.es.js';
import {
  type FromSpectrogramWorkerMessage,
  type ToSpectrogramWorkerMessage,
} from './protocol.es.js';

declare const self: DedicatedWorkerGlobalScope;

const port = wrapMessagePort(self).typed<
  ToSpectrogramWorkerMessage,
  FromSpectrogramWorkerMessage
>();
const onError = () => {
  port.postMessage({
    type: 'state',
    status: 'error',
  });
};
port.addEventListener('error', onError);
port.addEventListener('unhandledrejection', onError);
port.addEventListener('messageerror', onError);

type State = {
  pipeline?: spectrogram.Pipeline;
  wave?: Float32Array<SharedArrayBuffer>;
  progress: number;
};

const state: State = {
  progress: 0,
};

const render = async () => {
  const { pipeline, wave, progress } = state;
  if (!pipeline || !wave) return;
  await pipeline.render(wave, progress);
};

const singletonManager = createSingletonManager(
  async (message: ToSpectrogramWorkerMessage & { type: 'init' }) => {
    const device = await getGpuDevice(message.profiling);
    const pipeline = spectrogram.createPipeline({
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
