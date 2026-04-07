import { Box, Typography } from '@mui/material';
import { type api } from '@musetric/api';
import { type FC } from 'react';

const getWordColor = (word: api.subtitle.Word, playbackTime: number) => {
  if (playbackTime >= word.start && playbackTime < word.end) {
    return 'primary.main';
  }
  if (playbackTime >= word.end) {
    return 'text.secondary';
  }
  return 'text.primary';
};

export type SegmentLCurrentProps = {
  segment?: api.subtitle.Segment;
  playbackTime: number;
};

export const SegmentLCurrent: FC<SegmentLCurrentProps> = (props) => {
  const { segment, playbackTime } = props;
  if (!segment) {
    return;
  }
  return (
    <Typography
      variant='subtitle1'
      fontWeight='bold'
      textAlign='center'
      component='div'
    >
      {segment.words.map((word, index) => {
        return (
          <Box
            component='span'
            key={`${word.start}-${index}`}
            sx={{
              color: getWordColor(word, playbackTime),
              transition: 'color 120ms linear',
            }}
          >
            {word.text}
            {index < segment.words.length - 1 ? ' ' : ''}
          </Box>
        );
      })}
    </Typography>
  );
};
