import TuneIcon from '@mui/icons-material/Tune';
import {
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import { type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { LyricsTextIcon } from '../../../icons/LyricsTextIcon.js';
import { useProjectStore } from '../store.js';

export const DetailsModeToggle: FC = () => {
  const { t } = useTranslation();
  const detailsMode = useProjectStore((state) => state.detailsMode);
  const setDetailsMode = useProjectStore((state) => state.setDetailsMode);

  return (
    <ToggleButtonGroup
      exclusive
      size='small'
      color='primary'
      value={detailsMode}
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
      <Tooltip title={t('pages.project.detailsMode.subtitles')}>
        <ToggleButton
          value='subtitles'
          onClick={() => {
            setDetailsMode('subtitles');
          }}
        >
          <Stack alignItems='center'>
            <LyricsTextIcon fontSize='small' />
            <Typography
              variant='caption'
              fontSize={10}
              lineHeight={1}
              textTransform='none'
            >
              {t('pages.project.detailsMode.subtitles')}
            </Typography>
          </Stack>
        </ToggleButton>
      </Tooltip>
      <Tooltip title={t('pages.project.detailsMode.mixer')}>
        <ToggleButton
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
    </ToggleButtonGroup>
  );
};
