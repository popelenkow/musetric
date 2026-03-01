import { resolve } from 'node:path';
import ts from 'typescript';

export type TsConfigRules = {
  files: string[];
  ignores: string[];
  isReact: boolean;
};

const parseTsConfig = (absolutePath: string): ts.ParsedCommandLine => {
  const parsed = ts.getParsedCommandLineOfConfigFile(
    absolutePath,
    {},
    {
      ...ts.sys,
      onUnRecoverableConfigFileDiagnostic: () => {
        // Nothing
      },
    },
  );

  if (!parsed) {
    throw new Error(`Failed to parse tsconfig: ${absolutePath}`);
  }
  if (parsed.errors.length) {
    throw new Error(`Failed to parse tsconfig: ${absolutePath}`);
  }

  return parsed;
};

export const getTsConfigRules = (
  cwd: string,
  configPath: string,
): TsConfigRules => {
  const absolutePath = resolve(cwd, configPath);
  const parsed = parseTsConfig(absolutePath);
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const includes = parsed.raw.include as string[];
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const excludes = parsed.raw.exclude as string[];

  const files = includes
    .map((pattern) => pattern.replace('${configDir}/', ''))
    .filter((pattern) => !pattern.endsWith('.json'));
  const ignores = excludes.map((pattern) =>
    pattern.replace('${configDir}/', ''),
  );

  return {
    files: files.length > 0 ? files : ['**/*.ts'],
    ignores,
    isReact:
      parsed.options.jsx === ts.JsxEmit.ReactJSX ||
      parsed.options.jsx === ts.JsxEmit.ReactJSXDev,
  };
};
