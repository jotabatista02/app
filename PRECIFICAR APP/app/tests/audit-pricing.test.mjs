import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  convertQuantity, unitCost, ingredientCost, calculateRecipe, priceFor, analyzePrice,
} from '../dist/pricing.js';

const MAX_MONEY = Number.MAX_SAFE_INTEGER / 100;
const settings = () => ({
  monthlyPay: 0, workHours: 120, productiveHours: 120, fixedCosts: [], taxRate: 0,
});
const ingredient = () => ({ id: 'chocolate', name: 'Chocolate', price: 30, quantity: 1, unit: 'kg' });
const recipe = (extra = {}) => ({
  id: 'produto', name: 'Produto', yield: 1, yieldUnit: 'kg',
  minutes: 0, productionMinutes: 0, directCost: 0,
  items: [{ type: 'ingredient', id: 'chocolate', quantity: 1, unit: 'kg' }],
  packaging: [], ...extra,
});

test('auditoria: taxa e tributo decimais somando 100% são rejeitados', () => {
  assert.throws(() => priceFor(1, 0, 7.7, 92.3), /100%/);
  assert.throws(() => analyzePrice(1, 2, 7.7, 92.3), /100%/);
});

test('auditoria: margem, taxa e tributo decimais somando 100% são rejeitados', () => {
  assert.throws(() => priceFor(0.9, 20.2, 32.3, 47.5), /100%/);
  assert.throws(() => priceFor(0.9, 40, 23, 37), /100%/);
});

test('auditoria: limite percentual usa folga explícita e aceita valores afastados dela', () => {
  assert.throws(() => priceFor(1, 99.9999999999), /100%/);
  const result = priceFor(0.01, 99.9999);
  assert.ok(Math.abs(result.raw - 10_000) < 0.000001);
  assert.ok(result.price >= 10_000);
});

test('auditoria: preços em centavos conferem com oráculo racional inteiro independente', () => {
  // Inputs are exact cent amounts and whole percentage points. BigInt keeps the
  // expected ceiling exact without following the implementation's float path.
  for (const cents of [1, 7, 90, 199, 2705]) {
    for (const margin of [0, 25, 40, 70]) {
      for (const fee of [0, 4, 23]) {
        for (const tax of [0, 2]) {
          const denominator = 100 - margin - fee - tax;
          if (denominator <= 0) continue;
          const numerator = BigInt(cents) * 100n;
          const expectedCents = (numerator + BigInt(denominator) - 1n) / BigInt(denominator);
          assert.equal(priceFor(cents / 100, margin, fee, tax).price, Number(expectedCents) / 100,
            `custo=${cents} centavos; margem=${margin}; taxa=${fee}; tributo=${tax}`);
        }
      }
    }
  }
});

test('auditoria: limite monetário não aceita resultados que perdem centavos seguros', () => {
  assert.throws(() => priceFor(MAX_MONEY + 1, 0), /limite|centavo|segur/i);
  assert.throws(() => priceFor(MAX_MONEY, 1), /limite|centavo|segur/i);
  assert.throws(() => analyzePrice(1, MAX_MONEY + 1), /limite|centavo|segur/i);
  assert.throws(() => priceFor(1e100, 0), /limite|centavo|segur/i);
});

test('auditoria: fronteira monetária válida não arredonda para baixo vários centavos', () => {
  const result = priceFor(MAX_MONEY, 0);
  assert.equal(result.price, MAX_MONEY);
  assert.equal(result.profit, 0);
  assert.equal(result.breakEven, MAX_MONEY);
});

test('auditoria: ruído tolerado não absorve fração real de centavo em valores altos', () => {
  const result = priceFor(10_000_000_000.000002, 0);
  assert.equal(result.price, 10_000_000_000.01);
  assert.ok(result.profit > 0);
});

test('auditoria: custo normalizado e rateio também respeitam o limite monetário', () => {
  assert.throws(() => unitCost({ price: MAX_MONEY + 1, quantity: 1, unit: 'un' }), /limite|centavo|segur/i);
  assert.throws(() => unitCost({ price: MAX_MONEY, quantity: 0.001, unit: 'un' }), /limite|centavo|segur/i);
  assert.throws(() => calculateRecipe(recipe(), [ingredient()], [], {
    ...settings(), monthlyPay: MAX_MONEY, workHours: 0.001,
  }), /limite|centavo|segur/i);
  assert.throws(() => calculateRecipe(recipe(), [ingredient()], [], {
    ...settings(), fixedCosts: [{ value: MAX_MONEY }, { value: MAX_MONEY }],
  }), /limite|centavo|segur/i);
});

