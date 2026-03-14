import { api } from '@musetric/api';
import { fastifyRoute } from '@musetric/api/node';
import { type FastifyPluginCallbackZod } from 'fastify-type-provider-zod';
import { assertFound } from '../common/assertFound.js';
import { handleCachedFile } from '../common/cachedFile.js';

export const waveRouter: FastifyPluginCallbackZod = (app) => {
  app.addHook('onRoute', (opts) => {
    if (opts.schema) opts.schema.tags = ['wave'];
  });

  app.route({
    ...fastifyRoute(api.wave.get.base),
    handler: async (request, reply) => {
      const { projectId, type } = request.params;
      const wave = await app.db.wave.get(projectId, type);
      assertFound(
        wave,
        `Wave for project ${projectId} and type ${type} not found`,
      );

      const stat = await app.blobStorage.getStat(wave.blobId);
      assertFound(stat, `Wave blob for id ${wave.blobId} not found`);

      const isNotModified = handleCachedFile(request, reply, {
        filename: 'waveform.bin',
        contentType: 'application/octet-stream',
        size: stat.size,
        mtimeMs: stat.mtimeMs,
      });

      if (isNotModified) {
        return;
      }

      const stream = app.blobStorage.getStream(wave.blobId);
      return reply.send(stream);
    },
  });
};
