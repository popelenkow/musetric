import {
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import { type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { SpectrogramIcon } from '../../../icons/SpectrogramIcon.js';
import { WaveformIcon } from '../../../icons/WaveformIcon.js';
import { useProjectStore } from '../store.js';

export const VisualizationModeToggle: FC = () => {
  const { t } = useTranslation();
  const visualizationMode = useProjectStore((state) => state.visualizationMode);
  const setVisualizationMode = useProjectStore(
    (state) => state.setVisualizationMode,
  );

  return (
    <ToggleButtonGroup
      exclusive
      size='small'
      color='primary'
      value={visualizationMode}
      sx={{
        display: 'grid',
        gridAutoColumns: '1fr',
        gridAutoFlow: 'column',
        '& .MuiToggleButtonGroup-grouped': {
          py: 0,
        },
      }}
    >
      <Tooltip title={t('pages.project.visualizationMode.spectrogram')}>
        <ToggleButton
          value='spectrogram'
          onClick={() => {
            setVisualizationMode('spectrogram');
          }}
        >
          <Stack alignItems='center'>
            <SpectrogramIcon fontSize='small' />
            <Typography
              variant='caption'
              fontSize={10}
              lineHeight={1}
              textTransform='none'
            >
              {t('pages.project.visualizationMode.spectrogram')}
            </Typography>
          </Stack>
        </ToggleButton>
      </Tooltip>
      <Tooltip title={t('pages.project.visualizationMode.waveform')}>
        <ToggleButton
          value='waveform'
          onClick={() => {
            setVisualizationMode('waveform');
          }}
        >
          <Stack alignItems='center'>
            <WaveformIcon fontSize='small' />
            <Typography
              variant='caption'
              fontSize={10}
              lineHeight={1}
              textTransform='none'
            >
              {t('pages.project.visualizationMode.waveform')}
            </Typography>
          </Stack>
        </ToggleButton>
      </Tooltip>
    </ToggleButtonGroup>
  );
};
