import { api } from '@musetric/api';
import { requestWithAxios } from '@musetric/api/dom';
import { createDecoderWorkerRuntime } from '@musetric/audio/decoder/worker';
import axios from 'axios';

createDecoderWorkerRuntime({
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
});
