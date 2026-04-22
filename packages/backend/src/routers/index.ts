import { type FastifyInstance } from 'fastify';
import { audioDeliveryRouter } from './audioDelivery.js';
import { audioMasterRouter } from './audioMaster.js';
import { previewRouter } from './preview.js';
import { projectRouter } from './project.js';
import { subtitleRouter } from './subtitle.js';
import { wavePeaksRouter } from './wavePeaks.js';

export const registerRouters = (app: FastifyInstance) => {
  app.register(audioDeliveryRouter);
  app.register(audioMasterRouter);
  app.register(previewRouter);
  app.register(projectRouter);
  app.register(subtitleRouter);
  app.register(wavePeaksRouter);
};
