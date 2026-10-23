# Kalyne Chocolateria — aplicativo de precificação

Aplicativo funcional para calcular custos de receitas e preços de venda, com a identidade visual original da Kalyne Chocolateria. Inclui ingredientes, embalagens, receitas base, mão de obra, custos de produção, cenários de venda e simulações.

## Abrir localmente

Com Node.js disponível, abra um terminal na pasta `app` e execute:

```powershell
node server.mjs
```

Se preferir usar npm:

```powershell
npm start
```

Abra [Kalyne Chocolateria](http://127.0.0.1:4173) no navegador. Mantenha o terminal aberto enquanto utiliza a aplicação. Para encerrar o servidor, pressione `Ctrl+C` no terminal. Não é necessário instalar pacotes para iniciar este projeto.

## Fazer a primeira precificação

1. Em **Custos de produção**, confira a remuneração mensal, as horas de trabalho, as despesas fixas, as horas produtivas e as taxas de cada forma de venda.
2. Em **Insumos**, cadastre o preço pago e o conteúdo da embalagem comprada. Exemplo: chocolate comprado por R$ 30,00 em uma embalagem de 1 kg.
3. Em **Receitas**, crie uma **Ficha técnica** e informe quanto usou de cada ingrediente. Usar 200 g daquele chocolate acrescenta R$ 6,00 à receita. Adicione embalagens, rendimento vendável, tempos e despesas diretas do lote.
4. Em **Preço sugerido**, escolha a forma de venda e confira a composição do custo, a margem desejada, o preço calculado e a margem efetiva.
5. Clique em **Salvar ficha de preço**. A ficha aparece em **Minhas fichas**, preservando os valores usados naquele cálculo.

Os dados iniciais são **exemplos editáveis**. As taxas de cartão e aplicativo são hipotéticas; substitua pelos seus valores. Em **Preferências e dados**, é possível começar com o caderno vazio, mantendo as configurações de custos e taxas. Essa ação remove os insumos, as receitas e as fichas atuais após confirmação.

Para reutilizar um recheio ou outra receita base, adicione a receita como um item de outra ficha e informe a porção utilizada. A base transfere somente seus ingredientes. Inclua o tempo de preparo correspondente no tempo total do produto final para remunerar o trabalho sem duplicação.

O comando **Ajustar quantidade do lote** pode dobrar ou multiplicar as quantidades por outro fator. Ele ajusta ingredientes, embalagens, rendimento, peso informado e despesas diretas. Confira os tempos de trabalho e produção, que não são multiplicados automaticamente.

## Simular e guardar uma comparação

No **Simulador**, altere o rendimento, o preço de compra de um insumo, a margem ou o preço pretendido. Compare Pix, cartão, aplicativo e revenda com as taxas e margens cadastradas. É possível aplicar um desconto e ver a margem que permanece.

As simulações não alteram os cadastros. **Salvar simulação** cria uma ficha separada em **Minhas fichas**. Os resultados são estimativas a partir dos custos informados, não registros de faturamento ou lucro realizado.

## Impressão e PDF

Em **Minhas fichas**, abra a ficha e clique em **Imprimir / salvar PDF**, ou use o botão de impressora. A aplicação abre o diálogo de impressão do navegador. Escolha **Salvar como PDF**, quando disponível, para gerar o arquivo. A impressão usa os valores preservados na ficha.

## Dados e backup

Os cadastros ficam no **localStorage do navegador**, vinculados ao endereço usado para abrir a aplicação. Não há conta de usuário, banco de dados remoto ou sincronização entre dispositivos e navegadores. Abrir outro endereço ou usar outro perfil de navegador não transfere os dados automaticamente.

Em **Preferências e dados**, use **Exportar backup** para baixar um JSON com os cadastros, custos, cenários e fichas. Para transferir os dados, abra a aplicação no destino e escolha **Restaurar backup**. A restauração **substitui o caderno existente após confirmação**; exporte o caderno atual antes se quiser preservá-lo. O importador aceita arquivos de até 5 MB e valida o formato.

Limpar os dados do navegador pode remover o caderno. O histórico de preços de cada insumo não é criado automaticamente: as fichas salvas preservam os valores utilizados em cada cálculo. Esta versão não inclui instalação ou funcionamento offline garantido.

## Cálculo e precisão

O motor mantém a precisão interna dos números durante as operações e arredonda o preço sugerido **para cima no centavo ao final**, com correção do ruído de ponto flutuante nas fronteiras de centavos. Não arredonda antecipadamente o custo de cada ingrediente nem o rateio por hora.

```text
custo do lote = ingredientes + embalagens + mão de obra
                + rateio dos custos fixos + despesas diretas
custo unitário = custo do lote / rendimento vendável
preço sugerido = custo unitário / (1 − margem − taxas − tributo)
```

Na fórmula, os percentuais são decimais. A margem corresponde à parcela do preço de venda que permanece após os custos e taxas informados. Ela é diferente de acrescentar um percentual ao custo. O preço informado no simulador pode produzir margem negativa; o app identifica quando não cobre os custos.

O motor valida quantidades, unidades compatíveis, rendimentos, horas de trabalho, referências ausentes, ciclos de receitas base e percentuais impossíveis. Converte kg/g e L/ml; não presume equivalência entre massa e volume. Gás e energia lançados como custo direto não devem ser lançados novamente nos custos fixos.

Exemplo inicial: R$ 18,00 de ingredientes + R$ 5,00 de embalagens + R$ 18,00 de trabalho + R$ 2,00 de custos diretos + R$ 2,00 de custos fixos = R$ 45,00 por lote. Com 50 unidades vendáveis, o custo é R$ 0,90 por unidade. Com margem de 40%: Pix sem taxa = R$ 1,50; cartão com taxa fictícia de 4% = R$ 1,61; aplicativo com taxa fictícia de 23% = R$ 2,44. Revenda com margem de 25% e taxa zero = R$ 1,20.

## Testes do motor

Na pasta `app`, execute:

```powershell
node --test --test-isolation=none tests/pricing.test.mjs
```

A suíte contém **19 testes**, cobrindo custo proporcional, unidades, composição do lote, atualização de insumos, bases aninhadas, ciclos, validações, margem, taxas e arredondamento. A opção `--test-isolation=none` permite executar a suíte sem criar subprocessos de teste.
