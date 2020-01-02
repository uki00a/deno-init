import { basename, join, dirname } from 'https://deno.land/std@v0.27.0/path/mod.ts';
import { writeFileStr } from 'https://deno.land/std@v0.27.0/fs/write_file_str.ts';

function createTsConfig(denoDir: string): object {
  return {
    "compilerOptions": {
      "target": "esnext",
      "module": "esnext",
      "baseUrl": ".",
      "paths": {
        "https://*": [
          `${denoDir}/deps/https/*`
        ],
        "http://*": [
          `${denoDir}/deps/http/*`
        ]
      },
     "plugins": [{ "name": "typescript-deno-plugin" }]
    }
  };
}

function createPackage(name: string, tsVersion: string): object {
  return {
    "name": name,
    "version": "0.0.1",
    "license": "MIT",
    "private": true,
    "devDependencies": {
      "typescript": tsVersion,
      "typescript-deno-plugin": "latest"
    }
  };
}

async function prepareGitIgnore(): Promise<void> {
  const filename = '.gitignore';
  const dest = join(dirname(new URL(import.meta.url).pathname), filename);
  const pathsToIgnore = [
    'tsconfig.json',
    'package.json',
    'node_modules',
    'yarn.lock',
    'package-lock.json'
  ];
  await writeFileStr(dest, pathsToIgnore.join('\n'));
}

async function writeFileJson(path: string, json: object): Promise<void> {
  await writeFileStr(path, JSON.stringify(json, null, 2));
}

async function prepareTsConfig(): Promise<void> {
  const denoDir = join(Deno.dir('cache'), 'deno');
  const tsConfig = createTsConfig(denoDir);
  await writeFileJson(join(Deno.cwd(), 'tsconfig.json'), tsConfig);
}

async function preparePackageJson(): Promise<void> {
  const projectName = basename(Deno.cwd());
  const pkg = createPackage(projectName, Deno.version.typescript);
  await writeFileJson(join(Deno.cwd(), 'package.json'), pkg);
}

async function main(): Promise<void> {
  await prepareGitIgnore();
  await prepareTsConfig();
  await preparePackageJson();
}

main();
