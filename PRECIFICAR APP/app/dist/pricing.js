/** Pure pricing calculations. Inputs are numbers; percentages use 40 for 40%. */
const UNITS = Object.freeze({
  kg: { base: 'g', factor: 1000 },
  g: { base: 'g', factor: 1 },
  L: { base: 'ml', factor: 1000 },
  l: { base: 'ml', factor: 1000 },
  ml: { base: 'ml', factor: 1 },
  un: { base: 'un', factor: 1 },
});
const MAX_MONEY = Number.MAX_SAFE_INTEGER / 100;
// Percentage points, before division by 100. Reject numerically singular sums.
const PERCENT_TOLERANCE = 1e-9;

function numeric(value, label, positive = false) {
  if (typeof value !== 'number' || !Number.isFinite(value)
    || value < 0 || (positive && value === 0)) {
    throw new Error(`${label} deve ser um número finito ${positive ? 'maior que zero' : 'maior ou igual a zero'}.`);
  }
  return value;
}

function finiteResult(value, label) {
  if (!Number.isFinite(value)) throw new Error(`${label} excede o limite de cálculo.`);
  return value;
}

function moneyResult(value, label) {
  finiteResult(value, label);
  if (Math.abs(value) > MAX_MONEY) {
    throw new Error(`${label} excede o limite monetário seguro para representar centavos. Reduza os valores informados.`);
  }
  return value;
}

function moneyInput(value, label) {
  return moneyResult(numeric(value, label), label);
}

function unitDefinition(unit) {
  if (typeof unit !== 'string' || !Object.hasOwn(UNITS, unit)) {
    throw new Error(`Unidade inválida: ${String(unit)}. Use kg, g, L, ml ou un.`);
  }
  return UNITS[unit];
}

export function baseUnit(unit) {
  return unitDefinition(unit).base;
}

export function convertQuantity(quantity, from, to) {
  numeric(quantity, 'Quantidade');
  const source = unitDefinition(from);
  const target = unitDefinition(to);
  if (source.base !== target.base) {
    throw new Error(`Unidades incompatíveis: não é possível converter ${from} em ${to}.`);
  }
  return finiteResult(quantity * (source.factor / target.factor), 'Quantidade convertida');
}

/** Cost per g, ml or un, according to the purchase unit. */
export function unitCost(ingredient) {
  if (!ingredient || typeof ingredient !== 'object') throw new Error('Informe o insumo.');
  moneyInput(ingredient.price, 'Preço pago');
  numeric(ingredient.quantity, 'Conteúdo comprado', true);
  const quantity = convertQuantity(ingredient.quantity, ingredient.unit, baseUnit(ingredient.unit));
  return moneyResult(ingredient.price / quantity, 'Custo do insumo');
}

export function ingredientCost(ingredient, quantity, unit) {
  const normalizedCost = unitCost(ingredient);
  const normalizedQuantity = convertQuantity(quantity, unit, baseUnit(ingredient.unit));
  return moneyResult(normalizedCost * normalizedQuantity, 'Custo da porção');
}

function makeIndex(entries, label) {
  if (!Array.isArray(entries)) throw new Error(`${label} deve ser uma lista.`);
  const result = new Map();
  for (const entry of entries) {
    if (!entry || entry.id === undefined || entry.id === null || entry.id === '') {
      throw new Error(`${label}: cadastro sem identificador.`);
    }
    if (result.has(entry.id)) throw new Error(`${label}: identificador duplicado ${entry.id}.`);
    result.set(entry.id, entry);
  }
  return result;
}

function recipeYield(recipe) {
  numeric(recipe.yield, `Rendimento de ${recipe.name || 'receita'}`, true);
  if (!['un', 'kg', 'g'].includes(recipe.yieldUnit)) {
    throw new Error('Unidade de rendimento inválida. Use un, kg ou g.');
  }
  if (recipe.weightGrams !== undefined && recipe.weightGrams !== null) {
    numeric(recipe.weightGrams, 'Peso final aproveitável em gramas', true);
    if (recipe.yieldUnit !== 'un') {
      const expectedWeight = convertQuantity(recipe.yield, recipe.yieldUnit, 'g');
      const tolerance = Math.max(1e-6, Math.abs(expectedWeight) * 1e-9);
      if (Math.abs(recipe.weightGrams - expectedWeight) > tolerance) {
        throw new Error('O peso final em gramas deve corresponder ao rendimento da receita em kg ou g.');
      }
    }
  }
}

