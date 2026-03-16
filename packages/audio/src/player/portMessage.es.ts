import { type ChannelBuffers } from '../common/channelBuffers.es.js';

export const playerProcessorName = 'player-processor';

export type ToPlayerWorkletMessage =
  | { type: 'init'; buffers: ChannelBuffers }
  | { type: 'deinit' }
  | { type: 'play'; startFrame: number }
  | { type: 'pause' };

export type FromPlayerWorkletMessage = {
  type: 'ended';
};
