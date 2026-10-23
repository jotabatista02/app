# Kalyne Chocolateria — telas e funcionalidades

## Objetivo e estágio

O aplicativo de precificação da **Kalyne Chocolateria** tem uma implementação funcional voltada à formação de preços de doces e produtos de confeitaria. Permite calcular o custo da produção, configurar a remuneração pelo trabalho e simular preços com margem e taxas informadas pela pessoa.

Este documento descreve as funcionalidades implementadas a partir das pranchas visuais aprovadas. A aplicação inclui cadastros de insumos e receitas, receitas base, cálculos interativos, custos, cenários de venda, simulador, fichas preservadas, impressão/PDF e backup JSON. Os números iniciais são exemplos fictícios editáveis. O armazenamento é local no navegador; não há conta ou sincronização entre dispositivos.

O foco é precificação. Cardápio digital, pedidos, agenda, caixa, estoque, controle de clientes e conteúdo de cursos ficam fora deste escopo. As funcionalidades abaixo pertencem à implementação da Kalyne Chocolateria; não descrevem funções de outro aplicativo.

## Direção visual

- Interface em português brasileiro, com valores em reais e vírgula decimal.
- Identidade da loja: aplicar exclusivamente o **logo original da Kalyne Chocolateria**, fornecido na imagem de referência, com suas cores rosa claro, coral, framboesa e chocolate. Não criar outra marca para o aplicativo.
- Nome exibido: **Kalyne Chocolateria**. A identificação visual das telas usa o logo original da loja, sem uma segunda marca ou um nome separado de aplicativo.
- Formulários curtos, exemplos nas unidades de medida e resultado de preço visível durante o preenchimento.
- Rótulos simples para preço pago, conteúdo comprado e quantidade usada na receita.
- Menu do computador com Início, Insumos, Receitas, Custos de produção, Simulador e Minhas fichas. Ficha técnica e Preço sugerido são etapas de cada receita. No celular, o menu inferior reúne Início, Insumos, Receitas e Mais; Mais dá acesso aos demais caminhos e aos dados.
- Dados de exemplo identificados, estados vazios e mensagens de validação para ajudar no primeiro uso.

## 01 Início

**Objetivo:** apresentar o andamento da formação de preços e facilitar o retorno ao trabalho.

**Elementos implementados:**

- Identificação da **Kalyne Chocolateria** pelo logo original da loja e indicação de dados de exemplo enquanto esse caderno de demonstração estiver em uso.
- Resumo de insumos cadastrados, receitas e fichas de preço, calculado a partir dos dados disponíveis.
- Acesso a nova precificação, às receitas, aos insumos e às fichas salvas.
- Lista de receitas do caderno e resumo da composição do custo de uma receita.
- Orientação sobre os dados iniciais editáveis e o caminho para começar com um caderno vazio.

**Limite:** a tela apresenta estimativas de custos e preços. Não registra faturamento, lucro realizado ou quantidade vendida.

## 02 Insumos

**Objetivo:** registrar o preço pago e o conteúdo da embalagem comprada para calcular o custo proporcional da quantidade usada em cada receita.

**Categorias implementadas:** ingredientes e embalagens, com abas e pesquisa por nome. Há uma aba de arquivados para restaurar insumos.

**Campos:**

| Campo | Exemplo | Regra implementada |
| --- | --- | --- |
| Nome | Chocolate ao leite | Obrigatório |
| Categoria | Ingrediente | Ingrediente ou embalagem |
| Preço pago pela embalagem comprada | R$ 30,00 | Valor maior ou igual a zero para o conteúdo informado |
| Conteúdo da embalagem comprada | 1 | Maior que zero; representa o peso, volume ou número de unidades contidas na embalagem |
| Unidade do conteúdo comprado | kg | kg, g, L, ml ou un; neste exemplo, a embalagem contém 1 kg |
| Marca ou fornecedor | Opcional | Informação de referência |
| Data de atualização | Data em que o cadastro foi salvo | Registrada automaticamente |

