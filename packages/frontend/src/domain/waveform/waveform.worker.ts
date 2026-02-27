import { api } from '@musetric/api';
import { requestWithAxios } from '@musetric/api/dom';
import { setCanvasSize, type ViewColors, waveform } from '@musetric/audio';
import {
  createPortMessageHandler,
  wrapMessagePort,
} from '@musetric/resource-utils/cross/messagePort';
import axios from 'axios';
import {
  type FromWaveformWorkerMessage,
  type ToWaveformWorkerMessage,
} from './protocol.es.js';

declare const self: DedicatedWorkerGlobalScope;

type State = {
  canvas?: OffscreenCanvas;
  wave?: Float32Array<ArrayBuffer>;
  pipeline?: waveform.Pipeline;
  progress: number;
  colors?: ViewColors;
};

const state: State = {
  progress: 0,
};

const port = wrapMessagePort(self).typed<
  ToWaveformWorkerMessage,
  FromWaveformWorkerMessage
>();

const initializePipeline = () => {
  const { canvas, colors } = state;
  if (!canvas || !colors) return;
  state.pipeline = waveform.createPipeline(canvas, colors);
};

const render = (): boolean => {
  const { wave, pipeline, progress } = state;
  if (!wave || !pipeline) return false;
  pipeline.render(wave, progress);
  return true;
};

const loadWave = async (projectId: number, waveType: api.wave.Type) => {
  try {
    const wave = await requestWithAxios(axios, api.wave.get.base, {
      params: { projectId, type: waveType },
    });
    state.wave = wave;
    port.postMessage({
      type: 'state',
      status: 'success',
    });
    render();
  } catch (error) {
    console.error('Failed to load project wave', error);
    port.postMessage({
      type: 'state',
      status: 'error',
    });
  }
};

port.onmessage = createPortMessageHandler<ToWaveformWorkerMessage>({
  init: (message) => {
    state.colors = message.colors;
    state.progress = message.progress;
    port.postMessage({
      type: 'state',
      status: 'pending',
    });
    void loadWave(message.projectId, message.waveType);
  },
  attachCanvas: (message) => {
    state.canvas = message.canvas;
    initializePipeline();
    render();
  },
  progress: (message) => {
    state.progress = message.progress;
    render();
  },
  colors: (message) => {
    state.colors = message.colors;
    initializePipeline();
    render();
  },
  resize: (message) => {
    if (!state.canvas) return;
    setCanvasSize(state.canvas, message.viewSize);
    render();
  },
});
