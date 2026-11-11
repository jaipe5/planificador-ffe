const $=id=>document.getElementById(id), E=Engine;
const names=['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'], order=[1,2,3,4,5,6,0];
let ranges=[],special={},result=null,current=null,month='2027-02';
function nice(k,options={day:'numeric',month:'long',year:'numeric'}){return E.parse(k).toLocaleDateString('es-ES',{...options,timeZone:'UTC'})}
order.forEach(i=>{
 const label=document.createElement('label');label.className='day';label.innerHTML='<input type="checkbox" id="day'+i+'" '+(i>0&&i<6?'checked':'')+'>'+names[i];$('week').append(label);
 const l=document.createElement('label');l.textContent=names[i];const inp=document.createElement('input');inp.id='hours'+i;inp.type='number';inp.min=0;inp.max=24;inp.step='any';inp.value=8;l.append(inp);$('weeklyHours').append(l);
});
const ids=['start','total','daily','done','mode','variable','limit',...order.flatMap(i=>['day'+i,'hours'+i])];
function capture(){const c={};ids.forEach(id=>c[id]=$(id).type==='checkbox'?$(id).checked:$(id).value);return {...c,ranges,special}}
function persist(){try{localStorage.setItem('practicas-v1',JSON.stringify(capture()))}catch{}}
function load(){try{const s=JSON.parse(localStorage.getItem('practicas-v1'));if(!s)return;ids.forEach(id=>{if(s[id]!==undefined){if($(id).type==='checkbox')$(id).checked=!!s[id];else $(id).value=s[id]}});ranges=Array.isArray(s.ranges)?s.ranges:[];special=s.special||{}}catch{}}
function config(){const daily=E.minutes($('daily').value);if(daily<=0||daily>1440)throw Error('Las horas diarias deben ser mayores que 0 y como máximo 24.');const week=Array.from({length:7},(_,i)=>$('day'+i).checked?($('variable').checked?E.minutes($('hours'+i).value):daily):0);return {start:$('start').value,total:$('total').value,done:$('done').value,mode:$('mode').value,limit:$('limit').value,week,ranges,special}}
function lists(){
 $('ranges').replaceChildren();ranges.forEach((r,i)=>{const li=document.createElement('li');li.textContent=nice(r.from,{day:'2-digit',month:'2-digit',year:'numeric'})+(r.to!==r.from?' → '+nice(r.to,{day:'2-digit',month:'2-digit',year:'numeric'}):'');const b=document.createElement('button');b.textContent='×';b.ariaLabel='Quitar exclusión';b.type='button';b.onclick=()=>{ranges.splice(i,1);lists();calculate(false)};li.append(b);$('ranges').append(li)});
 $('count').textContent=ranges.length;
 $('specials').replaceChildren();Object.entries(special).sort().forEach(([date,m])=>{const li=document.createElement('li');li.textContent=nice(date)+' · '+E.fmt(m)+' h';const b=document.createElement('button');b.textContent='×';b.ariaLabel='Quitar jornada especial';b.type='button';b.onclick=()=>{delete special[date];lists();calculate(false)};li.append(b);$('specials').append(li)});
}
function calculate(jump=true){
 $('weeklyHours').classList.toggle('hidden',!$('variable').checked);$('calendarNote').textContent=$('mode').value==='school'?'Precargado del 01/02 al 31/07/2027. Excluye días coloreados y fines de semana. El 3 de mayo se incluye. Junio y julio requieren comprobar el periodo autorizado.':'No incorpora festivos automáticamente. Añade los nacionales, autonómicos y locales que correspondan.';
 current=null;
 try{
 current=config();result=E.run(current);$('error').textContent='';$('finish').textContent=nice(result.finish);$('finishNote').textContent=nice(result.finish,{weekday:'long'})+' · '+(result.rows.at(-1).partial?'Última jornada parcial para completar el total exacto.':'Última jornada completa.');
 $('days').textContent=result.rows.length;$('last').textContent=E.fmt(result.rows.at(-1).minutes);$('remaining').textContent=E.fmt(result.total-result.done);
 $('schedule').replaceChildren();result.rows.forEach((r,i)=>{const tr=document.createElement('tr');[i+1,nice(r.date,{weekday:'short',day:'2-digit',month:'2-digit',year:'numeric'}),E.fmt(r.minutes),E.fmt(r.total)].forEach(t=>{const td=document.createElement('td');td.textContent=t;tr.append(td)});$('schedule').append(tr)});
 if(jump)month=current.start.slice(0,7);
 }catch(e){result=null;$('error').textContent=e.message;$('finish').textContent='Revisa la configuración';$('finishNote').textContent='No se ha generado un calendario válido.';['days','last','remaining'].forEach(id=>$(id).textContent='—');$('schedule').replaceChildren()}
 $('comparison').replaceChildren();if(current)for(const h of [8,7,6]){const tr=document.createElement('tr');let vals;try{const r=E.run({...current,special:{},week:current.week.map((_,i)=>$('day'+i).checked?h*60:0)});vals=[h+' h',r.rows.length+' días',E.fmt(r.rows.at(-1).minutes)+' h',nice(r.finish,{day:'2-digit',month:'2-digit',year:'numeric'})]}catch(e){vals=[h+' h','—','—',e.message]}vals.forEach(x=>{const td=document.createElement('td');td.textContent=x;tr.append(td)});$('comparison').append(tr)}
 $('csv').disabled=$('copy').disabled=$('print').disabled=!result;persist();calendar();
}
function calendar(){
 $('calendar').replaceChildren();const first=E.parse(month+'-01');$('month').textContent=nice(month+'-01',{month:'long',year:'numeric'});
 for(const t of ['L','M','X','J','V','S','D']){const el=document.createElement('span');el.className='weekday';el.textContent=t;$('calendar').append(el)}
 for(let j=0;j<(first.getUTCDay()+6)%7;j++)$('calendar').append(document.createElement('span'));
 const map=new Map((result?.rows||[]).map(r=>[r.date,r]));const d=new Date(first);
 while(E.key(d).startsWith(month)){
 const k=E.key(d),r=map.get(k),excluded=(current?.mode==='school'&&E.exclusions.includes(k))||ranges.some(x=>k>=x.from&&k<=x.to)||special[k]===0;
 const b=document.createElement('button');b.type='button';b.textContent=d.getUTCDate();b.className=r?'attend':excluded?'excluded':'';if(r){const sm=document.createElement('small');sm.textContent=E.fmt(r.minutes)+' h';b.append(sm)}if(result?.finish===k)b.classList.add('final');
 b.ariaLabel=nice(k)+(r?' · '+E.fmt(r.minutes)+' horas':excluded?' · excluido':' · sin asistencia');
 b.onclick=()=>{const index=ranges.findIndex(x=>x.from===k&&x.to===k);if(index>=0)ranges.splice(index,1);else if(excluded){$('status').textContent='Este día está excluido por el calendario, un periodo o una jornada de cero horas. Modifica esa regla para habilitarlo.';return}else ranges.push({from:k,to:k});lists();calculate(false)};
 $('calendar').append(b);d.setUTCDate(d.getUTCDate()+1)}
}
$('form').onsubmit=e=>{e.preventDefault();calculate()};
ids.forEach(id=>$(id).addEventListener('change',()=>calculate(false)));
$('addRange').onclick=()=>{try{const a=$('excludeFrom').value,b=$('excludeTo').value||a;E.parse(a);E.parse(b);if(b<a)throw Error('El final de la exclusión es anterior al inicio.');ranges.push({from:a,to:b});lists();calculate(false)}catch(e){$('error').textContent=e.message}};
$('addSpecial').onclick=()=>{try{const k=$('specialDate').value;E.parse(k);const m=E.minutes($('specialHours').value);if(m>1440)throw Error('La jornada no puede superar 24 horas.');special[k]=m;lists();calculate(false)}catch(e){$('error').textContent=e.message}};
function move(n){const d=E.parse(month+'-01');d.setUTCMonth(d.getUTCMonth()+n);month=E.key(d).slice(0,7);calendar()}
$('prev').onclick=()=>move(-1);$('next').onclick=()=>move(1);
function data(){return [['Jornada','Fecha','Horas','Horas acumuladas'],...result.rows.map((r,i)=>[i+1,r.date,E.fmt(r.minutes),E.fmt(r.total)])]}
$('csv').onclick=()=>{if(!result)return;const content='\uFEFF'+data().map(row=>row.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(';')).join('\r\n');const url=URL.createObjectURL(new Blob([content],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='practicas-'+current.start+'.csv';a.click();URL.revokeObjectURL(url)};
$('copy').onclick=async()=>{if(!result)return;try{const rows=data();const plain=rows.map(r=>r.join('\t')).join('\n');if(window.ClipboardItem){const html='<table>'+rows.map((r,i)=>'<tr>'+r.map(v=>'<'+(i?'td':'th')+'>'+v+'</'+(i?'td':'th')+'>').join('')+'</tr>').join('')+'</table>';await navigator.clipboard.write([new ClipboardItem({'text/html':new Blob([html],{type:'text/html'}),'text/plain':new Blob([plain],{type:'text/plain'})})])}else await navigator.clipboard.writeText(plain);$('status').textContent='Tabla copiada. Puedes pegarla en Word o Excel.'}catch{$('status').textContent='El navegador no permite copiar. Descarga el CSV para abrirlo en Excel.'}};
$('print').onclick=()=>window.print();$('reset').onclick=()=>{try{localStorage.removeItem('practicas-v1')}catch{}location.reload()};
load();lists();calculate();
