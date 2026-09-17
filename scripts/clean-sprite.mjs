import sharp from 'sharp';
// Retain the actual connected sprite silhouettes, dropping neighboring-cell fragments.
export async function cleanSprite(input){
 const {data,info}=await sharp(input).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const {width:w,height:h}=info,n=w*h,labels=new Int32Array(n),queue=new Int32Array(n),sizes=[0];let label=0;
 for(let i=0;i<n;i++)if(!labels[i]&&data[i*4+3]>32){label++;let start=0,end=1;queue[0]=i;labels[i]=label;
  while(start<end){const p=queue[start++],x=p%w;for(const q of [x>0?p-1:-1,x<w-1?p+1:-1,p>=w?p-w:-1,p<n-w?p+w:-1])if(q>=0&&!labels[q]&&data[q*4+3]>32){labels[q]=label;queue[end++]=q;}}
  sizes[label]=end;
 }
 const largest=Math.max(...sizes),keep=new Uint8Array(n);
 for(let i=0;i<n;i++)if(labels[i]&&sizes[labels[i]]>=largest*.12){const x=i%w,y=Math.floor(i/w);for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)if(x+dx>=0&&x+dx<w&&y+dy>=0&&y+dy<h)keep[(y+dy)*w+x+dx]=1;}
 for(let i=0;i<n;i++)if(!keep[i])data[i*4+3]=0;
 return sharp(data,{raw:info}).png().toBuffer();
}
