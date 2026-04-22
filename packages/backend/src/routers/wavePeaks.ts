import { api } from '@musetric/api';
import { fastifyRoute } from '@musetric/api/node';
import { type FastifyPluginCallbackZod } from 'fastify-type-provider-zod';
import { assertFound } from '../common/assertFound.js';
import { handleCachedFile } from '../common/cachedFile.js';

export const wavePeaksRouter: FastifyPluginCallbackZod = (app) => {
  app.addHook('onRoute', (opts) => {
    if (opts.schema) opts.schema.tags = ['wavePeaks'];
  });

  app.route({
    ...fastifyRoute(api.wavePeaks.get.base),
    handler: async (request, reply) => {
      const { projectId, stemType } = request.params;
      const wavePeaks = await app.db.wavePeaks.get(projectId, stemType);
      assertFound(
        wavePeaks,
        `Wave peaks for project ${projectId} and stemType ${stemType} not found`,
      );

      const stat = await app.blobStorage.getStat(wavePeaks.blobId);
      assertFound(stat, `Wave peaks blob for id ${wavePeaks.blobId} not found`);

      const isNotModified = handleCachedFile(request, reply, {
        filename: 'waveform.bin',
        contentType: 'application/octet-stream',
        size: stat.size,
        mtimeMs: stat.mtimeMs,
      });

      if (isNotModified) {
        return;
      }

      const stream = app.blobStorage.getStream(wavePeaks.blobId);
      return reply.send(stream);
    },
  });
};