**Resultados implementados:** prévia do custo por g, ml ou un no formulário e referência por 100 g, 100 ml ou unidade na lista. Exemplo: embalagem com **1 kg de chocolate comprada por R$ 30,00** = 1.000 g por R$ 30,00 = **R$ 0,03 por g**. Ao informar **200 g usados na receita**, o custo dessa porção é **R$ 6,00**. O preço da embalagem inteira não é cobrado novamente na receita.

Para embalagens de venda, o conteúdo é informado em unidades. Exemplo: um pacote contendo 100 forminhas comprado por R$ 12,00 corresponde a R$ 0,12 por forminha. Neste cadastro, o conteúdo comprado é 100 un; a ficha técnica informa quantas forminhas são usadas no lote.

**Ações implementadas:** pesquisar, filtrar, adicionar, editar, arquivar e restaurar insumos. Arquivar retira o item das opções de novos cadastros, preservando as referências existentes. Alterar um preço atualiza os cálculos que usam o cadastro atual; fichas já salvas mantêm seus custos anteriores. Não há histórico automático de cada alteração de insumo ou uma tela de dependências.

**Regras implementadas para unidades:** conversões compatíveis entre **kg e g** e entre **L e ml**. Conteúdo comprado e quantidade utilizada são convertidos à mesma unidade antes do custo proporcional: 1 kg = 1.000 g e 1 L = 1.000 ml. O motor rejeita conversão entre massa e volume e entre unidades incompatíveis. Pacotes precisam ter seu conteúdo informado: 100 forminhas são cadastradas como 100 un, sem multiplicação duplicada.

## 03 Ficha técnica

**Objetivo:** cadastrar ou editar uma receita, montar sua ficha técnica e calcular o custo dos ingredientes conforme o rendimento aproveitável.

**Campos e componentes:**

- Nome e categoria da receita.
- Ingredientes com o preço pago e o conteúdo comprado disponíveis para consulta a partir do cadastro em “Insumos”.
- Campo **“Quantidade usada na receita”** e sua unidade para cada ingrediente do lote; por exemplo, 200 g de um chocolate comprado em embalagem de 1 kg.
- Custo proporcional de cada ingrediente na quantidade usada e total dos ingredientes; no exemplo de compra de 1 kg por R$ 30,00, usar 200 g acrescenta R$ 6,00 ao lote.
- Rendimento vendável e sua unidade: un, kg ou g para bases. Representa o que efetivamente pode ser vendido ou utilizado.
- Peso final aproveitável do lote, quando conhecido, para comparação por kg.
- Tempo ativo de trabalho e tempo produtivo para rateio de custos, usados posteriormente na precificação.
- Observações de preparo, opcionais.

**Bases reutilizáveis implementadas:** massas, recheios e coberturas podem ser cadastrados como receitas e selecionados como item de outra receita. Exemplo: uma base com R$ 20,00 de ingredientes e rendimento de 1.000 g transfere R$ 0,02/g; usar 150 g acrescenta R$ 3,00 à outra receita. O motor rejeita ciclos diretos ou indiretos e referências ausentes.

Uma base transfere somente o custo de seus ingredientes, incluindo outras bases, pelo rendimento aproveitável. Não transfere suas embalagens, mão de obra, custos fixos ou despesas diretas. Inclua os tempos e demais despesas correspondentes no produto final, uma única vez. Quando uma base rende unidades e tem peso final informado, o motor também permite utilizar uma porção por massa conhecida.

**Ações implementadas:** criar, editar, pesquisar, duplicar, ajustar a escala e abrir a precificação. O ajuste permite dobrar ou usar outro fator; multiplica ingredientes, embalagens, rendimento, peso positivo informado e despesas diretas. Os tempos não são multiplicados automaticamente e devem ser conferidos. Não há ação de arquivar receitas nesta interface.

