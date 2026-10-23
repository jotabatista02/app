import fs from 'node:fs';
const file=new URL('../app/dist/app.js',import.meta.url);
let source=fs.readFileSync(file,'utf8');
function replace(oldText,newText){if(!source.includes(oldText))throw Error('Trecho não encontrado: '+oldText.slice(0,90));source=source.replace(oldText,newText);}
function lineFunction(name,newText){const start=source.indexOf('function '+name+'(');if(start<0)throw Error(name);const end=source.indexOf('\n',start);source=source.slice(0,start)+newText+'\n'+source.slice(end+1);}

replace("const x=safePricing(r);if(x.error)","const x=safeCost(r);if(x.error)");
replace("const x=safePricing(r);if(x.error)","const x=safeCost(r);if(x.error)");
replace("const c=x.c;const scenario=", "const c=x.c;if(priceRecipeId!==r.id){selectedScenario=r.priceScenario||state.scenarios[0].id;priceRecipeId=r.id;}const scenario=");
replace("let p;try{p=priceFor(c.unitCost,margin,scenario.fee,state.settings.taxRate);}catch(e){return `${heading(esc(r.name))}${notice(esc(e.message),'warning')}<a href=\"#/costs\" class=\"button secondary\">Revisar taxas</a>`;}","let p={price:null,fees:null,profit:null,margin:null,breakEven:null};try{p=priceFor(c.unitCost,margin,scenario.fee,state.settings.taxRate);}catch{} ");
replace("${money(p.price*r.yield)}","${money(p.price==null?null:p.price*r.yield)}");
replace("<span class=\"row-sub\">Margem ${pct(r.margin??40)}</span>","<span class=\"row-sub\">${esc(x.scenario.name)} · ${pct(x.p.margin)}</span>");
replace("function makeDraft(rid){draft=", "function makeDraft(rid){draft=");
const draftStart=source.indexOf('function makeDraft('),draftEnd=source.indexOf('\n',draftStart);
let make=source.slice(draftStart,draftEnd);
make=make.replace('directCost:0,margin:40','directCost:state.settings.defaultDirectCost??2,margin:40').replace(/;\}$/, ';draftBaseline=JSON.stringify(draft);}');
source=source.slice(0,draftStart)+make+source.slice(draftEnd);
replace("draft.weightGrams=$('#recipe-weight').value.trim()===''?undefined:num($('#recipe-weight').value);", "draft.weightGrams=draft.yieldUnit==='kg'?draft.yield*1000:draft.yieldUnit==='g'?draft.yield:$('#recipe-weight').value.trim()===''?undefined:num($('#recipe-weight').value);const massYield=draft.yieldUnit!=='un';$('#recipe-weight').readOnly=massYield;if(massYield)$('#recipe-weight').value=val(draft.weightGrams);");
replace("const finalPrice=Math.round((sim.sellPrice*(1-sim.discount/100)+Number.EPSILON)*100)/100;", "priceFor(1,sim.margin,0,0);const finalPrice=roundCurrency(sim.sellPrice*(1-sim.discount/100));");
replace("function validateBackup(data){", "function legacyValidateBackup(data){");
replace("const data=validateBackup(JSON.parse(await file.text()));", "const data=validateState(JSON.parse(await file.text()));");
replace("ingredients:structuredClone(ingredients),settings:","ingredients:structuredClone(ingredients),recipes:structuredClone(state.recipes.map(item=>item.id===r.id?r:item)),settings:");
replace("document.body.classList.add('modal-open');", "document.body.classList.add('modal-open');$('#app').inert=true;");
replace("document.body.classList.remove('modal-open');previousFocus?.focus();", "document.body.classList.remove('modal-open');$('#app').inert=false;pendingLeave=null;previousFocus?.isConnected&&previousFocus.focus();");
replace("draft.directCost=state.settings.defaultDirectCost??0;", "draft.directCost=state.settings.defaultDirectCost??2;draftBaseline=JSON.stringify(draft);");
replace("draft.archived=false;current.id=null;route('edit');", "draft.archived=false;draftBaseline=JSON.stringify(draft);current.id=null;route('edit');");
replace("selectedScenario='pix';route('price',draft.id);", "draft=null;draftBaseline=null;selectedScenario='pix';priceRecipeId=null;route('price',saved.id);");
replace("Object.assign(next,restored);});pendingImport=null;", "Object.assign(next,restored);},{replace:true});pendingImport=null;");
replace("next.example=false;});draft=null;", "next.example=false;},{replace:true});draft=null;");
replace("const parts=decodeURIComponent(location.hash.replace(/^#\\/?/,'')).split('/');", "const parts=location.hash.replace(/^#\\/?/,'').split('/').map(part=>{try{return decodeURIComponent(part);}catch{return '';}});");
replace("if(current.page==='edit'&&draft)updateDraftTotals();", "if(current.page==='edit'&&draft){updateDraftTotals();syncMassYield();}if(current.page==='costs')costsBaseline=formFingerprint($('#costs-form'));if(current.page==='price'&&$('#target-margin'))refreshPrice();");
replace("<p class=\"field-help\">Informe o que fica pronto para vender, já descontando as perdas.</p>","<p class=\"field-help\">Informe o que fica pronto para vender, já descontando as perdas. Use vírgula para decimais: 0,125 kg.</p>");
replace("<div class=\"notice info\"><span id=\"ingredient-preview\">Ex.: 1 kg por R$ 30 custa R$ 0,03 por grama.</span></div>","<div class=\"notice info\"><span id=\"ingredient-preview\">Ex.: 1 kg por R$ 30 custa R$ 0,03 por grama. Use vírgula para decimais.</span></div>");
replace("const blob=new Blob([JSON.stringify(state,null,2)]", "const blob=new Blob([recoveryRaw??JSON.stringify(state,null,2)]");
replace("link.download='kalyne-backup-'", "link.download=(recoveryRaw?'kalyne-recuperacao-':'kalyne-backup-')");

