import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '../store.js';

const zeroPaddingFactors = [1, 2, 4] as const;

export const ZeroPaddingFactorField: FC = () => {
  const { t } = useTranslation();
  const zeroPaddingFactor = useSettingsStore((s) => s.zeroPaddingFactor);
  const setZeroPaddingFactor = useSettingsStore((s) => s.setZeroPaddingFactor);

  return (
    <FormControl size='small'>
      <InputLabel>
        {t('pages.project.settings.fields.zeroPaddingFactor.label')}
      </InputLabel>
      <Select
        value={zeroPaddingFactor}
        label={t('pages.project.settings.fields.zeroPaddingFactor.label')}
      >
        {zeroPaddingFactors.map((factor) => (
          <MenuItem
            key={factor}
            value={factor}
            onClick={() => setZeroPaddingFactor(factor)}
          >
            {factor}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
