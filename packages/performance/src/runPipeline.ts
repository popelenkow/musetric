import {
  type FourierMode,
  isGpuFourierMode,
  spectrogram,
} from '@musetric/audio';
import { progress, runs, skipRuns, wave } from './constants.js';
import { waitNextFrame } from './waitNextFrame.js';

export const runPipeline = async (
  fourierMode: FourierMode,
  windowSize: number,
  device: GPUDevice,
  canvas: OffscreenCanvas,
): Promise<{
  first: Record<string, number>;
  average: Record<string, number>;
  maxDeviation: Record<string, { positive: number; negative: number }>;
}> => {
  const metricsArray: Record<string, number>[] = [];
  const config: spectrogram.PipelineConfig = {
    ...spectrogram.defaultConfig,
    windowSize,
    viewSize: {
      width: canvas.width,
      height: canvas.height,
    },
    zeroPaddingFactor: 1,
  };
  const pipeline = isGpuFourierMode(fourierMode)
    ? spectrogram.gpu.createPipeline({
        device,
        canvas,
        fourierMode,
        onMetrics: (metrics) => metricsArray.push(metrics),
      })
    : spectrogram.cpu.createPipeline({
        canvas,
        fourierMode,
        onMetrics: (metrics) => metricsArray.push(metrics),
      });
  pipeline.configure(config);

  for (let i = 0; i < skipRuns + runs; i++) {
    await pipeline.render(wave, progress);
    await waitNextFrame(15);
  }
  pipeline.destroy();

  const first = metricsArray[0] ?? {};
  const average: Record<string, number> = {};
  const maxDeviation: Record<string, { positive: number; negative: number }> =
    {};
  const keys = Object.keys(first);

  for (const key of keys) {
    let sum = 0;
    for (const metrics of metricsArray.slice(skipRuns)) {
      sum += metrics[key] ?? 0;
    }
    average[key] = sum / runs;
  }

  for (const key of keys) {
    let maxPositive = 0;
    let maxNegative = 0;
    const avg = average[key] ?? 0;

    for (const metrics of metricsArray.slice(skipRuns)) {
      const value = metrics[key] ?? 0;
      const deviation = value - avg;
      if (deviation > maxPositive) {
        maxPositive = deviation;
      }
      if (deviation < maxNegative) {
        maxNegative = deviation;
      }
    }

    maxDeviation[key] = {
      positive: maxPositive,
      negative: Math.abs(maxNegative),
    };
  }

  return { first, average, maxDeviation };
};
