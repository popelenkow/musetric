import { Box, Typography } from '@mui/material';
import { type SpectrogramAssessmentFrame } from '@musetric/audio';
import { subscribeResizeObserver } from '@musetric/resource-utils/dom';
import { type FC, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { engine } from '../../../engine/engine.js';
import { useEngineStore } from '../../../engine/useEngineStore.js';
import { useSettingsStore } from '../settings/store.js';

const lineColors = {
  target: 'rgba(180, 218, 255, 0.72)',
  hit: 'rgba(96, 214, 134, 0.95)',
  near: 'rgba(255, 207, 92, 0.95)',
  miss: 'rgba(255, 91, 91, 0.95)',
  extra: 'rgba(255, 91, 91, 0.95)',
  missing: 'rgba(255, 91, 91, 0.82)',
  rest: 'rgba(255, 255, 255, 0)',
} as const;

const getFrequencyY = (
  frequency: number,
  minFrequency: number,
  maxFrequency: number,
  height: number,
) => {
  if (frequency < minFrequency || frequency > maxFrequency) {
    return undefined;
  }

  const logMinFrequency = Math.log(minFrequency);
  const logRange = Math.log(maxFrequency) - logMinFrequency;
  if (!logRange) {
    return undefined;
  }

  return height * (1 - (Math.log(frequency) - logMinFrequency) / logRange);
};

const getFrameX = (
  targetFrameIndex: number,
  visibleStartFrameIndex: number,
  visibleFrameCount: number,
  width: number,
) => ((targetFrameIndex - visibleStartFrameIndex) / visibleFrameCount) * width;

const drawTargetLine = (
  context: CanvasRenderingContext2D,
  frames: SpectrogramAssessmentFrame[],
  visibleStartFrameIndex: number,
  visibleEndFrameIndex: number,
  visibleFrameCount: number,
  minFrequency: number,
  maxFrequency: number,
  width: number,
  height: number,
) => {
  context.save();
  context.strokeStyle = lineColors.target;
  context.lineWidth = 1.5;
  context.setLineDash([6, 4]);

  let drawing = false;
  for (const frame of frames) {
    if (
      frame.frameIndex < visibleStartFrameIndex ||
      frame.frameIndex > visibleEndFrameIndex ||
      frame.targetFrequency === undefined
    ) {
      drawing = false;
      continue;
    }

    const y = getFrequencyY(
      frame.targetFrequency,
      minFrequency,
      maxFrequency,
      height,
    );
    if (y === undefined) {
      drawing = false;
      continue;
    }

    const x = getFrameX(
      frame.frameIndex,
      visibleStartFrameIndex,
      visibleFrameCount,
      width,
    );
    if (!drawing) {
      context.beginPath();
      context.moveTo(x, y);
      drawing = true;
      continue;
    }
    context.lineTo(x, y);
    context.stroke();
    context.beginPath();
    context.moveTo(x, y);
  }
  context.restore();
};

const drawRecordingLine = (
  context: CanvasRenderingContext2D,
  frames: SpectrogramAssessmentFrame[],
  visibleStartFrameIndex: number,
  visibleEndFrameIndex: number,
  visibleFrameCount: number,
  minFrequency: number,
  maxFrequency: number,
  width: number,
  height: number,
) => {
  context.save();
  context.lineWidth = 3;
  context.lineCap = 'round';
  context.lineJoin = 'round';

  let previousX: number | undefined = undefined;
  let previousY: number | undefined = undefined;

  for (const frame of frames) {
    if (
      frame.frameIndex < visibleStartFrameIndex ||
      frame.frameIndex > visibleEndFrameIndex ||
      frame.recordingFrequency === undefined
    ) {
      previousX = undefined;
      previousY = undefined;
      continue;
    }

    const y = getFrequencyY(
      frame.recordingFrequency,
      minFrequency,
      maxFrequency,
      height,
    );
    if (y === undefined) {
      previousX = undefined;
      previousY = undefined;
      continue;
    }

    const x = getFrameX(
      frame.frameIndex,
      visibleStartFrameIndex,
      visibleFrameCount,
      width,
    );
    context.strokeStyle = lineColors[frame.tone];
    context.fillStyle = lineColors[frame.tone];

    if (previousX !== undefined && previousY !== undefined) {
      context.beginPath();
      context.moveTo(previousX, previousY);
      context.lineTo(x, y);
      context.stroke();
    }
    context.beginPath();
    context.arc(x, y, 2.3, 0, Math.PI * 2);
    context.fill();
    previousX = x;
    previousY = y;
  }
  context.restore();
};

const drawMissingMarks = (
  context: CanvasRenderingContext2D,
  frames: SpectrogramAssessmentFrame[],
  visibleStartFrameIndex: number,
  visibleEndFrameIndex: number,
  visibleFrameCount: number,
  minFrequency: number,
  maxFrequency: number,
  width: number,
  height: number,
) => {
  context.save();
  context.strokeStyle = lineColors.missing;
  context.lineWidth = 2;

  for (const frame of frames) {
    if (
      frame.tone !== 'missing' ||
      frame.frameIndex < visibleStartFrameIndex ||
      frame.frameIndex > visibleEndFrameIndex ||
      frame.targetFrequency === undefined
    ) {
      continue;
    }

    const y = getFrequencyY(
      frame.targetFrequency,
      minFrequency,
      maxFrequency,
      height,
    );
    if (y === undefined) {
      continue;
    }

    const x = getFrameX(
      frame.frameIndex,
      visibleStartFrameIndex,
      visibleFrameCount,
      width,
    );
    context.beginPath();
    context.moveTo(x, y - 5);
    context.lineTo(x, y + 5);
    context.stroke();
  }
  context.restore();
};

export const SpectrogramAssessmentOverlay: FC = () => {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [resizeRevision, setResizeRevision] = useState(0);
  const assessment = useEngineStore((state) => state.vocalAssessment);
  const frameIndex = useEngineStore((state) => state.frameIndex);
  const minFrequency = useSettingsStore((state) => state.minFrequency);
  const maxFrequency = useSettingsStore((state) => state.maxFrequency);
  const visibleTime = useSettingsStore((state) => state.visibleTime);
  const playheadRatio = useSettingsStore((state) => state.playheadRatio);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const pixelRatio = window.devicePixelRatio || 1;
    const width = Math.max(1, Math.floor(canvas.clientWidth * pixelRatio));
    const height = Math.max(1, Math.floor(canvas.clientHeight * pixelRatio));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }

    context.clearRect(0, 0, width, height);
    const { sampleRate } = engine.context;
    const visibleFrameCount = visibleTime * sampleRate;
    const visibleStartFrameIndex =
      frameIndex - visibleFrameCount * playheadRatio;
    const visibleEndFrameIndex = visibleStartFrameIndex + visibleFrameCount;
    const { frames } = assessment;

    drawTargetLine(
      context,
      frames,
      visibleStartFrameIndex,
      visibleEndFrameIndex,
      visibleFrameCount,
      minFrequency,
      maxFrequency,
      width,
      height,
    );
    drawMissingMarks(
      context,
      frames,
      visibleStartFrameIndex,
      visibleEndFrameIndex,
      visibleFrameCount,
      minFrequency,
      maxFrequency,
      width,
      height,
    );
    drawRecordingLine(
      context,
      frames,
      visibleStartFrameIndex,
      visibleEndFrameIndex,
      visibleFrameCount,
      minFrequency,
      maxFrequency,
      width,
      height,
    );
  }, [
    assessment,
    frameIndex,
    maxFrequency,
    minFrequency,
    playheadRatio,
    resizeRevision,
    visibleTime,
  ]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    return subscribeResizeObserver(canvas, () => {
      setResizeRevision((revision) => revision + 1);
    });
  }, []);

  const { score } = assessment;
  const scoreLabel =
    score.processedFrameCount > 0
      ? t('pages.project.spectrogram.assessment.scoreValue', {
          value: score.overall,
        })
      : t('pages.project.spectrogram.assessment.scoreEmpty');

  return (
    <Box
      position='absolute'
      top={0}
      right={0}
      bottom={0}
      left={0}
      sx={{ pointerEvents: 'none' }}
    >
      <Box
        component='canvas'
        ref={canvasRef}
        sx={{ width: '100%', height: '100%', display: 'block' }}
      />
      <Box
        position='absolute'
        top={12}
        right={12}
        px={1.25}
        py={0.75}
        sx={{
          backgroundColor: 'rgba(0, 0, 0, 0.76)',
          border: '1px solid rgba(255, 255, 255, 0.22)',
          borderRadius: 1,
          color: '#fff',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
          backdropFilter: 'blur(6px)',
        }}
      >
        <Typography variant='caption' display='block' color='grey.300'>
          {t('pages.project.spectrogram.assessment.score')}
        </Typography>
        <Typography variant='h6' lineHeight={1.1} fontWeight={700}>
          {scoreLabel}
        </Typography>
        {score.processedFrameCount > 0 && (
          <Typography variant='caption' color='grey.300'>
            {t('pages.project.spectrogram.assessment.details', {
              pitch: score.pitch,
              timing: score.timing,
              stability: score.stability,
              vibrato: score.vibrato,
            })}
          </Typography>
        )}
      </Box>
    </Box>
  );
};
