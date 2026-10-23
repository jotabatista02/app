import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  baseUnit, convertQuantity, unitCost, ingredientCost,
  calculateRecipe, priceFor, analyzePrice,
} from '../dist/pricing.js';

const close = (actual, expected, epsilon = 1e-10) => {
  assert.ok(Math.abs(actual - expected) <= epsilon, `${actual} deveria ser próximo de ${expected}`);
};
const settings = () => ({
  monthlyPay: 1800, workHours: 120, productiveHours: 120,
  fixedCosts: [{ name: 'Despesas atribuídas ao negócio', value: 200 }], taxRate: 0,
});
const ingredients = () => [
  { id: 'chocolate', name: 'Chocolate', price: 30, quantity: 1, unit: 'kg' },
  { id: 'forminha', name: 'Forminha', price: 10, quantity: 100, unit: 'un' },
];
const recipe = (overrides = {}) => ({
  id: 'brigadeiro', name: 'Brigadeiro', yield: 50, yieldUnit: 'un',
  minutes: 72, productionMinutes: 72, directCost: 2,
  items: [{ type: 'ingredient', id: 'chocolate', quantity: 600, unit: 'g' }],
  packaging: [{ id: 'forminha', quantity: 50, unit: 'un' }], ...overrides,
});
const base = (overrides = {}) => recipe({
  id: 'base', name: 'Base de chocolate', yield: 1, yieldUnit: 'kg',
  minutes: 600, productionMinutes: 600, directCost: 500,
  items: [{ type: 'ingredient', id: 'chocolate', quantity: 1, unit: 'kg' }],
  packaging: [{ id: 'forminha', quantity: 100, unit: 'un' }], ...overrides,
});

test('normaliza massa, volume e unidades sem cruzar dimensões', () => {
  assert.equal(baseUnit('kg'), 'g');
  assert.equal(baseUnit('L'), 'ml');
  assert.equal(baseUnit('l'), 'ml');
  assert.equal(baseUnit('un'), 'un');
  assert.equal(convertQuantity(1, 'kg', 'g'), 1000);
  assert.equal(convertQuantity(200, 'g', 'kg'), 0.2);
  assert.equal(convertQuantity(1, 'L', 'ml'), 1000);
  assert.equal(convertQuantity(250, 'ml', 'l'), 0.25);
  assert.throws(() => convertQuantity(1, 'g', 'ml'), /incompatíveis/);
  assert.throws(() => convertQuantity(1, 'un', 'g'), /incompatíveis/);
  assert.throws(() => baseUnit('pacote'), /Unidade inválida/);
});

test('1 kg comprado por R$ 30 e 200 g utilizados custam R$ 6', () => {
  const chocolate = ingredients()[0];
  assert.equal(unitCost(chocolate), 0.03);
  assert.equal(ingredientCost(chocolate, 200, 'g'), 6);
  assert.equal(ingredientCost(chocolate, 0.2, 'kg'), 6);
});

test('1 L comprado por R$ 8 e 250 ml utilizados custam R$ 2', () => {
  const milk = { price: 8, quantity: 1, unit: 'L' };
  assert.equal(unitCost(milk), 0.008);
  assert.equal(ingredientCost(milk, 250, 'ml'), 2);
  assert.throws(() => ingredientCost(milk, 250, 'g'), /incompatíveis/);
});

test('o exemplo visual custa R$ 45 por lote e R$ 0,90 por doce', () => {
  const result = calculateRecipe(recipe(), ingredients(), [], settings());
  assert.equal(result.ingredientCost, 18);
  assert.equal(result.packagingCost, 5);
  assert.equal(result.laborCost, 18);
  assert.equal(result.fixedCost, 2);
  assert.equal(result.directCost, 2);
  assert.equal(result.totalCost, 45);
  assert.equal(result.unitCost, 0.9);
  assert.equal(result.laborHourly, 15);
  close(result.fixedHourly, 200 / 120);
  assert.equal(result.ingredientLines[0].cost, 18);
  assert.equal(result.packagingLines[0].quantity, 50);
});

