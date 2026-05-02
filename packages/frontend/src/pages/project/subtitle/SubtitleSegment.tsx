import { Box } from '@mui/material';
import { type api } from '@musetric/api';
import { type FC } from 'react';
import { type SubtitleCursor } from './subtitleCursor.js';
import { SubtitleSegmentText } from './SubtitleSegmentText.js';
import { useSubtitlePlaybackTime } from './useSubtitlePlaybackTime.js';
import { useSubtitleSegmentStatus } from './useSubtitleSegmentStatus.js';

type ActiveSubtitleSegmentProps = {
  segment: api.subtitle.Segment;
};

const ActiveSubtitleSegment: FC<ActiveSubtitleSegmentProps> = (props) => {
  const { segment } = props;
  const playbackTime = useSubtitlePlaybackTime();

  return (
    <SubtitleSegmentText
      playbackTime={playbackTime}
      segment={segment}
      status='active'
    />
  );
};

export type SubtitleSegmentProps = {
  index: number;
  segment: api.subtitle.Segment;
  subtitleCursor: SubtitleCursor;
};

export const SubtitleSegment: FC<SubtitleSegmentProps> = (props) => {
  const { index, segment, subtitleCursor } = props;
  const status = useSubtitleSegmentStatus(index, subtitleCursor);

  return (
    <Box data-subtitle-segment-index={index} py={1}>
      {status === 'active' ? (
        <ActiveSubtitleSegment segment={segment} />
      ) : (
        <SubtitleSegmentText segment={segment} status={status} />
      )}
    </Box>
  );
};
