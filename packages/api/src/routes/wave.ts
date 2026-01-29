import { z } from 'zod';
import { axiosRequest } from './common/axiosRequest.js';
import { fastifyRoute, createApiRoute } from './common/index.js';

export const typeSchema = z.enum(['lead', 'backing', 'instrumental']);
export type Type = z.infer<typeof typeSchema>;

export namespace get {
  export const base = createApiRoute({
    method: 'get',
    path: '/api/wave/project/:projectId/:type',
    paramsSchema: z.object({
      projectId: z.number(),
      type: typeSchema,
    }),
    requestSchema: z.void(),
    responseSchema: z.instanceof(Uint8Array<ArrayBufferLike>),
  });
  export const route = fastifyRoute(base);
  export const request = axiosRequest(base);
  export type Params = z.infer<typeof base.paramsSchema>;
  export type Request = z.infer<typeof base.requestSchema>;
  export type Response = z.infer<typeof base.responseSchema>;
}