test('alteração de preço de compra atualiza proporcionalmente a receita', () => {
  const list = ingredients();
  const before = calculateRecipe(recipe(), list, [], settings());
  list[0].price = 40;
  const after = calculateRecipe(recipe(), list, [], settings());
  assert.equal(before.ingredientCost, 18);
  assert.equal(after.ingredientCost, 24);
  assert.equal(after.totalCost, 51);
  assert.equal(after.unitCost, 1.02);
});

test('base usa somente ingredientes, excluindo embalagem, trabalho, fixos e diretos', () => {
  const current = recipe({ items: [{ type: 'recipe', id: 'base', quantity: 200, unit: 'g' }] });
  const result = calculateRecipe(current, ingredients(), [base()], settings());
  assert.equal(result.ingredientCost, 6);
  assert.equal(result.totalCost, 33);
});

test('bases aninhadas transferem custo proporcional por rendimento', () => {
  const middle = base({
    id: 'middle', name: 'Recheio', yield: 500, yieldUnit: 'g',
    items: [{ type: 'recipe', id: 'base', quantity: 0.5, unit: 'kg' }],
  });
  const current = recipe({ items: [{ type: 'recipe', id: 'middle', quantity: 100, unit: 'g' }] });
  const result = calculateRecipe(current, ingredients(), [base(), middle], settings());
  assert.equal(result.ingredientCost, 3);
  assert.equal(result.ingredientLines[0].name, 'Recheio');
});

test('base contada em unidades pode ser fracionada por massa se o peso final for informado', () => {
  const countedBase = base({ yield: 10, yieldUnit: 'un', weightGrams: 1000 });
  const current = recipe({ items: [{ type: 'recipe', id: 'base', quantity: 200, unit: 'g' }] });
  assert.equal(calculateRecipe(current, ingredients(), [countedBase], settings()).ingredientCost, 6);
  assert.throws(() => calculateRecipe(current, ingredients(), [base({ yieldUnit: 'un' })], settings()), /incompatíveis/);
});

test('detecta ciclo direto, indireto e identificador ausente', () => {
  const direct = recipe({ items: [{ type: 'recipe', id: 'brigadeiro', quantity: 1, unit: 'un' }] });
  assert.throws(() => calculateRecipe(direct, ingredients(), [], settings()), /Ciclo/);
  const first = base({ items: [{ type: 'recipe', id: 'other', quantity: 1, unit: 'kg' }] });
  const second = base({ id: 'other', items: [{ type: 'recipe', id: 'base', quantity: 1, unit: 'kg' }] });
  assert.throws(() => calculateRecipe(first, ingredients(), [first, second], settings()), /Ciclo/);
  assert.throws(() => calculateRecipe(recipe(), [], [], settings()), /Insumo não encontrado/);
  const missingBase = recipe({ items: [{ type: 'recipe', id: 'ausente', quantity: 1, unit: 'kg' }] });
  assert.throws(() => calculateRecipe(missingBase, ingredients(), [], settings()), /Receita base não encontrada/);
  assert.throws(() => calculateRecipe(recipe(), ingredients().slice(0, 1), [], settings()), /Insumo não encontrado/);
});

test('rendimento reduzido absorve perda sem percentual adicional', () => {
  const result = calculateRecipe(recipe({ yield: 48 }), ingredients(), [], settings());
  assert.equal(result.totalCost, 45);
  assert.equal(result.unitCost, 45 / 48);
});

test('custo por rendimento respeita kg e g sem conversão indevida para unidades', () => {
  const perKg = calculateRecipe(recipe({ yield: 1.5, yieldUnit: 'kg' }), ingredients(), [], settings());
  const perGram = calculateRecipe(recipe({ yield: 1500, yieldUnit: 'g' }), ingredients(), [], settings());
  assert.equal(perKg.unitCost, 30);
  assert.equal(perGram.unitCost, 0.03);
});

test('diferencia tempo ativo de tempo produtivo e não modifica entradas', () => {
  const current = recipe({ minutes: 30, productionMinutes: 60 });
  const config = settings();
  const list = ingredients();
  const snapshot = JSON.stringify([current, config, list]);
  const result = calculateRecipe(current, list, [], config);
  assert.equal(result.laborCost, 7.5);
  close(result.fixedCost, 200 / 120);
  assert.equal(JSON.stringify([current, config, list]), snapshot);
});

