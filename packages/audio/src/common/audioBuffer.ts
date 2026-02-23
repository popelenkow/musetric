import { type ChannelBuffers } from './channelBuffers.es.js';

const toSharedArrayBuffer = (data: Float32Array<ArrayBuffer>): Float32Array => {
  const buffer = new SharedArrayBuffer(data.byteLength);
  const array = new Float32Array(buffer);
  array.set(data);
  return array;
};

export const toChannelBuffers = (buffer: AudioBuffer): ChannelBuffers => {
  const first = toSharedArrayBuffer(buffer.getChannelData(0));

  if (buffer.numberOfChannels == 1) {
    return [first.buffer];
  }

  const second = toSharedArrayBuffer(buffer.getChannelData(1));
  return [first.buffer, second.buffer];
};
