import { useState, useMemo, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const DEF={biz:"SALESUP",closers:["Pablo","No Closer"],setters:["No Setter","Sofi"],ofertas:["Herbolario","Cafetería","Panadería","Compraventa de coches"],sources:["Setter","Organic","Youtube","Email","Facebook","Instagram","Self set"],deals:["Pago Completo","Sequra","Depósito","Pago Fraccionado","Pago Programado","Reembolso"],callTypes:["Demo + Cierre (1 Call Close - 1/1)","Demo (2 Call Close - 1/2)","Cierre (2 Call Close - 2/2)"],callPlanTypes:["Llamada","Follow-up","WhatsApp Follow-up"],metPago:["Stripe","Transferencia","Crypto","Efectivo"],cA:.75,cS:.1,cC:.15,cMS:0,cMC:0,cS1:0,cS2:0};

const NR_INIT=[];

const CK_INIT=[];

const SK_INIT=[];

/* utils */
const pd=d=>d?new Date(d+"T00:00:00"):null;
const fm=(n,d=0)=>(n==null||isNaN(n))?"0":Number(n).toLocaleString("es-ES",{minimumFractionDigits:d,maximumFractionDigits:d});
const fp=n=>(n==null||isNaN(n))?"0%":(Number(n)*100).toFixed(2).replace(/\.?0+$/,"")+"%";
const fe=n=>fm(n,2)+"€";
const sm=(a,k)=>a.reduce((s,r)=>s+(Number(r[k])||0),0);
const pn=v=>{if(typeof v==='number')return v;if(!v)return 0;const s=String(v).replace(/[^0-9.,\-]/g,'');if(s.includes('.')&&s.includes(','))return parseFloat(s.replace(/\./g,'').replace(',','.'))||0;if(s.includes(','))return parseFloat(s.replace(',','.'))||0;return parseFloat(s)||0;};
const CC2=["#FFD700","#3B82F6","#22C55E","#EF4444","#8B5CF6","#EC4899","#0D9488","#F97316"];
const tts={backgroundColor:"#111",border:"1px solid #FFD700",borderRadius:"6px",color:"#FFD700",fontSize:"12px"};
const fmtD=d=>d.toISOString().slice(0,10);

const PER=[{l:"TODO",v:"ALL"},{l:"Hoy",v:"TD"},{l:"Ayer",v:"YD"},{l:"Últimos 3 días",v:"P3"},{l:"Esta semana",v:"TW"},{l:"Semana pasada",v:"LW"},{l:"Últimos 7 días",v:"L7"},{l:"Últimos 14 días",v:"L14"},{l:"Este mes",v:"TM"},{l:"Últimos 30 días",v:"L30"},{l:"Mes pasado",v:"LM"},{l:"Últimos 3 meses",v:"P3M"},{l:"Últimos 6 meses",v:"P6M"},{l:"Este año",v:"TY"},{l:"Año pasado",v:"LY"},{l:"Personalizado",v:"CUSTOM"}];

function gdr(p){const n=new Date(),t=new Date(n.getFullYear(),n.getMonth(),n.getDate()),d=x=>{const r=new Date(t);r.setDate(r.getDate()-x);return r};switch(p){case"TD":return[t,t];case"YD":return[d(1),d(1)];case"P3":return[d(3),t];case"TW":{const r=new Date(t);const dow=r.getDay();const daysFromMonday=dow===0?-6:1-dow;r.setDate(r.getDate()+daysFromMonday);return[r,t];}case"LW":{const e=new Date(t);const dow=e.getDay();e.setDate(e.getDate()-(dow===0?0:dow));const s=new Date(e);s.setDate(s.getDate()-6);return[s,e];}case"L7":return[d(7),t];case"L14":return[d(14),t];case"TM":return[new Date(t.getFullYear(),t.getMonth(),1),t];case"L30":return[d(30),t];case"LM":return[new Date(t.getFullYear(),t.getMonth()-1,1),new Date(t.getFullYear(),t.getMonth(),0)];case"P3M":return[d(90),t];case"P6M":return[d(180),t];case"TY":return[new Date(t.getFullYear(),0,1),t];case"LY":return[new Date(t.getFullYear()-1,0,1),new Date(t.getFullYear()-1,11,31)];default:return[new Date(2020,0,1),t];}}
function gpr([s,e]){const df=e-s,pe=new Date(s-864e5);return[new Date(pe-df),pe];}
function fbd(a,df,[s,e]){return a.filter(i=>{const d=pd(i[df]);return d&&d>=s&&d<=new Date(e.getTime()+864e5-1);});}

/* default month dates */
function defCustom(){const n=new Date(),t=new Date(n.getFullYear(),n.getMonth(),n.getDate());const ms=new Date(t.getFullYear(),t.getMonth(),1);const pms=new Date(t.getFullYear(),t.getMonth()-1,1);const pme=new Date(t.getFullYear(),t.getMonth(),0);return{s1:fmtD(ms),e1:fmtD(t),s2:fmtD(pms),e2:fmtD(pme)};}

/* components */
function Sel({value,onChange,options}){
  return <select value={value} onChange={e=>onChange(e.target.value)} className="bg-black text-yellow-400 border border-neutral-700 rounded-md px-3 py-1.5 text-sm font-semibold focus:outline-none focus:border-yellow-500">
    {options.map(o=><option key={o.v??o} value={o.v??o}>{o.l??o}</option>)}
  </select>;
}

function KCard({t,v,p,icon,vr}){
  const base="border rounded-xl p-3 flex flex-col justify-between";
  const cls=vr==="red"?base+" bg-red-950/30 border-red-800/40":vr==="green"?base+" bg-emerald-950/30 border-emerald-800/40":base+" bg-neutral-900/50 border-neutral-800";
  const vc=vr==="red"?"text-red-400":vr==="green"?"text-emerald-400":"text-yellow-400";

  let deltaDisplay=null;
  if(p!=null){
    const parseVal=(val)=>{
      if(typeof val==="number")return val;
      if(typeof val==="string"){
        const cleaned=val.replace(/[^0-9.,%-]/g,'').replace(',','.');
        if(val.includes('%'))return parseFloat(cleaned)/100;
        return parseFloat(cleaned);
      }
      return 0;
    };
    const currVal=parseVal(v);
    const prevVal=parseVal(p);
    const increased=currVal>=prevVal;
    const arrow=increased?"↑":"↓";
    const color=increased?"text-emerald-400":"text-red-400";
    deltaDisplay=<div className={"text-[11px] mt-1 font-semibold "+color}>{arrow+" "+p}</div>;
  }

  return <div className={cls}>
    <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">{t}{icon?" "+icon:""}</div>
    <div className={"text-2xl font-extrabold tracking-tight leading-none mt-1 "+vc}>{v}</div>
    {deltaDisplay}
  </div>;
}

/* Unified filter bar */
function FilterBar({biz, gb, setGb, GS, per, setPer, customDates, setCustomDates, compOn, setCompOn, extraFilters}){
  const isCustom = per==="CUSTOM";
  return <div className="bg-black rounded-xl border border-neutral-800 overflow-hidden">
    <div className="bg-teal-700 px-4 py-2 flex items-center justify-between">
      <span className="text-white font-bold text-sm">{biz}</span>
    </div>
    {extraFilters && <div className="flex gap-3 px-4 py-2 border-b border-neutral-800">{extraFilters}</div>}
    <div className="flex flex-wrap items-end gap-4 px-4 py-2 border-b border-neutral-800 bg-teal-900/20">
      <div>
        <div className="text-[9px] text-yellow-400 font-bold uppercase tracking-widest mb-1">Agrupar</div>
        <Sel value={gb} onChange={setGb} options={GS.map(g=>({l:g,v:g}))}/>
      </div>
      <div>
        <div className="text-[9px] text-yellow-400 font-bold uppercase tracking-widest mb-1">Periodo</div>
        <Sel value={per} onChange={setPer} options={PER}/>
      </div>
      {isCustom && <>
        <div>
          <div className="text-[9px] text-teal-300 font-bold uppercase tracking-widest mb-1">Desde</div>
          <input type="date" value={customDates.s1} onChange={e=>setCustomDates(p=>({...p,s1:e.target.value}))} className="bg-black text-white border border-neutral-600 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-yellow-500"/>
        </div>
        <div>
          <div className="text-[9px] text-teal-300 font-bold uppercase tracking-widest mb-1">Hasta</div>
          <input type="date" value={customDates.e1} onChange={e=>setCustomDates(p=>({...p,e1:e.target.value}))} className="bg-black text-white border border-neutral-600 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-yellow-500"/>
        </div>
      </>}
      <div className="flex items-center gap-2 pb-1">
        <label className="flex items-center gap-1.5 cursor-pointer select-none">
          <input type="checkbox" checked={compOn} onChange={e=>setCompOn(e.target.checked)} className="accent-yellow-400 w-3.5 h-3.5 cursor-pointer"/>
          <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">Comparar</span>
        </label>
      </div>
      {compOn && <>
        <div>
          <div className="text-[9px] text-teal-300 font-bold uppercase tracking-widest mb-1">Comp. Desde</div>
          <input type="date" value={customDates.s2} onChange={e=>setCustomDates(p=>({...p,s2:e.target.value}))} className="bg-black text-white border border-neutral-600 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-yellow-500"/>
        </div>
        <div>
          <div className="text-[9px] text-teal-300 font-bold uppercase tracking-widest mb-1">Comp. Hasta</div>
          <input type="date" value={customDates.e2} onChange={e=>setCustomDates(p=>({...p,e2:e.target.value}))} className="bg-black text-white border border-neutral-600 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-yellow-500"/>
        </div>
      </>}
    </div>
  </div>;
}

/* date filter hook */
function useDF(data,dateField,per,customDates,compOn){
  const presetDr=useMemo(()=>gdr(per==="CUSTOM"?"ALL":per),[per]);
  const customDr=useMemo(()=>{if(per!=="CUSTOM")return null;const s=pd(customDates.s1),e=pd(customDates.e1);return(s&&e)?[s,e]:null;},[per,customDates.s1,customDates.e1]);
  const compDr=useMemo(()=>{if(!compOn)return null;const s=pd(customDates.s2),e=pd(customDates.e2);return(s&&e)?[s,e]:null;},[compOn,customDates.s2,customDates.e2]);

  const dr=customDr||presetDr;
  const pr=compDr||gpr(dr);
  const f=useMemo(()=>fbd(data,dateField,dr),[data,dateField,dr]);
  const pf=useMemo(()=>fbd(data,dateField,pr),[data,dateField,pr]);
  return{f,pf,compOn};
}

/* ═══ NOMBRES ═══ */
function Nombres({cfg,NR}){
  const [per,setPer]=useState("ALL");
  const [gb,setGb]=useState("Todos");
  const [cd2,setCd2]=useState(defCustom);
  const [compOn,setCompOn]=useState(false);
  const GS=["Todos","Mes/Año","Closers","Setters","Fuentes","Ventas","Offers","Paises"];
  const {f:allF,pf:allPF}=useDF(NR,"D",per,cd2,compOn);
  const f=useMemo(()=>allF.filter(r=>r.Dl!=="Reembolso"),[allF]);
  const pf=useMemo(()=>allPF.filter(r=>r.Dl!=="Reembolso"),[allPF]);

  const k=useMemo(()=>{
    const dl=allF.length,py=f.length,ca=sm(f,"Ca"),rv=sm(f,"Rv"),av=py?ca/py:0;
    const cp=rv?ca/rv:0,pi=py?f.filter(r=>r.Dl==="Pago Completo"||r.Dl==="Sequra").length/py:0;
    const stp=py?f.filter(r=>r.Sr==="Setter").length/py:0;
    const rf=allF.filter(r=>r.Dl==="Reembolso"),ra=sm(rf,"Ca");
    const cr=f.reduce((s,r)=>s+(r.Ca||0)*(cfg.cC+cfg.cS),0);
    const pdl=allPF.length,pp=pf.length,pc=sm(pf,"Ca"),prv=sm(pf,"Rv"),pa=pp?pc/pp:0;
    const pcp=prv?pc/prv:0,ppi=pp?pf.filter(r=>r.Dl==="Pago Completo"||r.Dl==="Sequra").length/pp:0;
    const pstp=pp?pf.filter(r=>r.Sr==="Setter").length/pp:0;
    const pcr=pf.reduce((s,r)=>s+(r.Ca||0)*(cfg.cC+cfg.cS),0);
    return{dl,py,ca,rv,av,cp,pi,stp,ra,cr,pdl,pp,pc,prv,pa,pcp,ppi,pstp,pcr};
  },[f,pf,allF,allPF,cfg]);

  const td=useMemo(()=>{
    if(gb==="Todos")return f.map(r=>({n:r.N,dt:r.D,ca:r.Ca,rv:r.Rv,dl:r.Dl,sr:r.Sr,co:r.P,cl:r.Cl,st:r.St}));
    const fm2={"Mes/Año":r=>{const d=pd(r.D);return d?d.toLocaleString("es",{month:"long"})+" "+d.getFullYear():"?"},Closers:r=>r.Cl,Setters:r=>r.St,Sources:r=>r.Sr,Deals:r=>r.Dl,Offers:r=>r.Of,Paises:r=>r.P};
    const fn=fm2[gb]||(r=>"?"),gs={};f.forEach(r=>{const k2=fn(r);(gs[k2]=gs[k2]||[]).push(r);});
    return Object.entries(gs).map(([k2,it])=>({n:k2,py:it.length,ca:sm(it,"Ca"),rv:sm(it,"Rv"),av:it.length?sm(it,"Ca")/it.length:0,pi:it.length?it.filter(r=>r.Dl==="Pago Completo"||r.Dl==="Sequra").length/it.length:0}));
  },[f,gb]);
  const chd=useMemo(()=>gb==="Todos"?f.map(r=>({name:r.N,cash:r.Ca||0})):td.map(r=>({name:r.n,cash:r.ca||0})),[f,td,gb]);
  const acols=[{k:"n",l:"Nombre"},{k:"dt",l:"Fecha"},{k:"ca",l:"Cobrado",r:v=>fe(v)},{k:"rv",l:"Ingresos",r:v=>fe(v)},{k:"dl",l:"Tipo Venta"},{k:"sr",l:"Fuente"},{k:"co",l:"País"},{k:"cl",l:"Closer"},{k:"st",l:"Setter"}];
  const gcols=[{k:"n",l:gb},{k:"py",l:"Pagos"},{k:"ca",l:"Cobrado",r:v=>fe(v)},{k:"rv",l:"Ingresos",r:v=>fe(v)},{k:"av",l:"Cobro Medio",r:v=>fe(v)},{k:"pi",l:"PIF %",r:v=>fp(v)}];
  const cols=gb==="Todos"?acols:gcols;
  const cp=compOn;

  return <div className="space-y-3">
    <div className="grid grid-cols-5 gap-2.5">
      <KCard t="Ventas" v={k.dl} p={cp?k.pdl:null} icon="🎯"/><KCard t="Pagos" v={k.py} p={cp?k.pp:null} icon="📦"/>
      <KCard t="Cobrado (%)" v={fp(k.cp)} p={cp?fp(k.pcp):null} vr="green"/><KCard t="Ingresos Totales" v={fe(k.rv)} p={cp?fe(k.prv):null} vr="green"/>
      <KCard t="Reembolsos" v={fe(k.ra)} icon="🏷️" vr="red"/>
    </div>
    <div className="grid grid-cols-5 gap-2.5">
      <KCard t="Setter (%)" v={fp(k.stp)} p={cp?fp(k.pstp):null}/><KCard t="PIF (%)" v={fp(k.pi)} p={cp?fp(k.ppi):null}/>
      <KCard t="Cobro Medio" v={fe(k.av)} p={cp?fe(k.pa):null} vr="green"/>
      <KCard t="Total Cobrado" v={fe(k.ca)} p={cp?fe(k.pc):null} vr="green"/>
      <KCard t="Com. Reps" v={fe(k.cr)} p={cp?fe(k.pcr):null} icon="💵"/>
    </div>
    <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-3">
      <div className="text-[10px] text-neutral-500 font-semibold uppercase tracking-widest mb-1">Cobrado por cliente</div>
      <ResponsiveContainer width="100%" height={180}><BarChart data={chd} margin={{top:5,right:10,bottom:45,left:5}}>
        <CartesianGrid strokeDasharray="3 3" stroke="#222"/><XAxis dataKey="name" tick={{fill:"#555",fontSize:9}} angle={-40} textAnchor="end" interval={0}/>
        <YAxis tick={{fill:"#444",fontSize:9}}/><Tooltip contentStyle={tts} itemStyle={{color:"#ccc"}} labelStyle={{color:"#FFD700"}}/><Bar dataKey="cash" fill="#FFD700" radius={[3,3,0,0]}/>
      </BarChart></ResponsiveContainer>
    </div>
    <FilterBar biz={cfg.biz} gb={gb} setGb={setGb} GS={GS} per={per} setPer={setPer} customDates={cd2} setCustomDates={setCd2} compOn={compOn} setCompOn={setCompOn}/>
    <div className="overflow-x-auto border border-neutral-800 rounded-b-xl"><table className="w-full text-sm"><thead className="sticky top-0"><tr className="bg-neutral-900">
      {cols.map((c,i)=><th key={i} className="px-3 py-2 text-left text-[10px] font-bold text-yellow-400 uppercase tracking-wider border-b border-neutral-800 whitespace-nowrap">{c.l}</th>)}
    </tr></thead><tbody>{(td||[]).map((r,ri)=><tr key={ri} className={ri%2===0?"bg-neutral-950":"bg-black"}>
      {cols.map((c,ci)=><td key={ci} className="px-3 py-1.5 text-neutral-300 whitespace-nowrap border-b border-neutral-900 text-sm">{c.r?c.r(r[c.k],r):(r[c.k]??"—")}</td>)}
    </tr>)}</tbody></table></div>
  </div>;
}

/* ═══ CLOSER ═══ */
function Closer({cfg,CK}){
  const [per,setPer]=useState("ALL");
  const [gb,setGb]=useState("Closers");
  const [cd2,setCd2]=useState(defCustom);
  const [compOn,setCompOn]=useState(false);
  const GS=["Closers","Tipo Llamada","Fechas"];
  const {f,pf}=useDF(CK,"D",per,cd2,compOn);

  const k=useMemo(()=>{
    const ca=sm(f,"Ca"),cc=sm(f,"CC"),lc=sm(f,"LC"),of=sm(f,"O"),dp=sm(f,"Dp"),ci=sm(f,"Ci");
    const pca=sm(pf,"Ca"),pcc=sm(pf,"CC"),plc=sm(pf,"LC"),pof=sm(pf,"O"),pdp=sm(pf,"Dp"),pci=sm(pf,"Ci");
    return{ca,cc,lc,of,dp,ci,sr:ca?lc/ca:0,cp:ca?cc/ca:0,op:lc?of/lc:0,cm:ci?dp/ci:0,oc:of?ci/of:0,ccr:lc?ci/lc:0,ac:ca?ci/ca:0,pca,pcc,plc,pof,pdp,pci,psr:pca?plc/pca:0,pop:plc?pof/plc:0,pcm:pci?pdp/pci:0,poc:pof?pci/pof:0,pccr:plc?pci/plc:0};
  },[f,pf]);

  const td=useMemo(()=>{
    const fm2={Closers:r=>r.Cl,"Tipo Llamada":r=>r.CT,Dates:r=>r.D};const fn=fm2[gb]||(r=>r.D),gs={};
    f.forEach(r=>{const k2=fn(r);if(!gs[k2])gs[k2]={ca:0,cc:0,lc:0,of:0,dp:0,ci:0};const g=gs[k2];g.ca+=r.Ca||0;g.cc+=r.CC||0;g.lc+=r.LC||0;g.of+=r.O||0;g.dp+=r.Dp||0;g.ci+=r.Ci||0;});
    return Object.entries(gs).map(([k2,v])=>({nm:k2,...v,sr:v.ca?v.lc/v.ca:0,cp:v.ca?v.cc/v.ca:0,op:v.lc?v.of/v.lc:0,cm:v.ci?v.dp/v.ci:0,oc:v.of?v.ci/v.of:0,ccr:v.lc?v.ci/v.lc:0,ac:v.ca?v.ci/v.ca:0})).sort((a,b)=>a.nm>b.nm?1:-1);
  },[f,gb]);

  const pie=useMemo(()=>{const fm2={Closers:r=>r.Cl,"Tipo Llamada":r=>r.CT,Dates:r=>r.D};const fn=fm2[gb]||(r=>r.D);const g={};f.forEach(r=>{const k2=fn(r);g[k2]=(g[k2]||0)+(r.Ca||0);});return Object.entries(g).map(([n,v])=>({name:n,value:v}));},[f,gb]);
  const bar=useMemo(()=>td.map(r=>({name:r.nm,calls:r.ca,live:r.lc})),[td]);
  const cols=[{k:"nm",l:gb},{k:"ca",l:"Llamadas"},{k:"cp",l:"Cancel %",r:v=>fp(v)},{k:"cc",l:"Canceladas"},{k:"sr",l:"Show %",r:v=>fp(v)},{k:"lc",l:"Hechas"},{k:"op",l:"Oferta %",r:v=>fp(v)},{k:"of",l:"Ofertas"},{k:"dp",l:"Dep."},{k:"ci",l:"Cierres"},{k:"cm",l:"Compromiso %",r:v=>fp(v)},{k:"oc",l:"Of/Ci %",r:v=>fp(v)},{k:"ccr",l:"Lla/Ci %",r:v=>fp(v)},{k:"ac",l:"Tot/Ci %",r:v=>fp(v)}];
  const cp=compOn;

  return <div className="space-y-3">
    <div className="grid grid-cols-6 gap-2.5">
      <KCard t="Llamadas Agenda" v={fm(k.ca)} p={cp?fm(k.pca):null} icon="📞" vr="green"/><KCard t="Llamadas Hechas" v={fm(k.lc)} p={cp?fm(k.plc):null} icon="🔴" vr="green"/>
      <KCard t="Ofertas" v={fm(k.of)} p={cp?fm(k.pof):null} vr="green"/><KCard t="Depósitos" v={fm(k.dp)} p={cp?fm(k.pdp):null} icon="💰" vr="green"/>
      <KCard t="Cierres" v={fm(k.ci)} p={cp?fm(k.pci):null} vr="green"/>
    </div>
    <div className="grid grid-cols-6 gap-2.5">
      <KCard t="Show Rate (%)" v={fp(k.sr)} p={cp?fp(k.psr):null}/><KCard t="Oferta (%)" v={fp(k.op)} p={cp?fp(k.pop):null}/>
      <KCard t="Compromiso (%)" v={fp(k.cm)} p={cp?fp(k.pcm):null}/><KCard t="Oferta/Cierre (%)" v={fp(k.oc)} p={cp?fp(k.poc):null}/>
      <KCard t="Llamada/Cierre (%)" v={fp(k.ccr)} p={cp?fp(k.pccr):null}/>
    </div>
    <div className="grid grid-cols-5 gap-2.5">
      <div className="col-span-2 bg-neutral-900 rounded-xl border border-neutral-800 p-3">
        <div className="text-[10px] text-neutral-500 font-semibold uppercase tracking-widest mb-1">Distribución llamadas</div>
        <div className="flex flex-wrap gap-2 mb-2">{pie.map((d,i)=><div key={i} className="flex items-center gap-1 text-[10px] text-neutral-500"><div className="w-2 h-2 rounded-full" style={{background:CC2[i%CC2.length]}}/>{d.name}</div>)}</div>
        <ResponsiveContainer width="100%" height={165}><PieChart><Pie data={pie} cx="50%" cy="50%" innerRadius={40} outerRadius={68} paddingAngle={2} dataKey="value" label={({percent,cx,cy,midAngle,innerRadius,outerRadius})=>{const r=outerRadius+16;const x=cx+r*Math.cos(-midAngle*Math.PI/180);const y=cy+r*Math.sin(-midAngle*Math.PI/180);return <text x={x} y={y} fill="#999" textAnchor="middle" fontSize={10} dominantBaseline="central">{(percent*100).toFixed(1)+"%"}</text>;}} labelLine={false}>
          {pie.map((_,i)=><Cell key={i} fill={CC2[i%CC2.length]}/>)}</Pie><Tooltip contentStyle={tts} itemStyle={{color:"#ccc"}} labelStyle={{color:"#FFD700"}}/></PieChart></ResponsiveContainer>
      </div>
      <div className="col-span-3 bg-neutral-900 rounded-xl border border-neutral-800 p-3">
        <div className="text-[10px] text-neutral-500 font-semibold uppercase tracking-widest mb-1">Llamadas vs Hechas</div>
        <ResponsiveContainer width="100%" height={185}><BarChart data={bar} margin={{top:5,right:10,bottom:45,left:5}}>
          <CartesianGrid strokeDasharray="3 3" stroke="#222"/><XAxis dataKey="name" tick={{fill:"#555",fontSize:9}} angle={-40} textAnchor="end" interval={0}/>
          <YAxis tick={{fill:"#444",fontSize:9}}/><Tooltip contentStyle={tts} itemStyle={{color:"#ccc"}} labelStyle={{color:"#FFD700"}}/>
          <Bar dataKey="calls" name="Llamadas" fill="rgba(255,215,0,0.3)" radius={[3,3,0,0]}/>
          <Bar dataKey="live" name="Hechas" fill="#FFD700" radius={[3,3,0,0]}/>
        </BarChart></ResponsiveContainer>
      </div>
    </div>
    <FilterBar biz={cfg.biz} gb={gb} setGb={setGb} GS={GS} per={per} setPer={setPer} customDates={cd2} setCustomDates={setCd2} compOn={compOn} setCompOn={setCompOn}/>
    <div className="border-b border-neutral-800"><table className="w-full text-sm"><tbody>
      <tr className="bg-neutral-900">{cols.map((c,i)=><td key={i} className="px-2 py-1.5 font-bold text-white whitespace-nowrap text-xs">{i===0?"Total":["ca","cc","lc","of","dp","ci"].includes(c.k)?fm(k[c.k]):c.r?c.r(k[c.k]||0):""}</td>)}</tr>
    </tbody></table></div>
    <div className="overflow-x-auto border border-neutral-800 rounded-b-xl"><table className="w-full text-sm"><thead className="sticky top-0"><tr className="bg-neutral-900">
      {cols.map((c,i)=><th key={i} className="px-2 py-2 text-left text-[10px] font-bold text-yellow-400 uppercase tracking-wider border-b border-neutral-800 whitespace-nowrap">{c.l}</th>)}
    </tr></thead><tbody>{td.map((r,ri)=><tr key={ri} className={ri%2===0?"bg-neutral-950":"bg-black"}>
      {cols.map((c,ci)=><td key={ci} className="px-2 py-1.5 text-neutral-300 whitespace-nowrap border-b border-neutral-900 text-xs">{c.r?c.r(r[c.k],r):(r[c.k]??"—")}</td>)}
    </tr>)}</tbody></table></div>
  </div>;
}

/* ═══ SETTER ═══ */
function SetterDB({cfg,SK}){
  const [per,setPer]=useState("ALL");
  const [gb,setGb]=useState("Mes/Año");
  const [cd2,setCd2]=useState(defCustom);
  const [compOn,setCompOn]=useState(false);
  const GS=["Setters","Tipo Plan","Mes/Año","Fechas"];
  const {f,pf}=useDF(SK,"D",per,cd2,compOn);
  const isL=r=>(r.DT||'').toLowerCase().includes('llamada');

  const k=useMemo(()=>{
    const fL=f.filter(isL),fM=f.filter(r=>!isL(r));
    const cv=fL.reduce((s,r)=>s+(r.NC||0),0);
    const ms=fM.reduce((s,r)=>s+(r.NC||0),0);
    const lL=sm(fL,"LE"),lM=sm(fM,"LE"),aL=sm(fL,"LA"),aM=sm(fM,"LA");
    const ofpL=cv?lL/cv:0,capL=cv?aL/cv:0,ccpL=lL?aL/lL:0;
    const ofpM=ms?lM/ms:0,capM=ms?aM/ms:0,ccpM=lM?aM/lM:0;
    const pfL=pf.filter(isL),pfM=pf.filter(r=>!isL(r));
    const pcv=pfL.reduce((s,r)=>s+(r.NC||0),0);
    const pms=pfM.reduce((s,r)=>s+(r.NC||0),0);
    const plL=sm(pfL,"LE"),plM=sm(pfM,"LE"),paL=sm(pfL,"LA"),paM=sm(pfM,"LA");
    const pofpL=pcv?plL/pcv:0,pcapL=pcv?paL/pcv:0,pccpL=plL?paL/plL:0;
    const pofpM=pms?plM/pms:0,pcapM=pms?paM/pms:0,pccpM=plM?paM/plM:0;
    return{cv,ms,lL,lM,aL,aM,ofpL,capL,ccpL,ofpM,capM,ccpM,pcv,pms,plL,plM,paL,paM,pofpL,pcapL,pccpL,pofpM,pcapM,pccpM};
  },[f,pf]);

  const td=useMemo(()=>{
    const fm2={Setters:r=>r.St,"Tipo Plan":r=>r.DT,"Mes/Año":r=>{const d=pd(r.D);return d?d.toLocaleString("es",{month:"long"})+" "+d.getFullYear():"?"},Fechas:r=>r.D};
    const fn=fm2[gb]||(r=>r.St),gs={};
    f.forEach(r=>{const k2=fn(r);if(!gs[k2])gs[k2]={cv:0,ms:0,lL:0,lM:0,aL:0,aM:0};const g=gs[k2];const ll=isL(r);if(ll){g.cv+=r.NC||0;g.lL+=r.LE||0;g.aL+=r.LA||0;}else{g.ms+=r.NC||0;g.lM+=r.LE||0;g.aM+=r.LA||0;}});
    return Object.entries(gs).map(([k2,v])=>({nm:k2,...v,ofpL:v.cv?v.lL/v.cv:0,capL:v.cv?v.aL/v.cv:0,ccpL:v.lL?v.aL/v.lL:0,ofpM:v.ms?v.lM/v.ms:0,capM:v.ms?v.aM/v.ms:0,ccpM:v.lM?v.aM/v.lM:0}));
  },[f,gb]);

  const pie=useMemo(()=>{const fm2={Setters:r=>r.St,"Tipo Plan":r=>r.DT,"Mes/Año":r=>{const d=pd(r.D);return d?d.toLocaleString("es",{month:"long"})+" "+d.getFullYear():"?"},Fechas:r=>r.D};const fn=fm2[gb]||(r=>r.St);const g={};f.forEach(r=>{const k2=fn(r);g[k2]=(g[k2]||0)+(r.NC||0);});return Object.entries(g).map(([n,v])=>({name:n,value:v}));},[f,gb]);
  const bar=useMemo(()=>td.map(r=>({name:r.nm,convos:r.cv,mensajes:r.ms})),[td]);

  const totCv=sm(td,"cv"),totMs=sm(td,"ms"),totlL=sm(td,"lL"),totlM=sm(td,"lM"),totaL=sm(td,"aL"),totaM=sm(td,"aM"),totN=td.length;
  const avgCv=totN?totCv/totN:0,avgMs=totN?totMs/totN:0,avglL=totN?totlL/totN:0,avglM=totN?totlM/totN:0,avgaL=totN?totaL/totN:0,avgaM=totN?totaM/totN:0;
  const avgOfpL=totN?td.reduce((s,r)=>s+r.ofpL,0)/totN:0,avgCapL=totN?td.reduce((s,r)=>s+r.capL,0)/totN:0,avgCcpL=totN?td.reduce((s,r)=>s+r.ccpL,0)/totN:0;
  const avgOfpM=totN?td.reduce((s,r)=>s+r.ofpM,0)/totN:0,avgCapM=totN?td.reduce((s,r)=>s+r.capM,0)/totN:0,avgCcpM=totN?td.reduce((s,r)=>s+r.ccpM,0)/totN:0;

  const cols=[{k:"nm",l:gb},{k:"cv",l:"Convos"},{k:"lL",l:"Of.(Ll)"},{k:"ofpL",l:"Of.% Ll",r:v=>fp(v)},{k:"aL",l:"Lla.(Ll)"},{k:"capL",l:"Lla.% Ll",r:v=>fp(v)},{k:"ccpL",l:"Of/Lla% Ll",r:v=>fp(v)},{k:"ms",l:"Mensajes"},{k:"lM",l:"Of.(Msg)"},{k:"ofpM",l:"Of.% Msg",r:v=>fp(v)},{k:"aM",l:"Lla.(Msg)"},{k:"capM",l:"Lla.% Msg",r:v=>fp(v)},{k:"ccpM",l:"Of/Lla% Msg",r:v=>fp(v)}];
  const cp=compOn;

  return <div className="space-y-3">
    <div className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">Llamadas</div>
    <div className="grid grid-cols-3 gap-2.5">
      <KCard t="Nuevas Convos" v={fm(k.cv)} p={cp?fm(k.pcv):null} icon="💬" vr="green"/>
      <KCard t="Ofertas (Ll)" v={fm(k.lL)} p={cp?fm(k.plL):null} icon="📩" vr="green"/>
      <KCard t="Lla. Agenda (Ll)" v={fm(k.aL)} p={cp?fm(k.paL):null} icon="📞" vr="green"/>
    </div>
    <div className="grid grid-cols-3 gap-2.5">
      <KCard t="Oferta % (Ll)" v={fp(k.ofpL)} p={cp?fp(k.pofpL):null}/>
      <KCard t="Llamada % (Ll)" v={fp(k.capL)} p={cp?fp(k.pcapL):null}/>
      <KCard t="Of/Lla % (Ll)" v={fp(k.ccpL)} p={cp?fp(k.pccpL):null}/>
    </div>
    <div className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">Mensajes</div>
    <div className="grid grid-cols-3 gap-2.5">
      <KCard t="Mensajes (FU)" v={fm(k.ms)} p={cp?fm(k.pms):null} icon="📨" vr="green"/>
      <KCard t="Ofertas (Msg)" v={fm(k.lM)} p={cp?fm(k.plM):null} icon="📩" vr="green"/>
      <KCard t="Lla. Agenda (Msg)" v={fm(k.aM)} p={cp?fm(k.paM):null} icon="📞" vr="green"/>
    </div>
    <div className="grid grid-cols-3 gap-2.5">
      <KCard t="Oferta % (Msg)" v={fp(k.ofpM)} p={cp?fp(k.pofpM):null}/>
      <KCard t="Llamada % (Msg)" v={fp(k.capM)} p={cp?fp(k.pcapM):null}/>
      <KCard t="Of/Lla % (Msg)" v={fp(k.ccpM)} p={cp?fp(k.pccpM):null}/>
    </div>
    <div className="grid grid-cols-5 gap-2.5">
      <div className="col-span-2 bg-neutral-900 rounded-xl border border-neutral-800 p-3">
        <div className="text-[10px] text-neutral-500 font-semibold uppercase tracking-widest mb-1">Distribución DMs</div>
        <div className="flex flex-wrap gap-2 mb-2">{pie.map((d,i)=><div key={i} className="flex items-center gap-1 text-[10px] text-neutral-500"><div className="w-2 h-2 rounded-full" style={{background:CC2[i%CC2.length]}}/>{d.name}</div>)}</div>
        <ResponsiveContainer width="100%" height={180}><PieChart><Pie data={pie} cx="50%" cy="50%" innerRadius={40} outerRadius={72} paddingAngle={2} dataKey="value" label={({percent,cx,cy,midAngle,innerRadius,outerRadius})=>{const r=outerRadius+16;const x=cx+r*Math.cos(-midAngle*Math.PI/180);const y=cy+r*Math.sin(-midAngle*Math.PI/180);return <text x={x} y={y} fill="#999" textAnchor="middle" fontSize={10} dominantBaseline="central">{(percent*100).toFixed(1)+"%"}</text>;}} labelLine={false}>
          {pie.map((_,i)=><Cell key={i} fill={CC2[i%CC2.length]}/>)}</Pie><Tooltip contentStyle={tts} itemStyle={{color:"#ccc"}} labelStyle={{color:"#FFD700"}}/></PieChart></ResponsiveContainer>
      </div>
      <div className="col-span-3 bg-neutral-900 rounded-xl border border-neutral-800 p-3">
        <div className="text-[10px] text-neutral-500 font-semibold uppercase tracking-widest mb-1">Convos vs Mensajes por grupo</div>
        <ResponsiveContainer width="100%" height={200}><BarChart data={bar} margin={{top:5,right:10,bottom:50,left:5}}>
          <CartesianGrid strokeDasharray="3 3" stroke="#222"/><XAxis dataKey="name" tick={{fill:"#555",fontSize:8}} angle={-45} textAnchor="end" interval={0}/>
          <YAxis tick={{fill:"#444",fontSize:9}}/><Tooltip contentStyle={tts} itemStyle={{color:"#ccc"}} labelStyle={{color:"#FFD700"}}/>
          <Bar dataKey="convos" name="Convos" fill="#FFD700" radius={[3,3,0,0]}/>
          <Bar dataKey="mensajes" name="Mensajes" fill="rgba(255,215,0,0.3)" radius={[3,3,0,0]}/>
        </BarChart></ResponsiveContainer>
      </div>
    </div>
    <FilterBar biz={cfg.biz} gb={gb} setGb={setGb} GS={GS} per={per} setPer={setPer} customDates={cd2} setCustomDates={setCd2} compOn={compOn} setCompOn={setCompOn}/>
    <div className="border border-neutral-800 rounded-xl overflow-hidden">
      <table className="w-full text-sm"><tbody>
        <tr className="bg-neutral-900">{cols.map((c,i)=><td key={i} className="px-3 py-1.5 font-bold text-white whitespace-nowrap text-xs">{i===0?"Total":c.k==="cv"?fm(totCv):c.k==="ms"?fm(totMs):c.k==="lL"?fm(totlL):c.k==="lM"?fm(totlM):c.k==="aL"?fm(totaL):c.k==="aM"?fm(totaM):c.k==="ofpL"?fp(k.ofpL):c.k==="capL"?fp(k.capL):c.k==="ccpL"?fp(k.ccpL):c.k==="ofpM"?fp(k.ofpM):c.k==="capM"?fp(k.capM):c.k==="ccpM"?fp(k.ccpM):""}</td>)}</tr>
        <tr className="bg-neutral-800">{cols.map((c,i)=><td key={i} className="px-3 py-1.5 font-semibold text-neutral-300 whitespace-nowrap text-xs">{i===0?"Media":c.k==="cv"?fm(avgCv,1):c.k==="ms"?fm(avgMs,1):c.k==="lL"?fm(avglL,1):c.k==="lM"?fm(avglM,1):c.k==="aL"?fm(avgaL,1):c.k==="aM"?fm(avgaM,1):c.k==="ofpL"?fp(avgOfpL):c.k==="capL"?fp(avgCapL):c.k==="ccpL"?fp(avgCcpL):c.k==="ofpM"?fp(avgOfpM):c.k==="capM"?fp(avgCapM):c.k==="ccpM"?fp(avgCcpM):""}</td>)}</tr>
      </tbody></table>
      <table className="w-full text-sm"><thead><tr className="bg-neutral-900">
        {cols.map((c,i)=><th key={i} className="px-3 py-2 text-left text-[10px] font-bold text-yellow-400 uppercase tracking-wider border-b border-neutral-800 whitespace-nowrap">{c.l}</th>)}
      </tr></thead><tbody>{td.map((r,ri)=><tr key={ri} className={ri%2===0?"bg-neutral-950":"bg-black"}>
        {cols.map((c,ci)=><td key={ci} className="px-3 py-1.5 text-neutral-300 whitespace-nowrap border-b border-neutral-900 text-sm">{c.r?c.r(r[c.k],r):(r[c.k]??"—")}</td>)}
      </tr>)}</tbody></table>
    </div>
  </div>;
}

/* ═══ ASISTENTE IA ═══ */
function AiAssistant(){
  const [msg,setMsg]=useState("");const [messages,setMessages]=useState([]);const [loading,setLoading]=useState(false);const [error,setError]=useState(null);
  const wc=msg.trim().split(/\s+/).filter(w=>w.length>0).length;
  const canSend=wc>0&&wc<=500&&!loading;

  const getSessionId=()=>{
    let sid=localStorage.getItem('ai_session_id');
    if(!sid){
      sid='session_'+Date.now()+'_'+Math.random().toString(36).slice(2,11);
      localStorage.setItem('ai_session_id',sid);
    }
    return sid;
  };

  const sendMessage=async()=>{
    if(!canSend)return;
    const userMsg=msg.trim();
    setMessages(p=>[...p,{role:"user",content:userMsg}]);
    setMsg("");setError(null);setLoading(true);
    try{
      const sessionId=getSessionId();
      const res=await fetch('https://samtomations.app.n8n.cloud/webhook/bcc35509-b729-448f-a069-2f6d46ac411d',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({message:userMsg,sessionId:sessionId})
      });
      console.log('Response status:',res.status);
      console.log('Response headers:',res.headers);
      if(!res.ok)throw new Error('Error al conectar con el asistente ('+res.status+')');
      const rawText=await res.text();
      console.log('Raw response:',rawText);
      console.log('Response length:',rawText.length);
      if(!rawText||rawText.trim()===''){
        throw new Error('El webhook devolvió una respuesta vacía. Verifica que el workflow en n8n esté activo y funcionando correctamente.');
      }
      let assistantMsg;
      try{
        const data=JSON.parse(rawText);
        console.log('Parsed JSON:',data);
        assistantMsg=data.Respuesta||data.respuesta||data.response||data.message||data.text||data.output||JSON.stringify(data);
      }catch(parseErr){
        console.log('JSON parse failed, using raw text');
        assistantMsg=rawText;
      }
      setMessages(p=>[...p,{role:"assistant",content:assistantMsg}]);
    }catch(e){
      console.error('Full error:',e);
      setError(e.message);
      setMessages(p=>[...p,{role:"assistant",content:"❌ Error: "+e.message}]);
    }finally{setLoading(false);}
  };

  return <div className="space-y-3">
    <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6">
      <div className="text-lg font-bold text-yellow-400 mb-1 flex items-center gap-2"><span>🤖</span><span>Asistente IA</span></div>
      <div className="text-xs text-neutral-500 mb-4">Haz preguntas sobre tus datos o solicita análisis.</div>

      <div className="bg-black rounded-lg border border-neutral-800 p-4 mb-3 max-h-[50vh] overflow-y-auto">
        {messages.length===0&&<div className="text-center text-neutral-600 text-sm py-8">No hay mensajes aún. Escribe algo para comenzar.</div>}
        {messages.map((m,i)=><div key={i} className={"mb-3 flex "+(m.role==="user"?"justify-end":"justify-start")}>
          <div className={"max-w-[80%] rounded-lg px-4 py-2 "+(m.role==="user"?"bg-yellow-400/10 border border-yellow-400/20":"bg-neutral-800 border border-neutral-700")}>
            <div className={"text-[10px] font-bold uppercase tracking-widest mb-1 "+(m.role==="user"?"text-yellow-400":"text-teal-400")}>{m.role==="user"?"Tú":"Asistente"}</div>
            <div className="text-sm text-white whitespace-pre-wrap">{m.content}</div>
          </div>
        </div>)}
        {loading&&<div className="flex justify-start mb-3">
          <div className="max-w-[80%] rounded-lg px-4 py-2 bg-neutral-800 border border-neutral-700">
            <div className="text-[10px] font-bold uppercase tracking-widest mb-1 text-teal-400">Asistente</div>
            <div className="text-sm text-neutral-400 animate-pulse">Escribiendo...</div>
          </div>
        </div>}
      </div>

      <div className="space-y-2">
        <textarea value={msg} onChange={e=>setMsg(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMessage();}}} placeholder="Escribe tu pregunta aquí... (Shift+Enter para nueva línea)" className="w-full bg-black border border-neutral-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-yellow-500 min-h-[80px] resize-none" disabled={loading}/>
        <div className="flex items-center justify-between">
          <div className={"text-xs "+(wc>500?"text-red-400":"text-neutral-500")}>{wc}/500 palabras</div>
          <button onClick={sendMessage} disabled={!canSend} className={"px-6 py-2 rounded-lg text-sm font-bold transition-all "+(canSend?"bg-yellow-400 text-black hover:bg-yellow-300":"bg-neutral-800 text-neutral-600 cursor-not-allowed")}>Enviar</button>
        </div>
        {error&&<div className="text-xs text-red-400">Error: {error}</div>}
      </div>
    </div>
  </div>;
}