**Perdas:** usar o rendimento vendável como fonte principal do custo unitário. Se um lote produz 50 doces e 2 não podem ser vendidos, o divisor é 48. Não aplicar mais 4% de perda sobre esse mesmo lote. Descartes já refletidos no rendimento não podem ser cobrados outra vez por um percentual genérico.

## 04 Preço sugerido

**Objetivo:** apresentar a composição do custo e permitir definir a margem para calcular o preço sugerido. A tela reúne os dados da ficha técnica e dos custos de produção.

**Passo 1 — Produto e rendimento**

Selecionar uma receita ou criar uma nova; confirmar tamanho do lote, rendimento vendável, unidade de venda e peso final quando houver. Mostrar a diferença entre o lote produzido e a unidade comercializada.

**Passo 2 — Embalagens e produção**

Na Ficha técnica, informar a quantidade total de embalagens do lote, tempo ativo, tempo produtivo e o valor agrupado de gás, energia e outros diretos. Os valores por hora vêm de Custos de produção. A tela de preço apresenta essas parcelas separadas. Não existe um cadastro de múltiplos custos diretos identificados por nome.

Exemplo: uma caixa para 6 doces não deve ser cobrada integralmente em cada doce. Cadastre manualmente o número de caixas realmente utilizadas e um rendimento coerente com a unidade comercializada. A aplicação não calcula automaticamente a composição de kits, o número de caixas ou suas sobras.

**Passo 3 — Margem e cenário de venda**

Informar margem desejada sobre o preço de venda e escolher Pix, cartão, aplicativo ou revenda. As taxas e margens próprias por cenário são editáveis em Custos de produção; os nomes dos quatro cenários são fixos nesta interface. “Aplicativo” é somente um cenário com comissão percentual; não há integração com outro serviço. As taxas iniciais são hipotéticas.

O campo de tributo percentual é preenchido pela pessoa em Custos de produção; zero significa não acrescentar esse percentual. A aplicação não determina alíquota legal ou regime tributário.

**Passo 4 — Resultado e ficha**

A tela mostra preço sugerido e custo por unidade de rendimento, preço do lote, custo do lote, taxas, sobra estimada, margem efetiva e preço mínimo sem margem. A composição separa ingredientes, embalagens, trabalho, custos fixos e gás/outros diretos. Com peso final informado, mostra a equivalência do custo por kg. O preço de venda por kg depende de configurar o rendimento da receita em kg.

O preço sugerido é arredondado para cima no centavo ao final. Alterar a margem atualiza o preço e sua margem efetiva. Para experimentar um preço praticado ou desconto, use o Simulador. **Salvar ficha de preço** preserva os valores daquele cálculo em Minhas fichas e registra o preço e o cenário escolhidos na receita.

## 05 Custos de produção

**Objetivo:** explicar e configurar mão de obra, rateio de despesas e consumos diretos sem duplicação.

**Mão de obra implementada:** remuneração mensal de referência dividida pelas horas de trabalho no mês. A interface calcula o valor por hora; não há um campo independente de valor por hora. O tempo ativo do lote representa preparo, montagem e outras atividades atribuídas ao produto. Não inclua a mesma remuneração também nos custos fixos.

**Exemplo das imagens:** remuneração de referência de R$ 1.800,00 por mês / 120 horas = R$ 15,00 por hora. Um lote com 72 minutos de trabalho ativo utiliza 1,2 hora e recebe R$ 18,00 de mão de obra.

**Custos fixos:** despesas mensais identificadas por nome e valor, como a parcela de aluguel atribuída ao negócio. A pessoa informa as horas produtivas planejadas no mês. Custo fixo por hora = total mensal incluído no rateio / horas produtivas planejadas. O custo atribuído ao lote é esse valor por hora multiplicado pelo tempo produtivo informado para o lote.

