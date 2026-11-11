const assert=require('node:assert/strict'),E=require('./engine.js');
const base={start:'2027-02-16',total:500,done:0,mode:'school',week:[0,480,480,480,480,480,0],ranges:[],special:{}};
for(const [h,end,count,last] of [[8,'2027-05-24',63,240],[7,'2027-06-04',72,180],[6,'2027-07-01',84,120]]){const r=E.run({...base,week:base.week.map(x=>x?h*60:0)});assert.equal(r.finish,end);assert.equal(r.rows.length,count);assert.equal(r.rows.at(-1).minutes,last);assert.equal(r.rows.reduce((n,r)=>n+r.minutes,0),30000)}
const custom={...base,mode:'custom',start:'2027-02-13',total:10.5};
assert.equal(E.run(custom).finish,'2027-02-16');
assert.equal(E.run({...custom,special:{'2027-02-15':150}}).finish,'2027-02-16');
assert.equal(E.run({...custom,ranges:[{from:'2027-02-15',to:'2027-02-16'}]}).finish,'2027-02-18');
assert.equal(E.run({...custom,total:10,done:8}).rows[0].minutes,120);
assert.throws(()=>E.run({...base,limit:'2027-02-16'}),/Faltan/);
assert.throws(()=>E.run({...base,week:[0,0,0,0,0,0,0]}),/Selecciona/);
assert.equal(E.run({...custom,total:8,start:'2028-02-29'}).finish,'2028-02-29');
assert.equal(E.run({...base,total:8,start:'2027-03-19'}).finish,'2027-03-30');
assert.equal(E.run({...base,total:8,start:'2027-02-13',week:[480,480,480,480,480,480,480]}).finish,'2027-02-16');
console.log('12 comprobaciones correctas');
