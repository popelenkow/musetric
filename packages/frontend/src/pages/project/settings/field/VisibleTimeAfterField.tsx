import { TextField } from '@mui/material';
import { type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '../store.js';

export const VisibleTimeAfterField: FC = () => {
  const { t } = useTranslation();
  const visibleTimeAfter = useSettingsStore((s) => s.visibleTimeAfter);
  const setVisibleTimeAfter = useSettingsStore((s) => s.setVisibleTimeAfter);

  return (
    <TextField
      key={visibleTimeAfter}
      size='small'
      type='number'
      label={t('pages.project.settings.fields.visibleTimeAfter.label')}
      defaultValue={visibleTimeAfter}
      onBlur={(event) => {
        const value = Number(event.target.value);
        if (Number.isNaN(value)) return;
        setVisibleTimeAfter(Math.max(0, Math.min(value, 30)));
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
