export const seedState = () => ({
  version: 1, example: true,
  ingredients: [
    {id:'leite',name:'Leite condensado',category:'ingredient',price:7.5,quantity:395,unit:'g',emoji:'🥫',brand:'',updatedAt:'2026-10-23'},
    {id:'creme',name:'Creme de leite',category:'ingredient',price:3.5,quantity:200,unit:'g',emoji:'🥛',brand:'',updatedAt:'2026-10-23'},
    {id:'cacau',name:'Chocolate em pó',category:'ingredient',price:14,quantity:200,unit:'g',emoji:'🍫',brand:'',updatedAt:'2026-10-23'},
    {id:'forminha',name:'Forminha rosa',category:'packaging',price:10,quantity:100,unit:'un',emoji:'🧁',brand:'',updatedAt:'2026-10-23'},
    {id:'chocolate',name:'Chocolate meio amargo',category:'ingredient',price:30,quantity:1,unit:'kg',emoji:'🍫',brand:'',updatedAt:'2026-10-23'},
    {id:'manteiga',name:'Manteiga',category:'ingredient',price:12,quantity:200,unit:'g',emoji:'🧈',brand:'',updatedAt:'2026-10-23'},
    {id:'farinha',name:'Farinha de trigo',category:'ingredient',price:6,quantity:1,unit:'kg',emoji:'🌾',brand:'',updatedAt:'2026-10-23'},
    {id:'acucar',name:'Açúcar',category:'ingredient',price:5,quantity:1,unit:'kg',emoji:'🍚',brand:'',updatedAt:'2026-10-23'},
    {id:'ovo',name:'Ovos',category:'ingredient',price:12,quantity:12,unit:'un',emoji:'🥚',brand:'',updatedAt:'2026-10-23'},
    {id:'pote',name:'Pote com tampa',category:'packaging',price:20,quantity:20,unit:'un',emoji:'🥡',brand:'',updatedAt:'2026-10-23'}
  ],
  recipes: [
    {id:'brigadeiro',name:'Brigadeiro clássico',category:'Docinhos',yield:50,yieldUnit:'un',weightGrams:1000,minutes:72,productionMinutes:72,directCost:2,margin:40,price:1.5,image:'brigadeiro',notes:'Exemplo de precificação. Substitua pelos ingredientes e pelo rendimento real da sua receita.',items:[{type:'ingredient',id:'leite',quantity:395,unit:'g'},{type:'ingredient',id:'creme',quantity:200,unit:'g'},{type:'ingredient',id:'cacau',quantity:100,unit:'g'}],packaging:[{id:'forminha',quantity:50,unit:'un'}]},
    {id:'brownie',name:'Brownie tradicional',category:'Brownies',yield:12,yieldUnit:'un',weightGrams:900,minutes:60,productionMinutes:90,directCost:3,margin:40,price:5.9,image:'brownie',notes:'Informe o rendimento vendável depois de assar e cortar.',items:[{type:'ingredient',id:'chocolate',quantity:200,unit:'g'},{type:'ingredient',id:'manteiga',quantity:100,unit:'g'},{type:'ingredient',id:'acucar',quantity:200,unit:'g'},{type:'ingredient',id:'farinha',quantity:100,unit:'g'},{type:'ingredient',id:'ovo',quantity:3,unit:'un'}],packaging:[{id:'forminha',quantity:12,unit:'un'}]},
    {id:'ganache',name:'Ganache de chocolate',category:'Receita base',yield:400,yieldUnit:'g',weightGrams:400,minutes:15,productionMinutes:15,directCost:1,margin:40,price:0.08,image:'brigadeiro',notes:'Receita base. Ao usar em outra receita, some o tempo de preparo ao tempo total do produto final.',items:[{type:'ingredient',id:'chocolate',quantity:200,unit:'g'},{type:'ingredient',id:'creme',quantity:200,unit:'g'}],packaging:[]}
  ],
  settings: {monthlyPay:1800,workHours:120,productiveHours:120,fixedCosts:[{name:'Parcela do espaço de produção',value:150},{name:'Manutenção e utensílios',value:50}],taxRate:0},
  scenarios:[{id:'pix',name:'Venda direta · Pix',fee:0,margin:null,icon:'pix'},{id:'card',name:'Cartão',fee:4,margin:null,icon:'card'},{id:'app',name:'Aplicativo',fee:23,margin:null,icon:'app'},{id:'resale',name:'Revenda',fee:0,margin:25,icon:'store'}],
  sheets:[]
});
