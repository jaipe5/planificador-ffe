(function(root){
const exclusions=['2027-02-12','2027-02-15','2027-03-19','2027-03-22','2027-03-23','2027-03-24','2027-03-25','2027-03-26','2027-03-29','2027-06-10','2027-06-14','2027-06-15','2027-06-16','2027-06-17','2027-06-18','2027-06-25'];
function parse(s){if(!/^\d{4}-\d{2}-\d{2}$/.test(s))throw Error('Introduce una fecha válida.');const d=new Date(s+'T12:00:00Z');if(isNaN(d)||key(d)!==s)throw Error('Fecha no válida.');return d}
function key(d){return d.toISOString().slice(0,10)}
function minutes(n){const v=Number(n);if(!Number.isFinite(v)||v<0||Math.abs(v*60-Math.round(v*60))>0.00001)throw Error('Utiliza horas positivas con precisión de minutos (por ejemplo, 7,5 horas).');return Math.round(v*60)}
function run(c){
let d=parse(c.start),total=minutes(c.total),remaining=total,done=minutes(c.done||0);
if(total<=0||done>=total)throw Error('El total debe ser mayor que cero y que las horas ya realizadas.');
remaining-=done;
if(c.week.length!==7||c.week.some(x=>!Number.isInteger(x)||x<0||x>1440)||!c.week.some(x=>x>0))throw Error('Selecciona al menos un día con entre 0 y 24 horas.');
if(c.mode==='school'&&(c.start<'2027-02-01'||c.start>'2027-07-31'))throw Error('El calendario adjunto está cargado solo del 1 de febrero al 31 de julio de 2027. Elige calendario personalizado para otras fechas.');
const end=c.limit?parse(c.limit):null;if(end&&key(end)<c.start)throw Error('La fecha límite no puede ser anterior al inicio.');
const rows=[],skips={weekend:0,excluded:0};let scanned=0;
while(remaining>0){
const k=key(d);if((end&&d>end)||(c.mode==='school'&&k>'2027-07-31'))throw Error('No caben todas las horas antes del final del periodo. Faltan '+fmt(remaining)+' h.');
if(scanned++>=36600)throw Error('El cálculo supera 100 años. Revisa los datos.');
let cap=c.week[d.getUTCDay()];
if(c.mode==='school'&&[0,6].includes(d.getUTCDay()))cap=0;
if(!cap)skips.weekend++;
else if((c.mode==='school'&&exclusions.includes(k))||c.ranges.some(r=>k>=r.from&&k<=r.to)){cap=0;skips.excluded++}
else if(Object.hasOwn(c.special,k))cap=c.special[k];
if(cap>0){const m=Math.min(cap,remaining);remaining-=m;rows.push({date:k,minutes:m,total:total-remaining,partial:m<cap})}
d.setUTCDate(d.getUTCDate()+1);
}
return {rows,finish:rows.at(-1).date,skips,total,done};
}
function fmt(m){return Number((m/60).toFixed(4)).toLocaleString('es-ES',{maximumFractionDigits:4})}
root.Engine={run,parse,key,minutes,fmt,exclusions};if(typeof module!=='undefined')module.exports=root.Engine;
})(globalThis);
