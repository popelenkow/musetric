import {
  type FourierMode,
  isGpuFourierMode,
  spectrogram,
} from '@musetric/audio';
import { envs } from '../../common/envs.js';
import { getGpuDevice } from '../../common/gpu.js';

export const createSpectrogramPipeline = async (
  canvas: OffscreenCanvas,
  fourierMode: FourierMode,
): Promise<spectrogram.Pipeline> => {
  const profiling = envs.spectrogramProfiling;

  if (isGpuFourierMode(fourierMode)) {
    const device = await getGpuDevice(profiling);
    return spectrogram.gpu.createPipeline({
      device,
      fourierMode,
      canvas,
      onMetrics: profiling
        ? (metrics) => {
            console.table(metrics);
          }
        : undefined,
    });
  }

  return spectrogram.cpu.createPipeline({
    fourierMode,
    canvas,
    onMetrics: profiling
      ? (metrics) => {
          console.table(metrics);
        }
      : undefined,
  });
};
