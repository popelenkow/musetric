import { toChannelBuffers } from '../../common/channelBuffers.es.js';
import { type playerDataChannel } from '../../player/protocol.cross.js';
import { type spectrogramDataChannel } from '../../spectrogram/protocol.cross.js';
import { decodeMp4 } from '../mp4/index.js';
import { type decoderChannel } from '../protocol.cross.js';

export type CreateDecoderRuntimeOptions = {
  getEncodedBuffer: (projectId: number) => Promise<ArrayBuffer>;
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
        const encodedBuffer = await getEncodedBuffer(projectId);
        const decoded = await decodeMp4(encodedBuffer, sampleRate);

        playerPort.methods.mount({
          buffers: toChannelBuffers(decoded.channels),
        });
        spectrogramPort.methods.mount({
          waveBuffer: decoded.channels[0].buffer,
        });
        port.methods.mounted({
          frameCount: decoded.frameCount,
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