function arrayField(value, name) {
  if (!Array.isArray(value)) throw new Error(`${name} deve ser uma lista.`);
  return value;
}

/** Base recipes transfer ingredient costs only; their labor/packaging are excluded. */
export function calculateRecipe(recipe, ingredients, recipes, settings) {
  if (!recipe || typeof recipe !== 'object') throw new Error('Informe a receita.');
  if (!settings || typeof settings !== 'object') throw new Error('Informe os custos de produção.');
  const ingredientIndex = makeIndex(ingredients, 'Insumos');
  const recipeIndex = makeIndex(recipes, 'Receitas');
  if (recipe.id !== undefined && recipe.id !== null) recipeIndex.set(recipe.id, recipe);

  const laborHourly = moneyInput(settings.monthlyPay, 'Remuneração mensal')
    / numeric(settings.workHours, 'Horas de trabalho no mês', true);
  const productiveHours = numeric(settings.productiveHours, 'Horas produtivas no mês', true);
  const fixedMonthly = arrayField(settings.fixedCosts, 'Custos fixos').reduce(
    (sum, item) => moneyResult(sum + moneyInput(item?.value, `Custo fixo ${item?.name || ''}`.trim()), 'Custos fixos mensais'), 0,
  );
  const fixedHourly = moneyResult(fixedMonthly / productiveHours, 'Custo fixo por hora');
  moneyResult(laborHourly, 'Mão de obra por hora');
  if (settings.taxRate !== undefined) percentage(settings.taxRate, 'Tributo');

  const getIngredient = (id) => {
    if (!ingredientIndex.has(id)) throw new Error(`Insumo não encontrado: ${String(id)}.`);
    return ingredientIndex.get(id);
  };

  // Cache only within this calculation. A subsequent purchase-price edit must
  // always recalculate the recipe, while repeated DAG branches share a subtotal.
  const baseCache = new Map();
  const ingredientsOf = (current, ancestors = new Set()) => {
    recipeYield(current);
    if (ancestors.has(current)) {
      throw new Error(`Ciclo de receitas detectado em ${current.name || current.id || 'receita'}.`);
    }
    if (baseCache.has(current)) return baseCache.get(current);
    const path = new Set(ancestors);
    path.add(current);
    const lines = arrayField(current.items, 'Ingredientes da receita').map((item) => {
      if (!item || !['ingredient', 'recipe'].includes(item.type)) {
        throw new Error('Tipo de item inválido. Use ingredient ou recipe.');
      }
      numeric(item.quantity, 'Quantidade usada na receita');
      unitDefinition(item.unit);
      if (item.type === 'ingredient') {
        const ingredient = getIngredient(item.id);
        return {
          type: item.type, id: item.id, name: ingredient.name || String(item.id),
          quantity: item.quantity, unit: item.unit,
          cost: ingredientCost(ingredient, item.quantity, item.unit),
        };
      }
      const base = recipeIndex.get(item.id);
      if (!base) throw new Error(`Receita base não encontrada: ${String(item.id)}.`);
      const subtotal = ingredientsOf(base, path).cost;
      let normalizedYield;
      let normalizedQuantity;
      if (base.yieldUnit === 'un' && baseUnit(item.unit) === 'g' && base.weightGrams != null) {
        normalizedYield = base.weightGrams;
        normalizedQuantity = convertQuantity(item.quantity, item.unit, 'g');
      } else {
        const normalizedUnit = baseUnit(base.yieldUnit);
        normalizedYield = convertQuantity(base.yield, base.yieldUnit, normalizedUnit);
        normalizedQuantity = convertQuantity(item.quantity, item.unit, normalizedUnit);
      }
      return {
        type: item.type, id: item.id, name: base.name || String(item.id),
        quantity: item.quantity, unit: item.unit,
        cost: moneyResult(subtotal / normalizedYield * normalizedQuantity, 'Custo da receita base'),
      };
    });
    const result = { lines, cost: moneyResult(lines.reduce((sum, line) => sum + line.cost, 0), 'Ingredientes do lote') };
    baseCache.set(current, result);
    return result;
  };

  const ingredientResult = ingredientsOf(recipe);
  const packagingLines = arrayField(recipe.packaging, 'Embalagens da receita').map((item) => {
    if (!item || item.unit !== 'un') throw new Error('Embalagens devem ser informadas em un.');
    const ingredient = getIngredient(item.id);
    return {
      type: 'ingredient', id: item.id, name: ingredient.name || String(item.id),
      quantity: item.quantity, unit: item.unit,
      cost: ingredientCost(ingredient, item.quantity, item.unit),
    };
  });
  const packagingCost = moneyResult(packagingLines.reduce((sum, line) => sum + line.cost, 0), 'Embalagens do lote');
  const laborCost = moneyResult(numeric(recipe.minutes, 'Minutos de trabalho ativo') / 60 * laborHourly, 'Mão de obra do lote');
  const fixedCost = moneyResult(numeric(recipe.productionMinutes, 'Minutos produtivos') / 60 * fixedHourly, 'Custos fixos do lote');
  const directCost = moneyInput(recipe.directCost, 'Custos diretos do lote');
  const totalCost = moneyResult(
    ingredientResult.cost + packagingCost + laborCost + fixedCost + directCost, 'Custo total',
  );
  return {
    ingredientCost: ingredientResult.cost, packagingCost, laborCost, fixedCost, directCost,
    totalCost, unitCost: moneyResult(totalCost / recipe.yield, 'Custo por unidade de rendimento'),
    ingredientLines: ingredientResult.lines, packagingLines, laborHourly, fixedHourly,
  };
}

