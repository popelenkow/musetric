import { z } from 'zod';
import { numericIdSchema } from './common.js';

export namespace project {
  export const itemSchema = z.object({
    id: numericIdSchema,
    name: z.string(),
  });
  export type Item = z.infer<typeof itemSchema>;
}

export namespace audioMaster {
  export const typeSchema = z.enum([
    'rawSource',
    'source',
    'lead',
    'backing',
    'instrumental',
  ]);
  export type Type = z.infer<typeof typeSchema>;

  export const itemSchema = z.object({
    id: numericIdSchema,
    projectId: numericIdSchema,
    type: typeSchema,
    blobId: z.string(),
  });
  export type Item = z.infer<typeof itemSchema>;
}

export namespace audioDelivery {
  export const typeSchema = z.enum(['lead', 'backing', 'instrumental']);
  export type Type = z.infer<typeof typeSchema>;

  export const itemSchema = z.object({
    id: numericIdSchema,
    projectId: numericIdSchema,
    type: typeSchema,
    blobId: z.string(),
  });
  export type Item = z.infer<typeof itemSchema>;
}

export namespace wave {
  export const typeSchema = z.enum(['lead', 'backing', 'instrumental']);
  export type Type = z.infer<typeof typeSchema>;

  export const itemSchema = z.object({
    id: numericIdSchema,
    projectId: numericIdSchema,
    type: typeSchema,
    blobId: z.string(),
  });
  export type Item = z.infer<typeof itemSchema>;
}

export namespace preview {
  export const itemSchema = z.object({
    id: numericIdSchema,
    projectId: numericIdSchema,
    blobId: z.string(),
    filename: z.string(),
    contentType: z.string(),
  });
  export type Item = z.infer<typeof itemSchema>;
}

export namespace subtitle {
  export const itemSchema = z.object({
    id: numericIdSchema,
    projectId: numericIdSchema,
    blobId: z.string(),
  });
  export type Item = z.infer<typeof itemSchema>;
}
