import { Stack, ToggleButton, Tooltip, Typography } from '@mui/material';
import { type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { SpectrogramIcon } from '../../../../icons/SpectrogramIcon.js';
import { useProjectStore } from '../../store.js';

export const SpectrogramButton: FC = () => {
  const { t } = useTranslation();
  const visualizationMode = useProjectStore((state) => state.visualizationMode);
  const setVisualizationMode = useProjectStore(
    (state) => state.setVisualizationMode,
  );

  return (
    <Tooltip title={t('pages.project.visualizationMode.spectrogram')}>
      <ToggleButton
        selected={visualizationMode === 'spectrogram'}
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
  );
};
