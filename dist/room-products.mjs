export const PRODUCTS=[
 {id:'boras-4304',roll:{width:.53,length:10.05,repeat:0},brand:'Boråstapeter',name:'Cream Linen',article:'4304',target:'wall',finish:'wallpaper',texture:'linen',color:'#ece8de',details:'Коллекция Linen · флизелин · рулон 0,53 × 10,05 м',url:'https://www.borastapeter.com/en/products/cream-linen-4304'},
 {id:'boras-4335',roll:{width:.53,length:10.05,repeat:0},brand:'Boråstapeter',name:'Soft Olive',article:'4335',target:'wall',finish:'wallpaper',texture:'linen',color:'#a3aa8d',details:'Коллекция Linen · мягкий оливковый оттенок',url:'https://www.borastapeter.com/en/products/soft-olive-4335'},
 {id:'quickstep-im1848',packArea:1.835,brand:'Quick-Step',name:'Classic oak natural',article:'IM1848',target:'floor',finish:'laminate',texture:'oak',color:'#c5a77d',details:'Impressive · 1380 × 190 × 8 мм · 1,835 м² в упаковке',url:'https://int.quick-step.com/en/laminate/impressive/im1848_classic-oak-natural'}
];
export const productFor=s=>PRODUCTS.find(v=>v.id===s.product);
export function productText(s){const v=productFor(s);return v?`${v.brand} ${v.name}, арт. ${v.article}; ${v.url} (визуализация приблизительная)`:'';}
export function applyProduct(s,id,target){const v=PRODUCTS.find(v=>v.id===id&&v.target===target);if(!v)throw Error('Материал не подходит для поверхности');return {...s,finish:v.finish,texture:v.texture,color:v.color,product:v.id};}
export function validateProduct(s,target){if(s.product===undefined)return;const v=PRODUCTS.find(v=>v.id===s.product&&v.target===target);if(!v||s.finish!==v.finish||s.texture!==v.texture||s.color!==v.color)throw Error('Материал каталога не соответствует поверхности');}
