import { z } from 'zod';
import { createApiRoute } from '../common/apiRoute.js';

export const stemTypeSchema = z.enum(['lead', 'backing', 'instrumental']);
export type StemType = z.infer<typeof stemTypeSchema>;

export namespace get {
  export const base = createApiRoute({
    method: 'get',
    path: '/api/wave/project/:projectId/:stemType',
    paramsSchema: z.object({
      projectId: z.number(),
      stemType: stemTypeSchema,
    }),
    requestSchema: z.void(),
    responseSchema: z.instanceof(Float32Array<ArrayBuffer>),
  });
  export type Params = z.infer<typeof base.paramsSchema>;
  export type Request = z.infer<typeof base.requestSchema>;
  export type Response = z.infer<typeof base.responseSchema>;
}
