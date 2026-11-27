(()=>{"use strict";
const fallback=document.getElementById("kxTextEffectsDialog"),shortcut=document.getElementById("kxTextEffectsLaunch");const motionPage=()=>document.querySelector('.kx-page[aria-label="Motion"]');const panel=motionPage()||fallback?.querySelector("[data-text-host]")||document.querySelector("#kxSettings section");if(!panel)return;
const key="ksyusha-text-effects-v1",defaults={name:"tech",headings:"original",individual:{},intensity:1,speed:5,color:"#00a878",enabled:true};
let prefs={...defaults};try{Object.assign(prefs,JSON.parse(localStorage.getItem(key)||"{}"))}catch{}
const modes={original:"Original",tech:"TechText",elastic:"ElasticMesh-style",foil:"Metallic foil",depth:"3D depth",glass:"Liquid Glass",gradient:"Emerald gradient",light:"Cursor lighting",glitch:"Glitch Text",decrypt:"Decrypt / Scramble",particle:"Particle / Scatter"};
const wrap=document.createElement("div");wrap.className="kx-v2-controls";
wrap.innerHTML='<h3>Text effects — choose a style</h3><p>Pick an effect for each text group. Changes preview instantly.</p><label>Enable text effects <input id="kxV2Enabled" type="checkbox"></label><div class="kx-v2-preview" aria-hidden="true">Ksyusha.</div><label>Name <select id="kxV2Name"></select></label><label>Section headings <select id="kxV2Headings"></select></label><label>Intensity <input id="kxV2Intensity" type="range" min="0" max="2" step=".1"></label><label>Cycle duration <input id="kxV2Speed" type="range" min="2" max="15" step="1"></label><label>Effect color <input id="kxV2Color" type="color"></label><button type="button" id="kxV2Reset">Hold 2 seconds to reset text effects</button><button type="button" id="kxV2ResetAccessible">Reset text effects (confirmation)</button><p id="kxV2Status" role="status"></p>';
panel.prepend(wrap);
function relocate(){const page=motionPage();if(page&&wrap.parentElement!==page)page.prepend(wrap)}
if(shortcut)shortcut.addEventListener("click",()=>{relocate();const page=motionPage(),dialog=page?.closest("dialog");if(page&&dialog){const nav=dialog.querySelector(".kx-sidebar");const motion=[...nav?.querySelectorAll("button")||[]].find(b=>b.textContent.trim()==="Motion");if(!dialog.open)dialog.showModal();motion?.click();wrap.scrollIntoView({block:"nearest"});}else if(fallback){fallback.querySelector("[data-text-host]").prepend(wrap);if(!fallback.open)fallback.showModal()}});
fallback?.querySelector("[data-text-close]")?.addEventListener("click",()=>fallback.close());
if(!motionPage()){const observer=new MutationObserver(()=>{if(motionPage()){relocate();observer.disconnect()}});observer.observe(document.body,{childList:true,subtree:true})}

const controls={enabled:wrap.querySelector("#kxV2Enabled"),name:wrap.querySelector("#kxV2Name"),headings:wrap.querySelector("#kxV2Headings"),intensity:wrap.querySelector("#kxV2Intensity"),speed:wrap.querySelector("#kxV2Speed"),color:wrap.querySelector("#kxV2Color")};
for(const id of ["name","headings"])for(const [value,label] of Object.entries(modes))controls[id].add(new Option(label,value));
const effectButtons={};
for(const target of ["name","headings"]){const select=controls[target],label=select.closest("label"),group=document.createElement("fieldset");group.className="kx-v2-picker";const legend=document.createElement("legend");legend.textContent=target==="name"?"Name effect":"Section heading effect";group.append(legend);const grid=document.createElement("div");grid.className="kx-v2-options";group.append(grid);effectButtons[target]=[];
for(const [mode,title] of Object.entries(modes)){const button=document.createElement("button");button.type="button";button.dataset.mode=mode;button.textContent=title;button.setAttribute("aria-pressed","false");button.addEventListener("click",()=>{select.value=mode;select.dispatchEvent(new Event("input",{bubbles:true}))});grid.append(button);effectButtons[target].push(button)}label.after(group);label.hidden=true;label.style.display="none"}
const names=[...document.querySelectorAll(".hero h1,.hero .cyrillic"),wrap.querySelector(".kx-v2-preview")],headings=[...document.querySelectorAll(".section-head h2")],all=[...names,...headings];const reduce=matchMedia("(prefers-reduced-motion: reduce)");
const individual=document.createElement("fieldset");individual.innerHTML='<legend>Customize individual headers</legend><label>Header <select id="kxHeaderTarget"></select></label><label>Style <select id="kxHeaderStyle"></select></label><label>Speed <input type="range" min="2" max="15" id="kxHeaderSpeed"></label><label>Intensity <input type="range" min="0" max="2" step=".1" id="kxHeaderPower"></label><label>Color <input type="color" id="kxHeaderColor"></label><button type="button" id="kxHeaderClear">Use group defaults</button>';wrap.append(individual);
const targets=all.filter(e=>!e.classList.contains("kx-v2-preview"));const target=individual.querySelector("#kxHeaderTarget"),style=individual.querySelector("#kxHeaderStyle"),speed=individual.querySelector("#kxHeaderSpeed"),power=individual.querySelector("#kxHeaderPower"),color=individual.querySelector("#kxHeaderColor");targets.forEach((e,i)=>target.add(new Option(e.textContent.trim().replace(/\s+/g," "),String(i))));for(const [v,l] of Object.entries(modes))style.add(new Option(l,v));const base=e=>({mode:names.includes(e)?prefs.name:prefs.headings,speed:prefs.speed,intensity:prefs.intensity,color:prefs.color});const config=e=>({...base(e),...prefs.individual?.[targets.indexOf(e)]});function refreshIndividual(){const c=config(targets[+target.value]);style.value=c.mode;speed.value=c.speed;power.value=c.intensity;color.value=c.color;}target.onchange=refreshIndividual;for(const input of [style,speed,power,color])input.oninput=()=>{prefs.individual={...prefs.individual,[target.value]:{mode:style.value,speed:+speed.value,intensity:+power.value,color:color.value}};save()};individual.querySelector("#kxHeaderClear").onclick=()=>{delete prefs.individual?.[target.value];refreshIndividual();save()};refreshIndividual();

/* Local canvas effects, integrated with the main picker. No Pro license required. */
const rendered=new Map();
const originalLabels=new Map(all.map(el=>[el,el.getAttribute("aria-label")||[...el.childNodes].map(n=>n.nodeName==="BR"?"\n":n.textContent).join("").trim()]));
const alphabet="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+";
function removeRendered(el){const item=rendered.get(el);if(item){item.dispose();rendered.delete(el)}}
function mountRendered(el,mode){
  const canvas=document.createElement("canvas");canvas.className="kx-custom-text-canvas";canvas.setAttribute("aria-hidden","true");
  const ctx=canvas.getContext("2d",{willReadFrequently:true});if(!ctx)return;
  let raf=0,points=[],lines=[],w=0,h=0,dpr=1,start=performance.now(),mx=-999,my=-999,ready=false,visible=true,last=0;
  el.append(canvas);
  const original=el.getAttribute("aria-label")||[...el.childNodes].filter(n=>n!==canvas).map(n=>n.nodeName==="BR"?"\n":n.textContent).join("");
  const label=(originalLabels.get(el)||original).trim();
  function color(){const s=getComputedStyle(el);return s.getPropertyValue("--kx-hue").trim()||s.color}
  function paintText(textLines,fill){
    ctx.fillStyle=fill;ctx.textBaseline="middle";ctx.textAlign="left";
    for(const line of textLines){ctx.font=line.font;ctx.fillText(line.text,line.x,line.y,line.max)}
  }
  function resize(){
    const b=el.getBoundingClientRect();if(b.width<2||b.height<2)return;
    const style=getComputedStyle(el),size=parseFloat(style.fontSize)||28;
    w=Math.round(b.width);h=Math.round(b.height);dpr=Math.min(devicePixelRatio||1,2);
    canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
    const raw=label.split("\n"),font=(style.fontWeight||700)+" "+size+"px "+style.fontFamily;
    ctx.font=font;const lh=Math.min(parseFloat(style.lineHeight)||size*1.1,h/raw.length);
    lines=raw.map((text,i)=>{const width=Math.min(w,ctx.measureText(text).width);return {text,font,x:style.textAlign==="center"||el.classList.contains("kx-v2-preview")?(w-width)/2:style.textAlign==="right"?w-width:0,y:(h-lh*raw.length)/2+lh*(i+.5),max:w}});
    if(mode==="particle"){
      ctx.clearRect(0,0,w,h);paintText(lines,"#fff");
      const data=ctx.getImageData(0,0,canvas.width,canvas.height).data;points=[];
      const step=Math.max(3,Math.ceil(Math.sqrt(w*h/4500)));
      for(let y=1;y<h;y+=step)for(let x=1;x<w;x+=step){const i=(Math.floor(y*dpr)*canvas.width+Math.floor(x*dpr))*4;if(data[i+3]>100)points.push({x:x+(Math.random()-.5)*190,y:y+(Math.random()-.5)*190,tx:x,ty:y})}
      if(!points.length){ready=false;el.classList.remove("kx-custom-text-mounted");ctx.clearRect(0,0,w,h);return;}
    }
    ready=true;el.classList.add("kx-custom-text-mounted");start=performance.now();wake();
  }
  function wake(){if(!raf&&ready&&visible&&!document.hidden)raf=requestAnimationFrame(frame)}
  function frame(now){
    raf=0;if(!ready||!visible||document.hidden)return;
    if(now-last<30){wake();return}last=now;
    const cfg=config(el),power=Math.max(0,Number(cfg.intensity)||0),elapsed=now-start;
    ctx.clearRect(0,0,w,h);
    if(mode==="decrypt"){
      const progress=Math.min(1,elapsed/Math.max(250,(Number(cfg.speed)||5)*120));
      paintText(lines.map(line=>({...line,text:[...line.text].map((ch,i)=>/\s/.test(ch)||i<Math.ceil(line.text.length*progress)||Math.random()>Math.min(1,power)?ch:alphabet[Math.floor(Math.random()*alphabet.length)]).join("")})),color());
      if(progress<1||document.body.classList.contains("rgb-mode"))wake();
    }else{
      ctx.fillStyle=color();let moving=false;
      for(const p of points){const dx=p.tx-mx,dy=p.ty-my,d=Math.hypot(dx,dy)||1,f=Math.max(0,1-d/120)*42*power;const tx=p.tx+dx/d*f,ty=p.ty+dy/d*f;p.x+=(tx-p.x)*.075;p.y+=(ty-p.y)*.075;if(Math.abs(tx-p.x)+Math.abs(ty-p.y)>.4)moving=true;ctx.beginPath();ctx.arc(p.x,p.y,1.1,0,Math.PI*2);ctx.fill()}
      if(moving||document.body.classList.contains("rgb-mode"))wake();
    }
  }
  function trigger(){start=performance.now();wake()}
  function move(e){const b=el.getBoundingClientRect();mx=e.clientX-b.left;my=e.clientY-b.top;if(mode==="particle")wake()}
  function leave(){mx=my=-999;wake()}
  function burst(){if(mode==="particle"){const pwr=Number(config(el).intensity)||0;for(const p of points){p.x+=(Math.random()-.5)*190*pwr;p.y+=(Math.random()-.5)*190*pwr}}trigger()}
  const ro=typeof ResizeObserver==="function"?new ResizeObserver(resize):null;ro?.observe(el);
  const io=typeof IntersectionObserver==="function"?new IntersectionObserver(es=>{visible=es[0].isIntersecting;if(visible)trigger()}):null;io?.observe(el);
  el.addEventListener("pointerenter",trigger);el.addEventListener("pointermove",move,{passive:true});el.addEventListener("pointerleave",leave);el.addEventListener("pointercancel",leave);el.addEventListener("click",burst);
  document.addEventListener("visibilitychange",wake);window.addEventListener("resize",resize);
  rendered.set(el,{mode,refresh:trigger,dispose(){cancelAnimationFrame(raf);ro?.disconnect();io?.disconnect();el.removeEventListener("pointerenter",trigger);el.removeEventListener("pointermove",move);el.removeEventListener("pointerleave",leave);el.removeEventListener("pointercancel",leave);el.removeEventListener("click",burst);document.removeEventListener("visibilitychange",wake);window.removeEventListener("resize",resize);el.classList.remove("kx-custom-text-mounted");canvas.remove()}});
  resize();document.fonts?.ready.then(()=>{if(canvas.isConnected)resize()});
}
function syncRendered(el,mode){
  if(reduce.matches||!["decrypt","particle"].includes(mode)){removeRendered(el);return}
  const current=rendered.get(el);
  if(current?.mode===mode){current.refresh();return}
  removeRendered(el);mountRendered(el,mode)
}
reduce.addEventListener?.("change",()=>apply());

function apply(){refreshIndividual();for(const target of ["name","headings"])for(const button of effectButtons[target])button.setAttribute("aria-pressed",String(button.dataset.mode===prefs[target]));for(const el of all){const c=config(el);const mode=prefs.enabled?c.mode:"original";el.classList.toggle("kx-v2-effect",mode!=="original"&&mode!=="tech"&&mode!=="glitch");el.dataset.kxEffect=mode;el.style.setProperty("--kx-power",c.intensity);el.style.setProperty("--kx-speed",c.speed+"s");el.style.setProperty("--kx-hue",c.color);syncRendered(el,mode)}}
function sync(){for(const [k,e] of Object.entries(controls)){if(e.type==="checkbox")e.checked=Boolean(prefs[k]);else e.value=prefs[k]}apply()}
function save(){try{localStorage.setItem(key,JSON.stringify(prefs))}catch{}apply();wrap.querySelector("#kxV2Status").textContent=prefs.enabled?"Name: "+modes[prefs.name]+" · Headings: "+modes[prefs.headings]:"Text effects disabled."}
for(const [k,e] of Object.entries(controls)){e.addEventListener("input",()=>{prefs[k]=e.type==="checkbox"?e.checked:e.type==="range"?Number(e.value):e.value;save()})}
for(const el of all){let pending=0;el.addEventListener("pointermove",e=>{if(reduce.matches||!prefs.enabled||el.dataset.kxEffect==="original")return;const x=e.clientX,y=e.clientY;if(pending)cancelAnimationFrame(pending);pending=requestAnimationFrame(()=>{pending=0;const b=el.getBoundingClientRect(),dx=Math.max(-1,Math.min(1,(x-b.left-b.width/2)/Math.max(1,b.width/2))),dy=Math.max(-1,Math.min(1,(y-b.top-b.height/2)/Math.max(1,b.height/2)));el.style.setProperty("--kx-x",(dx*50+50)+"%");el.style.setProperty("--kx-y",(dy*50+50)+"%");el.style.setProperty("--kx-dx",(dx*8*prefs.intensity)+"deg");el.style.setProperty("--kx-dy",(-dy*8*prefs.intensity)+"deg");el.style.setProperty("--kx-px",(dx*20*prefs.intensity)+"px");el.style.setProperty("--kx-py",(dy*20*prefs.intensity)+"px");el.style.setProperty("--kx-scale",1+.04*prefs.intensity)})},{passive:true});const clear=()=>{if(pending)cancelAnimationFrame(pending);pending=0;for(const k of ["--kx-x","--kx-y","--kx-dx","--kx-dy","--kx-px","--kx-py","--kx-scale"])el.style.removeProperty(k)};el.addEventListener("pointerleave",clear);el.addEventListener("pointerup",clear);el.addEventListener("pointercancel",clear)}
const reset=wrap.querySelector("#kxV2Reset"),status=wrap.querySelector("#kxV2Status");let frame=0,start=0;
function stop(){cancelAnimationFrame(frame);frame=0;reset.style.setProperty("--kx-hold",0)}
function restore(){stop();prefs={...defaults,individual:{}};sync();save();status.textContent="Text effects reset to original."}
function hold(t){const p=Math.min(1,(t-start)/2000);reset.style.setProperty("--kx-hold",p);if(p===1)restore();else frame=requestAnimationFrame(hold)}
function begin(){if(frame)return;start=performance.now();frame=requestAnimationFrame(hold)}
reset.addEventListener("pointerdown",e=>{if(e.button!==0)return;reset.setPointerCapture(e.pointerId);begin()});
for(const event of ["pointerup","pointercancel","lostpointercapture","blur"])reset.addEventListener(event,stop);
reset.addEventListener("keydown",e=>{if(e.key===" "||e.key==="Enter"){e.preventDefault();if(!e.repeat)begin()}});reset.addEventListener("keyup",stop);
wrap.querySelector("#kxV2ResetAccessible").onclick=()=>{if(confirm("Reset text effects to original?"))restore()};
sync();
})();