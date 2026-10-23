# Proposta visual — Kalyne Chocolateria / Precifica App

Geradas com a ferramenta integrada `imagegen`, usando a imagem enviada pela usuária como referência de identidade visual. São imagens de proposta, não telas de um aplicativo já implementado. Valores e taxas são exemplos.

## Arquivos

- `01-telas-precificacao-kalyne.png`: Início, Insumos, Ficha técnica, Preço sugerido.
- `02-telas-custos-simulador-kalyne.png`: Custos de produção, Simulador, Minhas fichas.

## Prompt comum às duas imagens

Use case: ui-mockup. Create a polished high fidelity visual proposal for a real mobile pricing app owned by Kalyne Chocolateria, named "Precifica App". The attached image is the STORE BRAND IDENTITY REFERENCE, not a mockup to edit: faithfully carry its Kalyne chocolateria hand-lettered wordmark, layered coral/raspberry/red lettering, brown chocolate cupcake detail, very pale pink backgrounds into the app. Use the logo naturally and clearly in each screen header, with the product name "Precifica App" in smaller modern text underneath. Do not carry over the incidental black "thaisekalyne" screenshot overlay. Brand palette: blush #FFF3F7, warm off-white #FFFBF9, coral #E98F87, raspberry #C31D50, chocolate brown #57382E. Stylish rounded clean sans-serif for all app labels, warm and accessible for a small Brazilian sweet shop; small subtle rounded corners, clear layout, comfortable touch controls, tasteful outlines, restrained shadows. All text in Brazilian Portuguese, large crisp legible type. This is a PRICING-only app: ingredients, packaging, recipe costs, yield, working time, fixed costs, margin, channel fees, price and pricing sheets. No customer catalog, no digital menu, no order screen, no customer management, no sales revenue dashboard. Flat front-facing actual UI layouts, not angled phones, not photographs. Neutral pale blush presentation background, generous spacing and consistent device size, thin light phone frames, no hands or props, no decorative slogans. Large high resolution landscape board with four equal columns. Board title "Kalyne Chocolateria · Precifica App", subtitle "Proposta visual • dados de exemplo".

## Complemento da imagem 1

Four complete mobile screens side by side, each with a short numbered label above:
01 "Início": branded header, greeting "Vamos precificar?", prominent button "Nova precificação", compact summaries "12 receitas" and "24 insumos"; section "Últimas fichas" with Brigadeiro clássico "R$ 1,50 / un", Brownie tradicional "R$ 8,90 / un"; small bottom nav Início, Insumos, Receitas, Custos. Do not show sales or orders.
02 "Insumos": search "Buscar ingrediente ou embalagem", tabs "Ingredientes" and "Embalagens", button "+ Novo insumo", clean list showing Leite condensado "R$ 7,50 • 395 g", Creme de leite "R$ 3,50 • 200 g", Chocolate em pó "R$ 14,00 • 200 g", Forminha "R$ 10,00 • 100 un". Each has subtle edit icon. A modest note "Cadastre o valor que você paga".
03 "Ficha técnica": title "Brigadeiro clássico", ingredient lines Leite condensado 395 g R$7,50, Creme de leite 200 g R$3,50, Chocolate em pó 100 g R$7,00; ingredients subtotal R$18,00; compact fields "Rendimento vendável" =50 unidades, "Tempo de trabalho" =72 min; other costs summary "Embalagens e produção"; primary button "Calcular preço". Use realistic complete form, not a sparse wireframe.
04 "Preço sugerido": title Brigadeiro clássico, selected channel "Venda direta • Pix"; largest result "R$ 1,50" and "/ unidade"; target margin control "40%"; detail costs "Custo do lote R$ 45,00", "Rendimento 50 un", "Custo por unidade R$ 0,90", "Taxa de venda 0%"; small result "Sobra estimada R$ 0,60 / un"; caption "Após os custos informados"; primary "Salvar ficha" and quiet "Ver composição". These are arithmetically consistent example costs and outputs. Show explicit label "Dados de exemplo" unobtrusively. Everything must be legible with correct Portuguese accents. No app implementation code.

## Complemento da imagem 2

Create exactly THREE full mobile app screens in the first three equal columns, with a fourth elegant text-only feature summary column (no fourth phone). Short numbered headings above:
05 "Custos de produção": Kalyne brand header. Section "Sua hora de trabalho": "Remuneração mensal" R$1.800,00, "Horas produtivas / mês" 120 h, computed "R$ 15,00 / hora". Section "Custos fixos": total R$200,00 / mês, rate "R$ 1,67 / hora". Section "Custos diretos": editable field "Gás e energia por lote" R$2,00. Footnote "Valores de exemplo. Evite contar a mesma despesa duas vezes." Primary "Salvar custos".
06 "Simulador": title "Brigadeiro clássico"; base cost R$0,90/un; target margin40%; clean comparison rows "Pix · taxa 0%" → "R$ 1,50", "Cartão · taxa 4%" → "R$ 1,61", "Aplicativo · taxa 23%" → "R$ 2,44"; caption "Taxas ilustrativas e editáveis"; separate revenda option "Margem 25% · taxa 0%" → "R$ 1,20"; compact current price input "Quero cobrar R$1,80" and output "Margem no Pix: 50%"; primary "Aplicar à ficha". Prices coherent with formula cost/(1-margin-fee), upward rounded to cents.
07 "Minhas fichas": search "Buscar receita"; compact list cards "Brigadeiro clássico", "50 unidades • Venda direta", "R$1,50 / un", small chip "Margem 40%"; second "Brownie tradicional" "R$8,90 / un"; each action "Abrir ficha"; selected sheet preview offers "Imprimir" and "Exportar PDF". No actual customer data. Bottom nav consistent with board one.
Fourth text column: heading "O que o app calcula"; six short feature lines with simple icons: "Custo de ingredientes e embalagens", "Rendimento e custo por unidade", "Mão de obra e custos de produção", "Margem sobre o preço de venda", "Taxas por forma de venda", "Simulações e fichas de preço". Footer small "Proposta para avaliação visual". Keep typography clear, all content accurately legible, no order/catalog modules. No app implementation code.

## Ajuste previsto na implementação

As duas pranchas apresentam variações na barra inferior. A implementação deverá usar uma navegação única e consistente, com destinos principais Início, Insumos, Receitas e Mais; Custos, Simulador e Minhas fichas devem ser acessíveis por atalhos claros. O logo da loja deverá usar o arquivo de marca fornecido, e não uma reconstrução gerada.
