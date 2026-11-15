import {test} from 'node:test';
import assert from 'node:assert/strict';
import {initialProject,validate,specification} from '../dist/room-model.mjs';
import {applyProduct} from '../dist/room-products.mjs';
import {comparisonFile,readComparison} from '../dist/room-comparison.mjs';
test('comparison roundtrip preserves independent snapshots and legacy rooms',()=>{const p=initialProject(),data=comparisonFile([p,null]);p.walls[0].color='#000000';assert.notEqual(data.slots[0].walls[0].color,p.walls[0].color);assert.deepEqual(readComparison(JSON.parse(JSON.stringify(data))),data.slots);assert.throws(()=>readComparison(p));assert.throws(()=>readComparison({...data,slots:[p]}));assert.throws(()=>readComparison({...data,slots:[{...p,length:0},null]}));});
test('catalog selection survives export, appears in specification and cannot mislabel edited material',()=>{const p=initialProject();p.walls[0]=applyProduct(p.walls[0],'boras-4304','wall');p.floor=applyProduct(p.floor,'quickstep-im1848','floor');assert.deepEqual(validate(JSON.parse(JSON.stringify(p))),p);assert.match(specification(p),/Cream Linen, арт. 4304/);assert.match(specification(p),/IM1848/);assert.throws(()=>applyProduct(p.floor,'boras-4304','floor'));p.walls[0].color='#000000';assert.throws(()=>validate(p));delete p.walls[0].product;assert.doesNotThrow(()=>validate(p));});
