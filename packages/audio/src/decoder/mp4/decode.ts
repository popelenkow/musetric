import { type DemuxedTrack } from './demux.js';

const concatChunks = (
  chunks: Float32Array<ArrayBuffer>[],
  totalFrames: number,
): Float32Array<ArrayBuffer> => {
  const result = new Float32Array(totalFrames);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return result;
};

export type DecodedTrack = {
  channels: Float32Array[];
  sampleRate: number;
};
export const decodeTrack = async (
  track: DemuxedTrack,
): Promise<DecodedTrack> => {
  const { decoderConfig, packets, sampleRate, numberOfChannels } = track;

  const support = await AudioDecoder.isConfigSupported(decoderConfig);
  if (!support.supported || !support.config) {
    throw new Error(`Unsupported AudioDecoder config: ${decoderConfig.codec}`);
  }

  const chunksByChannel: Float32Array<ArrayBuffer>[][] = [[], []];
  let frameCount = 0;
  let decodeError: Error | undefined = undefined;

  const decoder = new AudioDecoder({
    output: (audioData) => {
      for (
        let channelIndex = 0;
        channelIndex < numberOfChannels;
        channelIndex++
      ) {
        const chunk = new Float32Array(audioData.numberOfFrames);
        audioData.copyTo(chunk, {
          planeIndex: channelIndex,
          format: 'f32-planar',
        });
        chunksByChannel[channelIndex].push(chunk);
      }

      frameCount += audioData.numberOfFrames;
      audioData.close();
    },
    error: (error) => {
      decodeError = error;
    },
  });

  try {
    decoder.configure(support.config);

    for await (const packet of packets) {
      decoder.decode(packet.toEncodedAudioChunk());
    }

    await decoder.flush();
    if (decodeError) {
      throw decodeError;
    }
  } finally {
    decoder.close();
  }

  const left = concatChunks(chunksByChannel[0], frameCount);
  if (numberOfChannels === 1) {
    return { channels: [left], sampleRate };
  }

  const right = concatChunks(chunksByChannel[1], frameCount);
  return { channels: [left, right], sampleRate };
};
