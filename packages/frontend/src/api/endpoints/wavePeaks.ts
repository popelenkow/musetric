import { api } from '@musetric/api';
import { requestWithAxios } from '@musetric/api/dom';
import { queryOptions } from '@tanstack/react-query';
import axios from 'axios';

export const get = (projectId: number, stemType: api.wavePeaks.StemType) =>
  queryOptions({
    queryKey: ['wavePeaks', 'get', projectId, stemType],
    queryFn: async () =>
      requestWithAxios(axios, api.wavePeaks.get.base, {
        params: { projectId, stemType },
      }),
  });
