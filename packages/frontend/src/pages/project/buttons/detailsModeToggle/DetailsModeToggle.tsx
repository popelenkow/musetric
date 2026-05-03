import { ToggleButtonGroup } from '@mui/material';
import { type FC } from 'react';
import { MixerButton } from './MixerButton.js';
import { SubtitlesButton } from './SubtitlesButton.js';

export const DetailsModeToggle: FC = () => {
  return (
    <ToggleButtonGroup
      exclusive
      size='small'
      color='primary'
      sx={{
        display: 'grid',
        gridAutoColumns: '1fr',
        gridAutoFlow: 'column',
        width: 'max-content',
        '& .MuiToggleButtonGroup-grouped': {
          py: 0,
        },
      }}
    >
      <SubtitlesButton />
      <MixerButton />
    </ToggleButtonGroup>
  );
};
