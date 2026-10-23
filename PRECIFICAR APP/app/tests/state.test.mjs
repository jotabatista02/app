import assert from 'node:assert/strict';
import { test } from 'node:test';
import { seedState } from '../dist/seed.js';
import { validateState } from '../dist/state.js';
import { calculateRecipe, priceFor, analyzePrice } from '../dist/pricing.js';

const json = value => JSON.parse(JSON.stringify(value));
function snapshot(state = seedState(), overrides = {}) {
  const recipe = structuredClone(state.recipes[0]);
  const costs = calculateRecipe(recipe, state.ingredients, state.recipes, state.settings);
  return {
    id: 'sheet-1', recipeId: recipe.id, name: recipe.name, createdAt: '2026-10-23T12:30:00.000Z',
    recipe, ingredients: structuredClone(state.ingredients), settings: structuredClone(state.settings),
    scenario: { ...state.scenarios[0], margin: 40 }, costs,
    result: priceFor(costs.unitCost, 40, 0, state.settings.taxRate), simulation: false,
    ...overrides,
  };
}

test('seed v1 and JSON roundtrip are compatible and produce an independent copy', () => {
  const original = seedState();
  assert.deepEqual(validateState(json(original)), validateState(original));
  const normalized = validateState(original);
  normalized.ingredients[0].name = 'Outro nome';
  assert.equal(original.ingredients[0].name, 'Leite condensado');
});

test('empty notebook still requires valid production settings', () => {
  const state = seedState();
  state.ingredients = []; state.recipes = []; state.settings = {};
  assert.throws(() => validateState(state), /remuneração/);
});

test('revision defaults to zero for v1 and preserves safe integers on roundtrip', () => {
  assert.equal(validateState(seedState()).revision, 0);
  const state = seedState(); state.revision = 42;
  assert.equal(validateState(json(state)).revision, 42);
  for (const revision of [-1, 0.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1, '42']) {
    state.revision = revision;
    assert.throws(() => validateState(state), /revisão/);
  }
});

test('zero, negative and nonfinite hours are rejected without any recipe', () => {
  for (const key of ['workHours', 'productiveHours']) {
    for (const value of [0, -1, Infinity, NaN, '120']) {
      const state = seedState(); state.recipes = []; state.settings[key] = value;
      assert.throws(() => validateState(state), /horas/);
    }
  }
});

test('unsafe or duplicated identifiers are rejected before rendering forms', () => {
  for (const id of ['x\"><img src=x onerror=alert(1)>', 'a:b', 'a/b', '', '__proto__.x']) {
    const state = seedState(); state.scenarios[0].id = id;
    assert.throws(() => validateState(state), /identificador/);
  }
  const duplicate = seedState(); duplicate.ingredients.push({ ...duplicate.ingredients[0] });
  assert.throws(() => validateState(duplicate), /repetidos/);
});

test('names may contain markup characters as data while unknown fields are rejected', () => {
  const state = seedState(); state.ingredients[0].name = '<Chocolate & leite>';
  assert.equal(validateState(state).ingredients[0].name, '<Chocolate & leite>');
  state.settings.onfocus = 'alert(1)';
  assert.throws(() => validateState(state), /campo desconhecido/);
});

test('liters use the canonical uppercase L accepted by the editing form', () => {
  const state = seedState();
  state.ingredients.push({ id: 'milk-liter', name: 'Leite', category: 'ingredient', price: 5, quantity: 1, unit: 'l' });
  assert.equal(validateState(state).ingredients.at(-1).unit, 'L');
});

test('malformed lines, missing references and incompatible units fail validation', () => {
  const cases = [
    state => state.recipes[0].items[0].quantity = '395',
    state => state.recipes[0].items[0].type = 'other',
    state => state.recipes[0].items[0].id = 'missing',
    state => state.recipes[0].items[0].unit = 'ml',
    state => state.recipes[0].packaging[0].unit = 'g',
    state => state.recipes[0].items = null,
  ];
  for (const mutate of cases) {
    const state = seedState(); mutate(state);
    assert.throws(() => validateState(state));
  }
});

