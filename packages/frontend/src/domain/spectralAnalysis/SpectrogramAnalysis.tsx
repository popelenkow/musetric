import { Paper, Stack, Typography } from '@mui/material';
import { type FC } from 'react';
import { useTranslation } from 'react-i18next';
import {
  estimateDominantFrequencyBand,
  formatDecibels,
  formatDuration,
  toDecibels,
} from './analyze.js';
import { useSpectralAnalysisStore } from './store.js';

type MetricRowProps = {
  label: string;
  value: string;
};

const MetricRow: FC<MetricRowProps> = (props) => {
  const { label, value } = props;
  return (
    <Stack direction='row' justifyContent='space-between' alignItems='center'>
      <Typography variant='caption' color='text.secondary'>
        {label}
      </Typography>
      <Typography variant='caption' color='text.primary' fontFamily='monospace'>
        {value}
      </Typography>
    </Stack>
  );
};

export const SpectrogramAnalysis: FC = () => {
  const { t } = useTranslation();
  const analysis = useSpectralAnalysisStore((s) => s.analysis);

  if (!analysis) return undefined;

  const { rms, peak, zeroCrossingRate, duration } = analysis;
  const rmsDb = toDecibels(rms);
  const peakDb = toDecibels(peak);
  const band = estimateDominantFrequencyBand(zeroCrossingRate);

  const bandLabels: Record<string, string> = {
    low: t('pages.project.spectralAnalysis.band.low'),
    'mid-low': t('pages.project.spectralAnalysis.band.mid-low'),
    'mid-high': t('pages.project.spectralAnalysis.band.mid-high'),
    high: t('pages.project.spectralAnalysis.band.high'),
  };
  const bandLabel = bandLabels[band] ?? band;

  return (
    <Paper variant='outlined' sx={{ px: 2, py: 1 }}>
      <Stack gap={0.5}>
        <Typography variant='caption' fontWeight='bold' color='text.secondary'>
          {t('pages.project.spectralAnalysis.title')}
        </Typography>
        <MetricRow
          label={t('pages.project.spectralAnalysis.duration')}
          value={formatDuration(duration)}
        />
        <MetricRow
          label={t('pages.project.spectralAnalysis.peak')}
          value={formatDecibels(peakDb)}
        />
        <MetricRow
          label={t('pages.project.spectralAnalysis.rms')}
          value={formatDecibels(rmsDb)}
        />
        <MetricRow
          label={t('pages.project.spectralAnalysis.dominantBand')}
          value={bandLabel}
        />
      </Stack>
    </Paper>
  );
};