/* ═══ CONTROL ═══ */
function Ctrl({cfg,setCfg}){
  const [pw,setPw]=useState("");const [ok,setOk]=useState(false);const [ni,setNi]=useState("");const [ef,setEf]=useState("closers");
  if(!ok) return <div className="flex items-center justify-center min-h-[60vh]">
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-8 max-w-sm w-full text-center">
      <div className="text-3xl mb-2">🔒</div><div className="text-lg font-bold text-yellow-400 mb-1">Panel de Control</div><div className="text-xs text-neutral-500 mb-5">Introduce la contraseña</div>
      <input type="password" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&pw==="SAMUEL")setOk(true);}} placeholder="Contraseña" className="w-full bg-black border border-neutral-700 rounded-lg px-4 py-2.5 text-white text-center text-sm focus:outline-none focus:border-yellow-500 mb-3"/>
      <button onClick={()=>{if(pw==="SAMUEL")setOk(true);}} className="w-full bg-yellow-400 text-black rounded-lg py-2.5 text-sm font-bold hover:bg-yellow-300">Acceder</button>
      {pw.length>0&&pw!=="SAMUEL"&&<div className="text-red-400 text-xs mt-2">Contraseña incorrecta</div>}
    </div></div>;
  const FS=[{k:"closers",l:"Closers"},{k:"setters",l:"Setters"},{k:"ofertas",l:"Ofertas (Nichos)"},{k:"sources",l:"Fuentes"},{k:"deals",l:"Ventas"},{k:"callTypes",l:"Tipos de Llamada"},{k:"callPlanTypes",l:"Call Plan Types"},{k:"metPago",l:"Método de Pago"}];
  const CF=[{k:"cA",l:"Com. Agencia"},{k:"cS",l:"Com. Setter"},{k:"cC",l:"Com. Closer"},{k:"cMS",l:"Com. Mgr Setters"},{k:"cMC",l:"Com. Mgr Closers"},{k:"cS1",l:"Com. Socio 1"},{k:"cS2",l:"Com. Socio 2"}];
  const add=()=>{if(!ni.trim())return;setCfg(p=>({...p,[ef]:[...p[ef],ni.trim()]}));setNi("");};
  const rm=(fld,i)=>setCfg(p=>({...p,[fld]:p[fld].filter((_,j)=>j!==i)}));
  return <div className="space-y-4">
    <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6">
      <div className="text-lg font-bold text-yellow-400 mb-1">Panel de Control</div><div className="text-xs text-neutral-500 mb-4">Cambios inmediatos.</div>
      <div className="mb-4"><div className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mb-1">Nombre</div><input type="text" value={cfg.biz} onChange={e=>setCfg(p=>({...p,biz:e.target.value}))} className="bg-black border border-neutral-700 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500 w-full max-w-xs"/></div>
      <div className="flex flex-wrap gap-1.5 mb-4">{FS.map(f2=><button key={f2.k} onClick={()=>setEf(f2.k)} className={"px-3 py-1.5 rounded-md text-xs font-bold "+(ef===f2.k?"bg-yellow-400 text-black":"bg-neutral-800 text-neutral-500 hover:text-white")}>{f2.l}</button>)}</div>
      <div className="bg-black rounded-lg border border-neutral-800 p-4">
        <div className="text-sm font-bold text-white mb-3">{FS.find(f2=>f2.k===ef)?.l}</div>
        <div className="flex flex-wrap gap-2 mb-3">{(cfg[ef]||[]).map((it,i)=><div key={i} className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-1.5"><span className="text-sm text-white">{it}</span><button onClick={()=>rm(ef,i)} className="text-red-400 text-xs font-bold ml-1">✕</button></div>)}</div>
        <div className="flex gap-2"><input type="text" value={ni} onChange={e=>setNi(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add()} placeholder="Añadir..." className="flex-1 max-w-xs bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-500"/><button onClick={add} className="bg-yellow-400 text-black px-4 py-2 rounded-md text-sm font-bold hover:bg-yellow-300">Añadir</button></div>
      </div>
    </div>
    <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6">
      <div className="text-sm font-bold text-yellow-400 mb-4">Comisiones (%)</div>
      <div className="grid grid-cols-4 gap-4">{CF.map(f2=><div key={f2.k}><div className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mb-1">{f2.l}</div><input type="number" step="0.01" min="0" max="1" value={cfg[f2.k]} onChange={e=>{const n=parseFloat(e.target.value);if(!isNaN(n))setCfg(p=>({...p,[f2.k]:n}));}} className="w-full bg-black border border-neutral-700 rounded-md px-3 py-2 text-sm text-yellow-400 font-bold focus:outline-none focus:border-yellow-500"/><div className="text-[10px] text-neutral-600 mt-1">{(cfg[f2.k]*100).toFixed(0)+"%"}</div></div>)}</div>
    </div>
  </div>;
}

/* ═══ INGESTA ═══ */
function Ingesta({NR,setNR,CK,setCK,SK,setSK,cfg}){
  const [tab,setTab]=useState("clientes");const [eR,setER]=useState(null);const [eD,setED]=useState({});const [nw,setNw]=useState(false);
  const startE=(r,i)=>{setER(i);setED({...r});};const cancelE=()=>{setER(null);setNw(false);setED({});};
  const saveN=i=>{const d={...eD,Rv:Number(eD.Rv)||0,Ca:Number(eD.Ca)||0};if(nw)setNR(p=>[...p,d]);else setNR(p=>p.map((r,j)=>j===i?d:r));cancelE();};
  const saveC=i=>{const d={...eD,Ca:Number(eD.Ca)||0,CC:Number(eD.CC)||0,LC:Number(eD.LC)||0,O:Number(eD.O)||0,Dp:Number(eD.Dp)||0,Ci:Number(eD.Ci)||0};if(nw)setCK(p=>[...p,d]);else setCK(p=>p.map((r,j)=>j===i?d:r));cancelE();};
  const saveS=i=>{const d={...eD,NC:Number(eD.NC)||0,LE:Number(eD.LE)||0,LA:Number(eD.LA)||0};if(nw)setSK(p=>[...p,d]);else setSK(p=>p.map((r,j)=>j===i?d:r));cancelE();};
  const inp=f=><input value={eD[f]||""} onChange={e=>setED(p=>({...p,[f]:e.target.value}))} className="bg-black border border-neutral-700 rounded px-2 py-1 text-xs text-white w-full focus:outline-none focus:border-yellow-500"/>;
  const tabs2=[{id:"clientes",l:"Clientes"},{id:"closer",l:"Closer KPI"},{id:"setter",l:"Setter KPI"}];
  return <div className="space-y-3"><div className="bg-neutral-900 rounded-xl border border-neutral-800 p-4">
    <div className="text-lg font-bold text-yellow-400 mb-1">Ingesta de Datos</div><div className="text-xs text-neutral-500 mb-3">Edita datos directamente. Con Google Sheets se sincronizarán.</div>
    <div className="flex gap-1 mb-3">{tabs2.map(t=><button key={t.id} onClick={()=>{setTab(t.id);cancelE();}} className={"px-3 py-1.5 rounded-md text-xs font-bold "+(tab===t.id?"bg-yellow-400 text-black":"bg-neutral-800 text-neutral-500")}>{t.l}</button>)}</div>
    {tab==="clientes"&&<div><button onClick={()=>{setNw(true);setER(-1);setED({Em:"",N:"",P:"Spain",D:fmtD(new Date()),Cl:cfg.closers[0]||"",Sr:cfg.sources[0]||"",St:cfg.setters[0]||"",Dl:cfg.deals[0]||"",Of:cfg.ofertas[0]||"",Rv:0,Ca:0,TP:"",Ju:"",TX:"",CoT:"",IG:""});}} className="bg-yellow-400 text-black px-3 py-1.5 rounded-md text-xs font-bold mb-2">+ Nuevo</button>
      <div className="overflow-x-auto"><table className="w-full text-xs"><thead className="sticky top-0"><tr className="bg-neutral-800"><th className="px-2 py-2 text-yellow-400 text-left">#</th><th className="px-2 py-2 text-yellow-400 text-left">Email</th><th className="px-2 py-2 text-yellow-400 text-left">Nombre</th><th className="px-2 py-2 text-yellow-400 text-left">País</th><th className="px-2 py-2 text-yellow-400 text-left">Fecha</th><th className="px-2 py-2 text-yellow-400 text-left">Closer</th><th className="px-2 py-2 text-yellow-400 text-left">Source</th><th className="px-2 py-2 text-yellow-400 text-left">Setter</th><th className="px-2 py-2 text-yellow-400 text-left">Deal</th><th className="px-2 py-2 text-yellow-400 text-left">Oferta</th><th className="px-2 py-2 text-yellow-400 text-left">Revenue</th><th className="px-2 py-2 text-yellow-400 text-left">Cash</th><th className="px-2 py-2 text-yellow-400 text-left">Tipo Pago</th><th className="px-2 py-2 text-yellow-400 text-left">Justificante</th><th className="px-2 py-2 text-yellow-400 text-left">TXID</th><th className="px-2 py-2 text-yellow-400 text-left">Cod.Trans.</th><th className="px-2 py-2 text-yellow-400 text-left">Cuenta IG</th><th className="px-2 py-2 text-yellow-400 text-left">Act.</th></tr></thead><tbody>
        {nw&&<tr className="bg-teal-950/30">{[null,"Em","N","P","D","Cl","Sr","St","Dl","Of","Rv","Ca","TP","Ju","TX","CoT","IG"].map((f,i)=><td key={i} className="px-2 py-1">{i===0?"✨":inp(f)}</td>)}<td className="px-2 py-1"><button onClick={()=>saveN(-1)} className="text-emerald-400 text-xs font-bold mr-1">💾</button><button onClick={cancelE} className="text-red-400 text-xs font-bold">✕</button></td></tr>}
        {NR.map((r,i)=><tr key={i} className={i%2===0?"bg-neutral-950":"bg-black"}>{eR===i?<>{[null,"Em","N","P","D","Cl","Sr","St","Dl","Of","Rv","Ca","TP","Ju","TX","CoT","IG"].map((f,j)=><td key={j} className="px-2 py-1">{j===0?(i+1):inp(f)}</td>)}<td className="px-2 py-1"><button onClick={()=>saveN(i)} className="text-emerald-400 text-xs font-bold mr-1">💾</button><button onClick={cancelE} className="text-red-400 text-xs font-bold">✕</button></td></>:<><td className="px-2 py-1 text-neutral-500">{i+1}</td><td className="px-2 py-1 text-neutral-300">{r.Em}</td><td className="px-2 py-1 text-white">{r.N}</td><td className="px-2 py-1 text-neutral-300">{r.P}</td><td className="px-2 py-1 text-neutral-300">{r.D}</td><td className="px-2 py-1 text-neutral-300">{r.Cl}</td><td className="px-2 py-1 text-neutral-300">{r.Sr}</td><td className="px-2 py-1 text-neutral-300">{r.St}</td><td className="px-2 py-1 text-neutral-300">{r.Dl}</td><td className="px-2 py-1 text-neutral-300">{r.Of}</td><td className="px-2 py-1 text-yellow-400">{fe(r.Rv)}</td><td className="px-2 py-1 text-emerald-400">{fe(r.Ca)}</td><td className="px-2 py-1 text-neutral-300">{r.TP}</td><td className="px-2 py-1 text-neutral-300">{r.Ju}</td><td className="px-2 py-1 text-neutral-300">{r.TX}</td><td className="px-2 py-1 text-neutral-300">{r.CoT}</td><td className="px-2 py-1 text-neutral-300">{r.IG}</td><td className="px-2 py-1"><button onClick={()=>startE(r,i)} className="text-yellow-400 text-xs mr-1">✏️</button><button onClick={()=>setNR(p=>p.filter((_,j)=>j!==i))} className="text-red-400 text-xs">🗑️</button></td></>}</tr>)}
      </tbody></table></div></div>}
    {tab==="closer"&&<div><button onClick={()=>{setNw(true);setER(-1);setED({Cl:cfg.closers[0]||"",D:fmtD(new Date()),CT:cfg.callTypes[0]||"",Ca:0,CC:0,LC:0,O:0,Dp:0,Ci:0});}} className="bg-yellow-400 text-black px-3 py-1.5 rounded-md text-xs font-bold mb-2">+ Nuevo</button>
      <div className="overflow-x-auto"><table className="w-full text-xs"><thead className="sticky top-0"><tr className="bg-neutral-800"><th className="px-2 py-2 text-yellow-400 text-left">#</th><th className="px-2 py-2 text-yellow-400 text-left">Closer</th><th className="px-2 py-2 text-yellow-400 text-left">Fecha</th><th className="px-2 py-2 text-yellow-400 text-left">Call Type</th><th className="px-2 py-2 text-yellow-400 text-left">Calls</th><th className="px-2 py-2 text-yellow-400 text-left">Cancel</th><th className="px-2 py-2 text-yellow-400 text-left">Live</th><th className="px-2 py-2 text-yellow-400 text-left">Ofertas</th><th className="px-2 py-2 text-yellow-400 text-left">Dep.</th><th className="px-2 py-2 text-yellow-400 text-left">Cierres</th><th className="px-2 py-2 text-yellow-400 text-left">Act.</th></tr></thead><tbody>
        {nw&&<tr className="bg-teal-950/30">{[null,"Cl","D","CT","Ca","CC","LC","O","Dp","Ci"].map((f,i)=><td key={i} className="px-2 py-1">{i===0?"✨":inp(f)}</td>)}<td className="px-2 py-1"><button onClick={()=>saveC(-1)} className="text-emerald-400 text-xs font-bold mr-1">💾</button><button onClick={cancelE} className="text-red-400 text-xs font-bold">✕</button></td></tr>}
        {CK.map((r,i)=><tr key={i} className={i%2===0?"bg-neutral-950":"bg-black"}>{eR===i?<>{[null,"Cl","D","CT","Ca","CC","LC","O","Dp","Ci"].map((f,j)=><td key={j} className="px-2 py-1">{j===0?(i+1):inp(f)}</td>)}<td className="px-2 py-1"><button onClick={()=>saveC(i)} className="text-emerald-400 text-xs font-bold mr-1">💾</button><button onClick={cancelE} className="text-red-400 text-xs font-bold">✕</button></td></>:<><td className="px-2 py-1 text-neutral-500">{i+1}</td><td className="px-2 py-1 text-white">{r.Cl}</td><td className="px-2 py-1 text-neutral-300">{r.D}</td><td className="px-2 py-1 text-neutral-300">{r.CT}</td><td className="px-2 py-1 text-yellow-400">{r.Ca}</td><td className="px-2 py-1 text-red-400">{r.CC}</td><td className="px-2 py-1 text-emerald-400">{r.LC}</td><td className="px-2 py-1 text-neutral-300">{r.O}</td><td className="px-2 py-1 text-neutral-300">{r.Dp}</td><td className="px-2 py-1 text-neutral-300">{r.Ci}</td><td className="px-2 py-1"><button onClick={()=>startE(r,i)} className="text-yellow-400 text-xs mr-1">✏️</button><button onClick={()=>setCK(p=>p.filter((_,j)=>j!==i))} className="text-red-400 text-xs">🗑️</button></td></>}</tr>)}
      </tbody></table></div></div>}
    {tab==="setter"&&<div><button onClick={()=>{setNw(true);setER(-1);setED({St:cfg.setters[0]||"",D:fmtD(new Date()),DT:cfg.callPlanTypes[0]||"",NC:0,LE:0,LA:0});}} className="bg-yellow-400 text-black px-3 py-1.5 rounded-md text-xs font-bold mb-2">+ Nuevo</button>
      <div className="overflow-x-auto"><table className="w-full text-xs"><thead className="sticky top-0"><tr className="bg-neutral-800"><th className="px-2 py-2 text-yellow-400 text-left">#</th><th className="px-2 py-2 text-yellow-400 text-left">Setter</th><th className="px-2 py-2 text-yellow-400 text-left">Fecha</th><th className="px-2 py-2 text-yellow-400 text-left">Tipo</th><th className="px-2 py-2 text-yellow-400 text-left">Convos</th><th className="px-2 py-2 text-yellow-400 text-left">Links</th><th className="px-2 py-2 text-yellow-400 text-left">Llamadas</th><th className="px-2 py-2 text-yellow-400 text-left">Act.</th></tr></thead><tbody>
        {nw&&<tr className="bg-teal-950/30">{[null,"St","D","DT","NC","LE","LA"].map((f,i)=><td key={i} className="px-2 py-1">{i===0?"✨":inp(f)}</td>)}<td className="px-2 py-1"><button onClick={()=>saveS(-1)} className="text-emerald-400 text-xs font-bold mr-1">💾</button><button onClick={cancelE} className="text-red-400 text-xs font-bold">✕</button></td></tr>}
        {SK.map((r,i)=><tr key={i} className={i%2===0?"bg-neutral-950":"bg-black"}>{eR===i?<>{[null,"St","D","DT","NC","LE","LA"].map((f,j)=><td key={j} className="px-2 py-1">{j===0?(i+1):inp(f)}</td>)}<td className="px-2 py-1"><button onClick={()=>saveS(i)} className="text-emerald-400 text-xs font-bold mr-1">💾</button><button onClick={cancelE} className="text-red-400 text-xs font-bold">✕</button></td></>:<><td className="px-2 py-1 text-neutral-500">{i+1}</td><td className="px-2 py-1 text-white">{r.St}</td><td className="px-2 py-1 text-neutral-300">{r.D}</td><td className="px-2 py-1 text-neutral-300">{r.DT}</td><td className="px-2 py-1 text-yellow-400">{r.NC}</td><td className="px-2 py-1 text-yellow-400">{r.LE}</td><td className="px-2 py-1 text-emerald-400">{r.LA}</td><td className="px-2 py-1"><button onClick={()=>startE(r,i)} className="text-yellow-400 text-xs mr-1">✏️</button><button onClick={()=>setSK(p=>p.filter((_,j)=>j!==i))} className="text-red-400 text-xs">🗑️</button></td></>}</tr>)}
      </tbody></table></div></div>}
  </div></div>;
}

/* ═══ DATA FETCHER ═══ */
const WORKER_URL = 'https://salesup-sheets-proxy.samuel-cifg.workers.dev';

function parseDate(d){
  if(!d)return null;
  if(d.includes('/')){
    const p=d.split('/');
    if(p.length===3){
      let[dd,mm,yy]=p;
      dd=dd.padStart(2,'0');mm=mm.padStart(2,'0');
      if(yy.length===2)yy=(parseInt(yy)>50?'19':'20')+yy;
      if(yy.length===4)return yy+'-'+mm+'-'+dd;
      return '20'+yy+'-'+mm+'-'+dd;
    }
    if(p.length===2){const[mm,yy]=p;return(yy.length===2?'20'+yy:yy)+'-'+mm.padStart(2,'0')+'-01';}
  }
  return d;
}

function parseNombres(rows){
  if(!rows||rows.length<2)return[];
  const h=rows[0];
  const ix=(name)=>{const n=name.toLowerCase();return h.findIndex(c=>c.replace(/\n/g,' ').replace(/\s+/g,' ').trim().toLowerCase()===n);};
  const iEm=ix('email'),iN=ix('nombre'),iP=ix('paises'),iD=ix('dates'),iCl=ix('closers'),iSr=ix('sources'),iSt=ix('setters'),iDl=ix('deals'),iOf=ix('offers'),iRv=ix('revenue'),iCa=ix('cash'),iTP=ix('tipo de pago'),iJu=ix('justificante'),iTX=ix('txid'),iCoT=ix('codigo transaccion'),iIG=ix('cuenta ig');
  return rows.slice(1).filter(r=>r&&r.length>2&&(iN>=0?r[iN]:r[2])).map(r=>({
    Em:iEm>=0?r[iEm]||'':'',
    N:iN>=0?r[iN]||'':'',
    P:iP>=0?r[iP]||'':'',
    D:parseDate(iD>=0?r[iD]:''),
    Cl:iCl>=0?r[iCl]||'':'',
    Sr:iSr>=0?r[iSr]||'':'',
    St:iSt>=0?r[iSt]||'':'',
    Dl:iDl>=0?r[iDl]||'':'',
    Of:iOf>=0?r[iOf]||'':'',
    Rv:pn(iRv>=0?r[iRv]:0),
    Ca:pn(iCa>=0?r[iCa]:0),
    TP:iTP>=0?r[iTP]||'':'',
    Ju:iJu>=0?r[iJu]||'':'',
    TX:iTX>=0?r[iTX]||'':'',
    CoT:iCoT>=0?r[iCoT]||'':'',
    IG:iIG>=0?r[iIG]||'':'',
  }));
}

function parseCloser(rows){
  if(!rows||rows.length<2)return[];
  const h=rows[0];
  const ix=(name)=>{const n=name.toLowerCase();return h.findIndex(c=>c.replace(/\n/g,' ').replace(/\s+/g,' ').trim().toLowerCase()===n);};
  const fuzzy=(keywords)=>h.findIndex(c=>{const cl=c.replace(/\n/g,' ').replace(/\s+/g,' ').trim().toLowerCase();return keywords.every(k=>cl.includes(k.toLowerCase()));});
  const iCl=ix('closers'),iD=ix('dates'),iCT=ix('call type'),iCa=ix('calls'),iCC=ix('cancel calls'),iLC=ix('live calls'),iO=fuzzy(['oferta','#1']),iDp=fuzzy(['deposito','#1']),iCi=fuzzy(['cierre','#1']);
  return rows.slice(1).filter(r=>r&&r.length>2&&r[0]).map(r=>({
    Cl:iCl>=0?r[iCl]||'':'',
    D:parseDate(iD>=0?r[iD]:''),
    CT:iCT>=0?r[iCT]||'':'',
    Ca:parseInt(iCa>=0?r[iCa]:0)||0,
    CC:parseInt(iCC>=0?r[iCC]:0)||0,
    LC:parseInt(iLC>=0?r[iLC]:0)||0,
    O:parseInt(iO>=0?r[iO]:0)||0,
    Dp:parseInt(iDp>=0?r[iDp]:0)||0,
    Ci:parseInt(iCi>=0?r[iCi]:0)||0,
  }));
}

function parseSetter(rows){
  if(!rows||rows.length<2)return[];
  const h=rows[0];
  const ix=(name)=>{const n=name.toLowerCase();return h.findIndex(c=>c.replace(/\n/g,' ').replace(/\s+/g,' ').trim().toLowerCase()===n);};
  const fuzzy=(keywords)=>h.findIndex(c=>{const cl=c.replace(/\n/g,' ').replace(/\s+/g,' ').trim().toLowerCase();return keywords.every(k=>cl.includes(k.toLowerCase()));});
  const iSt=ix('setters'),iD=ix('dates'),iDT=fuzzy(['dm','type']),iNC=fuzzy(['nuevas','convo']),iLE=fuzzy(['links','enviados']),iLA=fuzzy(['llamadas','agendadas']);
  return rows.slice(1).filter(r=>r&&r.length>2&&r[0]).map(r=>({
    St:iSt>=0?r[iSt]||'':'',
    D:parseDate(iD>=0?r[iD]:''),
    DT:iDT>=0?r[iDT]||'':'',
    NC:parseInt(iNC>=0?r[iNC]:0)||0,
    LE:parseInt(iLE>=0?r[iLE]:0)||0,
    LA:parseInt(iLA>=0?r[iLA]:0)||0,
  }));
}

function loadCache(){
  try{
    const c=localStorage.getItem('salesup_cache');
    if(c){const d=JSON.parse(c);return{NR:d.NR||[],CK:d.CK||[],SK:d.SK||[],ts:d.ts||null};}
  }catch(e){}
  return{NR:[],CK:[],SK:[],ts:null};
}
function saveCache(NR,CK,SK){
  try{localStorage.setItem('salesup_cache',JSON.stringify({NR,CK,SK,ts:Date.now()}));}catch(e){}
}

function useSheetData(){
  const cached=useMemo(()=>loadCache(),[]);
  const [NR,setNR]=useState(cached.NR);
  const [CK,setCK]=useState(cached.CK);
  const [SK,setSK]=useState(cached.SK);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState(null);
  const [lastUpdate,setLastUpdate]=useState(cached.ts?new Date(cached.ts):null);

  const fetchData=async()=>{
    try{
      setLoading(true);
      const res=await fetch(WORKER_URL+'/?action=readAll');
      const data=await res.json();
      const nr=data['Nombres']?.values?parseNombres(data['Nombres'].values):NR;
      const ck=data['Closer KPI']?.values?parseCloser(data['Closer KPI'].values):CK;
      const sk=data['Setter KPI']?.values?parseSetter(data['Setter KPI'].values):SK;
      setNR(nr);setCK(ck);setSK(sk);
      saveCache(nr,ck,sk);
      setLastUpdate(new Date());
      setError(null);
    }catch(e){setError('Sin conexión — mostrando última carga');}
    finally{setLoading(false);}
  };

  useEffect(()=>{
    fetchData();
    const interval=setInterval(()=>{
      fetchData();
    },5*60*1000);
    return()=>clearInterval(interval);
  },[]);

  return{NR,setNR,CK,setCK,SK,setSK,loading,error,lastUpdate,refresh:fetchData};
}

/* ═══ APP ═══ */
export default function App(){
  const [tab,setTab]=useState("clientes");const [cfg,setCfg]=useState(DEF);
  const {NR,setNR,CK,setCK,SK,setSK,loading,error,lastUpdate,refresh}=useSheetData();
  const tabs=[{id:"asistente",l:"Asistente IA",i:"🤖"},{id:"clientes",l:"Clientes",i:"👤"},{id:"closer",l:"Closer KPI",i:"📞"},{id:"setter",l:"Setter KPI",i:"💬"},{id:"ingesta",l:"Ingesta",i:"📝"},{id:"control",l:"Control",i:"⚙️"}];
  return <div className="min-h-screen bg-black text-white" style={{fontFamily:"'DM Sans',system-ui,sans-serif"}}>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
    <style>{`input[type="date"]::-webkit-calendar-picker-indicator{filter:invert(1);cursor:pointer;}`}</style>
    <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-xl border-b border-neutral-900">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3"><span className="text-xl font-extrabold text-white tracking-tighter">sales</span><span className="text-xl font-extrabold text-yellow-400 italic tracking-tighter">UP</span><span className="text-[10px] text-neutral-600 uppercase tracking-widest ml-2">Dashboard</span>
          <button onClick={refresh} className="text-[10px] text-neutral-500 hover:text-yellow-400 ml-2" title="Actualizar datos">🔄</button>
          {loading&&<span className="text-[10px] text-yellow-400 animate-pulse">Cargando...</span>}
          {error&&<span className="text-[10px] text-red-400">Error: {error}</span>}
          {lastUpdate&&!loading&&<span className="text-[10px] text-neutral-600">{lastUpdate.toLocaleTimeString("es-ES")}</span>}
        </div>
        <nav className="flex gap-1 bg-neutral-900 rounded-lg p-1 border border-neutral-800">
          {tabs.map(t=><button key={t.id} onClick={()=>setTab(t.id)} className={"px-3 py-1.5 rounded-md text-sm font-semibold transition-all "+(tab===t.id?"bg-yellow-400 text-black":"text-neutral-500 hover:text-white")}>{t.i+" "+t.l}</button>)}
        </nav>
      </div>
    </header>
    <main className="max-w-7xl mx-auto px-4 py-4">
      {tab==="asistente"&&<AiAssistant/>}
      {tab==="clientes"&&<Nombres cfg={cfg} NR={NR}/>}
      {tab==="closer"&&<Closer cfg={cfg} CK={CK}/>}
      {tab==="setter"&&<SetterDB cfg={cfg} SK={SK}/>}
      {tab==="ingesta"&&<Ingesta NR={NR} setNR={setNR} CK={CK} setCK={setCK} SK={SK} setSK={setSK} cfg={cfg}/>}
      {tab==="control"&&<Ctrl cfg={cfg} setCfg={setCfg}/>}
    </main>
  </div>;
}