function percentage(value, label) {
  numeric(value, label);
  if (value >= 100 - PERCENT_TOLERANCE) throw new Error(`${label} deve ser menor que 100%.`);
  return value / 100;
}

function feeRate(feePercent, taxPercent) {
  percentage(feePercent, 'Taxa de venda');
  percentage(taxPercent, 'Tributo');
  const totalPercent = feePercent + taxPercent;
  if (totalPercent >= 100 - PERCENT_TOLERANCE) throw new Error('A soma das taxas e do tributo deve ser menor que 100%.');
  return totalPercent / 100;
}

function ceilCents(value) {
  moneyResult(value, 'Preço');
  if (value === 0) return 0;
  const cents = value * 100;
  // Remove only binary floating point noise at a cent boundary.
  // Bound the tolerance so large amounts cannot lose real cent fractions.
  const tolerance = Math.min(1e-7, Number.EPSILON * Math.max(1, Math.abs(cents)) * 4);
  const roundedCents = Math.max(1, Math.ceil(cents - tolerance));
  if (!Number.isSafeInteger(roundedCents)) {
    throw new Error('O preço excede o limite monetário seguro para representar centavos. Reduza os valores informados.');
  }
  return moneyResult(roundedCents / 100, 'Preço');
}

function analyze(cost, price, rate) {
  const fees = moneyResult(price * rate, 'Taxas em reais');
  const profit = moneyResult(price - fees - cost, 'Resultado por venda');
  return {
    price, fees, profit,
    // A percentage of zero revenue is undefined when there is a cost.
    margin: price === 0 ? (cost === 0 ? 0 : null) : finiteResult(profit / price * 100, 'Margem efetiva'),
    breakEven: ceilCents(cost / (1 - rate)),
  };
}

export function analyzePrice(cost, price, feePercent = 0, taxPercent = 0) {
  moneyInput(cost, 'Custo por unidade');
  moneyInput(price, 'Preço de venda');
  return analyze(cost, price, feeRate(feePercent, taxPercent));
}

export function priceFor(cost, marginPercent, feePercent = 0, taxPercent = 0) {
  moneyInput(cost, 'Custo por unidade');
  percentage(marginPercent, 'Margem desejada');
  const rate = feeRate(feePercent, taxPercent);
  const totalPercent = marginPercent + feePercent + taxPercent;
  if (totalPercent >= 100 - PERCENT_TOLERANCE) {
    throw new Error('A soma da margem, das taxas e do tributo deve ser menor que 100%.');
  }
  const raw = moneyResult(cost / ((100 - totalPercent) / 100), 'Preço sugerido');
  return { raw, ...analyze(cost, ceilCents(raw), rate), feeRate: rate };
}
