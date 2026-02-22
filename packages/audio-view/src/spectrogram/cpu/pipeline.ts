import { createCallLatest } from '@musetric/resource-utils';
import { type CpuFourierMode, cpuFouriers } from '../../fourier/index.js';
import { type Pipeline } from '../pipeline.js';
import { createDecibelify } from './decibelify.js';
import { createDraw } from './draw.js';
import { createMagnitudify } from './magnitudify.js';
import { createPipelineState } from './pipelineState.js';
import { createPipelineTimer, type PipelineMetrics } from './pipelineTimer.js';
import { createRemap } from './remap.js';
import { createSliceWave } from './sliceWave.js';
import { createWindowing } from './windowing.js';

export type CreatePipelineOptions = {
  canvas: HTMLCanvasElement;
  fourierMode: CpuFourierMode;
  onMetrics?: (metrics: PipelineMetrics) => void;
};
export const createPipeline = (options: CreatePipelineOptions): Pipeline => {
  const { canvas, fourierMode, onMetrics } = options;

  let isConfigureRequested = true;

  const timer = createPipelineTimer(onMetrics);
  const { markers } = timer;

  const state = createPipelineState(markers.zerofyImag);
  const sliceWave = createSliceWave(markers.sliceWave);
  const windowing = createWindowing(markers.windowing);
  const fourier = cpuFouriers[fourierMode](markers.fourier);
  const magnitudify = createMagnitudify(markers.magnitudify);
  const decibelify = createDecibelify(markers.decibelify);
  const remap = createRemap(markers.remap);
  const draw = createDraw(canvas, markers.draw);

  const configure = markers.configure(() => {
    state.configure();
    const { config } = state;
    sliceWave.configure(config);
    windowing.configure(config);
    fourier.configure({
      ...config,
      windowSize: config.windowSize * config.zeroPaddingFactor,
    });
    magnitudify.configure(config);
    decibelify.configure(config);
    remap.configure(config);
    draw.configure(config);
  });

  const render = markers.total((wave: Float32Array, progress: number) => {
    if (isConfigureRequested) {
      isConfigureRequested = false;
      configure();
    }
    const { signal, view } = state;
    sliceWave.run(wave, signal.real, progress);
    state.zerofyImag();
    windowing.run(signal.real);
    fourier.forward(signal);
    magnitudify.run(signal);
    decibelify.run(signal.real);
    remap.run(signal.real, view);
    draw.run(view);
  });

  return {
    render: createCallLatest(async (wave, progress) => {
      render(wave, progress);
      timer.finish();
      return Promise.resolve();
    }),
    configure: (newConfig) => {
      state.config = {
        ...newConfig,
        windowCount: newConfig.viewSize.width,
      };
      isConfigureRequested = true;
    },
    destroy: () => {
      // No resources to clean up in CPU implementation
    },
  };
};
