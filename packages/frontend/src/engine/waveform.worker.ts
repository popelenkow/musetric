import { api } from '@musetric/api';
import { requestWithAxios } from '@musetric/api/dom';
import { waveformChannel } from '@musetric/audio/waveform';
import { createWaveformRuntime } from '@musetric/audio/waveform/worker';
import axios from 'axios';

const port = waveformChannel.inbound(self);

const reportError = () => {
  port.methods.state({
    status: 'error',
  });
};
self.addEventListener('error', reportError);
self.addEventListener('unhandledrejection', reportError);
self.addEventListener('messageerror', reportError);

createWaveformRuntime({
  port,
  getWave: async (projectId, waveType) => {
    const wave = await requestWithAxios(axios, api.wave.get.base, {
      params: { projectId, type: waveType },
    });
    return wave;
  },
});
