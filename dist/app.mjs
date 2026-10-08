import {estimateProject,formatMoney,formatBudgetRange,buildBrief,SCOPE_HINTS} from './calculator.mjs';
import {CONTACT,DESIGN_HINTS} from './config.mjs';
const $=(s,root=document)=>root.querySelector(s);
const $$=(s,root=document)=>[...root.querySelectorAll(s)];
const form=$('#calculator-form'),area=$('#area-number'),range=$('#area-range'),scope=$('#scope'),design=$('#with-design');
const storageKey='ted-calculator-v2';
let lastValid={object:'flat',scope:'turnkey',area:72,design:'none'};
let toastTimer;
const showToast=text=>{const el=$('#toast');el.textContent=text;el.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('visible'),3200);};
function currentParams(){return {object:$('input[name="object"]:checked',form).value,scope:scope.value,area:Number(area.value),design:scope.value==='design'?'ted':design.value};}
function paintEstimate(persist=true){
  const params=currentParams();
  design.disabled=params.scope==='design';
  $('#design-toggle').hidden=design.disabled;
  $('#designer-hint').textContent=DESIGN_HINTS[params.design];
  $('#scope-hint').textContent=SCOPE_HINTS[params.scope];
  const valid=area.value.trim()!==''&&Number.isInteger(params.area)&&params.area>=20&&params.area<=500;
  area.setAttribute('aria-invalid',String(!valid));$('#area-error').hidden=valid;
  if(!valid){$('#estimate-total').textContent='Уточните площадь';$('#estimate-breakdown').replaceChildren();$('#estimate-note').textContent='Для расчёта нужна площадь от 20 до 500 м².';return false;}
  const e=estimateProject(params);lastValid=params;range.value=String(params.area);
  range.style.setProperty('--range-progress',`${(params.area-20)/480*100}%`);
  $('#estimate-total').textContent=e.manual?'По индивидуальной смете':formatBudgetRange(e.low,e.high);
  const breakdown=$('#estimate-breakdown');breakdown.replaceChildren();
  if(!e.manual){for(const [label,values] of (e.designOnly?[['Дизайн-проект TED',e.work]]:[['Ремонтные работы',e.work],['Дизайн-проект TED',e.extra]])){const row=document.createElement('div');const name=document.createElement('span');name.textContent=label;const val=document.createElement('span');val.textContent=values[1]===0?'Не включён':`${formatMoney(values[0])} – ${formatMoney(values[1])} ₸`;row.append(name,val);breakdown.append(row);}}
  $('#estimate-note').textContent=e.manual?'Для дома или коммерческого помещения уточним состояние, инженерию и состав работ. Выбор дизайнера будет указан в запросе.':e.designOnly?'Планировка, рабочие чертежи и 3D. Ремонт и авторский надзор не включены.':params.design==='own'?'Ваш дизайнер оплачивается вами отдельно. Материалы, мебель, техника и авторский надзор не включены.':'Материалы, мебель, техника и авторский надзор не включены.';
  if(persist){try{localStorage.setItem(storageKey,JSON.stringify(params));}catch{}}
  return true;
}
function restore(){try{const saved=JSON.parse(localStorage.getItem(storageKey));if(saved){estimateProject(saved);const radio=$$('input[name="object"]',form).find(el=>el.value===saved.object);if(radio)radio.checked=true;area.value=saved.area;scope.value=saved.scope;design.value=saved.design;}}catch{}paintEstimate(false);}
form.addEventListener('input',e=>{if(e.target===range)area.value=range.value;paintEstimate();});
form.addEventListener('change',()=>paintEstimate());
form.addEventListener('submit',e=>{e.preventDefault();if(paintEstimate()){openBrief();}else area.focus();});
$$('[data-service]').forEach(button=>button.addEventListener('click',()=>{const service=button.dataset.service;if(service==='design'){scope.value='design';}else{$$('input[name="object"]',form).forEach(r=>r.checked=r.value===service);if(scope.value==='design')scope.value='turnkey';}paintEstimate();$('#calculator').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}));

