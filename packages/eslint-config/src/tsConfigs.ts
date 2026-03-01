import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Linter } from 'eslint';
import { reactConfig } from './config/react.js';
import { tsConfig } from './config/ts.js';

type TsConfigItem = {
  path: string;
  files: string[];
  ignores: string[];
};

const tsConfigItems: TsConfigItem[] = [
  {
    path: './tsconfig.es.json',
    files: ['src/**/*.es.ts'],
    ignores: [],
  },
  {
    path: './tsconfig.src.json',
    files: ['src/**/*.{ts,tsx}'],
    ignores: [
      'src/**/*.es.ts',
      'src/**/*.cross.ts',
      'src/**/*.dom.ts',
      'src/**/*.node.ts',
      'src/**/*.worker.ts',
      'src/**/*.worklet.ts',
      'src/**/__tests__/*.ts',
    ],
  },
  {
    path: './tsconfig.cross.json',
    files: ['src/**/*.cross.ts'],
    ignores: [],
  },
  {
    path: './tsconfig.dom.json',
    files: ['src/**/*.dom.ts'],
    ignores: [],
  },
  {
    path: './tsconfig.node.json',
    files: ['src/**/*.node.ts'],
    ignores: [],
  },
  {
    path: './tsconfig.worker.json',
    files: ['src/**/*.worker.ts'],
    ignores: [],
  },
  {
    path: './tsconfig.worklet.json',
    files: ['src/**/*.worklet.ts'],
    ignores: [],
  },
  {
    path: './tsconfig.script.json',
    files: ['**/*.ts'],
    ignores: ['src/**/*', 'dist/**/*', 'storage/**/*'],
  },
  {
    path: './tsconfig.test.json',
    files: ['src/**/__tests__/**/*.ts'],
    ignores: [
      'src/**/*.es.ts',
      'src/**/*.cross.ts',
      'src/**/*.dom.ts',
      'src/**/*.node.ts',
      'src/**/*.worker.ts',
      'src/**/*.worklet.ts',
    ],
  },
];

const isReactTsConfig = (cwd: string, configPath: string): boolean => {
  const absolutePath = resolve(cwd, configPath);
  const configContent = readFileSync(absolutePath, 'utf8');

  return /"jsx"\s*:\s*"react-jsx(?:dev)?"/.test(configContent);
};

const createTsConfig = (item: TsConfigItem, cwd: string): Linter.Config => {
  const isReact = isReactTsConfig(cwd, item.path);
  const base = isReact ? reactConfig : tsConfig;

  return {
    ...base,
    files: item.files,
    ignores: item.ignores,
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

export const getTsConfigs = (cwd: string): Linter.Config[] =>
  tsConfigItems
    .filter((item) => existsSync(resolve(cwd, item.path)))
    .map((item) => createTsConfig(item, cwd));
