import type { StemType } from '../../common/stemType.es.js';
import { type playerDataChannel } from '../../player/protocol.cross.js';
import { type spectrogramDataChannel } from '../../spectrogram/protocol.cross.js';
import { decodeMp4 } from '../mp4/index.js';
import { type decoderChannel } from '../protocol.cross.js';

export type CreateDecoderRuntimeOptions = {
  getEncodedBuffer: (
    projectId: number,
    stemType: StemType,
  ) => Promise<ArrayBuffer>;
  port: ReturnType<typeof decoderChannel.inbound<DedicatedWorkerGlobalScope>>;
  playerPort: ReturnType<typeof playerDataChannel.outbound<MessagePort>>;
  spectrogramPort: ReturnType<
    typeof spectrogramDataChannel.outbound<MessagePort>
  >;
};
export const createDecoderRuntime = (options: CreateDecoderRuntimeOptions) => {
  const { getEncodedBuffer, port, playerPort, spectrogramPort } = options;

  port.bindHandlers({
    mount: async (message) => {
      try {
        const { projectId, sampleRate } = message;
        const [leadBuffer, backingBuffer, instrumentalBuffer] =
          await Promise.all([
            getEncodedBuffer(projectId, 'lead'),
            getEncodedBuffer(projectId, 'backing'),
            getEncodedBuffer(projectId, 'instrumental'),
          ]);
        const [leadDecoded, backingDecoded, instrumentalDecoded] =
          await Promise.all([
            decodeMp4(leadBuffer, sampleRate),
            decodeMp4(backingBuffer, sampleRate),
            decodeMp4(instrumentalBuffer, sampleRate),
          ]);

        playerPort.methods.mount({
          tracks: {
            lead: leadDecoded.channels,
            backing: backingDecoded.channels,
            instrumental: instrumentalDecoded.channels,
          },
        });
        spectrogramPort.methods.mount({
          wave: leadDecoded.channels[0],
        });
        port.methods.mounted({
          frameCount: Math.max(
            leadDecoded.frameCount,
            backingDecoded.frameCount,
            instrumentalDecoded.frameCount,
          ),
        });
      } catch (error) {
        console.error('Failed to load and decode project audio track', error);
        port.methods.setState({
          status: 'error',
        });
      }
    },
    unmount: () => {
      playerPort.methods.unmount();
      spectrogramPort.methods.unmount();
      port.methods.unmounted();
    },
  });
};
