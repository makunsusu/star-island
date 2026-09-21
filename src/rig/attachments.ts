import {baseArmParts} from './limbRegistration';
// Grip coordinates are measured in the trimmed source image, not its SVG viewport.
// Keeping the source ratio avoids the invisible padding introduced by `meet`.
export type HandAttachment={width:number;height:number;gripX:number;gripY:number;angle:number};
const hand=(sourceW:number,sourceH:number,height:number,gripX:number,gripY:number,angle:number):HandAttachment=>({width:height*sourceW/sourceH,height,gripX,gripY,angle});
export const hands:Record<string,HandAttachment>={
 rabbit:hand(230,289,112,.43,.66,15),
 strawberry:hand(187,326,135,.34,.72,16),
 bear:hand(271,288,110,.18,.70,-8),
 frog:hand(295,300,174,.36,.88,22),
 nezha:hand(261,258,112,.13,.70,-12),
 lubu:hand(279,331,232,.33,.68,-8),
 guanyu:hand(310,316,237,.30,.72,-15),
 monkey:hand(278,323,210,.48,.52,-12),
 galaxy:hand(287,329,172,.31,.70,-5),
 ice:hand(204,340,173,.32,.74,0),
 lion:hand(281,316,155,.72,.74,62),
 'star-wand':hand(188,396,118,.50,.78,18),
 lollipop:hand(213,367,112,.49,.83,23),
 flower:hand(296,388,106,.51,.84,24),
};
export type Box=readonly[number,number,number,number];
export const backBoxes:Record<string,Box>={
 rabbit:[-87,-12,125,143],strawberry:[-93,-12,186,156],bear:[-85,4,130,139],frog:[-90,-4,174,148],
 nezha:[-142,-110,135,245],lubu:[-87,-5,174,182],guanyu:[-87,-5,174,182],monkey:[-92,2,184,170],galaxy:[-92,-5,184,158],ice:[-126,-24,252,192],lion:[-102,-10,204,181],
 wings:[-126,-25,252,188], 'star-pack':[-83,-4,122,127],balloon:[77,-145,105,175],
};
export const headAccessories:Record<string,Box>={
 'star-clip':[39,-140,43,30],crown:[-50,-196,100,73],goggles:[-73,-88,146,77],
};
// Portraits contain differently sized hoods, beards and plumes; eye lines are not shared.
export const portraitAccessories:Record<string,Partial<Record<string,Box>>>={
 rabbit:{goggles:[-70,-101,140,74]},
 frog:{goggles:[-73,-118,146,77],crown:[-50,-220,100,73]},
 guanyu:{goggles:[-50,-102,125,66],'star-clip':[39,-130,43,30]},
 lubu:{goggles:[-58,-76,140,74],crown:[-42,-216,140,103],'star-clip':[58,-106,43,30]},
};

// Palm centers measured on each forearm sprite. `meet` letterboxing is included
// when converting the source pixels into the elbow's coordinate space.
export const palmSources:Record<string,readonly[number,number,number,number]>={
 base:[230,224,.29,.69],rabbit:[234,196,.70,.63],strawberry:[209,233,.65,.76],bear:[171,265,.28,.80],frog:[174,241,.70,.80],
 nezha:[160,257,.70,.78],lubu:[156,235,.62,.82],guanyu:[192,232,.24,.78],monkey:[184,261,.61,.79],galaxy:[173,252,.29,.79],ice:[129,254,.43,.80],lion:[161,255,.33,.79],
};
export function palmPoint(skin:string):readonly[number,number]{
 if(skin==='base')return [0,baseArmParts.foreR.length];
 const [sw,sh,u,v]=palmSources[skin]??palmSources.base!;
 const soft=['base','rabbit','strawberry','bear','frog'].includes(skin);
 const [x,y,w,h]=soft?[-24,-17,48,76]:[-20,-8,40,64];
 const scale=Math.min(w!/sw,h!/sh);
 return [x!+(w!-sw*scale)/2+sw*scale*u,y!+(h!-sh*scale)/2+sh*scale*v];
}
export const clothingFits:Record<string,{scarf:Box;cape:Box}>={
 base:{scarf:[-32,-15,64,74],cape:[-73,-17,146,119]},
 rabbit:{scarf:[-30,-18,60,69],cape:[-70,-20,140,114]},
 strawberry:{scarf:[-28,-11,56,65],cape:[-68,-15,136,110]},
 bear:{scarf:[-30,-16,60,69],cape:[-70,-18,140,114]},
 frog:{scarf:[-29,-26,58,67],cape:[-70,-28,140,114]},
 nezha:{scarf:[-25,-13,60,69],cape:[-66,-17,140,114]},
 lubu:{scarf:[-28,-12,60,69],cape:[-76,-16,152,124]},
 guanyu:{scarf:[-25,-6,62,72],cape:[-71,-12,146,119]},
 monkey:{scarf:[-28,-13,60,69],cape:[-73,-16,146,119]},
 galaxy:{scarf:[-29,-16,58,67],cape:[-75,-19,150,122]},
 ice:{scarf:[-29,-14,58,67],cape:[-70,-17,140,114]},
 lion:{scarf:[-29,-12,58,67],cape:[-74,-16,148,120]},
};

export const cleanHeadAccessories:Record<string,Box>={crown:[-50,-224,100,73],goggles:[-71,-104,142,75],'star-clip':[42,-139,43,30]};
export const cleanPortraitAccessories:Record<string,Partial<Record<string,Box>>>={
 strawberry:{goggles:[-71,-90,142,75],crown:[-48,-196,96,70],'star-clip':[48,-112,43,30]},
 guanyu:{goggles:[-60,-135,120,64],crown:[-43,-231,86,63],'star-clip':[38,-158,36,25]},
};
