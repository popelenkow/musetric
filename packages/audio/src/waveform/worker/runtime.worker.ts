import { setOffscreenCanvasSize } from '@musetric/resource-utils/cross/offscreenCanvas';
import { type StemType, stemTypes } from '../../common/stemType.es.js';
import {
  createWaveformProcessor,
  type WaveformProcessor,
} from '../processor.js';
import { type waveformChannel } from '../protocol.cross.js';

export type CreateWaveformRuntimeOptions = {
  port: ReturnType<typeof waveformChannel.inbound<DedicatedWorkerGlobalScope>>;
  getWave: (projectId: number, stemType: StemType) => Promise<Float32Array>;
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
  const waveItems: Partial<Record<StemType, WaveItem>> = {};

  const render = (stemType: StemType): boolean => {
    const item = waveItems[stemType];
    if (!item || !item.wave) {
      return false;
    }

    item.processor.render(item.wave, trackProgress);
    return true;
  };

  const renderAll = () => {
    for (const stemType of stemTypes) {
      render(stemType);
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
        waveItems[message.stemType] = item;
        item.wave = await getWave(message.projectId, message.stemType);
        render(message.stemType);
        port.methods.setState({
          stemType: message.stemType,
          status: 'success',
        });
      } catch (error) {
        console.error('Failed to load project wave', error);
        port.methods.setState({
          stemType: message.stemType,
          status: 'error',
        });
      }
    },
    unmount: (message) => {
      waveItems[message.stemType] = undefined;
    },
    setTrackProgress: (message) => {
      trackProgress = message.trackProgress;
      renderAll();
    },
    setColors: (message) => {
      for (const stemType of stemTypes) {
        waveItems[stemType]?.processor.setColors(message.colors);
      }
      renderAll();
    },
    resize: (message) => {
      const item = waveItems[message.stemType];
      if (!item) {
        return;
      }

      setOffscreenCanvasSize(item.canvas, message.viewSize);
      render(message.stemType);
    },
  });
};
