import { ToggleButtonGroup } from '@mui/material';
import { type FC } from 'react';
import { SpectrogramButton } from './SpectrogramButton.js';
import { WaveformButton } from './WaveformButton.js';

export const VisualizationModeToggle: FC = () => {
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
      <WaveformButton />
      <SpectrogramButton />
    </ToggleButtonGroup>
  );
};
