import { TextField } from '@mui/material';
import { type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '../store.js';

export const VisibleTimeBeforeField: FC = () => {
  const { t } = useTranslation();
  const visibleTimeBefore = useSettingsStore((s) => s.visibleTimeBefore);
  const setVisibleTimeBefore = useSettingsStore((s) => s.setVisibleTimeBefore);

  return (
    <TextField
      key={visibleTimeBefore}
      size='small'
      type='number'
      label={t('pages.project.settings.fields.visibleTimeBefore.label')}
      defaultValue={visibleTimeBefore}
      onBlur={(event) => {
        const value = Number(event.target.value);
        if (Number.isNaN(value)) return;
        setVisibleTimeBefore(Math.max(0, Math.min(value, 30)));
      }}
      slotProps={{
        input: {
          onKeyDown: (event) => {
            if (event.key === 'Enter') {
              event.currentTarget.blur();
            }
          },
        },
      }}
    />
  );
};
