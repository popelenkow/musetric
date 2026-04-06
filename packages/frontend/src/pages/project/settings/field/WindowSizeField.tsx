import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '../store.js';

const getWindowSizes = () => {
  const sizes = [];
  for (let size = 1024; size <= 1024 * 32; size *= 2) {
    sizes.push(size);
  }
  return sizes;
};
const windowSizes = getWindowSizes();

export const WindowSizeField: FC = () => {
  const { t } = useTranslation();
  const currentWindowSize = useSettingsStore((s) => s.windowSize);
  const setWindowSize = useSettingsStore((s) => s.setWindowSize);

  return (
    <FormControl size='small'>
      <InputLabel>
        {t('pages.project.settings.fields.windowSize.label')}
      </InputLabel>
      <Select
        value={currentWindowSize}
        label={t('pages.project.settings.fields.windowSize.label')}
      >
        {windowSizes.map((windowSize) => (
          <MenuItem
            key={windowSize}
            value={windowSize}
            onClick={() => setWindowSize(windowSize)}
          >
            {windowSize}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
