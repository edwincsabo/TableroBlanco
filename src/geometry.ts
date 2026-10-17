export function recognizeShape(points:readonly (readonly number[])[],width:number,height:number):'ellipse'|'rectangle'|null{
  if(points.length<12||width<35||height<35)return null;
  const first=points[0],last=points[points.length-1];
  if(Math.hypot(first[0]-last[0],first[1]-last[1])>Math.hypot(width,height)*0.22)return null;
  const minX=Math.min(...points.map(p=>p[0])),minY=Math.min(...points.map(p=>p[1]));
  const normalized=points.map(p=>[(p[0]-minX)/width,(p[1]-minY)/height]);
  const ellipseError=normalized.reduce((s,[x,y])=>s+Math.abs(Math.hypot((x-.5)*2,(y-.5)*2)-1),0)/points.length;
  const rectError=normalized.reduce((s,[x,y])=>s+Math.min(x,y,1-x,1-y),0)/points.length;
  if(rectError<.065&&rectError*2.5<ellipseError)return 'rectangle';
  if(ellipseError<.17)return 'ellipse';
  return null;
}
