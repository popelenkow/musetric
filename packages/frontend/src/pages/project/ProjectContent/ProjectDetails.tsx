import { Box } from '@mui/material';
import { type FC } from 'react';
import { useProjectStore } from '../store.js';
import { Subtitle } from '../subtitle/Subtitle.js';

export const ProjectDetails: FC = () => {
  const subtitlesOpen = useProjectStore((state) => state.subtitlesOpen);

  if (!subtitlesOpen) {
    return undefined;
  }

  return (
    <Box
      flex={{
        xs: '1 1 0',
        md: '0 0 420px',
      }}
      minHeight={0}
      minWidth={0}
    >
      <Subtitle />
    </Box>
  );
};
