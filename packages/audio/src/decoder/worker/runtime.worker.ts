import { createPortMessageHandler } from '@musetric/resource-utils/cross/messagePort';
import { decodeMp4 } from '../mp4/index.js';
import { type ToDecoderWorkerMessage } from '../portMessage.cross.js';
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
      port.postMessage({
        type: 'decoded',
        channels: decoded.channels,
        frameCount: decoded.frameCount,
        duration: decoded.frameCount / sampleRate,
      });
    } catch (error) {
      console.error('Failed to load and decode project audio track', error);
      port.postMessage({
        type: 'state',
        status: 'error',
      });
    }
  };

  port.onmessage = createPortMessageHandler<ToDecoderWorkerMessage>({
    init: (message) => {
      state.projectId = message.projectId;
      state.sampleRate = message.sampleRate;
      port.postMessage({
        type: 'state',
        status: 'pending',
      });
      void decodeAudioTrack(message.projectId, message.sampleRate);
    },
  });

  return {
    state,
    port,
  };
};
