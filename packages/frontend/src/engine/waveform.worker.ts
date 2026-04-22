import { api } from '@musetric/api';
import { requestWithAxios } from '@musetric/api/dom';
import { stemTypes } from '@musetric/audio/es';
import { waveformChannel } from '@musetric/audio/waveform';
import { createWaveformRuntime } from '@musetric/audio/waveform/worker';
import axios from 'axios';

const port = waveformChannel.inbound(self);

const reportError = () => {
  for (const stemType of stemTypes) {
    port.methods.setState({
      stemType,
      status: 'error',
    });
  }
};
self.addEventListener('error', reportError);
self.addEventListener('unhandledrejection', reportError);
self.addEventListener('messageerror', reportError);

port.bindBoot(() => {
  createWaveformRuntime({
    port,
    getWave: async (projectId, stemType) => {
      const wave = await requestWithAxios(axios, api.wave.get.base, {
        params: { projectId, stemType },
      });
      return wave;
    },
  });
  port.methods.booted();
});
