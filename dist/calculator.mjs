import {RATES,DESIGN_LABELS} from './config.mjs';
export const OBJECT_LABELS={flat:'Квартира',house:'Частный дом',commercial:'Коммерческое помещение'};
export const SCOPE_LABELS={refresh:'Косметический ремонт',capital:'Капитальный ремонт',turnkey:'Ремонт под ключ',design:'Только дизайн-проект'};
export const SCOPE_HINTS={refresh:'Обновление покрытий без замены основных коммуникаций.',capital:'Демонтаж, подготовка поверхностей, электрика, сантехника и отделка — по смете.',turnkey:'Комплекс работ до готовой отделки. Материалы и дизайн считаются отдельно.',design:'Планировка, рабочие чертежи и 3D-визуализации. Без ремонта и авторского надзора.'};
export function estimateProject({object,scope,area,design='none'}){
  if(!Object.hasOwn(OBJECT_LABELS,object)||!Object.hasOwn(RATES,scope)||!Object.hasOwn(DESIGN_LABELS,design))throw new RangeError('Неизвестный тип проекта');
  if(!Number.isInteger(area)||area<20||area>500)throw new RangeError('Площадь должна быть целым числом от 20 до 500');
  const designOnly=scope==='design',hasDesign=design==='ted'&&!designOnly;
  if(object!=='flat')return {manual:true,low:null,high:null,work:null,extra:null,hasDesign,designOnly};
  const price=rates=>rates.map(rate=>Math.round(rate*area/1000)*1000);
  const work=price(RATES[scope]),extra=hasDesign?price(RATES.design):[0,0];
  return {manual:false,low:work[0]+extra[0],high:work[1]+extra[1],work,extra,hasDesign,designOnly};
}
export const formatMoney=n=>new Intl.NumberFormat('ru-RU',{maximumFractionDigits:0}).format(n);
export function formatBudgetRange(low,high){
  if(low>=1000000){const f=n=>new Intl.NumberFormat('ru-RU',{maximumFractionDigits:3}).format(n/1000000);return `${f(low)} – ${f(high)} млн ₸`;}
  return `${formatMoney(low)} – ${formatMoney(high)} ₸`;
}
export function buildBrief(params){
  const e=estimateProject(params);
  const price=e.manual?'Стоимость: индивидуальная смета.':`Предварительный диапазон: ${formatMoney(e.low)} – ${formatMoney(e.high)} ₸.`;
  const detail=e.hasDesign&&!e.manual?`\nВ том числе дизайн TED: ${formatMoney(e.extra[0])} – ${formatMoney(e.extra[1])} ₸.`:'';
  return `Здравствуйте, команда TED.renovation! Хочу обсудить проект в Астане.\n\nОбъект: ${OBJECT_LABELS[params.object]}\nПлощадь: ${params.area} м²\nЗадача: ${SCOPE_LABELS[params.scope]}\nДизайн: ${DESIGN_LABELS[e.designOnly?'ted':params.design||'none']}\n\n${price}${detail}\nНе фиксированная смета. Стоимость уточняется после осмотра и согласования работ.\nМатериалы, мебель, техника и авторский надзор не включены.${params.design==='own'&&!e.designOnly?' Услуги моего дизайнера оплачиваются отдельно.':''}\n\nМои пожелания:\n\nЖелаемые сроки:\n\nОриентир по бюджету:\n`;
}
