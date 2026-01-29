import type { DatabaseSync } from 'node:sqlite';
import { table } from '../../schema/index.js';

export const get = (database: DatabaseSync) => {
  const statement = database.prepare(
    `SELECT id, projectId, type, blobId FROM Wave WHERE projectId = ? AND type = ?`,
  );

  return async (
    projectId: number,
    type: table.wave.Type,
  ): Promise<table.wave.Item | undefined> => {
    const row = await Promise.resolve(statement.get(projectId, type));
    if (!row) {
      return undefined;
    }
    return table.wave.itemSchema.parse(row);
  };
};
