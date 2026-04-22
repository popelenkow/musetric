import type { DatabaseSync } from 'node:sqlite';
import { table } from '../../schema/index.js';

export const get = (database: DatabaseSync) => {
  const statement = database.prepare(
    `SELECT id, projectId, stemType, blobId FROM Wave WHERE projectId = ? AND stemType = ?`,
  );

  return async (
    projectId: number,
    stemType: table.wave.StemType,
  ): Promise<table.wave.Item | undefined> => {
    const row = await Promise.resolve(statement.get(projectId, stemType));
    if (!row) {
      return undefined;
    }
    return table.wave.itemSchema.parse(row);
  };
};
