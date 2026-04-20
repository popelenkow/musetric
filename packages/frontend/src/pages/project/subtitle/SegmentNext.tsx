import { Typography } from '@mui/material';
import { type api } from '@musetric/api';
import { type FC } from 'react';

type SegmentNextProps = {
  segment?: api.subtitle.Segment;
};
export const SegmentNext: FC<SegmentNextProps> = (props) => {
  const { segment } = props;
  if (!segment) {
    return;
  }
  return (
    <Typography variant='subtitle2' color='text.secondary' textAlign='center'>
      {segment.text}
    </Typography>
  );
};
