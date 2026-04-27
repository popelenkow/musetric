import { Skeleton, Stack } from '@mui/material';
import { type api } from '@musetric/api';
import { useQuery } from '@tanstack/react-query';
import { type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { endpoints } from '../../../api/index.js';
import { ViewError } from '../../../components/ViewError.js';
import { getTrackProgress } from '../../../engine/state.js';
import { useEngineStore } from '../../../engine/useEngineStore.js';
import { useProjectStore } from '../store.js';
import { SegmentLCurrent } from './SegmentLCurrent.js';
import { SegmentNext } from './SegmentNext.js';

type SubtitleLines = {
  current?: api.subtitle.Segment;
  next?: api.subtitle.Segment;
  playbackTime: number;
};

const getSegmentEnd = (segment: api.subtitle.Segment) => {
  const words = segment.words;
  if (words.length > 0) {
    return words[words.length - 1].end;
  }
  return segment.end;
};

const getSubtitleLines = (
  subtitle: api.subtitle.Segment[],
  playbackTime: number,
): SubtitleLines => {
  if (subtitle.length === 0) {
    return {
      current: undefined,
      next: undefined,
      playbackTime: 0,
    };
  }

  const currentIndex = subtitle.findIndex(
    (segment) => playbackTime < getSegmentEnd(segment),
  );
  const current = currentIndex === -1 ? undefined : subtitle[currentIndex];
  const next = currentIndex === -1 ? undefined : subtitle[currentIndex + 1];

  return { current, next, playbackTime };
};

export type SubtitleProps = {
  projectId: number;
};
export const Subtitle: FC<SubtitleProps> = (props) => {
  const { projectId } = props;
  const { t } = useTranslation();
  const subtitleQuery = useQuery(endpoints.subtitle.get(projectId));
  const detailsMode = useProjectStore((state) => state.detailsMode);

  const duration = useEngineStore((state) => state.duration);
  const trackProgress = useEngineStore(getTrackProgress);
  const playbackTime = duration * trackProgress;

  const { current, next } = getSubtitleLines(
    subtitleQuery.data ?? [],
    playbackTime,
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
        <SegmentLCurrent segment={current} playbackTime={playbackTime} />
        <SegmentNext segment={next} />
      </>
    );
  };

  if (detailsMode !== 'subtitles') {
    return;
  }

  return (
    <Stack
      alignItems='center'
      gap={0}
      width='100%'
      minHeight='3em'
      maxHeight='3em'
    >
      {getContent()}
    </Stack>
  );
};
