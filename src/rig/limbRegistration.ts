import type {Point} from './registration';
// Measured source-pixel landmarks. Map the two joint centers, not sprite bounding boxes.
export function boneTransform(start:Point,end:Point,length:number){
 const dx=end[0]-start[0],dy=end[1]-start[1],d2=dx*dx+dy*dy;
 if(d2===0)throw new Error('Bone source anchors must differ');
 const a=length*dy/d2,b=length*dx/d2,c=-b,d=a;
 return [a,b,c,d,-a*start[0]-c*start[1],-b*start[0]-d*start[1]];
}
export const baseArmParts={
 upperL:{src:'upperL',size:[260,430],start:[85,85],end:[115,382],length:35,outline:'M89 9C118 0 165 45 183 78C211 122 248 154 243 201Q259 246 211 291L190 315L181 374Q174 422 120 423Q69 419 55 373L56 309Q13 296 13 258Q0 232 14 210Q2 162 17 130Q9 83 45 35Q65 8 89 9Z'},
 upperR:{src:'upperR',size:[250,430],start:[177,85],end:[132,382],length:35,outline:'M156 9Q191 0 213 32Q247 78 239 123Q246 154 231 184Q256 233 226 267Q225 296 192 311L188 377Q180 423 133 423Q78 421 63 378L65 309Q18 293 12 255Q0 224 13 202Q0 159 25 128Q68 45 116 18Q140 4 156 9Z'},
 foreL:{src:'foreL',size:[245,430],start:[119,26],end:[115,275],length:43,outline:'M66 16Q112 0 168 16Q187 82 166 180Q171 202 195 234L229 281Q247 307 220 318Q198 324 167 294L160 334L169 369Q173 408 144 414Q126 423 114 396Q102 435 77 420Q60 415 56 389Q42 414 27 402Q8 389 11 353Q0 322 15 281Q29 233 45 199Q55 166 49 135Q48 45 66 16Z'},
 foreR:{src:'foreR',size:[245,430],start:[128,26],end:[126,275],length:43,outline:'M79 16Q128 0 182 16Q204 93 186 175Q181 204 199 238Q231 281 236 318Q243 354 229 382Q213 408 197 396Q185 424 165 421Q148 424 138 407Q113 435 94 414Q82 398 93 368L99 305Q78 331 60 345Q30 357 17 337Q5 321 23 299Q56 263 70 239Q88 214 82 186Q65 135 71 61Z'},
} as const;
// Source silhouette masks remove the generator's opaque glow without substituting vector art.
export const baseTorsoOutline='M211 10Q227 2 244 10Q290 36 343 15Q376 0 390 23L407 43L437 58Q476 53 475 101L469 195L458 242L491 364L507 403Q460 438 393 447L183 459L166 470L72 471Q42 466 36 448L17 422L20 375L44 348L60 310Q72 295 91 291L94 252L95 218Q75 210 77 162L82 103Q83 61 109 68L133 55L154 49L177 26Q193 11 211 10Z';
