import { homedir } from 'node:os';
import{spawnSync}from'node:child_process';
const result=spawnSync(process.execPath,[`${homedir()}/.codex/skills/codex-image-gallery-sync/scripts/upload-gallery-ingest.js`,'--prompt-file','work/clean-heads-user-prompt.txt','--model','codex-image-generation','--tags','Codex生成,自动同步,角色设定','--image','work/art-source/clean-heads-heroes.png','--image','work/art-source/clean-heads-cute.png'],{stdio:'inherit'});process.exitCode=result.status??1;
