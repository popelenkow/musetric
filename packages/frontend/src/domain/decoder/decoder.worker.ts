import { api } from '@musetric/api';
import { requestWithAxios } from '@musetric/api/dom';
import { decodeMp4 } from '@musetric/audio';
import {
  createPortMessageHandler,
  wrapMessagePort,
} from '@musetric/resource-utils/cross/messagePort';
import axios from 'axios';
import {
  type FromDecoderWorkerMessage,
  type ToDecoderWorkerMessage,
} from './portMessage.es.js';

declare const self: DedicatedWorkerGlobalScope;

const port = wrapMessagePort(self).typed<
  ToDecoderWorkerMessage,
  FromDecoderWorkerMessage
>();

const onError = () => {
  port.postMessage({
    type: 'state',
    status: 'error',
  });
};

port.addEventListener('error', onError);
port.addEventListener('unhandledrejection', onError);
port.addEventListener('messageerror', onError);

const decodeAudioTrack = async (projectId: number, sampleRate: number) => {
  try {
    const encodedBuffer = await requestWithAxios(
      axios,
      api.audioDelivery.get.base,
      {
        params: {
          projectId,
          type: 'lead',
        },
      },
    );
    const decoded = await decodeMp4(encodedBuffer.buffer, sampleRate);
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
    port.postMessage({
      type: 'state',
      status: 'pending',
    });
    void decodeAudioTrack(message.projectId, message.sampleRate);
  },
});
