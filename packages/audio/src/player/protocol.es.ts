import { type ChannelBuffers } from '../common/channelBuffers.es.js';

export const playerProcessorName = 'player-processor';

export type PlayerCommandMethods = {
  init: (message: { buffers: ChannelBuffers }) => void;
  deinit: () => void;
  play: (message: { startFrame: number }) => void;
  pause: () => void;
};

export type PlayerEventMethods = {
  ended: () => void;
};
