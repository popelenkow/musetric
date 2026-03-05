import { api } from '@musetric/api';
import { requestWithAxios } from '@musetric/api/dom';
import { createWaveformWorkerRuntime } from '@musetric/audio/waveform/worker';
import axios from 'axios';

createWaveformWorkerRuntime(async (projectId, waveType) => {
  const wave = await requestWithAxios(axios, api.wave.get.base, {
    params: { projectId, type: waveType },
  });
  return wave;
});
