import { createCallLatest } from '@musetric/resource-utils';
import {
  applySpectrogramPatchConfig,
  type SpectrogramConfig,
} from './config.js';
import { createSpectrogramDecibelify } from './decibelify/index.js';
import { createSpectrogramDraw } from './draw/index.js';
import { type FourierMode, fouriers } from './fourier/fouriers.js';
import { createSpectrogramMagnitudify } from './magnitudify/index.js';
import { createSpectrogramPipelineState } from './pipelineState/index.js';
import {
  createSpectrogramPipelineTimer,
  type SpectrogramPipelineMetrics,
} from './pipelineTimer.js';
import { createSpectrogramRemap } from './remap/index.js';
import { createSpectrogramSliceWave } from './sliceWave/index.js';
import { createSpectrogramWindowing } from './windowing/index.js';

export type SpectrogramPipeline = {
  render: (wave: Float32Array, progress: number) => Promise<void>;
  updateConfig: (config: Partial<SpectrogramConfig>) => void;
  destroy: () => void;
};

export type CreateSpectrogramPipelineOptions = {
  device: GPUDevice;
  fourierMode: FourierMode;
  canvas: OffscreenCanvas;
  config: SpectrogramConfig;
  onMetrics?: (metrics: SpectrogramPipelineMetrics) => void;
};

export const createSpectrogramPipeline = (
  options: CreateSpectrogramPipelineOptions,
): SpectrogramPipeline => {
  const { device, fourierMode, canvas, onMetrics } = options;

  const timer = createSpectrogramPipelineTimer(device, onMetrics);
  const { markers } = timer;

  let draftConfig: Partial<SpectrogramConfig> = options.config;
  let config = {
    ...options.config,
    windowCount: options.config.viewSize.width,
  };
  const state = createSpectrogramPipelineState(device);
  const sliceWave = createSpectrogramSliceWave(device, markers.sliceWave);
  const windowing = createSpectrogramWindowing(device, markers.windowing);
  const fourier = fouriers[fourierMode](device, {
    reverse: markers.fourierReverse,
    transform: markers.fourierTransform,
  });
  const magnitudify = createSpectrogramMagnitudify(device, markers.magnitudify);
  const decibelify = createSpectrogramDecibelify(device, markers.decibelify);
  const remap = createSpectrogramRemap(device, markers.remap);
  const draw = createSpectrogramDraw(device, canvas, markers.draw);

  const configure = markers.configure(() => {
    state.configure(config);
    const { signal, texture } = state;
    sliceWave.configure(signal.real, config);
    windowing.configure(signal.real, config);
    fourier.configure(signal, {
      ...config,
      windowSize: config.windowSize * config.zeroPaddingFactor,
    });
    magnitudify.configure(signal, config);
    decibelify.configure(signal.real, config);
    remap.configure(signal.real, texture.view, config);
    draw.configure(texture.view, config);
  });

  const writeBuffers = markers.writeBuffers(
    (wave: Float32Array, progress: number) => {
      sliceWave.write(wave, progress);
    },
  );
  const createCommand = markers.createCommand(() => {
    const encoder = device.createCommandEncoder({
      label: 'pipeline-render-encoder',
    });
    sliceWave.run(encoder);
    state.zerofyImag(encoder);
    windowing.run(encoder);
    fourier.forward(encoder);
    magnitudify.run(encoder);
    decibelify.run(encoder);
    remap.run(encoder);
    draw.run(encoder);
    timer.resolve(encoder);
    return encoder.finish();
  });

  const submitCommand = markers.submitCommand(
    async (command: GPUCommandBuffer) => {
      device.queue.submit([command]);
      await device.queue.onSubmittedWorkDone();
    },
  );

  const render = markers.total(async (wave: Float32Array, progress: number) => {
    if (Object.keys(draftConfig).length) {
      config = { ...config, ...draftConfig };
      config.windowCount = config.viewSize.width;
      draftConfig = {};
      configure();
    }

    writeBuffers(wave, progress);
    const command = createCommand();
    await submitCommand(command);
  });

  return {
    render: createCallLatest(async (wave, progress) => {
      await render(wave, progress);
      await timer.finish();
    }),
    updateConfig: (patchConfig) => {
      draftConfig = applySpectrogramPatchConfig(
        draftConfig,
        patchConfig,
        config,
      );
    },
    destroy: () => {
      timer.destroy();
      state.destroy();
      windowing.destroy();
      fourier.destroy();
      magnitudify.destroy();
      decibelify.destroy();
      remap.destroy();
      draw.destroy();
    },
  };
};