**Exemplo inicial:** despesas fixas incluídas de R$ 200,00 por mês / 120 horas produtivas = R$ 1,6667 por hora, aproximadamente. Aplicar 72 minutos de tempo produtivo ao lote resulta em R$ 2,00 de custos fixos. O motor mantém a precisão interna; usar R$ 1,67 na multiplicação produziria uma diferença evitável.

O rateio depende da capacidade informada. Se as horas produtivas não forem realizadas, a recuperação dos custos fixos no mês pode ser menor que a estimada. A tela explica essa premissa junto dos campos de rateio.

**Gás e energia:** valor direto agrupado por lote, editável em cada receita. Há um valor padrão configurável para novas receitas. A interface orienta a excluir do rateio fixo as despesas cobradas diretamente; essa classificação é responsabilidade da pessoa. Não é aplicado um percentual genérico automático aos ingredientes.

**Tempos diferentes:** tempo de trabalho ativo e tempo usado para rateio podem ser diferentes. Exemplo: um produto pode exigir 30 minutos de trabalho ativo e ocupar 1 hora produtiva. A interface deve explicar quais tempos geram cada parcela do custo.

**Valores informados:** parcelas de custo e tempo podem ser zero. Quantidade comprada, rendimento e horas mensais precisam ser maiores que zero. Peso final é opcional, mas deve ser positivo quando preenchido. O resultado considera os valores cadastrados; o app não mede despesas ou tempos.

## 06 Simulador

**Objetivo:** comparar decisões antes de alterar uma ficha.

**Entradas implementadas:** receita selecionada, margem desejada, rendimento simulado, preço de compra de um insumo, preço de venda pretendido, desconto e cenário de venda. As taxas vêm dos custos de produção. A tela apresenta o custo unitário atual e o simulado.

**Comparações implementadas:**

- Preço sugerido em cada cenário de margem e taxas.
- Efeito da alta de um insumo no custo e no preço.
- Efeito de mudança no rendimento vendável.
- Desconto aplicado sobre o preço de venda e margem que permanece.
- Resultado na unidade de rendimento cadastrada na receita. A montagem automática de caixas ou kits não está implementada.

**Resultados implementados:** custo unitário simulado, preços sugeridos por cenário, margem efetiva do preço pretendido, sobra estimada e indicação de cobertura dos custos. O desconto gera um preço final normalizado em centavos. Os resultados dependem dos custos cadastrados e da premissa de rateio; não há registro de lucro realizado.

O simulador não altera a receita ou o cadastro do ingrediente. **Salvar simulação** cria uma ficha separada com a composição e o preço daquela simulação. Não há comando para aplicar automaticamente a alteração de ingrediente ao cadastro original.

## 07 Minhas fichas

**Objetivo:** listar as fichas de preço e simulações que foram salvas. O cadastro e a pesquisa de receitas ficam em Receitas.

**Lista implementada:** nome do produto, rendimento, preço escolhido, cenário de venda, margem efetiva e data de criação, com as fichas mais novas primeiro. Um aviso identifica quando o custo unitário atual difere do preservado. Não há filtros de fichas por nome ou categoria nesta versão.

**Detalhe da ficha:** logo, produto, cenário, data, preço, margem efetiva, composição dos custos, rendimento, custo unitário, taxas em reais, sobra estimada e linhas de ingredientes/bases e embalagens com quantidades e custos. A cópia armazenada também conserva a receita e as configurações usadas no cálculo.

**Ações implementadas:** abrir o detalhe preservado, imprimir, excluir uma ficha após confirmação e abrir o preço da receita com custos atuais para um novo cálculo. A impressão usa o diálogo do navegador; escolher “Salvar como PDF”, quando disponível, gera o arquivo. Duplicar e editar receitas são ações de Receitas/Preço sugerido, não das fichas preservadas.

Cada salvamento cria uma cópia dos valores utilizados: receita, insumos, configurações, cenário, composição dos custos e resultado. Alterações posteriores dos cadastros não reescrevem a ficha. Esse registro preservado permite comparar cálculos, mas não constitui histórico automático de todas as edições de um insumo ou receita.

