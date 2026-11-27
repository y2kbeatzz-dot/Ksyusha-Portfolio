(()=>{"use strict";
const reduce=matchMedia("(prefers-reduced-motion: reduce)"),q=(s,el=document)=>el.querySelector(s);
function read(key,def){try{return {...def,...JSON.parse(localStorage.getItem(key)||"{}")}}catch{return {...def}}}
function write(key,obj){try{localStorage.setItem(key,JSON.stringify(obj))}catch{}}
const gallery=q("#gallery");
if(gallery){const cards=[...gallery.querySelectorAll("button")];if(cards.length>1){
const key="kx-carousel-v2",cfg=read(key,{speed:14,auto:true}),n=cards.length,step=360/n;let angle=0,target=null,raf=0,last=0,visible=true,over=false,drag=null,blockClick=0,velocity=0;
gallery.classList.add("kx-cylinder");gallery.setAttribute("aria-label","Circular featured project gallery");
const ctl=document.createElement("div");ctl.className="kx-carousel-controls";ctl.innerHTML='<button type="button" data-prev aria-label="Previous project">←</button><button type="button" data-next aria-label="Next project">→</button><label>Autoplay <input type="checkbox" data-auto></label><label>Speed <input type="range" min="0" max="30" data-speed></label>';gallery.after(ctl);
const auto=q("[data-auto]",ctl),speed=q("[data-speed]",ctl);auto.checked=cfg.auto;speed.value=cfg.speed;
function norm(a){return ((a+180)%360+360)%360-180}
function render(){const w=gallery.clientWidth,cw=Math.min(220,Math.max(130,w*.35)),radius=Math.max(cw*.9,Math.min(w*.33,440));gallery.style.setProperty("--kc-width",cw+"px");cards.forEach((b,i)=>{const a=norm(i*step+angle),rad=a*Math.PI/180,depth=Math.cos(rad),x=Math.sin(rad)*radius;const on=depth>-.35;b.style.setProperty("--kc-x",x+"px");b.style.setProperty("--kc-y",((1-depth)*20)+"px");b.style.setProperty("--kc-z",((depth-1)*radius*.7)+"px");b.style.setProperty("--kc-angle",(-a*.66)+"deg");b.style.setProperty("--kc-layer",String(Math.round((depth+1)*100)));b.style.setProperty("--kc-opacity",on?String(Math.max(.18,.45+.55*depth)):"0");b.style.pointerEvents=on?"":"none";b.tabIndex=on?0:-1;b.setAttribute("aria-hidden",String(!on))})}
function wake(){if(!raf&&visible&&!document.hidden)raf=requestAnimationFrame(tick)}
function tick(t){raf=0;const dt=last?Math.min(.05,(t-last)/1000):0;last=t;if(!visible||document.hidden)return;
if(target!==null){const d=target-angle;if(reduce.matches||Math.abs(d)<.1){angle=target;target=null}else angle+=d*Math.min(1,dt*10)}
else if(!drag&&!reduce.matches&&cfg.auto&&!over&&!gallery.contains(document.activeElement))angle-=Number(cfg.speed)*dt;
render();if(target!==null||(!reduce.matches&&cfg.auto&&!over&&!gallery.contains(document.activeElement)&&!drag))wake();else last=0}
function focusIndex(i){const raw=-i*step;target=angle+norm(raw-angle);if(reduce.matches){angle=target;target=null;render()}else wake();cards[i].click()}
function current(){return ((Math.round(-angle/step)%n)+n)%n}
q("[data-prev]",ctl).onclick=()=>focusIndex((current()+n-1)%n);q("[data-next]",ctl).onclick=()=>focusIndex((current()+1)%n);
auto.onchange=()=>{cfg.auto=auto.checked;write(key,cfg);wake()};speed.oninput=()=>{cfg.speed=+speed.value;write(key,cfg);wake()};
gallery.addEventListener("pointerenter",()=>{over=true});gallery.addEventListener("pointerleave",()=>{over=false;wake()});
gallery.addEventListener("focusout",()=>requestAnimationFrame(wake));
gallery.addEventListener("pointerdown",e=>{if(e.button!==0)return;drag={id:e.pointerId,start:e.clientX,last:e.clientX,time:performance.now(),moved:false};target=null;velocity=0});
gallery.addEventListener("pointermove",e=>{if(!drag||e.pointerId!==drag.id)return;const dx=e.clientX-drag.last,t=performance.now();if(!drag.moved&&Math.abs(e.clientX-drag.start)>7){drag.moved=true;gallery.setPointerCapture(e.pointerId);gallery.classList.add("kx-dragging")}if(drag.moved){angle+=dx*.34;velocity=dx/Math.max(10,t-drag.time);render()}drag.last=e.clientX;drag.time=t});
function end(e){if(!drag||drag.id!==e.pointerId)return;if(drag.moved){blockClick=performance.now()+300;target=Math.round((angle+velocity*90*.6)/step)*step;wake()}drag=null;gallery.classList.remove("kx-dragging");wake()}
gallery.addEventListener("pointerup",end);gallery.addEventListener("pointercancel",end);gallery.addEventListener("lostpointercapture",end);
gallery.addEventListener("click",e=>{if(e.isTrusted&&performance.now()<blockClick){e.preventDefault();e.stopImmediatePropagation()}},true);
cards.forEach((b,i)=>b.addEventListener("click",e=>{if(e.isTrusted){target=angle+norm(-i*step-angle);wake()}}));
if("IntersectionObserver"in window)new IntersectionObserver(es=>{visible=es[0].isIntersecting;if(!visible){cancelAnimationFrame(raf);raf=0;last=0}else wake()}).observe(gallery);
document.addEventListener("visibilitychange",()=>{last=0;wake()});window.addEventListener("resize",render);reduce.addEventListener?.("change",wake);render();wake();
}}
const host=q(".hero-main .actions");if(!host)return;
const key="kx-digital-card-v2",prefs=read(key,{style:"holo",strap:false,shine:70});const launch=document.createElement("button");launch.type="button";launch.className="pill";launch.textContent="Digital Card ✧";host.append(launch);
const dialog=document.createElement("dialog");dialog.className="kx-card-dialog";dialog.setAttribute("aria-labelledby","kx-card-title");
dialog.innerHTML='<div class="kx-card-head"><h2 id="kx-card-title">Digital Card</h2><button type="button" data-close>Close ×</button></div><div class="kx-card-actions"><button type="button" data-card-style="holo">Holographic</button><button type="button" data-card-style="reflective">Reflective</button></div><div class="kx-card-stage"><svg class="kx-strap" aria-hidden="true"><path fill="none" stroke="#123f31" stroke-width="19" stroke-linecap="round"/><path fill="none" stroke="#46b58b" stroke-width="11" stroke-linecap="round"/></svg><article class="kx-id-card"><small>KSYUSHA / DIGITAL ID</small><div class="kx-card-art"><img src="assets/card-art-preview.svg" alt="Anime character wearing green headphones"></div><div><div class="kx-card-name">Ксюша</div><small>DEVELOPER · DIGITAL CREATOR</small></div><div class="kx-card-bottom"><a href="https://guns.lol/life999" target="_blank" rel="noopener">Public profiles ↗</a><img src="assets/profile-qr.svg" width="65" height="65" alt="QR code for public profiles"></div></article></div><div class="kx-card-actions"><label>Show lanyard <input type="checkbox" data-strap></label><label>Shine <input type="range" min="0" max="100" data-shine></label><button type="button" data-share>Share profile</button></div><p class="kx-card-status" role="status"></p>';
document.body.append(dialog);const stage=q(".kx-card-stage",dialog),card=q(".kx-id-card",dialog),strap=q("[data-strap]",dialog),shine=q("[data-shine]",dialog),status=q(".kx-card-status",dialog);let drag=null,raf=0,x=0,y=0,vx=0,vy=0,rx=0,ry=0;
function strapPath(){if(!prefs.strap||!dialog.open)return;const s=stage.getBoundingClientRect(),b=card.getBoundingClientRect(),cx=b.left+b.width/2-s.left,cy=b.top+9-s.top;const path="M "+(s.width*.40)+" -12 Q "+(s.width*.40)+" "+(cy*.55)+" "+cx+" "+cy+" Q "+(s.width*.60)+" "+(cy*.55)+" "+(s.width*.60)+" -12";stage.querySelectorAll("path").forEach(p=>p.setAttribute("d",path))}
function paint(){card.style.setProperty("--dx",x+"px");card.style.setProperty("--dy",y+"px");card.style.setProperty("--swing",x*.11+"deg");card.style.setProperty("--rx",rx+"deg");card.style.setProperty("--ry",ry+"deg");strapPath()}
function settle(){raf=0;if(!dialog.open||drag||reduce.matches)return;vx=(vx-x*.07)*.84;vy=(vy-y*.07)*.84;x+=vx;y+=vy;if(Math.abs(x)+Math.abs(y)+Math.abs(vx)+Math.abs(vy)<.25){x=y=vx=vy=0;paint();return}paint();raf=requestAnimationFrame(settle)}
function apply(){card.dataset.style=prefs.style;stage.dataset.strap=String(prefs.strap);strap.checked=prefs.strap;shine.value=prefs.shine;card.style.setProperty("--shine",prefs.shine/100);dialog.querySelectorAll("[data-card-style]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.cardStyle===prefs.style)));if(!prefs.strap){x=y=vx=vy=0}requestAnimationFrame(paint)}
dialog.querySelectorAll("[data-card-style]").forEach(b=>b.onclick=()=>{prefs.style=b.dataset.cardStyle;write(key,prefs);apply()});strap.onchange=()=>{prefs.strap=strap.checked;write(key,prefs);apply()};shine.oninput=()=>{prefs.shine=+shine.value;write(key,prefs);apply()};
launch.onclick=()=>{dialog.showModal();apply()};q("[data-close]",dialog).onclick=()=>dialog.close();dialog.addEventListener("click",e=>{if(e.target===dialog){const b=dialog.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)dialog.close()}});
dialog.addEventListener("close",()=>{cancelAnimationFrame(raf);raf=0;drag=null;x=y=vx=vy=rx=ry=0;launch.focus()});
card.addEventListener("pointermove",e=>{if(reduce.matches)return;const b=card.getBoundingClientRect(),px=(e.clientX-b.left)/b.width,py=(e.clientY-b.top)/b.height;card.style.setProperty("--cx",px*100+"%");card.style.setProperty("--cy",py*100+"%");if(drag){x=Math.max(-85,Math.min(85,e.clientX-drag.x));y=Math.max(-45,Math.min(100,e.clientY-drag.y))}else{rx=(.5-py)*15;ry=(px-.5)*15}paint()});
card.addEventListener("pointerdown",e=>{if(!prefs.strap||reduce.matches||e.button!==0||e.target.closest("a"))return;cancelAnimationFrame(raf);drag={x:e.clientX-x,y:e.clientY-y};card.setPointerCapture(e.pointerId)});
function release(){if(!drag)return;drag=null;vx=vy=0;cancelAnimationFrame(raf);raf=requestAnimationFrame(settle)}
for(const ev of ["pointerup","pointercancel","lostpointercapture"])card.addEventListener(ev,release);
card.addEventListener("pointerleave",()=>{if(!drag){rx=ry=0;paint()}});
q("[data-share]",dialog).onclick=async()=>{try{const url="https://guns.lol/life999";if(navigator.share){await navigator.share({title:"Ксюша",url});status.textContent="Profile shared."}else if(navigator.clipboard){await navigator.clipboard.writeText(url);status.textContent="Profile link copied."}else status.textContent=url}catch(e){if(e.name!=="AbortError")status.textContent="Profile: https://guns.lol/life999"}};
window.addEventListener("resize",strapPath);apply();
})();