test('auditoria: insumo de custo muito pequeno mantém precisão até o preço final', () => {
  const tiny = { price: 0.01, quantity: 1000, unit: 'kg' };
  assert.equal(ingredientCost(tiny, 1, 'g'), 0.00000001);
  assert.equal(priceFor(ingredientCost(tiny, 1, 'g'), 40).price, 0.01);
});

test('auditoria: conversão identidade não estoura por intermediário desnecessário', () => {
  assert.equal(convertQuantity(1e307, 'kg', 'kg'), 1e307);
  assert.equal(convertQuantity(1e307, 'L', 'l'), 1e307);
  assert.throws(() => convertQuantity(1e307, 'kg', 'g'), /limite/);
});

test('auditoria: rendimento em kg e peso final incompatíveis são rejeitados', () => {
  assert.throws(() => calculateRecipe(recipe({ weightGrams: 500 }), [ingredient()], [], settings()), /peso|rendimento/i);
  const valid = calculateRecipe(recipe({ yield: 1.5, weightGrams: 1500 }), [ingredient()], [], settings());
  assert.equal(valid.totalCost, 30);
  assert.equal(valid.unitCost, 20);
});

test('auditoria: rendimento em g deve coincidir com o peso final, com tolerância numérica', () => {
  assert.throws(() => calculateRecipe(recipe({ yield: 50, yieldUnit: 'g', weightGrams: 51 }), [ingredient()], [], settings()), /peso|rendimento/i);
  const valid = calculateRecipe(recipe({ yield: 50, yieldUnit: 'g', weightGrams: 50.00000001 }), [ingredient()], [], settings());
  assert.equal(valid.unitCost, 0.6);
});

test('auditoria: peso opcional e peso de receita contada continuam válidos', () => {
  assert.equal(calculateRecipe(recipe(), [ingredient()], [], settings()).unitCost, 30);
  const counted = recipe({ yield: 50, yieldUnit: 'un', weightGrams: 1000 });
  assert.equal(calculateRecipe(counted, [ingredient()], [], settings()).unitCost, 0.6);
});

test('auditoria: base compartilhada não é recalculada exponencialmente', () => {
  let priceReads = 0;
  const cocoa = {
    id: 'cacau', name: 'Cacau', quantity: 1, unit: 'g',
    get price() { priceReads += 1; return 10; },
  };
  const recipes = [recipe({
    id: 'base-0', yield: 1, yieldUnit: 'g',
    items: [{ type: 'ingredient', id: 'cacau', quantity: 1, unit: 'g' }],
  })];
  for (let level = 1; level <= 12; level += 1) {
    recipes.push(recipe({
      id: `base-${level}`, yield: 1, yieldUnit: 'g',
      items: [
        { type: 'recipe', id: `base-${level - 1}`, quantity: 0.5, unit: 'g' },
        { type: 'recipe', id: `base-${level - 1}`, quantity: 0.5, unit: 'g' },
      ],
    }));
  }
  const result = calculateRecipe(recipes.at(-1), [cocoa], recipes, settings());
  assert.equal(result.totalCost, 10);
  assert.ok(priceReads <= 40, `Apenas 13 receitas causaram ${priceReads} leituras do preço.`);
});

test('auditoria: cache de base é local e respeita alteração posterior de ingrediente', () => {
  const base = recipe({ id: 'base' });
  const current = recipe({ items: [{ type: 'recipe', id: 'base', quantity: 200, unit: 'g' }] });
  const chocolate = ingredient();
  assert.equal(calculateRecipe(current, [chocolate], [base], settings()).ingredientCost, 6);
  chocolate.price = 45;
  assert.equal(calculateRecipe(current, [chocolate], [base], settings()).ingredientCost, 9);
});

test('auditoria: base compartilhada não esconde ciclo em outro ramo', () => {
  const leaf = recipe({ id: 'leaf' });
  const middle = recipe({ id: 'middle', items: [{ type: 'recipe', id: 'produto', quantity: 1, unit: 'kg' }] });
  const current = recipe({ items: [
    { type: 'recipe', id: 'leaf', quantity: 0.5, unit: 'kg' },
    { type: 'recipe', id: 'middle', quantity: 0.5, unit: 'kg' },
  ] });
  assert.throws(() => calculateRecipe(current, [ingredient()], [leaf, middle], settings()), /Ciclo/);
});

test('auditoria: tributo não é cobrado dentro do custo e outra vez no preço', () => {
  const result = calculateRecipe(recipe(), [ingredient()], [], { ...settings(), taxRate: 10 });
  assert.equal(result.totalCost, 30);
  assert.equal(result.unitCost, 30);
  assert.equal(priceFor(result.unitCost, 40, 0, 10).price, 60);
});
