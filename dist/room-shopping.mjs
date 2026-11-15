import {wallSegments,floorArea,perimeter} from './room-geometry.mjs';
import {materialFor} from './room-materials.mjs';
import {productFor} from './room-products.mjs';
const titles={paint:'Краска',wallpaper:'Обои',plaster:'Штукатурка',laminate:'Ламинат',tile:'Плитка',stretch:'Натяжной потолок'};
const fmt=n=>n.toLocaleString('ru-RU',{maximumFractionDigits:2});
const ceil=n=>Math.ceil(n-1e-9);
export function materialRows(p){
 const reserve=p.materialPlan?.reserve??10,factor=1+reserve/100,walls=wallSegments(p),groups=new Map();
 p.walls.forEach((s,i)=>{const key=JSON.stringify([s.finish,s.texture,s.color,s.product]);if(!groups.has(key))groups.set(key,{surface:s,indices:[],area:0});const g=groups.get(key);g.indices.push(i);g.area+=Math.max(0,walls[i].length*p.height-p.openings.filter(o=>o.wall===i).reduce((sum,o)=>sum+o.width*o.height,0));});
 const rows=[];
 for(const g of groups.values()){
  const s=g.surface,product=productFor(s),name=product?`${product.brand} ${product.name} · ${product.article}`:`${titles[s.finish]} · ${materialFor(s).name} · ${s.color}`,where='Стены '+g.indices.map(i=>i+1).join(', ');
  let quantity=1,unit='позиция целиком',amount=`${fmt(g.area)} м²`,note='Площадь за вычетом окон и дверей. Расход и число слоёв — по выбранному составу; литры и килограммы не рассчитаны.';
  if(s.finish==='wallpaper'){
   if(product?.roll){const {width,length}=product.roll,strip=p.height+.1,perRoll=Math.floor((length+1e-9)/strip),base=g.indices.reduce((sum,i)=>sum+ceil(walls[i].length/width),0),strips=ceil(base*factor);if(perRoll){quantity=ceil(strips/perRoll);unit='рулон';}amount=perRoll?`${ceil(strips/perRoll)} рул.`:'Нужна проверка раскроя';note=`Рулон ${fmt(width)} × ${fmt(length)} м; ${base} полос + ${reserve}% запаса = ${strips}. Полоса ${fmt(strip)} м (высота + 10 см), ${perRoll} полос из рулона. Проёмы не вычитаем из раскроя, остатки по ширине не переносим между стенами. Без подбора рисунка.`;}
   else {amount=`${fmt(g.area*factor)} м² с запасом`;note=`Чистая площадь ${fmt(g.area)} м² + ${reserve}%. Для числа рулонов выберите товар с известными шириной, длиной и раппортом. Площадь не заменяет раскрой.`;}
  }
  rows.push({name,where,amount,note,quantity,unit,url:product?.url});
 }
 const area=floorArea(p),floor=productFor(p.floor),required=area*factor,pack=floor?.packArea;
 rows.push({name:floor?`${floor.brand} ${floor.name} · ${floor.article}`:`${titles[p.floor.finish]} · ${materialFor(p.floor,true).name} · ${p.floor.color}`,where:'Пол',quantity:pack?ceil(required/pack):required,unit:pack?'упаковка':'м²',amount:pack?`${ceil(required/pack)} упак. · ${fmt(ceil(required/pack)*pack)} м²`:`${fmt(required)} м² с запасом`,note:`Площадь ${fmt(area)} м² + ${reserve}% = ${fmt(required)} м².${pack?` В упаковке ${pack.toLocaleString('ru-RU',{maximumFractionDigits:3})} м²; округление вверх.`:' Упаковки — после выбора конкретного товара.'} Схему укладки и подрезку нужно уточнить.`,url:floor?.url});
 rows.push({name:titles[p.ceiling.finish]+' · '+p.ceiling.color,where:'Потолок',quantity:1,unit:'позиция целиком',amount:`${fmt(area)} м²`,note:p.ceiling.finish==='stretch'?'Площадь помещения для замерщика; раскрой полотна выполняет подрядчик.':'Расход краски и число слоёв — по выбранному составу.'});
 const base=Math.max(0,perimeter(p)-p.openings.filter(o=>o.type==='door').reduce((sum,o)=>sum+o.width,0));rows.push({name:'Плинтус',where:'Периметр без дверей',quantity:base*factor,unit:'пог. м',amount:`${fmt(base*factor)} пог. м с запасом`,note:`Без запаса ${fmt(base)} м. Длину планок, соединители и углы подобрать отдельно.`});
 return rows;
}
export function materialListText(p){return `ПРЕДВАРИТЕЛЬНЫЙ СПИСОК МАТЕРИАЛОВ\nЗапас для пола, обоев и плинтуса: ${p.materialPlan?.reserve??10}%.\n${materialRows(p).map(r=>`${r.where} — ${r.name}: ${r.amount}\n${r.note}${r.url?'\n'+r.url:''}`).join('\n\n')}\n\nКлей, грунтовка, выравнивание, подложка, крепёж и расходники не рассчитаны. Состав системы и количество согласовать после замера. Это ориентир для обсуждения закупки, не готовый заказ.`;}
