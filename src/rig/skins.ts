export type Skin={ink:string;main:string;light:string;trim:string;hair:string;boot:string;type:'cloth'|'armor'|'robe';skirt:boolean};
const make=(main:string,trim:string,hair='#78584e',type:Skin['type']='cloth',skirt=false):Skin=>({ink:'#76554d',main,light:'#fff5df',trim,hair,boot:trim,type,skirt});
export const SKINS:Record<string,Skin>={
 base:make('#a9c499','#d9ae76'),rabbit:make('#c3dbba','#eca475'),strawberry:make('#efa9ba','#ca718a','#a66d78','cloth',true),bear:make('#dcc0a0','#b18b6b'),frog:make('#b7d596','#e5be65'),
 nezha:make('#e98590','#e0b265','#634647','robe',true),lubu:make('#a78ac7','#e4c174','#634957','armor'),guanyu:make('#a5c8b0','#d1b673','#68524a','robe',true),monkey:make('#ebca7d','#c98860','#ad8667','armor'),iron:make('#ce686c','#eccb79','#77544f','armor'),galaxy:make('#b9d3e8','#859cc8','#98a9c7','armor'),ice:make('#bbdeea','#8eafc9','#a9bbc9','armor'),lion:make('#e3c47d','#8b9bbe','#ae8d5e','armor')
};
export const skinFor=(id:string)=>SKINS[id]||SKINS.base!;
