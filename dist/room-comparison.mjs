import {validate} from './room-model.mjs';
export function comparisonFile(slots){if(!Array.isArray(slots)||slots.length!==2)throw Error('Нужны два слота сравнения');return {type:'ted-comparison',version:1,slots:slots.map(s=>s===null?null:structuredClone(validate(s)))};}
export function readComparison(data){if(data?.type!=='ted-comparison'||data.version!==1)throw Error('Неверный файл сравнения');return comparisonFile(data.slots).slots;}
