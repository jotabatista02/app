# Aplicativo Kalyne Chocolateria

Publicado em acesso privado: https://kalyne-chocolateria-precos.joel240617.chatgpt.site

O acesso ao site privado é feito com o ChatGPT. A publicação foi confirmada pelo serviço de hospedagem em 23/10/2026. A entrada com a conta proprietária e a abertura das telas Início e Preço sugerido também foram verificadas no endereço publicado.

## Implementado

Ingredientes e embalagens com preço de compra e conteúdo; quantidades utilizadas por receita; conversões kg/g e L/ml; receitas base; ajuste do lote; rendimento vendável; tempos de trabalho e produção; custos fixos; taxas; margem sobre o preço; quatro cenários editáveis de venda; simulações de rendimento, insumo e desconto; fichas com valores preservados; impressão e PDF pelo diálogo do navegador; exportação e restauração por backup JSON.

## Verificação

- 19 testes do motor de cálculo aprovados.
- Fluxo testado no navegador: cadastrar compra de 1 kg por R$ 30, utilizar 200 g e obter R$ 6 no lote.
- Ficha do exemplo aprovada: lote R$ 45 / 50 unidades = R$ 0,90; preço Pix R$ 1,50; cartão R$ 1,61; aplicativo R$ 2,44; revenda R$ 1,20.
- Salvamento da ficha, permanência dos dados após recarregar, gravação de custos e exportação de backup conferidos no navegador.
- Simulação de R$ 1,50 com desconto de 5% conferida no navegador: preço monetário final R$ 1,43, antes de apurar taxas e margem.
- Seis telas internas verificadas em largura de 320 px sem transbordamento horizontal; prévia também inspecionada em 390 px e no desktop.

## Dados

Os exemplos podem ser editados ou removidos pelo próprio app. Os dados reais ficam no armazenamento do navegador, por aparelho e por endereço do site. O backup JSON permite transferir os cadastros; a restauração substitui os dados do navegador após confirmação. Não existe sincronização entre aparelhos nesta versão. O histórico mantém os valores das fichas salvas; não há histórico automático de todas as alterações de insumos.

Fontes e instruções locais em `app/README.md`. Identidade e imagens usadas estão em `app/dist/assets/`; prompts de geração em `design/ASSET-PROMPTS.md`.
