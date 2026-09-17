import { homedir } from 'node:os';
import {spawnSync} from 'node:child_process';
import {readFile,writeFile} from 'node:fs/promises';
const m=JSON.parse(await readFile('art-rig-manifest.json','utf8'));
const r=spawnSync(process.execPath,[process.env.GALLERY_UPLOADER||`${homedir()}/.codex/skills/codex-image-gallery-sync/scripts/upload-gallery-ingest.js`,'--prompt-file','work/rig-gallery-prompt.txt','--model',m.model,'--tags','Codex生成,自动同步,角色设定',...m.files.flatMap(x=>['--image',x])],{encoding:'utf8',timeout:45000});
await writeFile('gallery-rig-sync-status.json',JSON.stringify({at:new Date().toISOString(),count:m.files.length,status:r.status,output:r.stdout+r.stderr,error:r.error?.message},null,2));
console.log(r.stdout+r.stderr);if(r.status!==0)process.exitCode=1;
