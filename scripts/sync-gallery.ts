import { homedir } from 'node:os';
import {spawnSync} from 'node:child_process';
import {readFile,writeFile} from 'node:fs/promises';
const records=JSON.parse(await readFile('art-prompts.json','utf8')) as {id:string;prompt:string;file:string;model:string}[];
const uploader=process.env.GALLERY_UPLOADER||`${homedir()}/.codex/skills/codex-image-gallery-sync/scripts/upload-gallery-ingest.js`;
const characters=records.filter(r=>r.id!=='map');
const args=[uploader,'--prompt-file','gallery-prompt.txt','--model','codex-image-generation','--tags','Codex生成,自动同步,角色设定',...characters.flatMap(r=>['--image',r.file])];
const r=spawnSync(process.execPath,args,{encoding:'utf8',timeout:45000});
const status={date:new Date().toISOString(),model:'codex-image-generation',characterImages:characters.length,success:r.status===0,result:r.stdout+r.stderr};
await writeFile('gallery-sync-status.json',JSON.stringify(status,null,2));console.log(JSON.stringify(status,null,2));
if(r.status!==0)process.exitCode=1;
if(r.status===0){const map=records.find(r=>r.id==='map')!;await writeFile('work/map-prompt.txt',map.prompt);const m=spawnSync(process.execPath,[uploader,'--prompt-file','work/map-prompt.txt','--model',map.model,'--tags','Codex生成,自动同步,游戏场景','--image',map.file],{encoding:'utf8',timeout:45000});console.log(m.stdout+m.stderr);if(m.status!==0)process.exitCode=1;}
