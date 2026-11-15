import {wallSegments,roomPolygon,fitRect} from './room-geometry.mjs';
import {doorSwing} from './room-openings.mjs';
import {validate,footprint,wallLength} from './room-model.mjs';
export const DEFAULT_CAMERA={yaw:45,pitch:30,zoom:1};
export function cameraState(c={}){return {yaw:((Number.isFinite(c.yaw)?c.yaw:45)%360+360)%360,pitch:Math.max(15,Math.min(75,Number.isFinite(c.pitch)?c.pitch:30)),zoom:Math.max(.6,Math.min(1.8,Number.isFinite(c.zoom)?c.zoom:1))};}
export function projectionFor(p,view,W,H,options={}){
 const cam=cameraState(options),theta=cam.yaw*Math.PI/180,tilt=cam.pitch*Math.PI/180,s=Math.sin(theta),c=Math.cos(theta),frame=options.frame||p;
 if(view==='plan'){const bounds=roomPolygon(frame);for(const o of frame.openings||[])if(o.type==='door'&&o.swing==='out')bounds.push(...doorSwing(frame,o).arc);const xs=bounds.map(v=>v[0]),ys=bounds.map(v=>v[1]),left=Math.min(...xs),right=Math.max(...xs),top=Math.min(...ys),bottom=Math.max(...ys),scale=Math.min((W-280)/(right-left),(H-250)/(bottom-top))*cam.zoom,ox=(W-(right-left)*scale)/2-left*scale,oy=(H-(bottom-top)*scale)/2-top*scale;return {point:(x,y)=>[ox+x*scale,oy+y*scale],unproject:(x,y)=>({x:(x-ox)/scale,y:(y-oy)/scale}),scale,depth:(x,y)=>y,farWalls:[]};}
 const raw=(x,y,z=0)=>[(x-p.length/2)*c-(y-p.width/2)*s,((x-p.length/2)*s+(y-p.width/2)*c)*Math.sin(tilt)-z*Math.cos(tilt)];
 const corners=[];for(const x of [0,p.length])for(const y of [0,p.width])for(const z of [0,p.height])corners.push(raw(x,y,z));
 const xs=corners.map(v=>v[0]),ys=corners.map(v=>v[1]),minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
 const diagonal=Math.hypot(p.length,p.width);
 const scale=Math.min((W-280)/diagonal,(H-270)/(diagonal*Math.sin(tilt)+p.height*Math.cos(tilt)))*cam.zoom,ox=W/2-(minX+maxX)*scale/2,oy=H/2-(minY+maxY)*scale/2;
 return {point:(x,y,z=0)=>{const v=raw(x,y,z);return [ox+v[0]*scale,oy+v[1]*scale];},scale,depth:(x,y)=>x*s+y*c,farWalls:wallSegments(p).filter(w=>w.normal[0]*s+w.normal[1]*c>1e-8).map(w=>w.index),frontX:s>=0,frontY:c>=0};
}
export function resizeRoom(p,dimensions,adapt=true){const next=structuredClone(p);for(const k of ['length','width','height'])if(dimensions[k]!==undefined)next[k]=dimensions[k];if(adapt){next.furniture=next.furniture.map(f=>fitRect(next,f));next.openings.forEach(o=>{o.offset=Math.max(0,Math.min(o.offset,wallLength(next,o.wall)-o.width));if(o.type==='window')o.sill=Math.max(0,Math.min(o.sill,next.height-o.height));});}return validate(next);}
