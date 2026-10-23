import { unitCost, ingredientCost, calculateRecipe, analyzePrice, priceFor } from './pricing.js';

const SAFE_ID = /^[A-Za-z0-9_-]+$/;
const UNITS = ['g', 'kg', 'ml', 'L', 'l', 'un'];
const ICONS = ['pix', 'card', 'app', 'store'];
const own = (value, key) => Object.hasOwn(value, key) && value[key] !== undefined;

function fail(label, message) { throw new Error(`${label}: ${message}.`); }
function object(value, label, allowed) {
  if (!value || typeof value !== 'object' || Array.isArray(value)
    || ![Object.prototype, null].includes(Object.getPrototypeOf(value))) fail(label, 'objeto inválido');
  for (const key of Object.keys(value)) {
    if (!allowed.includes(key)) fail(label, `campo desconhecido ${key}`);
  }
  return value;
}
function text(value, label, max = 100, empty = false) {
  if (typeof value !== 'string' || value.length > max || (!empty && !value.trim())) fail(label, 'texto inválido');
  return value;
}
function identifier(value, label) {
  if (typeof value !== 'string' || value.length > 128 || !SAFE_ID.test(value)) fail(label, 'identificador inválido');
  return value;
}
function number(value, label, { positive = false, signed = false } = {}) {
  if (typeof value !== 'number' || !Number.isFinite(value) || (!signed && value < 0) || (positive && value <= 0)) {
    fail(label, positive ? 'use um número finito maior que zero' : 'número inválido');
  }
  return value;
}
function percentage(value, label, nullable = false) {
  if (nullable && value === null) return null;
  number(value, label);
  if (value >= 100) fail(label, 'o percentual deve ser menor que 100%');
  return value;
}
function boolean(value, label) {
  if (typeof value !== 'boolean') fail(label, 'valor deve ser verdadeiro ou falso');
  return value;
}
function enumeration(value, label, choices) {
  if (!choices.includes(value)) fail(label, 'opção inválida');
  return value;
}
function unit(value, label, choices = UNITS) {
  enumeration(value, label, choices);
  return value === 'l' ? 'L' : value;
}
function list(value, label, max, mapper, unique = false) {
  if (!Array.isArray(value) || value.length > max) fail(label, `lista inválida ou com mais de ${max} registros`);
  const result = value.map((item, index) => mapper(item, `${label} ${index + 1}`));
  if (unique && new Set(result.map(item => item.id)).size !== result.length) fail(label, 'identificadores repetidos');
  return result;
}
function date(value, label) {
  text(value, label, 40);
  if (!/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z)?$/.test(value)) fail(label, 'data inválida');
  const parsed = new Date(value);
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value.slice(0, 10)) fail(label, 'data inválida');
  return value;
}
function optional(target, source, key, validator, label) {
  if (own(source, key)) target[key] = validator(source[key], `${label} / ${key}`);
}
function almost(actual, expected, label) {
  if (actual === null && expected === null) return;
  if (typeof actual !== 'number' || typeof expected !== 'number'
    || Math.abs(actual - expected) > 1e-8 * Math.max(1, Math.abs(expected))) fail(label, 'valor incoerente com o cálculo preservado');
}

