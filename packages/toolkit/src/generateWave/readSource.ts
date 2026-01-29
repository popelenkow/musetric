import { spawn } from 'node:child_process';
import { Logger } from '@musetric/resource-utils/logger';
import { ReadSourceResult } from './types.js';

const bytesPerFloat = 4;
const bytesPerFrame = bytesPerFloat * 2;

const getDurationSeconds = async (
  fromPath: string,
  logger: Logger,
): Promise<number> => {
  return new Promise((resolve, reject) => {
    const processName = 'waveProbe';
    const child = spawn('ffprobe', [
      '-v',
      'error',
      '-show_entries',
      'format=duration',
      '-of',
      'default=noprint_wrappers=1:nokey=1',
      fromPath,
    ]);

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('close', (code) => {
      if (code !== 0) {
        logger.error(
          { processName, code, stderr },
          'Failed to probe audio duration',
        );
        reject(
          new Error(
            stderr.trim() || `ffprobe failed with code ${code ?? 'null'}`,
          ),
        );
        return;
      }
      const duration = Number.parseFloat(stdout.trim());
      if (!Number.isFinite(duration) || duration <= 0) {
        reject(new Error('ffprobe returned invalid duration'));
        return;
      }
      resolve(duration);
    });

    child.on('error', (error) => {
      logger.error({ processName, error }, 'ffprobe process error');
      reject(error);
    });
  });
};

const streamStereoFloats = async function* (
  fromPath: string,
  sampleRate: number,
  logger: Logger,
): AsyncIterable<Float32Array> {
  const processName = 'waveDecode';
  const child = spawn('ffmpeg', [
    '-hide_banner',
    '-loglevel',
    'error',
    '-i',
    fromPath,
    '-vn',
    '-ac',
    '2',
    '-ar',
    sampleRate.toString(),
    '-f',
    'f32le',
    '-acodec',
    'pcm_f32le',
    '-',
  ]);

  let stderr = '';
  let carry = Buffer.alloc(0);
  let processError: Error | undefined;

  child.stderr.on('data', (chunk) => {
    stderr += chunk.toString();
  });

  child.on('error', (error) => {
    processError = error;
  });

  try {
    for await (const chunk of child.stdout) {
      const data =
        carry.length > 0 ? Buffer.concat([carry, chunk]) : chunk;
      const usable = data.length - (data.length % bytesPerFrame);
      carry = data.subarray(usable);
      if (usable === 0) continue;
      yield new Float32Array(
        data.buffer,
        data.byteOffset,
        usable / bytesPerFloat,
      );
    }
  } finally {
    const code = await new Promise<number | null>((resolve) => {
      child.on('close', resolve);
    });
    if (processError) {
      logger.error({ processName, error: processError }, 'ffmpeg process error');
      throw processError;
    }
    if (code !== 0) {
      logger.error(
        { processName, code, stderr },
        'Failed to decode audio for wave generation',
      );
      throw new Error(
        stderr.trim() || `ffmpeg failed with code ${code ?? 'null'}`,
      );
    }
  }
};

export const readSource = async (
  fromPath: string,
  sampleRate: number,
  logger: Logger,
): Promise<ReadSourceResult> => {
  const durationSeconds = await getDurationSeconds(fromPath, logger);
  const stream = streamStereoFloats(fromPath, sampleRate, logger);
  return { durationSeconds, stream };
};
