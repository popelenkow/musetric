import TuneIcon from '@mui/icons-material/Tune';
import { IconButton, Tooltip } from '@mui/material';
import { type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useProjectStore } from '../../store.js';

export const VolumeMixerButton: FC = () => {
  const { t } = useTranslation();
  const isVolumeMixerVisible = useProjectStore(
    (state) => state.isVolumeMixerVisible,
  );
  const toggleVolumeMixerVisible = useProjectStore(
    (state) => state.toggleVolumeMixerVisible,
  );
  const mixerButtonLabel = isVolumeMixerVisible
    ? t('pages.project.waveform.controls.hideMixer')
    : t('pages.project.waveform.controls.showMixer');

  return (
    <Tooltip title={mixerButtonLabel}>
      <IconButton
        onClick={toggleVolumeMixerVisible}
        size='small'
        color={isVolumeMixerVisible ? 'primary' : 'default'}
        aria-label={mixerButtonLabel}
      >
        <TuneIcon fontSize='small' />
      </IconButton>
    </Tooltip>
  );
};
