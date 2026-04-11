import { type ChannelBuffers } from '../common/channelBuffers.es.js';

export const playerProcessorName = 'player-processor';

export type PlayerCommandMethods = {
  boot: (message: { decoderPort: MessagePort }) => void;
  play: () => void;
  pause: () => void;
  seek: (message: { frameIndex: number }) => void;
};

export type PlayerDataMethods = {
  mount: (message: { buffers: ChannelBuffers }) => void;
  unmount: () => void;
};

export type PlayerEventMethods = {
  playing: (message: { playing: boolean; frameIndex: number }) => void;
  frameIndex: (message: { frameIndex: number }) => void;
};
