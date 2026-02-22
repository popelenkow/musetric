import { Skeleton, Stack } from '@mui/material';
import { type api } from '@musetric/api';
import { useQuery } from '@tanstack/react-query';
import { type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { endpoints } from '../../api/index.js';
import { ViewError } from '../../components/ViewError.js';
import { usePlayerStore } from '../player/store.js';
import { SegmentLCurrent } from './current.js';
import { SegmentNext } from './next.js';

type SubtitleLines = {
  current?: api.subtitle.Segment;
  next?: api.subtitle.Segment;
  currentTime: number;
};

const getSegmentEnd = (segment: api.subtitle.Segment) => {
  const words = segment.words;
  if (words && words.length > 0) {
    return words[words.length - 1].end;
  }
  return segment.end;
};

const getSubtitleLines = (
  subtitle: api.subtitle.Segment[],
  duration: number,
  progress: number,
): SubtitleLines => {
  if (subtitle.length === 0) {
    return {
      current: undefined,
      next: undefined,
      currentTime: 0,
    };
  }

  const currentTime = duration * progress;
  const currentIndex = subtitle.findIndex(
    (segment) => currentTime < getSegmentEnd(segment),
  );
  const current = currentIndex === -1 ? undefined : subtitle[currentIndex];
  const next = currentIndex === -1 ? undefined : subtitle[currentIndex + 1];

  return { current, next, currentTime };
};

export type SubtitleProps = {
  projectId: number;
};
export const Subtitle: FC<SubtitleProps> = (props) => {
  const { projectId } = props;
  const { t } = useTranslation();
  const subtitleQuery = useQuery(endpoints.subtitle.get(projectId));

  const duration = usePlayerStore((s) => s.duration);
  const progress = usePlayerStore((s) => s.progress);

  const { current, next, currentTime } = getSubtitleLines(
    subtitleQuery.data ?? [],
    duration,
    progress,
  );

  const getContent = () => {
    if (subtitleQuery.status === 'pending') {
      return (
        <>
          <Skeleton variant='text' width='60%' sx={{ fontSize: '1rem' }} />
          <Skeleton variant='text' width='35%' sx={{ fontSize: '1rem' }} />
        </>
      );
    }

    if (subtitleQuery.status === 'error') {
      return <ViewError message={t('pages.project.progress.error.lyrics')} />;
    }

    return (
      <>
        <SegmentLCurrent segment={current} currentTime={currentTime} />
        <SegmentNext segment={next} />
      </>
    );
  };

  return (
    <Stack
      sx={{
        alignItems: 'center',
        gap: 0,
        width: '100%',
        minHeight: '3em',
        maxHeight: '3em',
      }}
    >
      {getContent()}
    </Stack>
  );
};
