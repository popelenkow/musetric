import { Stack, ToggleButton, Tooltip, Typography } from '@mui/material';
import { type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { WaveformIcon } from '../../../../icons/WaveformIcon.js';
import { useProjectStore } from '../../store.js';

export const WaveformButton: FC = () => {
  const { t } = useTranslation();
  const visualizationMode = useProjectStore((state) => state.visualizationMode);
  const setVisualizationMode = useProjectStore(
    (state) => state.setVisualizationMode,
  );

  return (
    <Tooltip title={t('pages.project.visualizationMode.waveform')}>
      <ToggleButton
        selected={visualizationMode === 'waveform'}
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
  );
};
