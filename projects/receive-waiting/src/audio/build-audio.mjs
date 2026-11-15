import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const cli = path.join(path.dirname(require.resolve('disaster-broadcast-studio/package.json')), 'dist', 'cli.js');
const sourceDir = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.resolve(sourceDir, '../../output/audio');
mkdirSync(outputDir, { recursive: true });

for (const [name, duration] of [['room', 310], ['receiver', 4], ['carrier', 30]]) {
  execFileSync(process.execPath, [
    cli, 'audio', path.join(sourceDir, `${name}.mjs`),
    '--duration', String(duration), '--channels', '1', '--seed', '731',
    '--out', path.join(outputDir, `${name}.wav`), '--overwrite',
  ], { stdio: 'inherit' });
}
