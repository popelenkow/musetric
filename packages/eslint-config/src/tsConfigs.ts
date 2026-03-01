import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Linter } from 'eslint';
import { reactConfig } from './config/react.js';
import { tsConfig } from './config/ts.js';
import { getTsConfigRules } from './getTsConfigRules.js';

type TsConfigItem = {
  path: string;
};

const createTsConfig = (item: TsConfigItem, cwd: string): Linter.Config => {
  const rules = getTsConfigRules(cwd, item.path);
  const base = rules.isReact ? reactConfig : tsConfig;

  return {
    ...base,
    files: rules.files,
    ignores: rules.ignores,
    languageOptions: {
      ...base.languageOptions,
      parserOptions: {
        ...base.languageOptions?.parserOptions,
        project: [item.path],
        tsconfigRootDir: cwd,
      },
    },
  };
};

const getTsConfigItems = (cwd: string): TsConfigItem[] => {
  const tsconfigPath = resolve(cwd, './tsconfig.json');
  const tsconfig: { references: TsConfigItem[] } = JSON.parse(
    readFileSync(tsconfigPath, 'utf8'),
  );

  return tsconfig.references;
};

export const getTsConfigs = (cwd: string): Linter.Config[] =>
  getTsConfigItems(cwd).map((item) => createTsConfig(item, cwd));
