import { api } from '@musetric/api';
import { fastifyRoute } from '@musetric/api/node';
import { flacAudioOutput } from '@musetric/toolkit';
import { type FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { assertFound } from '../common/assertFound.js';
import { handleCachedFile } from '../common/cachedFile.js';

export const audioMasterRouter: FastifyPluginAsyncZod = async (app) => {
  app.addHook('onRoute', (opts) => {
    if (opts.schema) opts.schema.tags = ['audioMaster'];
  });

  app.route({
    ...fastifyRoute(api.audioMaster.get.base),
    handler: async (request, reply) => {
      const { projectId, type } = request.params;
      const audio = await app.db.audioMaster.get(projectId, type);
      assertFound(
        audio,
        `Audio master for project ${projectId} and type ${type} not found`,
      );

      const project = await app.db.project.get(projectId);
      assertFound(project, `Project with id ${projectId} not found`);

      const stat = await app.blobStorage.getStat(audio.blobId);
      assertFound(stat, `Audio master blob for id ${audio.blobId} not found`);

      const suffix = type === 'source' ? '' : `_${type}`;
      const isNotModified = handleCachedFile(request, reply, {
        filename: `${project.name}${suffix}.${flacAudioOutput.format}`,
        contentType: flacAudioOutput.contentType,
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
