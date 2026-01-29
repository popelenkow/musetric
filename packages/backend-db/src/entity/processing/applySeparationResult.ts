import type { DatabaseSync } from 'node:sqlite';
import { transaction } from '../../common/index.js';

export type ApplySeparationResultArg = {
  projectId: number;
  master: {
    leadId: string;
    backingId: string;
    instrumentalId: string;
  };
  delivery: {
    leadId: string;
    backingId: string;
    instrumentalId: string;
  };
  wave: {
    leadId: string;
    backingId: string;
    instrumentalId: string;
  };
};

export const applySeparationResult = (database: DatabaseSync) => {
  const insertAudioStatement = database.prepare(
    `INSERT INTO AudioMaster (projectId, type, blobId) VALUES (?, ?, ?)`,
  );
  const insertDeliveryStatement = database.prepare(
    `INSERT INTO AudioDelivery (projectId, type, blobId) VALUES (?, ?, ?)`,
  );
  const insertWaveStatement = database.prepare(
    `INSERT INTO Wave (projectId, type, blobId) VALUES (?, ?, ?)`,
  );

  return async (arg: ApplySeparationResultArg): Promise<void> => {
    return await transaction(database, async () => {
      await Promise.resolve(
        insertAudioStatement.run(arg.projectId, 'lead', arg.master.leadId),
      );

      await Promise.resolve(
        insertAudioStatement.run(
          arg.projectId,
          'instrumental',
          arg.master.instrumentalId,
        ),
      );

      await Promise.resolve(
        insertAudioStatement.run(
          arg.projectId,
          'backing',
          arg.master.backingId,
        ),
      );

      await Promise.resolve(
        insertDeliveryStatement.run(arg.projectId, 'lead', arg.delivery.leadId),
      );

      await Promise.resolve(
        insertDeliveryStatement.run(
          arg.projectId,
          'instrumental',
          arg.delivery.instrumentalId,
        ),
      );

      await Promise.resolve(
        insertDeliveryStatement.run(
          arg.projectId,
          'backing',
          arg.delivery.backingId,
        ),
      );

      await Promise.resolve(
        insertWaveStatement.run(arg.projectId, 'lead', arg.wave.leadId),
      );

      await Promise.resolve(
        insertWaveStatement.run(
          arg.projectId,
          'instrumental',
          arg.wave.instrumentalId,
        ),
      );

      await Promise.resolve(
        insertWaveStatement.run(arg.projectId, 'backing', arg.wave.backingId),
      );
    });
  };
};