lineFunction('refreshPrice',`function refreshPrice(){
  const r=getRecipe();const scenario=state.scenarios.find(s=>s.id===selectedScenario)||state.scenarios[0];const save=$('[data-action="save-sheet"]');
  try{const c=cost(r);const margin=num($('#target-margin').value);const p=priceFor(c.unitCost,margin,scenario.fee,state.settings.taxRate);$('#price-error').textContent='';$('#suggested-price').textContent=money(p.price);$('#price-fees').textContent=money(p.fees);$('#price-batch').textContent=money(p.price*r.yield);$('#price-profit').textContent=money(p.profit);$('#price-margin').textContent=pct(p.margin);$('#break-even').textContent=money(p.breakEven);if(save)save.disabled=false;return {r,c,p,scenario,margin};}
  catch(error){$('#price-error').textContent=error.message+' Ajuste a margem ou escolha outra forma de venda.';for(const key of ['suggested-price','price-fees','price-batch','price-profit','price-margin','break-even'])$('#'+key).textContent='—';if(save)save.disabled=true;return null;}
}`);
lineFunction('refreshSim',`function refreshSim(){
  try{const {r,c,p}=simulated();$('#sim-error').textContent='';$('#sim-unit-cost').textContent=money(c.unitCost);$('#sim-scenarios').innerHTML=state.scenarios.map(sc=>{
    try{const result=priceFor(c.unitCost,sc.margin??sim.margin,sc.fee,state.settings.taxRate);return '<div class="scenario-card">'+icon(sc.icon,26)+'<div class="row-main"><strong>'+esc(sc.name)+' · taxa '+pct(sc.fee)+'</strong><span class="row-sub">Margem '+pct(sc.margin??sim.margin)+' · taxas '+money(result.fees)+'</span></div><strong class="scenario-price">'+money(result.price)+'</strong></div>';}
    catch(error){return '<div class="scenario-card"><div class="row-main"><strong>'+esc(sc.name)+'</strong><span class="field-error">'+esc(error.message)+'</span></div><span class="badge warning">Ajustar margem</span></div>';}
  }).join('');$('#sim-actual-margin').textContent=pct(p.margin);$('#sim-actual-margin').classList.toggle('negative',p.profit<0);$('#sim-actual-profit').textContent=money(p.profit)+' de sobra estimada / '+r.yieldUnit;$('#sim-coverage').innerHTML=notice(p.profit<0?'Este preço fica abaixo dos custos e taxas informados.':'Preço final com desconto: '+money(p.price)+'. Cobre os custos informados.',p.profit<0?'warning':'info');return true;}
  catch(error){$('#sim-error').textContent=error.message;$('#sim-unit-cost').textContent='—';$('#sim-scenarios').innerHTML='';$('#sim-actual-margin').textContent='—';$('#sim-actual-profit').textContent='';$('#sim-coverage').innerHTML='';return false;}
}`);
// Obsolete validation is replaced by the tested state module, avoiding two contracts.
const legacyStart=source.indexOf('function legacyValidateBackup('),legacyEnd=source.indexOf('\n',legacyStart);
source=source.slice(0,legacyStart)+source.slice(legacyEnd+1);
replace("function saveSnapshot({", "function saveSnapshot({");
replace("recipe.priceScenario=scenario.id;}});notify", "recipe.priceScenario=scenario.id;}});draft=null;draftBaseline=null;notify");
replace("case 'close-modal':closeModal();break;", "case 'close-modal':closeModal();break;\n+ case 'confirm-leave':{const leave=pendingLeave;closeModal();draft=null;draftBaseline=null;costsBaseline=null;leave?.();break;}".replace('\n+ ','\n '));
replace("window.addEventListener('hashchange',()=>{render();window.scrollTo({top:0,behavior:'instant'});});", `window.addEventListener('hashchange',()=>{
  if(hasUnsavedChanges()) { const target=location.hash;history.replaceState(null,'','#/'+current.page+(current.id?'/'+encodeURIComponent(current.id):''));confirmLeave(()=>{location.hash=target;});return; }
  if(current.page==='edit'){draft=null;draftBaseline=null;}render();window.scrollTo({top:0,behavior:'instant'});
});`);

