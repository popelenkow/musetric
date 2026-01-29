import { api } from '@musetric/api';
import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { assertFound } from '../common/assertFound.js';
import { handleCachedFile } from '../common/cachedFile.js';
import { envs } from '../common/envs.js';

export const waveRouter: FastifyPluginAsyncZod = async (app) => {
  app.addHook('onRoute', (opts) => {
    if (opts.schema) opts.schema.tags = ['audio'];
  });

  app.route({
    ...api.wave.get.route,
    handler: async (request, reply) => {
      const { projectId, type } = request.params;
      const wave = await app.db.wave.get(projectId, type);
      assertFound(
        wave,
        `Wave for project ${projectId} and type ${type} not found`,
      );

      const data = await app.blobStorage.get(wave.blobId);
      assertFound(data, `Wave blob for id ${wave.blobId} not found`);

      const isNotModified = handleCachedFile(request, reply, {
        data,
        filename: 'waveform.bin',
        contentType: 'application/octet-stream',
      });

      if (isNotModified) {
        return;
      }

      return data;
    },
  });

  return Promise.resolve();
};
