import { type ChannelBuffers } from '../common/channelBuffers.js';

export type ToWorkletMessage =
  | { type: 'play'; buffers: ChannelBuffers; startFrame: number }
  | { type: 'pause' };

export type FromWorkletMessage = {
  type: 'ended';
};
