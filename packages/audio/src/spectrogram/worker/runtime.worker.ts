import { getGpuDevice } from '../common/gpuDevice.js';
import { createSpectrogramProcessor } from '../processor.js';
import {
  type spectrogramChannel,
  type spectrogramDataChannel,
} from '../protocol.cross.js';

export type CreateSpectrogramRuntimeOptions = {
  port: ReturnType<
    typeof spectrogramChannel.inbound<DedicatedWorkerGlobalScope>
  >;
  dataPort: ReturnType<typeof spectrogramDataChannel.inbound<MessagePort>>;
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

  let processor = createProcessor();
  let wave: Float32Array<SharedArrayBuffer> | undefined = undefined;
  let trackProgress = 0;

  const render = async () => {
    if (!wave) {
      return;
    }

    const ok = await processor.render(wave, trackProgress);
    if (!ok) {
      return;
    }
    port.methods.setState({
      status: 'success',
    });
  };

  dataPort.bindHandlers({
    setWave: async (message) => {
      wave = new Float32Array(message.waveBuffer);
      await render();
    },
    clear: () => {
      wave = undefined;
      port.methods.setState({
        status: 'pending',
      });
    },
  });

  port.bindHandlers({
    mount: async (message) => {
      try {
        trackProgress = message.trackProgress;
        processor = createProcessor();
        processor.updateConfig(message.config);
        await render();
      } catch (error) {
        console.error('Failed to render spectrogram', error);
        port.methods.setState({
          status: 'error',
        });
      }
    },
    unmount: () => {
      processor.dispose();
      processor = createProcessor();
      wave = undefined;
      trackProgress = 0;
      port.methods.setState({
        status: 'pending',
      });
    },
    setTrackProgress: async (message) => {
      trackProgress = message.trackProgress;
      await render();
    },
    updateConfig: async (message) => {
      processor.updateConfig(message.patch);
      await render();
    },
  });
};
