import type { ChannelArrays } from './channelBuffers.es.js';

export const readAudioBuffer = (
  audioBuffer: AudioBuffer,
): ChannelArrays<ArrayBuffer> => {
  if (audioBuffer.numberOfChannels === 1) {
    return [audioBuffer.getChannelData(0)];
  }

  return [audioBuffer.getChannelData(0), audioBuffer.getChannelData(1)];
};

export const writeAudioBuffer = (
  audioBuffer: AudioBuffer,
  channels: ChannelArrays<ArrayBuffer>,
): void => {
  if (channels.length === 1) {
    audioBuffer.copyToChannel(channels[0], 0);
  } else {
    audioBuffer.copyToChannel(channels[0], 0);
    audioBuffer.copyToChannel(channels[1], 1);
  }
};
