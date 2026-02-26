import { type ChannelArrays } from '../channelBuffers.es.js';
import { toChannelSharedArrays } from './buffers.js';
import { decodeTrack } from './decode.js';
import { withDemuxedTrack } from './demux.js';
import { resamplePcm } from './resample.js';

export type DecodedMp4 = {
  channels: ChannelArrays<SharedArrayBuffer>;
  frameCount: number;
};
export const decodeMp4 = async (
  encodedBuffer: ArrayBuffer,
  sampleRate: number,
): Promise<DecodedMp4> => {
  const decoded = await withDemuxedTrack(encodedBuffer, decodeTrack);
  const resampled = await resamplePcm(
    decoded.channels,
    decoded.sampleRate,
    sampleRate,
  );
  const channels = toChannelSharedArrays(resampled);
  const frameCount = channels[0].length;

  return {
    channels,
    frameCount,
  };
};
