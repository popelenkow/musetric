import { type ChannelArrays } from '../channelBuffers.es.js';

const toSharedArray = (data: Float32Array): Float32Array<SharedArrayBuffer> => {
  const shared = new SharedArrayBuffer(data.byteLength);
  new Float32Array(shared).set(data);
  return new Float32Array(shared);
};

export const toChannelSharedArrays = (
  channels: ChannelArrays,
): ChannelArrays<SharedArrayBuffer> =>
  channels.length === 1
    ? [toSharedArray(channels[0])]
    : [toSharedArray(channels[0]), toSharedArray(channels[1])];
