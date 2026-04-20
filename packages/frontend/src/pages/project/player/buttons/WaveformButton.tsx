import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import { IconButton, Tooltip } from '@mui/material';
import { type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useProjectStore } from '../../store.js';

export const WaveformButton: FC = () => {
  const { t } = useTranslation();
  const isWaveformVisible = useProjectStore((state) => state.isWaveformVisible);
  const toggleWaveformVisible = useProjectStore(
    (state) => state.toggleWaveformVisible,
  );
  const waveformButtonLabel = isWaveformVisible
    ? t('pages.project.waveform.controls.hideWaveform')
    : t('pages.project.waveform.controls.showWaveform');

  return (
    <Tooltip title={waveformButtonLabel}>
      <IconButton
        onClick={toggleWaveformVisible}
        size='small'
        color={isWaveformVisible ? 'primary' : 'default'}
        aria-label={waveformButtonLabel}
      >
        <GraphicEqIcon fontSize='small' />
      </IconButton>
    </Tooltip>
  );
};
