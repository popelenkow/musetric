import { decodeMp4 } from '../mp4/index.js';
import { createDecoderWorkerPort } from './port.worker.js';

export type DecoderWorkerState = {
  projectId?: number;
  sampleRate: number;
};

export const createDecoderWorkerRuntime = (
  getEncodedBuffer: (projectId: number) => Promise<ArrayBuffer>,
) => {
  const state: DecoderWorkerState = {
    sampleRate: 0,
  };
  const port = createDecoderWorkerPort();

  const decodeAudioTrack = async (projectId: number, sampleRate: number) => {
    try {
      const encodedBuffer = await getEncodedBuffer(projectId);
      const decoded = await decodeMp4(encodedBuffer, sampleRate);
      port.methods.decoded({
        channels: decoded.channels,
        frameCount: decoded.frameCount,
        duration: decoded.frameCount / sampleRate,
      });
    } catch (error) {
      console.error('Failed to load and decode project audio track', error);
      port.methods.state({
        status: 'error',
      });
    }
  };

  port.bindMethods({
    mount: async (message) => {
      state.projectId = message.projectId;
      state.sampleRate = message.sampleRate;
      await decodeAudioTrack(message.projectId, message.sampleRate);
    },
    unmount: () => {
      state.projectId = undefined;
      state.sampleRate = 0;
    },
  });

  return {
    state,
    port,
  };
};
