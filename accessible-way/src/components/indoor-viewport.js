import { INDOOR_VIEW } from "../data/indoor-buildings.js";
export function createIndoorViewport(host,{onRoom,onZoom}) {
  const events=new AbortController(), options={signal:events.signal};
  const pointers=new Map();
  const ratio=INDOOR_VIEW.height/INDOOR_VIEW.width;
  let svg=null,view={x:0,y:0,w:1120,h:780},gesture=null,dragged=false,disposed=false;
  const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
  function apply() {
    if(!svg || disposed) return;
    view.x=clamp(view.x,Math.min(0,1120-view.w)-80,Math.max(0,1120-view.w)+80);
    view.y=clamp(view.y,Math.min(0,780-view.h)-65,Math.max(0,780-view.h)+65);
    svg.setAttribute("viewBox",`${view.x} ${view.y} ${view.w} ${view.h}`);
    onZoom(Math.round(1120/view.w*100));
  }
  function point(clientX,clientY) {
    const matrix=svg?.getScreenCTM();
    return matrix ? new DOMPoint(clientX,clientY).matrixTransform(matrix.inverse()) : null;
  }
  function zoom(factor,center) {
    if(!svg) return;
    const p=center??{x:view.x+view.w/2,y:view.y+view.h/2};
    const width=clamp(view.w/factor,280,1344),height=width*ratio;
    const rx=(p.x-view.x)/view.w,ry=(p.y-view.y)/view.h;
    view={x:p.x-rx*width,y:p.y-ry*height,w:width,h:height};apply();
  }
  host.addEventListener("pointerdown",event=>{
    if(!svg || event.button!==0) return;
    const p=point(event.clientX,event.clientY); if(!p) return;
    pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});
    host.setPointerCapture(event.pointerId);
    if(pointers.size===1){dragged=false;gesture={screenX:event.clientX,screenY:event.clientY,point:p,roomId:event.target.closest("[data-room-id]")?.dataset.roomId};}
    else {dragged=true;gesture={pinchDistance:distance(),center:midpoint()};}
  },options);
  function distance(){const [a,b]=[...pointers.values()];return a&&b?Math.hypot(a.x-b.x,a.y-b.y):0;}
  function midpoint(){const [a,b]=[...pointers.values()];return a&&b?point((a.x+b.x)/2,(a.y+b.y)/2):null;}
  host.addEventListener("pointermove",event=>{
    if(!pointers.has(event.pointerId)||!gesture) return;
    pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});
    if(pointers.size>1){const next=distance();if(gesture.pinchDistance>0)zoom(next/gesture.pinchDistance,midpoint());gesture.pinchDistance=next;dragged=true;return;}
    const p=point(event.clientX,event.clientY);if(!p||!gesture.point)return;
    if(Math.hypot(event.clientX-gesture.screenX,event.clientY-gesture.screenY)>5)dragged=true;
    if(dragged){view.x-=p.x-gesture.point.x;view.y-=p.y-gesture.point.y;apply();host.classList.add("is-panning");}
  },options);
  function finish(event,cancelled=false){
    if(!pointers.has(event.pointerId))return;
    const selected=!cancelled&&!dragged&&pointers.size===1?gesture?.roomId:null;
    pointers.delete(event.pointerId);
    if(host.hasPointerCapture(event.pointerId))host.releasePointerCapture(event.pointerId);
    if(!pointers.size){gesture=null;host.classList.remove("is-panning");}
    else {dragged=true;gesture=null;}
    if(selected){svg.querySelector(`[data-room-id="${selected}"]`)?.focus({preventScroll:true});onRoom(selected);}
  }
  host.addEventListener("pointerup",event=>finish(event),options);
  host.addEventListener("pointercancel",event=>finish(event,true),options);
  host.addEventListener("wheel",event=>{if(!svg)return;event.preventDefault();zoom(Math.exp(-clamp(event.deltaY,-100,100)*.003),point(event.clientX,event.clientY));},{...options,passive:false});
  host.addEventListener("keydown",event=>{
    const room=event.target.closest("[data-room-id]");
    if(room&&(event.key==="Enter"||event.key===" ")){event.preventDefault();onRoom(room.dataset.roomId);return;}
    if(event.target!==host)return;
    const move={ArrowLeft:[-.08,0],ArrowRight:[.08,0],ArrowUp:[0,-.08],ArrowDown:[0,.08]}[event.key];
    if(move){event.preventDefault();view.x+=move[0]*view.w;view.y+=move[1]*view.h;apply();}
    else if(["+","="].includes(event.key)){event.preventDefault();zoom(1.25);}
    else if(event.key==="-"){event.preventDefault();zoom(.8);}
    else if(event.key==="0"){event.preventDefault();fit();}
  },options);
  host.addEventListener("click",event=>{if(event.detail===0){const room=event.target.closest("[data-room-id]");if(room)onRoom(room.dataset.roomId);}},options);
  host.addEventListener("focusin",event=>{
    const room=event.target.closest("[data-room-id]");
    if(!room||!room.matches(":focus-visible"))return;
    const bounds=room.getBoundingClientRect(),area=host.getBoundingClientRect();
    if(bounds.left>=area.left&&bounds.right<=area.right&&bounds.top>=area.top&&bounds.bottom<=area.bottom)return;
    const rect=room.querySelector("rect");view.x=Number(rect.getAttribute("x"))+Number(rect.getAttribute("width"))/2-view.w/2;view.y=Number(rect.getAttribute("y"))+Number(rect.getAttribute("height"))/2-view.h/2;apply();
  },options);
  function fit(){view={x:0,y:0,w:1120,h:780};apply();}
  return {
    setSvg(element){svg=element;pointers.clear();gesture=null;fit();if(window.matchMedia("(max-width:760px)").matches)zoom(2.2);},
    zoomIn(){zoom(1.25);},zoomOut(){zoom(.8);},fit,
    focusRoom(room){view.x=room.anchor[0]-view.w/2;view.y=room.anchor[1]-view.h/2;apply();},
    fitPoints(points){
      if(!points.length)return;
      const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);
      const minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
      const paddingX=Math.max(80,(maxX-minX)*.22);
      const width=clamp(Math.max(maxX-minX+paddingX*2,(maxY-minY+160)/ratio),320,1344);
      view={x:(minX+maxX-width)/2,y:(minY+maxY-width*ratio)/2,w:width,h:width*ratio};apply();
    },
    destroy(){disposed=true;events.abort();pointers.clear();svg=null;},
  };
}
