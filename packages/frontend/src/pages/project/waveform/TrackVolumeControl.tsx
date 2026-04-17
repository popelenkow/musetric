import { Paper, Slider, Stack, Typography } from '@mui/material';
import { type WaveType } from '@musetric/audio';
import type { TFunction } from 'i18next';
import { type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useProjectStore } from '../store.js';

const waveformTrackLabels: Record<WaveType, (t: TFunction) => string> = {
  lead: (t) => t('pages.project.waveform.type.lead'),
  backing: (t) => t('pages.project.waveform.type.backing'),
  instrumental: (t) => t('pages.project.waveform.type.instrumental'),
};

export type TrackVolumeControlProps = {
  waveType: WaveType;
};

export const TrackVolumeControl: FC<TrackVolumeControlProps> = (props) => {
  const { waveType } = props;
  const { t } = useTranslation();
  const trackVolume = useProjectStore((state) => state.trackVolumes[waveType]);
  const setTrackVolume = useProjectStore((state) => state.setTrackVolume);
  const volumePercent = Math.round(trackVolume * 100);

  return (
    <Stack
      component={Paper}
      elevation={3}
      height='100%'
      justifyContent='center'
      p={4}
    >
      <Stack
        direction='row'
        alignItems='center'
        justifyContent='space-between'
        gap={1}
        minWidth={0}
      >
        <Typography variant='subtitle2' fontWeight='bold'>
          {waveformTrackLabels[waveType](t)}
        </Typography>
        <Typography variant='caption'>{`${volumePercent}%`}</Typography>
      </Stack>
      <Slider
        size='small'
        min={0}
        max={100}
        value={volumePercent}
        onChange={(_, value) => {
          setTrackVolume(waveType, value / 100);
        }}
      />
    </Stack>
  );
};
