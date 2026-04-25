import { Paper, Slider, Stack, Typography } from '@mui/material';
import { type StemType } from '@musetric/audio';
import type { TFunction } from 'i18next';
import { type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { engine } from '../../../engine/engine.js';
import { useEngineStore } from '../../../engine/useEngineStore.js';

const stemLabels: Record<StemType, (t: TFunction) => string> = {
  lead: (t) => t('pages.project.waveform.stemType.lead'),
  backing: (t) => t('pages.project.waveform.stemType.backing'),
  instrumental: (t) => t('pages.project.waveform.stemType.instrumental'),
};

export type TrackVolumeControlProps = {
  stemType: StemType;
};

export const TrackVolumeControl: FC<TrackVolumeControlProps> = (props) => {
  const { stemType } = props;
  const { t } = useTranslation();
  const trackVolume = useEngineStore((state) => state.trackVolumes[stemType]);
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
          {stemLabels[stemType](t)}
        </Typography>
        <Typography variant='caption'>{`${volumePercent}%`}</Typography>
      </Stack>
      <Slider
        size='small'
        min={0}
        max={100}
        value={volumePercent}
        onChange={(_, value) => {
          engine.setTrackVolume(stemType, value / 100);
        }}
      />
    </Stack>
  );
};
