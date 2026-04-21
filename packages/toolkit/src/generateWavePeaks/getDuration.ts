import { type Logger } from '@musetric/resource-utils';
import { spawnScript } from '@musetric/resource-utils/node';

export const getDurationSeconds = async (
  fromPath: string,
  logger: Logger,
): Promise<number> => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  let duration = undefined as number | undefined;

  await spawnScript({
    command: 'ffprobe',
    flatArgs: [
      '-v',
      'error',
      '-select_streams',
      'a:0',
      '-show_entries',
      'format=duration',
      '-of',
      'default=nk=1:nw=1',
      fromPath,
    ],
    stdout: {
      mode: 'text',
      onLine: (line) => {
        const trimmed = line.trim();
        if (trimmed && !duration) {
          duration = Number(trimmed);
        }
      },
    },
    stderr: { mode: 'logText' },
    logger,
    processName: 'generateWavePeaks.getDurationSeconds',
  });

  if (!duration || !Number.isFinite(duration) || duration < 0) {
    throw new Error('Invalid duration');
  }
  return duration;
};
