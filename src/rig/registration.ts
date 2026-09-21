import manifest from './assets.json';
import type {Box} from './attachments';
export type Point=readonly[number,number];
export type AssetRegistration={size:number[];canvas:number[];trim:number[];registration:string;source?:string;rect?:number[]};
export const assets=manifest.assets as Record<string,AssetRegistration>;
export const RIG_VERSION=manifest.version;
/** Convert once, explicitly, from an authored box to pixel coordinates. SVG never letterboxes. */
export function registeredRect(src:string,box:Box,align:'center'|'bottom'='center'):Box{
 const asset=assets[src];if(!asset)throw new Error(`Unregistered rig asset: ${src}`);
 const [w,h]=asset.size as [number,number];const scale=Math.min(box[2]/w,box[3]/h);
 return [box[0]+(box[2]-w*scale)/2,box[1]+(box[3]-h*scale)*(align==='bottom'?1:.5),w*scale,h*scale];
}
export function sourcePoint(src:string,box:Box,point:Point):Point{const r=registeredRect(src,box);return [r[0]+r[2]*point[0],r[1]+r[3]*point[1]];}
export const HEAD={face:[-128.25,-210.6,230.4,230.4] as Box,eyes:[0,-87] as Point,crown:[0,-169] as Point,neck:[0,0] as Point};
export const hairBoxes:Record<string,Box>={
 base:[-112,-248,224,195],rabbit:[-111,-234,222,169],strawberry:[-115,-235,230,197],bear:[-114,-244,228,195],frog:[-112,-248,224,195],nezha:[-121,-246,242,209],lubu:[-115,-275,230,231],guanyu:[-111,-246,222,186],monkey:[-116,-257,232,205],galaxy:[-114,-250,228,197],ice:[-115,-250,230,202],lion:[-115,-257,230,205]
};
export const hatBoxes:Record<string,Box>={
 base:[-103,-198,206,117],rabbit:[-120,-276,240,279],strawberry:[-115,-247,230,161],bear:[-119,-238,238,225],frog:[-122,-235,244,227],nezha:[-120,-228,240,190],lubu:[-134,-312,268,253],guanyu:[-121,-265,242,232],monkey:[-136,-300,272,248],galaxy:[-94,-113,188,89],ice:[-129,-281,258,272],lion:[-122,-239,244,213]
};
export const isHood=(id:string)=>['rabbit','bear','frog','ice','lion','guanyu'].includes(id);

// Portrait feature canvases are registered by neck and eye line, never by expression bounds.
export const faceBoxes:Record<string,Box>={idle:HEAD.face,blink:[-116.1,-210.6,230.4,230.4],happy:[-115.2,-210.6,230.4,230.4],blush:[-128.25,-204.75,230.4,230.4],angry:[-115.2,-204.75,230.4,230.4],sad:[-115.2,-204.75,230.4,230.4]};
