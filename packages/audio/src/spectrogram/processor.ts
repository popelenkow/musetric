import { createCallLatest } from '@musetric/resource-utils';
import {
  createSpectrogramProcessorTimer,
  type SpectrogramProcessorMetrics,
} from './common/processorTimer.js';
import { type SpectrogramConfig } from './config.cross.js';
import {
  createSpectrogramConfigurator,
  type SpectrogramRuntime,
} from './configurator.js';
import { type SpectrogramSliceWave } from './sliceWave/index.js';

export type SpectrogramProcessor = {
  render: (wave: Float32Array, progress: number) => Promise<void>;
  updateConfig: (config: Partial<SpectrogramConfig>) => void;
  destroy: () => void;
};

export type CreateSpectrogramProcessorOptions = {
  device: GPUDevice;
  config?: Partial<SpectrogramConfig>;
  onMetrics?: (metrics: SpectrogramProcessorMetrics) => void;
};

export const createSpectrogramProcessor = (
  options: CreateSpectrogramProcessorOptions,
): SpectrogramProcessor => {
  const { device, onMetrics } = options;

  const timer = createSpectrogramProcessorTimer(device, onMetrics);
  const { markers } = timer;

  const configurator = createSpectrogramConfigurator(device, markers);
  configurator.updateConfig(options.config ?? {});

  const writeBuffers = markers.writeBuffers(
    (sliceWave: SpectrogramSliceWave, wave: Float32Array, progress: number) => {
      sliceWave.write(wave, progress);
    },
  );
  const createCommand = markers.createCommand((runtime: SpectrogramRuntime) => {
    const encoder = device.createCommandEncoder({
      label: 'processor-render-encoder',
    });
    runtime.sliceWave.run(encoder);
    runtime.state.zerofyImag(encoder);
    runtime.windowing.run(encoder);
    runtime.fourier.forward(encoder);
    runtime.magnitudify.run(encoder);
    runtime.decibelify.run(encoder);
    runtime.remap.run(encoder);
    runtime.draw.run(encoder);
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
    const runtime = configurator.configure();
    writeBuffers(runtime.sliceWave, wave, progress);
    const command = createCommand(runtime);
    await submitCommand(command);
  });

  return {
    render: createCallLatest(async (wave, progress) => {
      await render(wave, progress);
      await timer.finish();
    }),
    updateConfig: configurator.updateConfig,
    destroy: () => {
      timer.destroy();
      configurator.dispose();
    },
  };
};