source+=`
function syncMassYield(){if(!draft||!$('#recipe-weight'))return;const mass=draft.yieldUnit!=='un';$('#recipe-weight').readOnly=mass;if(mass){draft.weightGrams=draft.yieldUnit==='kg'?draft.yield*1000:draft.yield;$('#recipe-weight').value=val(draft.weightGrams);}}
function formFingerprint(form){return form?JSON.stringify([...form.querySelectorAll('input,select,textarea')].map(el=>[el.id||el.className,el.value])):'';}
function hasUnsavedChanges(){if(current.page==='edit'&&draft&&$('#recipe-form')){pullDraft();return draftBaseline!==JSON.stringify(draft);}return current.page==='costs'&&costsBaseline!==null&&costsBaseline!==formFingerprint($('#costs-form'));}
function confirmLeave(leave){openModal('Você tem alterações não salvas','<p>Salve suas alterações antes de sair ou descarte apenas o que ainda não foi salvo.</p>',button('Continuar editando','close-modal','secondary')+button('Descartar alterações','confirm-leave','primary'));pendingLeave=leave;}
document.addEventListener('click',event=>{const link=event.target.closest('a[href^="#/"]');if(!link||link.hash===location.hash||!hasUnsavedChanges())return;event.preventDefault();event.stopImmediatePropagation();const target=link.hash;confirmLeave(()=>{location.hash=target;});},true);
window.addEventListener('beforeunload',event=>{if(hasUnsavedChanges()){event.preventDefault();event.returnValue='';}});
window.addEventListener('storage',event=>{
  if(event.key!==STORAGE)return;
  if(hasUnsavedChanges()){remoteChanged=true;loadWarning='Outra aba alterou os dados. Suas alterações nesta tela foram preservadas. Reabra os dados atuais antes de salvar.';notify(loadWarning);return;}
  try{state=validateState(event.newValue?JSON.parse(event.newValue):seedState());remoteChanged=false;draft=null;draftBaseline=null;sim=null;render();notify('Caderno atualizado com as alterações da outra aba.');}
  catch{persistenceBlocked=true;loadWarning='Os dados alterados em outra aba precisam de recuperação. Seus dados desta sessão foram preservados.';render();}
});
`;
fs.writeFileSync(file,source);
console.log('Correções de integração aplicadas.');