const menu=$('#menu-toggle'),nav=$('#main-nav');
function closeMenu(){menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Открыть меню');nav.classList.remove('is-open');}
menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Закрыть меню':'Открыть меню');nav.classList.toggle('is-open',open);});
$$('a',nav).forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
document.addEventListener('click',e=>{if(!e.target.closest('.site-header'))closeMenu();});
window.matchMedia('(min-width: 981px)').addEventListener('change',closeMenu);

const concepts={flat:{src:'/assets/hero.webp',title:'Тёплый минимализм',alt:'AI-концепция светлой квартиры с натуральными материалами'},house:{src:'/assets/house.webp',title:'Больше воздуха',alt:'AI-концепция частного дома с деревянной лестницей'},cafe:{src:'/assets/cafe.webp',title:'Место встречи',alt:'AI-концепция современной кофейни в тёплых тонах'}};
$$('[data-filter]').forEach(button=>button.addEventListener('click',()=>{const filter=button.dataset.filter;$$('[data-filter]').forEach(b=>{const active=b===button;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});$$('.project').forEach(p=>p.hidden=filter!=='all'&&p.dataset.category!==filter);$('#project-grid').dataset.filter=filter;}));
function showDialog(id){closeMenu();const d=$('#'+id);if(!d.open)d.showModal();document.body.classList.add('dialog-open');}
$$('dialog').forEach(d=>{d.addEventListener('close',()=>{if(!document.querySelector('dialog[open]'))document.body.classList.remove('dialog-open');});d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}});});
$$('[data-close]').forEach(b=>b.addEventListener('click',()=>$('#'+b.dataset.close).close()));
$$('[data-concept]').forEach(b=>b.addEventListener('click',()=>{const c=concepts[b.dataset.concept];$('#concept-image').src=c.src;$('#concept-image').alt=c.alt;$('#concept-title').textContent=c.title;showDialog('concept-dialog');}));

function updateShare(){const text=$('#brief-text').value;$('#share-brief').href='https://wa.me/'+CONTACT.whatsapp+'?text='+encodeURIComponent(text);}
let briefSnapshot='';
function openBrief(){if(!paintEstimate()){showToast('Уточните площадь в калькуляторе');$('#calculator').scrollIntoView();area.focus();return;}const snapshot=JSON.stringify(lastValid);if(snapshot!==briefSnapshot){$('#brief-text').value=buildBrief(lastValid);briefSnapshot=snapshot;}$('#brief-feedback').textContent='';updateShare();showDialog('brief-dialog');}
$$('[data-brief]').forEach(b=>b.addEventListener('click',openBrief));
$('#brief-text').addEventListener('input',updateShare);
$('#copy-brief').addEventListener('click',async()=>{const text=$('#brief-text');try{if(!navigator.clipboard)throw new Error('Clipboard unavailable');await navigator.clipboard.writeText(text.value);$('#brief-feedback').textContent='Запрос скопирован. Можно отправить его команде TED.';}catch{text.focus();text.select();$('#brief-feedback').textContent='Текст выделен. Скопируйте его вручную или скачайте файл.';}});
$('#download-brief').addEventListener('click',()=>{const blob=new Blob(['\uFEFF'+$('#brief-text').value],{type:'text/plain;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='ted-renovation-zapros-na-proekt.txt';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);$('#brief-feedback').textContent='Запрос подготовлен к скачиванию. Он не отправлен команде.';});
$('#privacy-button').addEventListener('click',()=>showDialog('privacy-dialog'));
$('#clear-settings').addEventListener('click',()=>{try{localStorage.removeItem(storageKey);form.reset();paintEstimate(false);$('#privacy-feedback').textContent='Параметры удалены. Калькулятор возвращён к исходному примеру.';}catch{$('#privacy-feedback').textContent='Браузер не разрешил доступ к локальному хранилищу.';}});
$('#year').textContent=new Date().getFullYear();
$$('[data-phone]').forEach(a=>{a.href='tel:'+CONTACT.phone;a.textContent=CONTACT.display;});
$$('[data-whatsapp]').forEach(a=>a.href='https://wa.me/'+CONTACT.whatsapp+'?text='+encodeURIComponent('Здравствуйте! Хочу обсудить ремонт в Астане.'));
restore();
