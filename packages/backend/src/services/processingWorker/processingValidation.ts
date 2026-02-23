import {
  defaultSampleRate,
  type EventEmitter,
  type Logger,
} from '@musetric/resource-utils';
import { convertToFlac } from '@musetric/toolkit';
import { type FastifyInstance } from 'fastify';
import {
  type ProcessingWorkerEvent,
  type ProcessingWorkerProgressEvent,
} from './processingSummary.js';

export type ValidationTask = {
  projectId: number;
  blobId: string;
};

export type ValidationWorker = {
  run: (task: ValidationTask) => Promise<void>;
  getState: (projectId: number) => ProcessingWorkerProgressEvent | undefined;
};

export const createValidationWorker = (
  app: FastifyInstance,
  emitter: EventEmitter<ProcessingWorkerEvent>,
  logger: Logger,
): ValidationWorker => {
  let state: ProcessingWorkerProgressEvent | undefined = undefined;

  return {
    run: async (task) => {
      try {
        state = {
          type: 'progress',
          projectId: task.projectId,
          step: 'validation',
          progress: 0,
        };
        emitter.emit(state);

        const rawSourcePath = app.blobStorage.getPath(task.blobId);
        const source = app.blobStorage.createPath();
        await convertToFlac({
          fromPath: rawSourcePath,
          toPath: source.blobPath,
          sampleRate: defaultSampleRate,
          logger,
        });

        await app.db.processing.applyValidationResult({
          projectId: task.projectId,
          sourceId: source.blobId,
          rawSourceId: task.blobId,
        });

        state = undefined;
        emitter.emit({
          type: 'complete',
          projectId: task.projectId,
          step: 'validation',
        });

        await app.blobStorage.remove(task.blobId);
      } catch (error) {
        emitter.emit({
          type: 'error',
          projectId: task.projectId,
          step: 'validation',
        });
        state = undefined;
        logger.error({ projectId: task.projectId, error }, 'Validation failed');
      }
    },
    getState: (projectId) =>
      state && state.projectId === projectId ? state : undefined,
  };
};
