/* Шевченко — единая модель данных и финансов. Все площади — по экспликации альбома 31.10.2026. */
(function(root){
/* ЖК «Шевченко» — единая модель v4 (10.11.2026): 2 блока × 2 подъезда, 9 этажей (1 — коммерция с антресолью, 2–9 — квартиры),
   ядро по центру секции (2 лифта, холл, лестница Н2), 4 квартиры на этаже подъезда. Площади — по чертежам; квартира — сумма помещений
   между отделанными поверхностями стен и перегородок, без лоджий. 128 квартир = 11 284,0 м² (эскизный проект, обновление 17.11.2026; ранее 15 000,0 м²). */
const TYPES = {
 A:{rooms:4,name:'4-комнатная · 3 спальни · угловая',side:'ул. Амангельды + торец',loggia:0,total:88.17,color:'#3D6FA8',r:[["Кухня-гостиная", 23.77], ["Мастер-спальня", 14.37], ["Гардеробная", 2.33], ["Мастер-ванная", 3.16], ["Спальня 2", 10.46], ["Спальня 3", 10.61], ["Ванная", 3.31], ["Гостевой санузел", 1.73], ["Постирочная", 2.26], ["Прихожая и холл", 16.17]]},
 B:{rooms:4,name:'4-комнатная · 3 спальни',side:'ул. Амангельды · у стыка подъездов',loggia:0,total:88.16,color:'#2E8B7E',r:[["Кухня-гостиная", 23.54], ["Мастер-спальня", 10.61], ["Гардеробная", 1.65], ["Мастер-ванная", 4.59], ["Спальня 2", 9.55], ["Спальня 3", 10.23], ["Ванная", 3.46], ["Гостевой санузел", 3.16], ["Постирочная", 2.78], ["Кладовая", 2.71], ["Прихожая и холл", 15.88]]},
 C:{rooms:4,name:'4-комнатная · 3 спальни · угловая',side:'двор + торец',loggia:0,total:88.17,color:'#B8862F',r:[["Кухня-гостиная", 23.77], ["Мастер-спальня", 14.37], ["Гардеробная", 2.33], ["Мастер-ванная", 3.16], ["Спальня 2", 10.46], ["Спальня 3", 10.61], ["Ванная", 3.31], ["Гостевой санузел", 1.73], ["Постирочная", 2.26], ["Прихожая и холл", 16.17]]},
 D:{rooms:4,name:'4-комнатная · 3 спальни',side:'двор · у стыка подъездов',loggia:0,total:88.16,color:'#8E64A8',r:[["Кухня-гостиная", 23.54], ["Мастер-спальня", 10.61], ["Гардеробная", 1.65], ["Мастер-ванная", 4.59], ["Спальня 2", 9.55], ["Спальня 3", 10.23], ["Ванная", 3.46], ["Гостевой санузел", 3.16], ["Постирочная", 2.78], ["Кладовая", 2.71], ["Прихожая и холл", 15.88]],
    rEnd:[["Кухня-гостиная", 23.55], ["Мастер-спальня", 10.61], ["Гардеробная", 1.65], ["Мастер-ванная", 4.59], ["Спальня 2", 9.55], ["Спальня 3", 10.23], ["Ванная", 3.46], ["Гостевой санузел", 3.16], ["Постирочная", 2.78], ["Кладовая", 2.71], ["Прихожая и холл", 15.8]],totalEnd:88.09},   // в подъездах 1 и 4 шахта у квартиры D меньше на 0,07 м² (стояки вентиляции коммерции)
};
const TYPE_KEYS = Object.keys(TYPES);
const FLOORS = [2,3,4,5,6,7,8,9];
const SECTIONS = [{n:1,name:'Подъезд 1 · блок 1, у ул. Жамбыла',keys:['A','B','C','D']},{n:2,name:'Подъезд 2 · блок 1',keys:['A','B','C','D']},{n:3,name:'Подъезд 3 · блок 2',keys:['A','B','C','D']},{n:4,name:'Подъезд 4 · блок 2, у ул. Шевченко',keys:['A','B','C','D']}];
const PRICES = [4500,5000,6000];
const PER_FLOOR = 4, PARK_PER_APT = 2;
const STATE = {price:4500};
const COMM = {"К-1.1": {"L1": 194.11, "MZ": 246.82, "B1": 149.62}, "К-1.2": {"L1": 248.18, "MZ": 254.73, "B1": 149.63}, "К-2.1": {"L1": 211.26, "MZ": 246.82, "B1": 149.63}, "К-2.2": {"L1": 248.18, "MZ": 254.73, "B1": 149.63}, "К-3.1": {"L1": 211.26, "MZ": 246.82, "B1": 149.63}, "К-3.2": {"L1": 248.18, "MZ": 254.73, "B1": 139.54}, "К-4.1": {"L1": 194.13, "MZ": 246.82, "B1": 98.32}, "К-4.2": {"L1": 248.18, "MZ": 254.73, "B1": 98.32}};
const PARK = {levels:[98, 132, 78], total:308, planned:160, added:70, addedUsd:2100000, residents:301, guest:7};
const GROUND = [['Коммерция 1 этажа · 8 помещений',1803.48],['Антресоль коммерции',2006.2],['Торговый цоколь −1',1084.32],['Итого коммерция',4894.00],['Лобби 4 подъездов',197.28]];
const r1 = x => Math.round(x*10)/10;
function inner(t){ return r1(TYPES[t].r.reduce((s,x)=>s+x[1],0)); }
function aptArea(t,sec){ return (t==='D' && (sec===1||sec===4)) ? TYPES.D.totalEnd : TYPES[t].total; }
function units(){
  const u=[];
  for(const f of FLOORS) for(const s of SECTIONS) s.keys.forEach((t,i)=>{
    const n=(s.n-1)*PER_FLOOR+i+1; const a=aptArea(t,s.n);
    u.push({no:f+'-'+String(n).padStart(2,'0'),floor:f,section:s.n,type:t,rooms:TYPES[t].rooms,area:a,end:(t==='D'&&(s.n===1||s.n===4)),get pm2(){return STATE.price;},get price(){return Math.round(this.area*STATE.price);}});
  });
  return u;
}
const AREA = r1(units().reduce((s,u)=>s+u.area,0)); // 128 квартир = 11 284,0 м²
/* Финмодель v2 — схема команды проекта (документ от 07.09.2026): партнёр вносит участок, застройщик строит. */
const DEF = {basis:'team', price:4500, sellHalls:false, parkN:160, parkPrice:30000,
  grossAbove:23237.56, grossPark:5912.0, grossRetB:0, retBCost:1500, constr:1500, parkCost:400, landValue:17000000, partnerArea:6500, partnerPark:37,
  vat:0.16, cit:0.20, fx:457, fxDoc:457, extras:false, design:0.04, superv:0.02, conting:0.05, mgmt:0.02, broker:0.03, guar:0.015,
  citDeduct:'none', partnerPay:'end', partnerMode:'fixed', partnerParkValue:1124567.47, equity:2000000, arbat:10000000, upfront:0.6, salesDelay:0, costAdj:0,
  liftN:0, liftCost:54700};  // 2 лифта в каждом подъезде входят в ставку $1 500/м² (как в модели команды)
const BASIS = {team:{apt:AREA, com:4894, label:'128 квартир 11 284,0 м² + 4 894,0 м² коммерции'},
               draw:{apt:AREA, com:0, label:'Чертежи 31.10.2026: 13 180,8 м² квартир'}};
function run(inp){
  const a=Object.assign({},DEF,inp||{});
  const B=BASIS[a.basis]; const apt=B.apt, com=B.com+(a.basis==='draw'&&a.sellHalls?872:0), sell=apt+com;
  const k=1+a.costAdj, vr=a.vat/(1+a.vat);
  const revApt=apt*a.price, revCom=com*a.price, revPark=a.parkN*a.parkPrice, G=revApt+revCom+revPark;
  const cAbove=a.grossAbove*a.constr*k, cPark=a.grossPark*a.parkCost*k, cRetB=(a.grossRetB||0)*(a.retBCost||0)*k, cLift=a.liftN*a.liftCost*k, C=cAbove+cPark+cRetB+cLift;
  const ex=a.extras?{design:C*a.design, superv:C*a.superv, conting:C*a.conting, mgmt:C*a.mgmt, broker:G*a.broker, guar:G*a.guar}:{design:0,superv:0,conting:0,mgmt:0,broker:0,guar:0};
  const X=ex.design+ex.superv+ex.conting+ex.mgmt+ex.broker+ex.guar;
  const vatOut=G*vr, vatIn=(C+X)*vr, vatPay=vatOut-vatIn;
  const rev=G-vatOut, costEx=C-C*vr, extrasEx=X-X*vr;
  const ebt=rev-costEx-extrasEx;
  const ded=a.citDeduct==='land'?a.landValue:0;
  const cit=Math.max(0,ebt-ded)*a.cit, netAll=ebt-cit;
  const pArea=a.partnerMode==='share'?sell*a.partnerArea/(AREA+4894):a.partnerArea;
  const P=pArea*a.price+(a.partnerParkValue!=null?a.partnerParkValue:a.partnerPark*a.parkPrice);
  const devNet=netAll-P, partnerNet=P-a.landValue;
  // cash flow
  const N=30,c0=4,d=Math.round(a.salesDelay),T=36+d, cf=new Array(T+1).fill(0), rec=new Array(T+1).fill(0), cost=new Array(T+1).fill(0);
  for(let m=0;m<6;m++) cost[m]+=ex.design/6;
  const w=[];let sw=0; for(let i=0;i<N;i++){w.push(Math.sin(Math.PI*(i+0.5)/N)); sw+=w[i];}
  const build=C+ex.superv+ex.conting+ex.mgmt; for(let i=0;i<N;i++) cost[c0+i]+=build*w[i]/sw;
  const A=Math.min(a.arbat,G), R=G-A;
  for(let m=4;m<=7;m++) rec[m+d]+=A/4;
  for(let m=8;m<=33;m++){ const s=R/26; rec[m+d]+=s*a.upfront; rec[34+d]+=s*(1-a.upfront); }
  for(let m=0;m<=T;m++) cost[m]+=rec[m]*(a.broker+a.guar)*(a.extras?1:0);
  let bal=0; const vatPaid=new Array(T+1).fill(0);
  for(let m=0;m<=T;m++){ bal+=rec[m]*vr-cost[m]*vr; if(bal>0||m===T){vatPaid[m]=bal; bal=0;} }
  const pp=new Array(T+1).fill(0);
  if(a.partnerPay==='end') pp[T]=P; else for(let m=0;m<=T;m++) pp[m]=P*rec[m]/G;
  for(let m=0;m<=T;m++) cf[m]=rec[m]-cost[m]-vatPaid[m]-pp[m];
  cf[T]-=cit;
  let cum=0,peak=0; const cumArr=cf.map(x=>{cum+=x; peak=Math.min(peak,cum); return cum;});
  const npv=r=>cf.reduce((s,x,i)=>s+x/Math.pow(1+r,i),0);
  let irr=null; if(peak<0&&npv(-0.5)>0&&npv(5)<0){let lo=-0.5,hi=5; for(let i=0;i<200;i++){const mid=(lo+hi)/2; if(npv(mid)>0) lo=mid; else hi=mid;} irr=Math.pow(1+lo,12)-1;}
  // break-even price (dev net = 0), linear in price
  return {cLift,cRetB,a,pArea,apt,com,sell,revApt,revCom,revPark,G,cAbove,cPark,C,ex,X,vatOut,vatIn,vatPay,rev,costEx,extrasEx,ebt,ded,cit,netAll,P,devNet,partnerNet,
    cf,cum:cumArr,rec,peak:-peak,irr,T,gap:Math.max(0,-peak-a.equity), devRoi:devNet/Math.max(a.equity,-peak), partnerRoi:partnerNet/a.landValue,
    taxShare:(vatPay+cit)/G, avg:a.price};
}
function run1(a,p){ return run(Object.assign({},a,{price:p})).devNet; }
function breakEven(inp){ // price where developer net profit = 0
  let lo=500,hi=20000; for(let i=0;i<100;i++){const mid=(lo+hi)/2; if(run(Object.assign({},inp,{price:mid})).devNet>0) hi=mid; else lo=mid;} return (lo+hi)/2; }
const API={COMM,PARK,aptArea,PER_FLOOR,PARK_PER_APT,TYPES,TYPE_KEYS,FLOORS,SECTIONS,PRICES,STATE,GROUND,AREA,DEF,BASIS,run,breakEven,units,inner};
if(typeof module!=='undefined') module.exports=API; else root.SHEV=API;
})(this);