import { api } from '@musetric/api';
import { requestWithAxios } from '@musetric/api/dom';
import { queryOptions } from '@tanstack/react-query';
import axios from 'axios';

export const get = (projectId: number, stemType: api.wave.StemType) =>
  queryOptions({
    queryKey: ['wave', 'get', projectId, stemType],
    queryFn: async () =>
      requestWithAxios(axios, api.wave.get.base, {
        params: { projectId, stemType },
      }),
  });
