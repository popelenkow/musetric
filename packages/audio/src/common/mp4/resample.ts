import { readAudioBuffer, writeAudioBuffer } from '../audioBuffer.js';
import { type ChannelArrays } from '../channelBuffers.es.js';

export const resamplePcm = async (
  channels: ChannelArrays<ArrayBuffer>,
  sourceSampleRate: number,
  targetSampleRate: number,
): Promise<ChannelArrays<ArrayBuffer>> => {
  if (sourceSampleRate === targetSampleRate) {
    return channels;
  }

  const sourceFrameCount = channels[0].length;
  const targetFrameCount = Math.round(
    (sourceFrameCount * targetSampleRate) / sourceSampleRate,
  );

  const context = new OfflineAudioContext(
    channels.length,
    targetFrameCount,
    targetSampleRate,
  );
  const sourceBuffer = context.createBuffer(
    channels.length,
    sourceFrameCount,
    sourceSampleRate,
  );
  writeAudioBuffer(sourceBuffer, channels);

  const source = context.createBufferSource();
  source.buffer = sourceBuffer;
  source.connect(context.destination);
  source.start(0);

  const rendered = await context.startRendering();
  return readAudioBuffer(rendered);
};
