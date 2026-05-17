import { createVocalAssessmentProcessor } from '../assessment/processor.js';
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
  let samples: Float32Array<SharedArrayBuffer> | undefined = undefined;
  let recordingSamples: Float32Array<SharedArrayBuffer> | undefined = undefined;
  let trackProgress = 0;
  let sampleRate = 0;
  const assessment = createVocalAssessmentProcessor({
    onPatch: (patch) => {
      port.methods.patchAssessment({
        patch,
      });
    },
  });

  const mountAssessment = () => {
    if (!samples || sampleRate <= 0) {
      return;
    }

    assessment.mount({
      leadSamples: samples,
      recordingSamples,
      sampleRate,
    });
  };

  const render = async () => {
    if (!samples) {
      return;
    }

    const ok = await processor.render(samples, trackProgress);
    if (!ok) {
      return;
    }
    port.methods.setState({
      status: 'success',
    });
  };

  dataPort.bindHandlers({
    mount: async (message) => {
      samples = message.samples;
      recordingSamples = message.recordingSamples;
      mountAssessment();
      await render();
    },
    patchRecording: (message) => {
      assessment.patchRecording(message);
    },
    unmount: () => {
      samples = undefined;
      recordingSamples = undefined;
      assessment.reset();
      port.methods.setState({
        status: 'pending',
      });
    },
  });

  port.bindHandlers({
    mount: async (message) => {
      try {
        trackProgress = message.trackProgress;
        if (message.config.sampleRate !== undefined) {
          sampleRate = message.config.sampleRate;
          mountAssessment();
        }
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
      trackProgress = 0;
      sampleRate = 0;
      assessment.reset();
      port.methods.setState({
        status: 'pending',
      });
    },
    setTrackProgress: (message) => {
      trackProgress = message.trackProgress;
      void render();
    },
    updateConfig: (message) => {
      if (message.patch.sampleRate !== undefined) {
        sampleRate = message.patch.sampleRate;
        mountAssessment();
      }
      processor.updateConfig(message.patch);
      void render();
    },
  });
};
