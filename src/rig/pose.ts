export type Emotion='idle'|'happy'|'blush'|'angry'|'sad';
export const JOINTS={root:[180,285],neck:[0,8],shoulderL:[-43,5],shoulderR:[43,5],elbow:[0,35],wrist:[0,30],hipL:[-24,68],hipR:[24,68],knee:[0,26],ankle:[0,18]} as const;
export type Pose={y:number;torso:number;head:number;armL:number;armR:number;foreL:number;foreR:number;legL:number;legR:number;ear:number;cloth1:number;cloth2:number;blink:number;cheeks:number;energy:number};
/** Local-space angles keep joint origins fixed; every attachment inherits its parent bone. */
export function evaluatePose(time:number,emotion:Emotion='idle',age=10,skin='base',reduced=false):Pose {
 const active=emotion!=='idle'&&age<2.2;
 const pulse=active?Math.sin(Math.min(1,age/2.2)*Math.PI):0;
 const cycle=time%4.6,blink=reduced?1:cycle>4.25&&cycle<4.49?Math.max(.06,Math.abs(cycle-4.37)/.12):1;
 const p:Pose={y:reduced?0:Math.sin(time*1.7)*2.3,torso:reduced?0:Math.sin(time*1.05)*1.1,head:reduced?0:Math.sin(time*.85)*2.4,armL:10,armR:-10,foreL:-6,foreR:6,legL:0,legR:0,ear:reduced?0:Math.sin(time*1.6)*3,cloth1:reduced?0:Math.sin(time*1.4)*6,cloth2:reduced?0:Math.sin(time*1.4-.7)*10,blink,cheeks:emotion==='blush'?.85:emotion==='happy'?.6:.22,energy:active?pulse:0};
 if(reduced)return p;
 if(emotion==='happy'&&active){p.y-=Math.abs(Math.sin(age*Math.PI*1.7))*14*pulse;p.armL=10+32*pulse;p.armR=-10-48*pulse;p.foreL-=28*pulse;p.foreR+=20*pulse;p.head+=Math.sin(age*7)*5*pulse;p.legL=8*pulse;p.legR=-8*pulse;}
 if(emotion==='blush'&&active){p.head=7*pulse;p.armL=-28*pulse;p.armR=28*pulse;p.foreL=-70*pulse;p.foreR=70*pulse;}
 if(emotion==='sad'&&active){p.head=6*pulse;p.y+=4*pulse;p.armL=3;p.armR=-3;}
 if(emotion==='angry'&&active){p.armR=-55*pulse;p.foreR=-35*pulse;p.torso=-5*pulse;p.head=4*pulse;}
 if(active&&emotion==='happy'){
  if(skin==='nezha'||skin==='galaxy'||skin==='iron')p.y-=14*pulse;
  if(skin==='lubu'){p.armR=-45*pulse;p.foreR=25*pulse;}
  if(skin==='guanyu'){p.armR=-60*pulse;p.foreR=-20*pulse;}
  if(skin==='monkey'){p.armR=-42*pulse;p.foreR=75*Math.sin(age*4)*pulse;}
  if(skin==='lion')p.armR=-115*pulse;
  if(skin==='bear')p.armL=90*pulse;
 }
 return p;
}
