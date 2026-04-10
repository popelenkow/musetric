import { toChannelBuffers } from '../../common/channelBuffers.es.js';
import { decodeMp4 } from '../mp4/index.js';
import type {
  DecoderWorkerPort,
  PlayerDataPort,
  SpectrogramDataPort,
} from './port.worker.js';

export type CreateDecoderWorkerRuntimeOptions = {
  getEncodedBuffer: (projectId: number) => Promise<ArrayBuffer>;
  port: DecoderWorkerPort;
  playerPort: PlayerDataPort;
  spectrogramPort: SpectrogramDataPort;
};
export const createDecoderWorkerRuntime = (
  options: CreateDecoderWorkerRuntimeOptions,
) => {
  const { getEncodedBuffer, port, playerPort, spectrogramPort } = options;

  port.bindMethods({
    mount: async (message) => {
      try {
        const { projectId, sampleRate } = message;
        const encodedBuffer = await getEncodedBuffer(projectId);
        const decoded = await decodeMp4(encodedBuffer, sampleRate);

        playerPort.methods.mount({
          buffers: toChannelBuffers(decoded.channels),
        });
        spectrogramPort.methods.wave({
          waveBuffer: decoded.channels[0].buffer,
        });
        port.methods.mounted({
          frameCount: decoded.frameCount,
        });
      } catch (error) {
        console.error('Failed to load and decode project audio track', error);
        port.methods.state({
          status: 'error',
        });
      }
    },
    unmount: () => {
      playerPort.methods.unmount();
      spectrogramPort.methods.clear();
      port.methods.unmounted();
    },
  });
};
