import { api } from '@musetric/api';
import { requestWithAxios } from '@musetric/api/dom';
import {
  createDecoderWorkerPort,
  createDecoderWorkerRuntime,
  createPlayerDataPort,
  createSpectrogramDataPort,
} from '@musetric/audio/decoder/worker';
import axios from 'axios';

const port = createDecoderWorkerPort();

port.bindBoot((message) =>
  createDecoderWorkerRuntime({
    port,
    playerPort: createPlayerDataPort(message.playerPort),
    spectrogramPort: createSpectrogramDataPort(message.spectrogramPort),
    getEncodedBuffer: async (projectId) => {
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
      return encodedBuffer.buffer;
    },
  }),
);
