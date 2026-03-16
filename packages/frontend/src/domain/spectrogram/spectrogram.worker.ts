import { createSpectrogramWorkerRuntime } from '@musetric/audio/spectrogram/worker';

const profiling = import.meta.env.frontendSpectrogramProfiling === 'true';
await createSpectrogramWorkerRuntime(profiling);