test('valida rendimento, conteúdo comprado, tempos e configuração de horas', () => {
  for (const bad of [0, -1, NaN, Infinity, '50', undefined]) {
    assert.throws(() => calculateRecipe(recipe({ yield: bad }), ingredients(), [], settings()), /Rendimento/);
  }
  for (const field of ['workHours', 'productiveHours']) {
    assert.throws(() => calculateRecipe(recipe(), ingredients(), [], { ...settings(), [field]: 0 }), /Horas/);
  }
  assert.throws(() => calculateRecipe(recipe({ minutes: -1 }), ingredients(), [], settings()), /Minutos/);
  assert.throws(() => calculateRecipe(recipe(), ingredients(), [], { ...settings(), monthlyPay: NaN }), /Remuneração/);
  assert.throws(() => calculateRecipe(recipe(), ingredients(), [], { ...settings(), fixedCosts: [{ value: -1 }] }), /Custo fixo/);
  assert.throws(() => unitCost({ price: 30, quantity: 0, unit: 'kg' }), /Conteúdo comprado/);
  assert.throws(() => ingredientCost(ingredients()[0], -1, 'g'), /Quantidade/);
  assert.throws(() => calculateRecipe(recipe({ yieldUnit: 'ml' }), ingredients(), [], settings()), /rendimento inválida/);
});

test('reproduz os quatro cenários dos mockups com arredondamento para cima', () => {
  assert.equal(priceFor(0.9, 40).price, 1.5);
  assert.equal(priceFor(0.9, 40, 4).price, 1.61);
  assert.equal(priceFor(0.9, 40, 23).price, 2.44);
  assert.equal(priceFor(0.9, 25).price, 1.2);
  assert.ok(priceFor(0.9, 40, 23).margin >= 40);
});

test('margem sobre venda difere do acréscimo sobre custo', () => {
  assert.equal(priceFor(2, 30).price, 2.86);
  close(analyzePrice(2, 2.6).margin, 23.076923076923077);
  assert.ok(priceFor(2, 30).margin >= 30);
});

test('taxa e tributo incidem no preço e preservam o cálculo em precisão completa', () => {
  const result = priceFor(2, 30, 3, 2);
  assert.equal(result.price, 3.08);
  assert.equal(result.feeRate, 0.05);
  close(result.raw, 2 / 0.65);
  close(result.fees, 0.154);
  close(result.profit, 0.926);
  close(result.margin, 30.064935064935067);
  assert.equal(result.breakEven, 2.11);
});

test('arredondamento remove só ruído binário no centavo e sobe frações reais', () => {
  assert.equal(priceFor(0.07, 0).price, 0.07);
  assert.equal(priceFor(0.1 + 0.2, 0).price, 0.3);
  assert.equal(priceFor(1.500001, 0).price, 1.51);
  assert.equal(priceFor(0.0001, 0).price, 0.01);
  assert.equal(priceFor(0, 40).price, 0);
});

test('preço praticado recalcula margem, resultado negativo e ponto de equilíbrio', () => {
  const analysis = analyzePrice(0.9, 1.5, 4);
  close(analysis.fees, 0.06);
  close(analysis.profit, 0.54);
  close(analysis.margin, 36);
  assert.equal(analysis.breakEven, 0.94);
  const loss = analyzePrice(0.9, 0.5, 4);
  assert.ok(loss.profit < 0);
  assert.ok(loss.margin < 0);
  assert.equal(analyzePrice(0.9, 0).margin, null);
  assert.equal(analyzePrice(0, 0).margin, 0);
});

test('rejeita percentuais impossíveis, negativos e números não finitos', () => {
  assert.throws(() => priceFor(1, 80, 20), /soma da margem/);
  assert.throws(() => priceFor(1, 40, 50, 10), /soma da margem/);
  assert.throws(() => priceFor(1, 100), /menor que 100/);
  assert.throws(() => analyzePrice(1, 2, 60, 40), /soma das taxas/);
  assert.throws(() => priceFor(-1, 40), /Custo por unidade/);
  assert.throws(() => priceFor(Infinity, 40), /Custo por unidade/);
  assert.throws(() => priceFor(1, NaN), /Margem/);
  assert.throws(() => priceFor(1, 40, -2), /Taxa/);
  assert.throws(() => analyzePrice(1, '2'), /Preço de venda/);
});
