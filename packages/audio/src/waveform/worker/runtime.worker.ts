import { setOffscreenCanvasSize } from '@musetric/resource-utils/cross/offscreenCanvas';
import { type WaveType, waveTypes } from '../../common/waveType.es.js';
import {
  createWaveformProcessor,
  type WaveformProcessor,
} from '../processor.js';
import { type waveformChannel } from '../protocol.cross.js';

export type CreateWaveformRuntimeOptions = {
  port: ReturnType<typeof waveformChannel.inbound<DedicatedWorkerGlobalScope>>;
  getWave: (projectId: number, waveType: WaveType) => Promise<Float32Array>;
};

type WaveItem = {
  canvas: OffscreenCanvas;
  processor: WaveformProcessor;
  wave?: Float32Array;
  projectId: number;
};

export const createWaveformRuntime = (
  options: CreateWaveformRuntimeOptions,
) => {
  const { port, getWave } = options;

  let trackProgress = 0;
  const waveItems: Partial<Record<WaveType, WaveItem>> = {};

  const render = (waveType: WaveType): boolean => {
    const item = waveItems[waveType];
    if (!item || !item.wave) {
      return false;
    }

    item.processor.render(item.wave, trackProgress);
    return true;
  };

  const renderAll = () => {
    for (const waveType of waveTypes) {
      render(waveType);
    }
  };

  port.bindHandlers({
    mount: async (message) => {
      try {
        trackProgress = message.trackProgress;
        setOffscreenCanvasSize(message.canvas, message.viewSize);
        const item: WaveItem = {
          canvas: message.canvas,
          processor: createWaveformProcessor(message.canvas, message.colors),
          projectId: message.projectId,
        };
        waveItems[message.waveType] = item;
        item.wave = await getWave(message.projectId, message.waveType);
        render(message.waveType);
        port.methods.setState({
          waveType: message.waveType,
          status: 'success',
        });
      } catch (error) {
        console.error('Failed to load project wave', error);
        port.methods.setState({
          waveType: message.waveType,
          status: 'error',
        });
      }
    },
    unmount: (message) => {
      waveItems[message.waveType] = undefined;
    },
    setTrackProgress: (message) => {
      trackProgress = message.trackProgress;
      renderAll();
    },
    setColors: (message) => {
      for (const waveType of waveTypes) {
        waveItems[waveType]?.processor.setColors(message.colors);
      }
      renderAll();
    },
    resize: (message) => {
      const item = waveItems[message.waveType];
      if (!item) {
        return;
      }

      setOffscreenCanvasSize(item.canvas, message.viewSize);
      render(message.waveType);
    },
  });
};
