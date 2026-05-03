import { Stack, ToggleButton, Tooltip, Typography } from '@mui/material';
import { type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { LyricsTextIcon } from '../../../../icons/LyricsTextIcon.js';
import { useProjectStore } from '../../store.js';

export const SubtitlesButton: FC = () => {
  const { t } = useTranslation();
  const detailsMode = useProjectStore((state) => state.detailsMode);
  const setDetailsMode = useProjectStore((state) => state.setDetailsMode);

  return (
    <Tooltip title={t('pages.project.detailsMode.subtitles')}>
      <ToggleButton
        selected={detailsMode === 'subtitles'}
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
  );
};