## Lógica implementada para os cálculos

O motor puro JavaScript calcula as parcelas abaixo sem arredondamento antecipado. A suíte de 19 testes cobre exemplos, conversões, alterações de custo, bases recursivas, ciclos, percentuais e arredondamento.

1. **Insumo na receita:** preço pago pela embalagem comprada / conteúdo dessa embalagem na unidade base × quantidade usada na receita na mesma unidade. Exemplo: R$ 30,00 / 1.000 g × 200 g = R$ 6,00.
2. **Ingredientes do lote:** soma dos ingredientes e das porções de receitas base utilizadas.
3. **Mão de obra do lote:** valor da hora × tempo ativo em horas.
4. **Rateio fixo do lote:** custo fixo por hora × tempo produtivo do lote em horas.
5. **Base de custo do lote:** ingredientes + embalagens + mão de obra + rateio fixo + gás/energia diretos + demais custos diretos identificados.
6. **Base unitária:** base de custo do lote / rendimento vendável na unidade de venda.
7. **Preço sugerido:** base unitária / (1 − margem desejada − taxas variáveis).

Margem e taxas são usadas em formato decimal nesta fórmula. As taxas variáveis incluem a taxa do cenário e o tributo opcional, ambos aplicados ao preço de venda. A soma de margem e taxas precisa ser menor que 100%. Custos monetários fixos por venda ou por lote precisam ser atribuídos à base de custo de forma explícita; não devem ser somados a percentuais.

**Exemplo inicial da aplicação:**

| Parcela | Cálculo ou origem | Custo do lote |
| --- | --- | --- |
| Ingredientes | Soma das quantidades utilizadas | R$ 18,00 |
| Embalagens | Embalagens para o lote | R$ 5,00 |
| Mão de obra | 72 min = 1,2 h × R$ 15,00/h | R$ 18,00 |
| Custos diretos | Gás/energia informados por lote | R$ 2,00 |
| Custos fixos | 1,2 h × (R$ 200,00 / 120 h) | R$ 2,00 |
| **Total** | Soma das parcelas | **R$ 45,00** |

Rendimento vendável de **50 unidades**, resultando em **R$ 0,90 por unidade**. Os R$ 2,00 de gás/energia diretos não integram novamente os R$ 200,00 mensais do rateio fixo.

| Cenário hipotético | Margem desejada | Taxas sobre a venda | Preço teórico por unidade | Preço sugerido, arredondado para cima |
| --- | --- | --- | --- | --- |
| Pix | 40% | 0% | R$ 0,90 / 0,60 = R$ 1,50 | **R$ 1,50** |
| Cartão | 40% | 4% | R$ 0,90 / 0,56 = R$ 1,6071… | **R$ 1,61** |
| Venda por app | 40% | 23% | R$ 0,90 / 0,37 = R$ 2,4324… | **R$ 2,44** |
| Revenda | 25% | 0% | R$ 0,90 / 0,75 = R$ 1,20 | **R$ 1,20** |

Na revenda, **25% é a margem desejada do exemplo, não uma taxa**. Os valores de 4% e 23% são taxas fictícias editáveis. A comparação não representa condições comerciais de uma instituição ou plataforma específica. A margem efetiva pode ficar ligeiramente acima da desejada por causa do arredondamento para cima. O motor mantém a precisão interna e arredonda o preço sugerido somente ao final, corrigindo o ruído de ponto flutuante nas fronteiras de centavos.

**Margem não é markup:** sem taxas, acrescentar 30% a um custo de R$ 2,00 gera R$ 2,60, cuja margem sobre a venda é aproximadamente 23,08%. Para obter margem de 30%, o preço teórico é R$ 2,00 / 0,70 = R$ 2,8571. Usar “margem sobre a venda” como rótulo principal. Se houver markup em alguma tela, exibir seu significado e sua base de cálculo.

