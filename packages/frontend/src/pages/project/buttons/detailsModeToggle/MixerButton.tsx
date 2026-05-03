import TuneIcon from '@mui/icons-material/Tune';
import { Stack, ToggleButton, Tooltip, Typography } from '@mui/material';
import { type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useProjectStore } from '../../store.js';

export const MixerButton: FC = () => {
  const { t } = useTranslation();
  const detailsMode = useProjectStore((state) => state.detailsMode);
  const setDetailsMode = useProjectStore((state) => state.setDetailsMode);

  return (
    <Tooltip title={t('pages.project.detailsMode.mixer')}>
      <ToggleButton
        selected={detailsMode === 'mixer'}
        value='mixer'
        onClick={() => {
          setDetailsMode('mixer');
        }}
      >
        <Stack alignItems='center'>
          <TuneIcon fontSize='small' />
          <Typography
            variant='caption'
            fontSize={10}
            lineHeight={1}
            textTransform='none'
          >
            {t('pages.project.detailsMode.mixer')}
          </Typography>
        </Stack>
      </ToggleButton>
    </Tooltip>
  );
};
