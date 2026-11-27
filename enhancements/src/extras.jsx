import React,{useState,useEffect,useRef} from 'react';
import {createRoot} from 'react-dom/client';
import Magnet from './upgrades/Magnet.jsx';
import SpotlightCard from './upgrades/SpotlightCard.jsx';
import PixelTransition from './upgrades/PixelTransition.jsx';
import ScrollReveal from './upgrades/ScrollReveal.jsx';
import GlassSurface from './upgrades/GlassSurface.jsx';
import './extras.css';
const q=(s,p=document)=>p.querySelector(s);
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const fine=matchMedia('(pointer:fine)');
const defs={magnet:false,spotlight:false,pixel:false,reveal:false,glass:false};
let prefs={...defs};try{Object.assign(prefs,JSON.parse(localStorage.getItem('kx-extra-effects-v2')||'{}'))}catch{}
const roots=new Map();
function mount(el,kind,render){if(!el||roots.has(el))return;const host=document.createElement('div');host.className='kx-extra-'+kind;el.append(host);const rt=createRoot(host);roots.set(el,{rt,host,kind});rt.render(render);}
function clean(el){const o=roots.get(el);if(!o)return;o.rt.unmount();o.host.remove();roots.delete(el);}
function PortalSlot({node}){const ref=useRef(null);useEffect(()=>{const slot=ref.current;if(!slot)return;const marker=document.createComment('kx-original-position');node.before(marker);slot.append(node);return()=>{if(marker.parentNode)marker.replaceWith(node)}},[node]);return <span ref={ref} className="kx-extra-slot"/>;}
const magnetic=[...document.querySelectorAll('.hero .actions>.pill,#contact .actions>.pill')];
const spotCards=[...document.querySelectorAll('.skill-grid>article,.research-grid>article')];
const intro=q('#about .statement');
const artwork=q('#kxHeroCharacter');
const settings=q('.kx-page[aria-label="Motion"]')||q('#kxSettings section');
function apply(){
 for(const [el,o] of roots)if(!prefs[o.kind]||reduced.matches||(o.kind==='magnet'&&!fine.matches))clean(el);
 if(reduced.matches)return;
 if(prefs.magnet&&fine.matches)for(const el of magnetic){let host=el.closest('.kx-extra-anchor');if(host&&roots.has(host))continue;if(!host){host=document.createElement('span');host.className='kx-extra-anchor';el.before(host);host.append(el);}mount(host,'magnet',<Magnet padding={32} magnetStrength={5} maxOffset={8} tilt={2}><PortalSlot node={el}/></Magnet>);}
 if(prefs.spotlight)for(const el of spotCards)mount(el,'spotlight',<SpotlightCard theme="light" spotlightColor="#45bd8b" intensity={.25} proximity={0} ambient={false} flare={false} grain={0} style={{width:'100%',height:'100%',padding:0,border:0,borderRadius:'inherit',background:'transparent',boxShadow:'none'}}/>);
 if(prefs.reveal&&intro&&!roots.has(intro)){const text=intro.textContent;mount(intro,'reveal',<ScrollReveal mode="once" effect="rise" enableBlur={false} baseOpacity={.5} baseRotation={0} containerClassName="kx-reveal-original" textClassName="kx-reveal-original-text">{text}</ScrollReveal>);intro.classList.add('kx-extra-reveal-active');}
 if(!prefs.reveal)intro?.classList.remove('kx-extra-reveal-active');
 if(prefs.pixel&&artwork)mount(artwork,'pixel',<PixelTransition firstContent={<img src="assets/character-cutout.svg" alt="Character artwork"/>} secondContent={<img src="assets/card-art-preview.svg" alt="Digital card artwork"/>} gridSize={12} fps={30} trigger="click" aspectRatio="1 / 1" pixelColor="#52c99a"/>);
 if(prefs.glass&&settings)mount(settings,'glass',<GlassSurface width="100%" height={70} borderRadius={20} refraction={false} blur={9} saturation={1.2}><span>Liquid Glass · React Bits</span></GlassSurface>);
}
if(settings){const panel=document.createElement('fieldset');panel.className='kx-extra-settings';panel.innerHTML='<legend>Additional React Bits effects</legend>'+Object.entries({magnet:'Magnetic buttons',spotlight:'Spotlight cards',pixel:'Pixel artwork transition',reveal:'Scroll reveal',glass:'Glass surface'}).map(([k,v])=>'<label>'+v+' <input type="checkbox" data-extra="'+k+'"></label>').join('');settings.append(panel);for(const input of panel.querySelectorAll('input')){input.checked=!!prefs[input.dataset.extra];input.onchange=()=>{prefs[input.dataset.extra]=input.checked;try{localStorage.setItem('kx-extra-effects-v2',JSON.stringify(prefs))}catch{}apply()}}}
reduced.addEventListener('change',()=>{if(reduced.matches)intro?.classList.remove('kx-extra-reveal-active');apply()});fine.addEventListener('change',apply);apply();