test('invalid dates, overlong text and invalid archived flags are rejected', () => {
  const cases = [
    state => state.ingredients[0].updatedAt = '2026-02-31',
    state => state.ingredients[0].name = 'a'.repeat(101),
    state => state.ingredients[0].archived = 'false',
    state => state.ingredients[0].quantity = 0,
  ];
  for (const mutate of cases) {
    const state = seedState(); mutate(state);
    assert.throws(() => validateState(state));
  }
});

test('margin impossible for one channel does not invalidate the whole notebook', () => {
  const state = seedState(); state.recipes[0].margin = 80;
  assert.equal(validateState(state).recipes[0].margin, 80);
  state.scenarios[2].margin = 90;
  assert.equal(validateState(state).scenarios[2].margin, 90);
});

test('saved snapshot roundtrips with original costs after current ingredient updates', () => {
  const state = seedState(); state.sheets.push(snapshot(state));
  state.ingredients[0].price = 100;
  const restored = validateState(json(state));
  assert.equal(restored.sheets[0].costs.totalCost, 45);
  assert.equal(restored.sheets[0].result.price, 1.5);
  assert.equal(restored.ingredients[0].price, 100);
  assert.equal(restored.sheets[0].ingredients[0].price, 7.5);
});

test('negative simulation result and undefined margin at zero revenue remain valid', () => {
  const state = seedState(); const sheet = snapshot(state);
  sheet.simulation = true;
  sheet.result = analyzePrice(sheet.costs.unitCost, 0, 0, 0);
  state.sheets.push(sheet);
  const restored = validateState(json(state));
  assert.equal(restored.sheets[0].result.profit, -0.9);
  assert.equal(restored.sheets[0].result.margin, null);
});

test('bad snapshot structure, nonfinite numbers and incoherent totals are rejected', () => {
  const cases = [
    sheet => delete sheet.ingredients,
    sheet => sheet.costs.ingredientLines[0].cost = -1,
    sheet => sheet.costs.ingredientLines[0].quantity = 1,
    sheet => sheet.result.raw = 100,
    sheet => sheet.costs.unitCost = NaN,
    sheet => sheet.result.price = Infinity,
    sheet => sheet.result.fees = 10,
    sheet => sheet.costs.ingredientCost += 1,
    sheet => sheet.recipe.yield = 0,
    sheet => sheet.recipeId = 'another-recipe',
    sheet => sheet.settings.workHours = 0,
    sheet => sheet.scenario.id = 'x\" onfocus=alert(1)',
  ];
  for (const mutate of cases) {
    const state = seedState(); const sheet = snapshot(state); mutate(sheet); state.sheets.push(sheet);
    assert.throws(() => validateState(state));
  }
});

test('v1 base-recipe snapshots are independent of current recipes', () => {
  const state = seedState(); const recipe = structuredClone(state.recipes[0]);
  recipe.items = [{ type: 'recipe', id: 'ganache', quantity: 200, unit: 'g' }];
  const costs = calculateRecipe(recipe, state.ingredients, state.recipes, state.settings);
  const sheet = snapshot(state, { recipe, costs, result: priceFor(costs.unitCost, 40, 0, 0) });
  state.sheets.push(sheet); state.recipes = []; state.ingredients = [];
  assert.equal(validateState(json(state)).sheets[0].costs.ingredientCost, 4.75);
});

test('new snapshots may freeze base recipes and validate their reproduced costs', () => {
  const state = seedState(); const recipe = structuredClone(state.recipes[0]);
  recipe.items = [{ type: 'recipe', id: 'ganache', quantity: 200, unit: 'g' }];
  const costs = calculateRecipe(recipe, state.ingredients, state.recipes, state.settings);
  const sheet = snapshot(state, { recipe, recipes: structuredClone(state.recipes), costs, result: priceFor(costs.unitCost, 40, 0, 0) });
  state.sheets.push(sheet); state.recipes = []; state.ingredients = [];
  assert.equal(validateState(json(state)).sheets[0].costs.ingredientCost, 4.75);
  sheet.recipes.find(item => item.id === 'ganache').items[0].quantity *= 2;
  assert.throws(() => validateState(state), /incoerente/);
});
