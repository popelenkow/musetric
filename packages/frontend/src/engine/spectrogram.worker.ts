import {
  createSpectrogramDecoderDataPort,
  createSpectrogramRuntime,
  createSpectrogramWorkerPort,
} from '@musetric/audio/spectrogram/worker';

const profiling = import.meta.env.frontendSpectrogramProfiling === 'true';
const port = createSpectrogramWorkerPort();

port.bindBoot(async (message) =>
  createSpectrogramRuntime({
    port,
    dataPort: createSpectrogramDecoderDataPort(message.decoderPort),
    profiling,
  }),
);
