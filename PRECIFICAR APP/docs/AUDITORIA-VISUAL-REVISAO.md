# Revisão visual e de responsividade — Kalyne

Data: 23/10/2026.

Referências: `design/01-telas-kalyne-v2.png` e `design/02-telas-kalyne-v2.png`, aprovadas na conversa. A identidade foi preservada: logo Kalyne, blush, raspberry, chocolate, cards suaves e ícones de contorno.

Esta revisão inspecionou `app/dist/styles.css` e `app/dist/app.js`. A inspeção deste agente foi estática, sem operar navegador. A verificação de telas e fluxos no navegador ficou com o agente principal. Apenas `styles.css` foi editado nesta revisão; o JavaScript foi lido.

## Problemas e correções

| Prioridade | Evidência anterior | Correção em CSS | Validação ainda necessária |
| --- | --- | --- | --- |
| P1 | `.editor-grid` usava duas colunas com `!important`, derrotando o colapso da grade entre 761 e 900 px. Em 768 px, o agente principal confirmou colunas de 263,95 e 203,05 px e `.line-name` com largura zero. | Editor com uma coluna até 1180 px e painel lateral sem `sticky` nessa faixa. Acima disso, conserva duas colunas. | Reabrir ficha em 768, 1024 e 1440 px. |
| P1 | `.modal-footer` não permitia quebra; botões tinham texto sem quebra e largura mínima de conteúdo. Três ações de insumo e duas ações longas de ficha ultrapassavam a largura útil de 320–390 px. | `flex-wrap`, botões com texto quebrável, `min-width: 0` e base flexível de 140 px no mobile/150 px no desktop. | Editar insumo e abrir ficha em 320 e 390 px, incluindo teclado aberto. |
| P2 | Lista de receitas reservava lado a lado miniatura, nome, preço e seta. O nome ficava com espaço muito pequeno em 320 px. | No mobile, miniatura à esquerda, nome e preço na coluna central em duas linhas, seta na direita. | Nomes com espaços e nomes de 100 caracteres em 320/375/390 px. |
| P2 | Notas de ajuda tinham 10 px e contraste aproximado de 3,01:1 em branco. Alguns avisos tinham 10 px/3,31:1. | Ajuda e avisos com 12 px. Texto secundário #816771: 5,11:1 em branco e 4,63:1 em #fff0f5. Avisos amarelos também escurecidos. | Conferência visual em celular, preservando hierarquia e densidade. |
| P2 | Anel de foco rosa #f291ac tinha contraste de aproximadamente 2,23:1 em branco. | Anel raspberry #d0134b e borda raspberry na busca focada. | Navegação por Tab em todos os campos, abas e ações. |
| P2 | Várias ações mobile usavam 28–35 px. | Ícones, ações de topo, abas e botões pequenos com área mínima de 44 px; linhas de receita com campos de 44 px; margem aceita quebra para manter os controles disponíveis. | Conferir preço em 320 px e insumos em 375/390 px. |
| P2 | `.sidebar` fixa não rolava, podendo esconder o rodapé em notebooks com pouca altura. | Rolagem vertical da sidebar e navegação/logo sem encolhimento. | Tela de aproximadamente 1280 × 600 px. |
| P2 | `.sheet-list { grid-template-columns: 1fr }` não vencia a especificidade de `.grid.two` no tablet. | Seletor `.sheet-list.grid.two` no mesmo intervalo garante coluna única. | Fichas em 768/1024 px. |
| P2 | Ações de backup em painel de meia largura não permitiam quebra entre 901 e 1180 px. | `.panel-body .page-actions` permite quebra. | Preferências em 1024 px. |
| P3 | Nome de receita longo e sem espaços podia alargar o cabeçalho. | Contêiner de título com `min-width: 0` e título com `overflow-wrap: anywhere`; descrições e rótulos de resumo também podem quebrar palavras. | Nome com 100 caracteres sem espaços. |

## Pontos conferidos na leitura

- `.sr-only` mantém rótulos acessíveis sem ocupar espaço visual.
- Inputs, selects e textarea mobile usam 16 px para evitar ampliação automática ao focar.
- Modais têm `role="dialog"`, `aria-modal`, título associado, Escape e ciclo de Tab implementados no JavaScript existente.
- Modais bloqueiam rolagem de fundo com `.modal-open` e usam altura baseada em `dvh`.
- A impressão esconde os demais filhos de `body` quando há `#print-root`; `.print-sheet` fica invisível na tela comum.
- Preço principal, títulos, botões e logo conservaram as cores e proporções da identidade aprovada.
- A barra inferior considera `safe-area-inset-bottom` e o conteúdo reserva espaço abaixo.

## Limites desta revisão

As medidas de contraste foram calculadas diretamente a partir das cores em sRGB, sem afirmar conformidade global de acessibilidade. Pequenos textos decorativos, como rodapé da marca, mantêm sua aparência discreta. Nesta revisão, os estados financeiros e as fórmulas não foram alterados. A validação final de sobreposição, foco e impressão depende dos testes do agente principal no navegador.
