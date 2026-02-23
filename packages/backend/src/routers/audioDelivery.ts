import { api } from '@musetric/api';
import { fastifyRoute } from '@musetric/api/node';
import { fmp4AudioOutput } from '@musetric/toolkit';
import { type FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { assertFound } from '../common/assertFound.js';
import { handleCachedFile } from '../common/cachedFile.js';

export const audioDeliveryRouter: FastifyPluginAsyncZod = async (app) => {
  app.addHook('onRoute', (opts) => {
    if (opts.schema) opts.schema.tags = ['audioDelivery'];
  });

  app.route({
    ...fastifyRoute(api.audioDelivery.get.base),
    handler: async (request, reply) => {
      const { projectId, type } = request.params;
      const audio = await app.db.audioDelivery.get(projectId, type);
      assertFound(
        audio,
        `Audio delivery for project ${projectId} and type ${type} not found`,
      );

      const project = await app.db.project.get(projectId);
      assertFound(project, `Project with id ${projectId} not found`);

      const stat = await app.blobStorage.getStat(audio.blobId);
      assertFound(stat, `Audio delivery blob for id ${audio.blobId} not found`);

      const suffix = `_${type}`;
      const isNotModified = handleCachedFile(request, reply, {
        filename: `${project.name}${suffix}.${fmp4AudioOutput.format}`,
        contentType: fmp4AudioOutput.contentType,
        size: stat.size,
        mtimeMs: stat.mtimeMs,
      });

      if (isNotModified) {
        return;
      }

      const stream = app.blobStorage.getStream(audio.blobId);
      return reply.send(stream);
    },
  });

  return Promise.resolve();
};
