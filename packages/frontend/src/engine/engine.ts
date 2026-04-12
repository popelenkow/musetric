import { defaultSampleRate } from '@musetric/resource-utils';
import { createStore, type Store } from '../common/store.js';
import { createEngineDecoder, type EngineDecoder } from './decoder.js';
import {
  createEnginePlayer,
  createEngineStubPlayer,
  type EnginePlayer,
} from './player.js';
import {
  createEngineSpectrogram,
  type EngineSpectrogram,
} from './spectrogram.js';
import { type EngineState } from './state.js';
import { createEngineWaveform, type EngineWaveform } from './waveform.js';

const initialState: EngineState = {
  statuses: {
    decoder: 'pending',
    spectrogram: 'pending',
    waveform: 'pending',
  },
  colors: {
    background: '#000000',
    played: '#ffffff',
    unplayed: '#888888',
  },
  duration: 0,
  playing: false,
  frameIndex: 0,
};

export type Engine = {
  context: AudioContext;
  store: Store<EngineState>;
  decoder: EngineDecoder;
  spectrogram: EngineSpectrogram;
  waveform: EngineWaveform;
  player: EnginePlayer;
  initPlayer: () => Promise<void>;
};

export const createEngine = (): Engine => {
  const context = new AudioContext({ sampleRate: defaultSampleRate });
  const store = createStore(initialState);
  const playerChannel = new MessageChannel();
  const spectrogramChannel = new MessageChannel();

  const ref: Engine = {
    context,
    store,
    spectrogram: createEngineSpectrogram({
      store,
      sampleRate: context.sampleRate,
      decoderPort: spectrogramChannel.port2,
    }),
    waveform: createEngineWaveform(store),
    decoder: createEngineDecoder({
      store,
      sampleRate: context.sampleRate,
      playerPort: playerChannel.port1,
      spectrogramPort: spectrogramChannel.port1,
    }),
    player: createEngineStubPlayer(),
    initPlayer: async () => {
      ref.player = await createEnginePlayer({
        context,
        store,
        decoderPort: playerChannel.port2,
      });
    },
  };

  return ref;
};

export const engine = createEngine();
