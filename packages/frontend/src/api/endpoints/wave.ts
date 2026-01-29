import { api } from '@musetric/api';
import { queryOptions } from '@tanstack/react-query';
import axios from 'axios';

export const get = (projectId: number, type: api.wave.Type) =>
  queryOptions({
    queryKey: ['wave', 'get', projectId, type],
    queryFn: async () =>
      api.wave.get.request(axios, {
        params: { projectId, type },
      }),
  });