**Margem efetiva de um preço informado:** (preço − base unitária − preço × taxas variáveis) / preço. Um valor negativo deve ser apresentado claramente. O resultado em reais já considera o rateio e a mão de obra cadastrados, mas continua sendo uma estimativa, não lucro apurado de uma operação real.

**Lote e kg:** o preço do lote corresponde ao conjunto de unidades efetivamente comercializadas. Um preço por kg só pode ser derivado quando houver peso final aproveitável. Embalagens e taxas precisam corresponder à forma de venda para a comparação ser válida. Não converter unidades em kg usando apenas o peso comprado dos ingredientes.

## Fluxos principais

| Fluxo | Caminho | Resultado implementado |
| --- | --- | --- |
| Primeiro preço | Custos de produção → Insumos → Ficha técnica → Preço sugerido → Minhas fichas | Ficha com custo, rendimento, cenário, preço e memória do cálculo |
| Novo ingrediente | Insumos → cadastrar compra → usar em Ficha técnica | Custo proporcional à quantidade utilizada |
| Recheio reutilizado | Ficha técnica → criar base → incluir porção em outra receita | Custo da porção, com rendimento aproveitável e regra de tempos visível |
| Compra ficou mais cara | Insumos → atualizar preço → abrir receita ou recalcular ficha | Cálculo atual com o novo preço; ficha antiga mantém seus valores |
| Ajustar preço de mercado | Preço sugerido → Simulador → informar preço ou desconto | Margem efetiva e indicação de cobertura dos custos |
| Comparar formas de venda | Preço sugerido ou Simulador → editar cenários | Preços calculados com os percentuais fornecidos |

## Regras para evitar resultados enganosos

- Bloquear quantidade comprada ou rendimento igual a zero; bloquear valores negativos em custos, tempos e taxas.
- Bloquear combinações de margem e taxas que tornem o denominador menor ou igual a zero.
- Validar unidades compatíveis e permitir quantidades fracionárias quando fizerem sentido.
- Não preencher custos omitidos com percentuais presumidos.
- Não acrescentar embalagem, perdas, trabalho ou gás duas vezes em etapas diferentes.
- Guardar precisão nos cálculos; arredondar o preço sugerido para cima no centavo somente ao final e recalcular a margem efetiva do preço escolhido.
- Ao alterar o preço final, atualizar a margem efetiva e os valores das taxas.
- Mostrar preço abaixo do custo como resultado da simulação, com indicação clara; não tratá-lo como preço recomendado.
- Diferenciar dados salvos, valores simulados e exemplos fictícios.
- Considerar que embalagens por caixa exigem composição comercial definida, incluindo sobras quando existirem.

## Armazenamento, backup e limites

Os cadastros ficam no localStorage, vinculados ao navegador, ao perfil e ao endereço em que a aplicação é aberta. Não há conta de usuário, sincronização ou banco de dados remoto. Limpar os dados do navegador pode remover o caderno. A aplicação não inclui instalação ou funcionamento offline garantido.

Em Preferências e dados, **Exportar backup** baixa um JSON do caderno. **Restaurar backup** valida um arquivo de até 5 MB e substitui os dados atuais após confirmação; exporte os dados atuais antes para preservá-los. **Começar com o caderno vazio** remove insumos, receitas e fichas após confirmação, mantendo custos e cenários.

As fichas preservam cálculos salvos explicitamente. Não há histórico automático de preços dos insumos, sincronização de fichas entre aparelhos, geração própria de PDF fora do diálogo de impressão ou composição automática de kits. A identificação visual permanece exclusivamente Kalyne Chocolateria.

As sete telas das pranchas continuam como referência de organização: **01 Início**, **02 Insumos**, **03 Ficha técnica**, **04 Preço sugerido**, **05 Custos de produção**, **06 Simulador** e **07 Minhas fichas**. A implementação acrescenta a lista de Receitas e a página de Preferências e dados para os fluxos de cadastro e backup.
