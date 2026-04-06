import { Box, Typography } from '@mui/material';
import { type api } from '@musetric/api';
import { type FC } from 'react';

const getWordColor = (word: api.subtitle.Word, currentTime: number) => {
  if (currentTime >= word.start && currentTime < word.end) {
    return 'primary.main';
  }
  if (currentTime >= word.end) {
    return 'text.secondary';
  }
  return 'text.primary';
};

export type SegmentLCurrentProps = {
  segment?: api.subtitle.Segment;
  currentTime: number;
};

export const SegmentLCurrent: FC<SegmentLCurrentProps> = (props) => {
  const { segment, currentTime } = props;
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
              color: getWordColor(word, currentTime),
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
