import { createCallLatest } from '@musetric/resource-utils';
import type { ExtSpectrogramConfig } from './common/extConfig.js';
import { applySpectrogramPatchConfig } from './common/patchConfig.js';
import {
  createSpectrogramProcessorTimer,
  type SpectrogramProcessorMetrics,
} from './common/processorTimer.js';
import { type FourierMode, type SpectrogramConfig } from './config.es.js';
import { createSpectrogramDecibelify } from './decibelify/index.js';
import { createSpectrogramDraw } from './draw/index.js';
import { fouriers } from './fourier/fouriers.js';
import { createSpectrogramMagnitudify } from './magnitudify/index.js';
import { createSpectrogramProcessorState } from './processorState/index.js';
import { createSpectrogramRemap } from './remap/index.js';
import { createSpectrogramSliceWave } from './sliceWave/index.js';
import { createSpectrogramWindowing } from './windowing/index.js';

export type SpectrogramProcessor = {
  render: (wave: Float32Array, progress: number) => Promise<void>;
  updateConfig: (config: Partial<SpectrogramConfig>) => void;
  destroy: () => void;
};

export type CreateSpectrogramProcessorOptions = {
  device: GPUDevice;
  fourierMode: FourierMode;
  canvas: OffscreenCanvas;
  config: SpectrogramConfig;
  onMetrics?: (metrics: SpectrogramProcessorMetrics) => void;
};

export const createSpectrogramProcessor = (
  options: CreateSpectrogramProcessorOptions,
): SpectrogramProcessor => {
  const { device, fourierMode, canvas, onMetrics } = options;

  const timer = createSpectrogramProcessorTimer(device, onMetrics);
  const { markers } = timer;

  let draftConfig: Partial<SpectrogramConfig> = options.config;
  let config: ExtSpectrogramConfig = {
    ...options.config,
    windowCount: options.config.viewSize.width,
  };
  const state = createSpectrogramProcessorState(device);
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
      label: 'processor-render-encoder',
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
      draftConfig = applySpectrogramPatchConfig({
        base: config,
        draft: draftConfig,
        patch: patchConfig,
      });
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
