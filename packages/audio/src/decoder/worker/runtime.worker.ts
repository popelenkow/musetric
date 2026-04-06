import { decodeMp4 } from '../mp4/index.js';
import { createDecoderWorkerPort } from './port.worker.js';

export type CreateDecoderWorkerRuntimeOptions = {
  getEncodedBuffer: (projectId: number) => Promise<ArrayBuffer>;
};
export const createDecoderWorkerRuntime = (
  options: CreateDecoderWorkerRuntimeOptions,
) => {
  const { getEncodedBuffer } = options;

  const port = createDecoderWorkerPort();

  port.bindMethods({
    mount: async (message) => {
      try {
        const { projectId, sampleRate } = message;
        const encodedBuffer = await getEncodedBuffer(projectId);
        const decoded = await decodeMp4(encodedBuffer, sampleRate);
        port.methods.mounted({
          channels: decoded.channels,
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
      port.methods.unmounted();
    },
  });
};