function ingredient(value, label) {
  object(value, label, ['id', 'name', 'category', 'price', 'quantity', 'unit', 'emoji', 'brand', 'updatedAt', 'archived']);
  const result = {
    id: identifier(value.id, label), name: text(value.name, label),
    category: enumeration(value.category, label, ['ingredient', 'packaging']),
    price: number(value.price, label), quantity: number(value.quantity, label, { positive: true }),
    unit: unit(value.unit, label, packaging ? ['un'] : UNITS),
  };
  optional(result, value, 'brand', (v, l) => text(v, l, 100, true), label);
  optional(result, value, 'emoji', (v, l) => text(v, l, 32, true), label);
  optional(result, value, 'updatedAt', date, label);
  optional(result, value, 'archived', boolean, label);
  unitCost(result);
  return result;
}
function recipeLine(value, label, packaging = false) {
  object(value, label, ['id', 'type', 'quantity', 'unit']);
  const result = {
    id: identifier(value.id, label), quantity: number(value.quantity, label),
    unit: unit(value.unit, label),
  };
  if (!packaging || own(value, 'type')) result.type = enumeration(value.type, label, packaging ? ['ingredient'] : ['ingredient', 'recipe']);
  return result;
}
function recipe(value, label) {
  object(value, label, ['id', 'name', 'category', 'yield', 'yieldUnit', 'weightGrams', 'minutes', 'productionMinutes', 'directCost', 'margin', 'price', 'image', 'notes', 'items', 'packaging', 'archived', 'priceScenario', 'updatedAt', 'createdAt']);
  const result = {
    id: identifier(value.id, label), name: text(value.name, label),
    yield: number(value.yield, label, { positive: true }), yieldUnit: enumeration(value.yieldUnit, label, ['un', 'kg', 'g']),
    minutes: number(value.minutes, label), productionMinutes: number(value.productionMinutes, label), directCost: number(value.directCost, label),
    items: list(value.items, `${label} / ingredientes`, 500, (v, l) => recipeLine(v, l)),
    packaging: list(value.packaging, `${label} / embalagens`, 500, (v, l) => recipeLine(v, l, true)),
  };
  if (own(value, 'weightGrams') && value.weightGrams !== null) result.weightGrams = number(value.weightGrams, `${label} / peso`, { positive: true });
  optional(result, value, 'category', text, label);
  optional(result, value, 'margin', (v, l) => percentage(v, l, true), label);
  optional(result, value, 'price', number, label);
  optional(result, value, 'image', (v, l) => enumeration(v, l, ['brigadeiro', 'brownie']), label);
  optional(result, value, 'notes', (v, l) => text(v, l, 2000, true), label);
  optional(result, value, 'archived', boolean, label);
  optional(result, value, 'priceScenario', identifier, label);
  optional(result, value, 'updatedAt', date, label);
  optional(result, value, 'createdAt', date, label);
  return result;
}
function settings(value, label) {
  object(value, label, ['monthlyPay', 'workHours', 'productiveHours', 'fixedCosts', 'taxRate', 'defaultDirectCost']);
  const result = {
    monthlyPay: number(value.monthlyPay, `${label} / remuneração`),
    workHours: number(value.workHours, `${label} / horas de trabalho`, { positive: true }),
    productiveHours: number(value.productiveHours, `${label} / horas produtivas`, { positive: true }),
    fixedCosts: list(value.fixedCosts, `${label} / despesas fixas`, 200, (item, itemLabel) => {
      object(item, itemLabel, ['name', 'value']);
      return { name: text(item.name, itemLabel), value: number(item.value, itemLabel) };
    }),
    taxRate: own(value, 'taxRate') ? percentage(value.taxRate, `${label} / tributo`) : 0,
  };
  optional(result, value, 'defaultDirectCost', number, label);
  // Validate derived hourly costs even when the notebook has no recipes.
  calculateRecipe({ id: 'validation', name: 'Validação', yield: 1, yieldUnit: 'un', minutes: 0, productionMinutes: 0, directCost: 0, items: [], packaging: [] }, [], [], result);
  return result;
}
function scenario(value, label) {
  object(value, label, ['id', 'name', 'fee', 'margin', 'icon']);
  const result = { id: identifier(value.id, label), name: text(value.name, label), fee: percentage(value.fee, label) };
  optional(result, value, 'margin', (v, l) => percentage(v, l, true), label);
  optional(result, value, 'icon', (v, l) => enumeration(v, l, ICONS), label);
  return result;
}
function costLine(value, label) {
  object(value, label, ['id', 'type', 'name', 'quantity', 'unit', 'cost']);
  return {
    id: identifier(value.id, label), type: enumeration(value.type, label, ['ingredient', 'recipe']),
    name: text(value.name, label), quantity: number(value.quantity, label),
    unit: unit(value.unit, label), cost: number(value.cost, label),
  };
}
function costs(value, label) {
  const keys = ['ingredientCost', 'packagingCost', 'laborCost', 'fixedCost', 'directCost', 'totalCost', 'unitCost', 'laborHourly', 'fixedHourly'];
  object(value, label, [...keys, 'ingredientLines', 'packagingLines']);
  const result = Object.fromEntries(keys.map(key => [key, number(value[key], `${label} / ${key}`)]));
  result.ingredientLines = list(value.ingredientLines, `${label} / ingredientes`, 500, costLine);
  result.packagingLines = list(value.packagingLines, `${label} / embalagens`, 500, costLine);
  almost(result.ingredientCost, result.ingredientLines.reduce((sum, line) => sum + line.cost, 0), label);
  almost(result.packagingCost, result.packagingLines.reduce((sum, line) => sum + line.cost, 0), label);
  almost(result.totalCost, result.ingredientCost + result.packagingCost + result.laborCost + result.fixedCost + result.directCost, label);
  return result;
}
function result(value, label) {
  object(value, label, ['raw', 'price', 'fees', 'profit', 'margin', 'breakEven', 'feeRate']);
  const output = {
    price: number(value.price, label), fees: number(value.fees, label),
    profit: number(value.profit, label, { signed: true }),
    margin: value.margin === null ? null : number(value.margin, label, { signed: true }),
    breakEven: number(value.breakEven, label),
  };
  optional(output, value, 'raw', number, label);
  optional(output, value, 'feeRate', number, label);
  return output;
}
function snapshot(value, label) {
  object(value, label, ['id', 'recipeId', 'name', 'createdAt', 'recipe', 'recipes', 'ingredients', 'settings', 'scenario', 'costs', 'result', 'simulation']);
  const output = {
    id: identifier(value.id, label), recipeId: identifier(value.recipeId, label), name: text(value.name, label),
    createdAt: date(value.createdAt, label), recipe: recipe(value.recipe, `${label} / receita`),
    ingredients: list(value.ingredients, `${label} / insumos`, 2000, ingredient, true),
    settings: settings(value.settings, `${label} / custos de produção`),
    scenario: scenario(value.scenario, `${label} / forma de venda`),
    costs: costs(value.costs, `${label} / custos`), result: result(value.result, `${label} / resultado`),
  };
  if (output.recipeId !== output.recipe.id) fail(label, 'a receita da ficha possui outro identificador');
  optional(output, value, 'simulation', boolean, label);
  if (own(value, 'recipes')) output.recipes = list(value.recipes, `${label} / receitas base`, 2000, recipe, true);
  const expected = analyzePrice(output.costs.unitCost, output.result.price, output.scenario.fee, output.settings.taxRate);
  for (const key of ['price', 'fees', 'profit', 'margin', 'breakEven']) almost(output.result[key], expected[key], `${label} / ${key}`);
  if (own(output.result, 'feeRate')) almost(output.result.feeRate, (output.scenario.fee + output.settings.taxRate) / 100, label);
  if (own(output.result, 'raw')) {
    const suggested = priceFor(output.costs.unitCost, output.scenario.margin ?? output.recipe.margin ?? 40, output.scenario.fee, output.settings.taxRate);
    almost(output.result.raw, suggested.raw, label);
    almost(output.result.price, suggested.price, label);
  }
  almost(output.costs.unitCost, output.costs.totalCost / output.recipe.yield, label);
  for (const [source, preserved] of [[output.recipe.items, output.costs.ingredientLines], [output.recipe.packaging, output.costs.packagingLines]]) {
    if (source.length !== preserved.length) fail(label, 'a memória de cálculo não corresponde aos itens da receita');
    source.forEach((line, index) => {
      const saved = preserved[index];
      if (saved.id !== line.id || saved.type !== (line.type || 'ingredient') || saved.unit !== line.unit) fail(label, 'item divergente na memória de cálculo');
      almost(saved.quantity, line.quantity, label);
      if (saved.type === 'ingredient') {
        const input = output.ingredients.find(item => item.id === line.id);
        if (!input) fail(label, 'insumo preservado não encontrado');
        almost(saved.cost, ingredientCost(input, line.quantity, line.unit), label);
      }
    });
  }
  // Labor, fixed and direct costs can also be reproduced for legacy base snapshots.
  const nonIngredientCosts = calculateRecipe({ ...output.recipe, items: [] }, output.ingredients, [], output.settings);
  for (const key of ['packagingCost', 'laborCost', 'fixedCost', 'directCost', 'laborHourly', 'fixedHourly']) {
    almost(output.costs[key], nonIngredientCosts[key], `${label} / ${key}`);
  }
  // Original v1 snapshots froze ingredient totals without copying their base recipes.
  // Validate their preserved totals, without consulting today's recipe references.
  if (output.recipes || !output.recipe.items.some(line => line.type === 'recipe')) {
    const reproduced = calculateRecipe(output.recipe, output.ingredients, output.recipes || [], output.settings);
    for (const key of ['ingredientCost', 'packagingCost', 'laborCost', 'fixedCost', 'directCost', 'totalCost', 'unitCost', 'laborHourly', 'fixedHourly']) {
      almost(output.costs[key], reproduced[key], `${label} / ${key}`);
    }
  }
  return output;
}

