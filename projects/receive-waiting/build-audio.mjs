import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url);
const cli=path.join(path.dirname(require.resolve('disaster-broadcast-studio/package.json')),'dist/cli.js');
const root=path.dirname(fileURLToPath(import.meta.url));
for(const [name,duration] of [['room',310],['receiver',4],['carrier',30]]) {
 execFileSync(process.execPath,[cli,'audio',path.join(root,'audio-code',`${name}.mjs`),'--duration',String(duration),'--channels','1','--seed','731','--out',path.join(root,'audio',`${name}.wav`),'--overwrite'],{stdio:'inherit'});
}
