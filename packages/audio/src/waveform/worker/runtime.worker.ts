import { setOffscreenCanvasSize } from '../../common/offscreenCanvas.cross.js';
import {
  createWaveformProcessor,
  type WaveformProcessor,
} from '../processor.js';
import { type waveformChannel, type WaveType } from '../protocol.cross.js';

export type CreateWaveformRuntimeOptions = {
  port: ReturnType<typeof waveformChannel.inbound<DedicatedWorkerGlobalScope>>;
  getWave: (projectId: number, waveType: WaveType) => Promise<Float32Array>;
};

export const createWaveformRuntime = (
  options: CreateWaveformRuntimeOptions,
) => {
  const { port, getWave } = options;

  let canvas: OffscreenCanvas | undefined = undefined;
  let wave: Float32Array | undefined = undefined;
  let processor: WaveformProcessor | undefined = undefined;
  let trackProgress = 0;

  const render = (): boolean => {
    if (!wave || !processor) return false;
    processor.render(wave, trackProgress);
    return true;
  };

  port.bindHandlers({
    mount: async (message) => {
      trackProgress = message.trackProgress;
      canvas = message.canvas;

      try {
        setOffscreenCanvasSize(message.canvas, message.viewSize);
        processor = createWaveformProcessor(message.canvas, message.colors);

        wave = await getWave(message.projectId, message.waveType);
        render();
        port.methods.state({
          status: 'success',
        });
      } catch (error) {
        console.error('Failed to load project wave', error);
        port.methods.state({
          status: 'error',
        });
      }
    },
    unmount: () => {
      canvas = undefined;
      wave = undefined;
      processor = undefined;
      trackProgress = 0;
    },
    trackProgress: (message) => {
      trackProgress = message.trackProgress;
      render();
    },
    colors: (message) => {
      processor?.setColors(message.colors);
      render();
    },
    resize: (message) => {
      if (!canvas) {
        return;
      }

      setOffscreenCanvasSize(canvas, message.viewSize);
      render();
    },
  });
};
