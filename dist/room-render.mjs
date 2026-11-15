import {roomPolygon,wallSegments,wallPoint as geometryPoint,floorArea} from './room-geometry.mjs';
import {paintMaterial} from './room-materials.mjs';
import {footprint,LABELS,fmt} from './room-model.mjs';
import {doorSwing} from './room-openings.mjs';
import {projectionFor} from './room-camera.mjs';
export function render(canvas,p,view,selected=-1,surface=-1,warningIndices=[],camera={},resizable=false,selectedOpening=-1){
 const regions=[],c=canvas.getContext('2d'),W=canvas.width,H=canvas.height; c.clearRect(0,0,W,H);c.fillStyle='#eef1e5';c.fillRect(0,0,W,H);c.lineJoin='round';
 const projection=projectionFor(p,view,W,H,camera),{point,scale}=projection,l=p.length,w=p.width,h=p.height;
 const region=(pts,target)=>regions.push({pts:pts.map(v=>point(...v)),target});
 const polygon=(pts,fill,stroke='#536148',width=1)=>{c.beginPath();pts.forEach((v,i)=>{const a=point(...v);i?c.lineTo(...a):c.moveTo(...a);});c.closePath();c.fillStyle=fill;c.fill();c.strokeStyle=stroke;c.lineWidth=width;c.stroke();};
 const line=(a,b,color='#ffffff66',width=1)=>{c.beginPath();c.moveTo(...point(...a));c.lineTo(...point(...b));c.strokeStyle=color;c.lineWidth=width;c.stroke();};
 const text=(s,x,y,size=20,color='#56634b')=>{c.fillStyle=color;c.font=`${size}px Arial`;c.textAlign='center';c.fillText(s,x,y);};
 const segments=wallSegments(p),wallPoint=(i,t,z=0)=>geometryPoint(p,i,t,z);
 const floor=roomPolygon(p).map(v=>[...v,0]);polygon(floor,p.floor.color,surface===p.walls.length?'#cf8745':'#536148',surface===p.walls.length?5:1);region(floor,{kind:'surface',index:p.walls.length});
 paintMaterial(c,point,floor,[0,0,0],[1,0,0],[0,1,0],l,w,p.floor,true);
 if(view==='3d'){
  for(const i of [...projection.farWalls].sort((a,b)=>{const A=segments[a],B=segments[b];return projection.depth((A.a[0]+A.b[0])/2,(A.a[1]+A.b[1])/2)-projection.depth((B.a[0]+B.b[0])/2,(B.a[1]+B.b[1])/2);})){const len=segments[i].length,pts=[wallPoint(i,0),wallPoint(i,len),wallPoint(i,len,h),wallPoint(i,0,h)];polygon(pts,p.walls[i].color,surface===i?'#cf8745':'#536148',surface===i?5:1);region(pts,{kind:'surface',index:i});paintMaterial(c,point,pts,wallPoint(i,0,h),[...segments[i].tangent,0],[0,0,-1],len,h,p.walls[i]);if(surface===i){line(wallPoint(i,0,h),wallPoint(i,len,h),'#cf8745',5);}

   for(const [oi,o] of p.openings.entries()){if(o.wall!==i)continue;const a=o.offset,b=a+o.width,z=o.sill,t=z+o.height;const openingPts=[wallPoint(i,a,z),wallPoint(i,b,z),wallPoint(i,b,t),wallPoint(i,a,t)];polygon(openingPts,o.type==='window'?'#c8dfe0':'#b59b79',selectedOpening===oi?'#df883e':'#f7f7ef',selectedOpening===oi?6:4);region(openingPts,{kind:'opening',index:oi});if(o.type==='window')line(wallPoint(i,(a+b)/2,z),wallPoint(i,(a+b)/2,t),'#f7f7ef',3);}
   const label=point(...wallPoint(i,len/2,h));text('Стена '+(i+1),label[0],label[1]-12,17);
  }
 }else{
  for(const segment of segments){const i=segment.index,len=segment.length,a=wallPoint(i,0),b=wallPoint(i,len),n=segment.normal,pad=18/scale;line(a,b,surface===i?'#cf8745':p.walls[i].color,surface===i?20:14);region([[a[0]+n[0]*pad,a[1]+n[1]*pad],[b[0]+n[0]*pad,b[1]+n[1]*pad],[b[0]-n[0]*pad,b[1]-n[1]*pad],[a[0]-n[0]*pad,a[1]-n[1]*pad]],{kind:'surface',index:i});const mid=point(...wallPoint(i,len/2));text(`Стена ${i+1} · ${fmt(len)} м`,mid[0]-n[0]*48,mid[1]-n[1]*32,16);}
  for(const o of p.openings)line(wallPoint(o.wall,o.offset),wallPoint(o.wall,o.offset+o.width),o.type==='window'?'#83b5c2':'#a88250',12);
 }
 const ordered=p.furniture.map((f,i)=>({...f,index:i})).sort((a,b)=>{const A=footprint(a),B=footprint(b);return view==='3d'?projection.depth(a.x+A.w/2,a.y+A.d/2)-projection.depth(b.x+B.w/2,b.y+B.d/2):0;});
 for(const f of ordered){const {w:fw,d}=footprint(f),x=f.x,y=f.y,z=view==='plan'?0:({bed:.45,sofa:.65,desk:.75,wardrobe:1.9}[f.type]),base=[[x,y,0],[x+fw,y,0],[x+fw,y+d,0],[x,y+d,0]],top=base.map(v=>[v[0],v[1],z]),fill={bed:'#e9dfc7',sofa:'#78866c',desk:'#b89364',wardrobe:'#d4c1a3'}[f.type],target={kind:'furniture',index:f.index};
  if(view==='3d'){const pairs=[projection.frontX?[1,2]:[0,3],projection.frontY?[2,3]:[0,1]];pairs.forEach(([a,b],i)=>{const pts=[base[a],base[b],top[b],top[a]];polygon(pts,i?fill:'#8f957e');region(pts,target);});}region(top,target);polygon(top,fill,warningIndices.includes(f.index)?'#bf6040':f.index===selected?'#db8a3e':'#536148',f.index===selected||warningIndices.includes(f.index)?5:1.5);
  if(f.type==='bed'||f.type==='sofa'){const inset=.06,head=Math.min((f.rotation%180?fw:d)*.26,.32);let headPts;if(f.rotation===0)headPts=[[x+inset,y+inset],[x+fw-inset,y+inset],[x+fw-inset,y+head],[x+inset,y+head]];else if(f.rotation===180)headPts=[[x+inset,y+d-head],[x+fw-inset,y+d-head],[x+fw-inset,y+d-inset],[x+inset,y+d-inset]];else if(f.rotation===90)headPts=[[x+fw-head,y+inset],[x+fw-inset,y+inset],[x+fw-inset,y+d-inset],[x+fw-head,y+d-inset]];else headPts=[[x+inset,y+inset],[x+head,y+inset],[x+head,y+d-inset],[x+inset,y+d-inset]];polygon(headPts.map(v=>[...v,z+.01]),f.type==='bed'?'#fffaf0':'#a1ae95');}
  const center=point(x+fw/2,y+d/2,z);text(LABELS[f.type],center[0],center[1]+6,view==='plan'?19:16,'#283623');
 }
 if(view==='plan'){
  for(const [i,o] of p.openings.entries()){
   const a=wallPoint(o.wall,o.offset),b=wallPoint(o.wall,o.offset+o.width),pad=22/scale;
   const rect=segments[o.wall].vertical?[[a[0]-pad,a[1]],[a[0]+pad,a[1]],[b[0]+pad,b[1]],[b[0]-pad,b[1]]]:[[a[0],a[1]-pad],[b[0],b[1]-pad],[b[0],b[1]+pad],[a[0],a[1]+pad]];
   region(rect,{kind:'opening',index:i});line(a,b,selectedOpening===i?'#df883e':o.type==='window'?'#73a9b8':'#a88250',selectedOpening===i?18:13);
   if(o.type==='door'){const swing=doorSwing(p,o);c.beginPath();c.moveTo(...point(...swing.hinge));for(const v of swing.arc)c.lineTo(...point(...v));c.closePath();c.fillStyle=selectedOpening===i?'#df883e22':'#a8825018';c.fill();c.beginPath();swing.arc.forEach((v,j)=>j?c.lineTo(...point(...v)):c.moveTo(...point(...v)));c.strokeStyle=selectedOpening===i?'#c47a31':'#98764e';c.lineWidth=2;c.setLineDash([7,5]);c.stroke();c.setLineDash([]);line(swing.hinge,swing.tip,selectedOpening===i?'#c47a31':'#98764e',4);}
   const mid=point(...wallPoint(o.wall,o.offset+o.width/2));text((o.type==='door'?'Д':'О')+(i+1),mid[0]-segments[o.wall].normal[0]*28,mid[1]-segments[o.wall].normal[1]*22,15);
  }
 }
 if(view==='plan'&&resizable&&p.shape?.type!=='l'){for(const [x,y,axis,label] of [[l,w/2,'length','↔'],[l/2,w,'width','↕'],[l,w,'both','↘']]){const a=point(x,y);c.fillStyle='#354b2c';c.beginPath();c.arc(a[0],a[1],21,0,2*Math.PI);c.fill();text(label,a[0],a[1]+7,25,'white');regions.push({pts:[[a[0]-28,a[1]-28],[a[0]+28,a[1]-28],[a[0]+28,a[1]+28],[a[0]-28,a[1]+28]],target:{kind:'resize',axis}});}}
 regions.push({pts:[[W/2-240,H-65],[W/2+240,H-65],[W/2+240,H-10],[W/2-240,H-10]],target:{kind:'dimensions'}});text(`${fmt(l)} × ${fmt(w)} м  ·  h ${fmt(h)} м  ✎`,W/2,H-35,22);text('TED.renovation / концепция',W/2,38,17,'#81916f');
 return {...projection,hitTest:(x,y)=>{for(const r of [...regions].reverse()){let inside=false;for(let i=0,j=r.pts.length-1;i<r.pts.length;j=i++){const a=r.pts[i],b=r.pts[j];if(((a[1]>y)!==(b[1]>y))&&(x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0]))inside=!inside;}if(inside)return r.target;}return null;}};
}
