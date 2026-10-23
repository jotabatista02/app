import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseNumber, roundCurrency } from '../dist/numbers.js';

test('preserva números finitos e trata o campo vazio como zero', () => {
  for (const value of [0, 1.5, 0.125, -12.5, Number.MAX_VALUE]) {
    assert.equal(parseNumber(value), value);
  }
  for (const value of ['', ' ', '\t\n', '\u00a0\u202f']) {
    assert.equal(parseNumber(value), 0);
  }
});

test('entende vírgula decimal e valores pt-BR colados com moeda e espaços', () => {
  const cases = [
    ['1,5', 1.5], ['0,125', 0.125], [',5', 0.5],
    ['1234,5678', 1234.5678], ['1.234,56', 1234.56],
    ['12.345.678,90', 12345678.9], ['R$1.234,56', 1234.56],
    ['  R$\u00a01.234,56\n', 1234.56], ['R$\u202f1 234,56', 1234.56],
    ['r$ 30,00', 30], ['- R$ 1.234,56', -1234.56],
    ['R$ -1,50', -1.5], ['+ R$ 1,50', 1.5], ['00012,50', 12.5],
  ];
  for (const [entry, expected] of cases) {
    assert.equal(parseNumber(entry), expected, entry);
  }
});

test('interpreta padrões de milhar brasileiros e aceita ponto decimal inequívoco', () => {
  const cases = [
    ['1.234', 1234], ['12.345', 12345], ['123.456', 123456],
    ['12.345.678', 12345678], ['-1.234', -1234],
    ['1.5', 1.5], ['15.25', 15.25], ['1.2345', 1.2345],
    ['1234.567', 1234.567], ['0.125', 0.125], ['00.125', 0.125],
    ['01.234', 1.234], ['-0.125', -0.125], ['.5', 0.5],
  ];
  for (const [entry, expected] of cases) {
    assert.equal(parseNumber(entry), expected, entry);
  }
});

test('rejeita lixo, expoentes, agrupamentos malformados e conversões implícitas', () => {
  const invalid = [
    '1e3', '1E3', '0x10', 'Infinity', 'NaN', '30 reais', '12abc',
    '1,2,3', '1,234.56', '1.23.456', '12.34.567', '1.234.56',
    '1234.567,89', '0.123,45', '01.234,56', '0.125.000',
    '1,', '1.', '.', ',', '-', '+', '--1', '-+1',
    'R$', 'R$R$1,50', '$1,50', '1,50R$', '9'.repeat(400),
    null, undefined, true, false, [], {}, NaN, Infinity, -Infinity,
  ];
  for (const value of invalid) {
    assert.ok(Number.isNaN(parseNumber(value)), `Deveria rejeitar ${String(value)}`);
  }
});

test('arredonda preços efetivos e descontos para o centavo mais próximo', () => {
  const cases = [
    [1.50 * 0.95, 1.43], [1.005, 1.01], [1.0049, 1],
    [1.00499999999, 1], [2.675, 2.68], [1.335, 1.34],
    [0.075, 0.08], [4.005, 4.01], [0.005, 0.01], [0.0049, 0],
    [1.01, 1.01], [0, 0], [-0, 0],
  ];
  for (const [entry, expected] of cases) {
    assert.equal(roundCurrency(entry), expected, String(entry));
  }
  assert.equal(Object.is(roundCurrency(-0), -0), false);
});

test('não aplica teto a valores abaixo do meio centavo', () => {
  assert.equal(roundCurrency(1.001), 1);
  assert.equal(roundCurrency(1.494), 1.49);
  assert.equal(roundCurrency(12345.6701), 12345.67);
});

test('protege o limite de centavos e rejeita moeda inválida com erro em português', () => {
  const maximum = Number.MAX_SAFE_INTEGER / 100;
  assert.equal(roundCurrency(maximum), maximum);
  assert.equal(roundCurrency(maximum - 1), maximum - 1);
  for (const entry of [-0.01, NaN, Infinity, -Infinity, '1,50', null, undefined]) {
    assert.throws(() => roundCurrency(entry), /valor monetário.*número finito/i);
  }
  assert.throws(() => roundCurrency(maximum + 0.01), /limite seguro.*centavos/i);
  assert.throws(() => roundCurrency(Number.MAX_VALUE), /limite seguro.*centavos/i);
});
