import { Box, Stack } from '@mui/material';
import { type FC } from 'react';
import { DetailsModeToggle } from '../buttons/DetailsModeToggle.js';
import { PlayPauseButton } from '../buttons/PlayPauseButton.js';
import { TempoButton } from '../buttons/TempoButton.js';
import { TempoPicker } from '../buttons/TempoPicker.js';
import { TransposeButton } from '../buttons/TransposeButton.js';
import { TransposePicker } from '../buttons/TransposePicker.js';
import { PlayerProgress } from './PlayerProgress.js';

export const PlaybackPanel: FC = () => {
  return (
    <Stack width='100%'>
      <PlayerProgress />
      <Box
        width='100%'
        display='grid'
        gridTemplateColumns='minmax(0, 1fr) auto minmax(0, 1fr)'
        alignItems='center'
      >
        <Box gridColumn={1}>
          <DetailsModeToggle />
        </Box>
        <Box gridColumn={2}>
          <PlayPauseButton />
        </Box>
        <Stack gridColumn={3} direction='row' gap={1} justifySelf='end'>
          <TransposeButton />
          <TransposePicker />
          <TempoButton />
          <TempoPicker />
        </Stack>
      </Box>
    </Stack>
  );
};
