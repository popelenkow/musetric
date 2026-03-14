import { type ChannelBuffers } from '../common/channelBuffers.es.js';

export type ToPlayerWorkletMessage =
  | { type: 'play'; buffers: ChannelBuffers; startFrame: number }
  | { type: 'pause' };

export type FromPlayerWorkletMessage = {
  type: 'ended';
};
