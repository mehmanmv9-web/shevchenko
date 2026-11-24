/* Шевченко — единая модель данных и финансов. Все площади — по экспликации альбома 31.10.2026. */
(function(root){
/* ЖК «Шевченко» — единая модель v4 (10.11.2026): 2 блока × 2 подъезда, 9 этажей (1 — коммерция с антресолью, 2–9 — квартиры),
   ядро по центру секции (2 лифта, холл, лестница Н2), 4 квартиры на этаже подъезда. Площади — по чертежам; квартира — сумма помещений
   между отделанными поверхностями стен и перегородок, без лоджий. 128 квартир = 15 000,0 м² (как в таблице команды). */
const TYPES = {
 '2':{rooms:2,name:'2-комнатная',side:'',loggia:0,total:80,range:[75,85],color:'#3D6FA8',r:[]},
 '3':{rooms:3,name:'3-комнатная',side:'',loggia:0,total:145,range:[130,160],color:'#2E8B7E',r:[]},
 '4':{rooms:4,name:'4-комнатная',side:'',loggia:0,total:205,range:[180,250],color:'#B8862F',r:[]},
 '5':{rooms:5,name:'5-комнатная',side:'',loggia:0,total:301,range:[280,330],color:'#8E64A8',r:[]},
 '6':{rooms:6,name:'6-комнатная · пентхаус',side:'',loggia:0,total:470,range:[450,470],color:'#A8433D',r:[]}
};
const TYPE_KEYS = Object.keys(TYPES);
const FLOORS = [2,3,4,5,6,7,8,9];
/* раскладка по подъездам и этажам (сценарий А: все 4 подъезда Luxury): состав этажа — типы по возрастанию номера */
const LAYOUTS = {A:{"1": {"2": "234", "3": "234", "4": "234", "5": "234", "6": "333", "7": "244", "8": "44", "9": "35"}, "2": {"2": "234", "3": "234", "4": "234", "5": "234", "6": "333", "7": "244", "8": "44", "9": "35"}, "3": {"2": "234", "3": "234", "4": "234", "5": "234", "6": "333", "7": "44", "8": "35", "9": "35"}, "4": {"2": "234", "3": "234", "4": "234", "5": "333", "6": "244", "7": "44", "8": "35", "9": "6"}},B:{"1": {"2": "234", "3": "234", "4": "234", "5": "234", "6": "333", "7": "244", "8": "44", "9": "35"}, "2": {"2": "234", "3": "234", "4": "234", "5": "234", "6": "333", "7": "244", "8": "44", "9": "35"}, "3": {"2": "234", "3": "234", "4": "234", "5": "234", "6": "333", "7": "44", "8": "35", "9": "35"}, "4": {"2": "44", "3": "44", "4": "44", "5": "44", "6": "5", "7": "5", "8": "5", "9": "6"}}};
let SCEN='A'; try{ const q=/[?&#]v=([AaBb])/.exec(location.search+location.hash); if(q){SCEN=q[1].toUpperCase(); localStorage.setItem('shevScen',SCEN);} else {SCEN=(localStorage.getItem('shevScen')==='B')?'B':'A';} }catch(e){}
const LAYOUT = LAYOUTS[SCEN];
const SECTIONS = [{n:1,name:'Подъезд 1 · блок 1, у ул. Жамбыла'},{n:2,name:'Подъезд 2 · блок 1'},{n:3,name:'Подъезд 3 · блок 2'},{n:4,name:(SCEN==='B'?'Private Residence · ':'')+'Подъезд 4 · блок 2, у ул. Шевченко'}];
const PRICES = [4500,5000];
const PER_FLOOR = 3, PARK_PER_APT = 2;
const STATE = {price:4500};
const COMM = {"К-1.1": {"L1": 183.59, "MZ": 233.42, "B1": 141.51}, "К-1.2": {"L1": 234.71, "MZ": 240.91, "B1": 141.51}, "К-2.1": {"L1": 199.79, "MZ": 233.42, "B1": 141.51}, "К-2.2": {"L1": 234.71, "MZ": 240.91, "B1": 141.51}, "К-3.1": {"L1": 199.79, "MZ": 233.42, "B1": 141.51}, "К-3.2": {"L1": 234.71, "MZ": 240.91, "B1": 131.97}, "К-4.1": {"L1": 183.59, "MZ": 233.42, "B1": 92.98}, "К-4.2": {"L1": 234.71, "MZ": 240.91, "B1": 92.98}};
const PARK = {levels:[98, 132], total:230, guest:7};
const GROUND = [['Коммерция 1 этажа · 8 помещений',1705.6],['Антресоль коммерции',1897.32],['Торговый цоколь −1',1025.48],['Итого коммерция',4628.40],['Лобби 4 подъездов',197.28]];
const r1 = x => Math.round(x*10)/10;
function inner(t){ return r1(TYPES[t].r.reduce((s,x)=>s+x[1],0)); }
function aptArea(t,sec){ return TYPES[t].total; }
function units(sc){
  const LAY=sc?LAYOUTS[sc]:LAYOUT; const u=[];
  for(const f of FLOORS){ let n=0; for(const s of SECTIONS){ const ks=LAY[s.n][f].split(''); ks.forEach((t,i)=>{
    n++; const a=aptArea(t,s.n);
    u.push({no:f+'-'+String(n).padStart(2,'0'),floor:f,section:s.n,pos:i,count:ks.length,type:t,rooms:TYPES[t].rooms,area:a,end:false,get pm2(){return STATE.price;},get price(){return Math.round(this.area*STATE.price);}});
  }); }}
  return u;
}
const AREA = r1(units().reduce((s,u)=>s+u.area,0)), NUNITS = units().length; // 85 квартир = 14 000,0 м² (рекомендация по квартирографии, Arbat Real Estate)
/* Финмодель v2 — схема команды проекта (документ от 07.09.2026): партнёр вносит участок, застройщик строит. */
const DEF = {basis:'team', price:4500, sellHalls:false, parkN:Math.max(0,230-(NUNITS*2+7)), parkPrice:30000,
  grossAbove:23787.6, grossPark:5912.0, grossRetB:0, retBCost:1500, constr:1500, parkCost:400, landValue:17000000, partnerArea:6500, partnerPark:37,
  vat:0.16, cit:0.20, fx:457, fxDoc:457, extras:false, design:0.04, superv:0.02, conting:0.05, mgmt:0.02, broker:0.03, guar:0.015,
  citDeduct:'none', partnerPay:'end', partnerMode:'fixed', partnerParkValue:1124567.47, equity:2000000, arbat:10000000, upfront:0.6, salesDelay:0, costAdj:0,
  liftN:0, liftCost:54700};  // 2 лифта в каждом подъезде входят в ставку $1 500/м² (как в модели команды)
const BASIS = {team:{apt:AREA, com:4628.4, label:NUNITS+' квартир '+AREA.toLocaleString('ru-RU',{minimumFractionDigits:1})+' м² + 4 628,4 м² коммерции'},
               draw:{apt:AREA, com:0, label:'Чертежи 31.10.2026 (прежняя раскладка)'}};
function run(inp){
  const a=Object.assign({},DEF,inp||{});
  const B=BASIS[a.basis]; const apt=a.aptM2||B.apt, com=B.com+(a.basis==='draw'&&a.sellHalls?872:0), sell=apt+com;
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
  const pArea=a.partnerMode==='share'?sell*a.partnerArea/(AREA+4628.4):a.partnerArea;
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
function scenarioStats(sc){ const us=units(sc), area=r1(us.reduce((t,x)=>t+x.area,0)), by={}; us.forEach(x=>by[x.type]=(by[x.type]||0)+1); const res={}; PRICES.forEach(p=>{ const r=run({price:p,aptM2:area,parkN:Math.max(0,230-(us.length*2+7))}); res[p]={G:r.G,devNet:r.devNet,partnerNet:r.partnerNet,revApt:area*p}; }); return {n:us.length,area,by,res,avg:r1(area/us.length),maxFloorSec:Math.max(...Object.values(us.reduce((m,x)=>{const k=x.section+'-'+x.floor; m[k]=(m[k]||0)+x.area; return m;},{})))}; }

/* распределение машино-мест: 2 на квартиру (ближайшие к своему подъезду), 7 гостевых, остальные — сверх нормы */
function parkAssign(){
  const G=(typeof window!=='undefined'&&window.GEO3)||null; if(!G) return null;
  const us=units(), need={}; us.forEach(u=>need[u.section]=(need[u.section]||0)+PARK_PER_APT);
  const cat={}, taken=new Set(), res=G.stalls.filter(s=>s.cat!=='guest');
  G.stalls.filter(s=>s.cat==='guest').forEach(s=>cat[s.no]='guest');
  const SY={1:110.5,2:83.9,3:42.4,4:15.8}, secY=n=>SY[n]+13.3, short={};
  Object.keys(need).map(Number).sort((a,b)=>a-b).forEach(n=>{
    const cy=secY(n), cand=res.filter(s=>!taken.has(s.no)).map(s=>({s,c:Math.abs((s.r[2]+s.r[3])/2-cy)+30*(-s.lv-1)})).sort((a,b)=>a.c-b.c);
    let k=0; for(const c of cand){ if(k>=need[n]) break; taken.add(c.s.no); cat[c.s.no]='apt'; k++; } short[n]=need[n]-k; });
  res.forEach(s=>{ if(!taken.has(s.no)) cat[s.no]='extra'; });
  const nApt=us.length*PARK_PER_APT, nGuest=G.stalls.filter(s=>s.cat==='guest').length, total=G.stalls.length;
  return {cat,nApt,nGuest,total,extra:total-nApt-nGuest,flats:us.length,short:Object.values(short).reduce((a,b)=>a+b,0)};
}
function setScenario(sc){ try{localStorage.setItem('shevScen',sc);}catch(e){} try{sessionStorage.setItem('shevKeep',JSON.stringify({y:window.scrollY||0,t:Date.now()}));}catch(e){} const u=new URL(location.href); u.searchParams.set('v',sc); u.hash=''; location.href=u.pathname+u.search; }
/* после смены сценария возвращаем пользователя на то же место страницы (страница перезагружается) */
(function(){ let k=null; try{ k=JSON.parse(sessionStorage.getItem('shevKeep')||'null'); sessionStorage.removeItem('shevKeep'); }catch(e){} if(!k||Date.now()-k.t>20000||!(k.y>0)) return;
  let moved=false; const mv=()=>{moved=true}; ['wheel','touchstart','keydown','mousedown'].forEach(ev=>window.addEventListener(ev,mv,{passive:true,once:true}));
  const go=()=>{ if(!moved) window.scrollTo(0,k.y); };
  window.addEventListener('load',()=>{ go(); [400,1200,2500,4500].forEach(t=>setTimeout(go,t)); }); })();
const API={parkAssign,SCEN,LAYOUTS,scenarioStats,setScenario,LAYOUT,COMM,PARK,aptArea,PER_FLOOR,PARK_PER_APT,TYPES,TYPE_KEYS,FLOORS,SECTIONS,PRICES,STATE,GROUND,AREA,DEF,BASIS,run,breakEven,units,inner};
if(typeof module!=='undefined') module.exports=API; else root.SHEV=API;
})(this);