/** Validate and copy the complete persisted v1 notebook; never mutate the input. */
export function validateState(data) {
  object(data, 'Caderno', ['version', 'revision', 'example', 'ingredients', 'recipes', 'sheets', 'scenarios', 'settings']);
  if (data.version !== 1) fail('Caderno', 'versão incompatível');
  const revision = own(data, 'revision') ? data.revision : 0;
  if (!Number.isSafeInteger(revision) || revision < 0) fail('Caderno', 'revisão inválida');
  const output = {
    version: 1, revision,
    ingredients: list(data.ingredients, 'Insumos', 2000, ingredient, true),
    recipes: list(data.recipes, 'Receitas', 2000, recipe, true),
    sheets: list(data.sheets, 'Fichas de preço', 5000, snapshot, true),
    scenarios: list(data.scenarios, 'Formas de venda', 25, scenario, true),
    settings: settings(data.settings, 'Custos de produção'),
  };
  optional(output, data, 'example', boolean, 'Caderno');
  if (!output.scenarios.length) fail('Formas de venda', 'cadastre ao menos uma forma de venda');
  for (const channel of output.scenarios) priceFor(1, 0, channel.fee, output.settings.taxRate);
  for (const item of output.recipes) {
    if (item.priceScenario && !output.scenarios.some(channel => channel.id === item.priceScenario)) fail(item.name, 'forma de venda não encontrada');
    calculateRecipe(item, output.ingredients, output.recipes, output.settings);
  }
  return output;
}
