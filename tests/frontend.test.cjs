const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { test } = require('node:test');
const root = require('node:path').join(__dirname, '..');

function load(file) {
  const nodes = new Map(), storage = new Map(), alerts = [];
  const node = id => {
    if (!nodes.has(id)) {
      const classes = new Set();
      nodes.set(id, { value: '', textContent: '', innerHTML: '', style: {}, dataset: {}, attributes: {}, type: 'password',
        classList: { add(name) { classes.add(name); }, remove(name) { classes.delete(name); }, toggle(name, on) { on ? classes.add(name) : classes.delete(name); }, contains(name) { return classes.has(name); } },
        setAttribute(name, value) { this.attributes[name] = value; }, removeAttribute(name) { delete this.attributes[name]; }, querySelector(selector) { return node(id + ':' + selector); }, querySelectorAll() { return []; }, focus() {}, scrollIntoView() {} });
    }
    return nodes.get(id);
  };
  const context = { console: { warn() {}, error() {}, log() {} }, URL, Blob, Date, Event,
    window: { PMAS_CONFIG: { appsScriptUrl: 'https://example.com/exec' }, setTimeout() {}, clearTimeout() {} },
    document: { addEventListener() {}, getElementById: node, querySelectorAll:()=>[], querySelector:()=>null },
    localStorage: { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) },
    alert: message => alerts.push(message), fetch: async () => ({ ok: true, json: async () => ({ ok: true, id: 'recebido' }) })
  };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(root + '/' + file, 'utf8'), context);
  return { context, nodes, storage, alerts, run: code => vm.runInContext(code, context) };
}

test('painel mostra quantidade e textos das metas incluídas sem alterar a execução', () => {
  const a = load('painel.js');
  a.run(`dashboardState.submissions = dashboardState.filtered = [{id:'x', nome:'Pessoa', sim:3, nao:1, metas:[], inclusaoMetas:['Meta A','<img src=x onerror=alert(1)>']}]; renderMetrics(); openDetails('x');`);
  assert.equal(a.nodes.get('metricIncluded').textContent, 2);
  assert.equal(a.nodes.get('metricRate').textContent, 75);
  const details = a.nodes.get('detailContent').innerHTML;
  assert(details.includes('Inclusão de Metas Concluídas'));
  assert(details.includes('Meta A'));
  assert(details.includes('&lt;img'));
  assert(!details.includes('<img'));
});

test('registros antigos sem inclusaoMetas continuam funcionando', () => {
  const a = load('painel.js');
  a.run(`dashboardState.submissions = dashboardState.filtered = [{id:'antigo', sim:0, nao:0}]; renderMetrics(); openDetails('antigo');`);
  assert.equal(a.nodes.get('metricIncluded').textContent, 0);
  assert(a.nodes.get('detailContent').innerHTML.includes('Nenhuma meta nesta situação.'));
});

test('CSV neutraliza fórmulas e conserva aspas e quebras de linha', () => {
  const a = load('painel.js');
  assert.equal(a.run(`csvCell('=1+1')`), `"'=1+1"`);
  assert.equal(a.context.csvCell('Meta "A"\nMeta B'), '"Meta ""A""\nMeta B"');
});

test('consulta do painel usa POST e não inclui senha na URL', async () => {
  const a = load('painel.js'); let call;
  a.context.fetch = async (url, options) => { call = { url, options }; return { ok: true, json: async () => ({ ok: true, autenticado: true, envios: [] }) }; };
  await a.run(`requestDashboard({sistema:'Sistema de Vigilância', senha:'senha-de-teste'})`);
  assert(!call.url.includes('senha-de-teste'));
  assert.equal(call.options.method, 'POST');
  assert.equal(JSON.parse(call.options.body).acao, 'painel');
});

function sending() {
  const a = load('script.js');
  a.run(`addAdditionalGoal=()=>{}; validateIdentification=()=>true; validateAllMetas=()=>true;
    globalThis.cleared=false; globalThis.success=false;
    buildPayload=()=>({enviadoEm:new Date().toISOString(),identificacao:{nome:'Teste'},metas:[],inclusaoMetas:['Meta A']});
    resetFormAfterSuccessfulSubmit=()=>{cleared=true}; openSuccessModal=()=>{success=true};`);
  return a;
}

function submissionResponse(response) {
  return async (url, options) => options?.method === 'POST' ? response(url, options)
    : { ok: true, json: async () => ({ ok: true, versaoFormulario: 2 }) };
}

test('rejeição do servidor preserva rascunho e referência para nova tentativa', async () => {
  const a = sending();
  a.context.fetch = submissionResponse(async () => ({ ok: true, json: async () => ({ ok: false, mensagem: 'Dados inválidos' }) }));
  await a.run('enviarFormulario()');
  assert.equal(a.run('cleared'), false); assert.equal(a.run('success'), false);
  assert(a.alerts[0].includes('Dados inválidos'));
  const previous = a.run('prepareSubmissionPayload().enviadoEm');
  assert.equal(a.run('prepareSubmissionPayload().enviadoEm'), previous);
});

test('resposta sem ID ou erro de rede não mostra sucesso', async () => {
  for (const response of [async () => ({ ok: true, json: async () => ({ ok: true }) }), async () => { throw Error('Falha de conexão'); }]) {
    const a = sending(); a.context.fetch = submissionResponse(response);
    await a.run('enviarFormulario()');
    assert.equal(a.run('cleared'), false); assert.equal(a.run('success'), false);
  }
});

test('apenas confirmação explícita de gravação permite concluir o envio', async () => {
  const a = sending(); let options;
  a.context.fetch = submissionResponse(async (url, config) => { options = config; return { ok: true, json: async () => ({ ok: true, id: 'id-confirmado' }) }; });
  await a.run('enviarFormulario()');
  assert.equal(a.run('cleared'), true); assert.equal(a.run('success'), true);
  assert.notEqual(options.mode, 'no-cors');
});

test('referências fixas de elementos JavaScript existem no HTML', () => {
  for (const [script, html] of [['painel.js', 'painel.html'], ['script.js', 'index.html']]) {
    const code = fs.readFileSync(root + '/' + script, 'utf8'), markup = fs.readFileSync(root + '/' + html, 'utf8');
    const ids = [...markup.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
    const references = [...code.matchAll(/getElementById\("([^"]+)"\)/g)].map(m => m[1]);
    assert.equal(ids.length, new Set(ids).size);
    assert.deepEqual([...new Set(references.filter(id => !ids.includes(id)))], []);
  }
});

test('rótulos de eixos são formatados sem modificar os valores dos dados', () => {
  const a = load('painel.js');
  for (const [value, label] of [['ORGÃO GESTOR', 'Órgão Gestor'], ['GESTÃO SUAS', 'Gestão SUAS'], ['FUNDO MUNICIPAL', 'Fundo Municipal'], ['PROTEÇÃO SOCIAL BÁSICA (PSB)', 'Proteção Social Básica'], ['SEGURANÇA ALIMENTAR', 'Segurança Alimentar'], ['COMPLEXO DA CIDADANIA', 'Complexo da Cidadania']]) {
    assert.equal(a.context.shortAxis(value), label);
  }
  a.run(`dashboardState.axes=['ORGÃO GESTOR']; populateAxes();`);
  assert(a.nodes.get('axisFilter').innerHTML.includes('value="ORGÃO GESTOR">Órgão Gestor'));
  assert(a.nodes.get('axisNavigation').innerHTML.includes('data-axis-filter="ORGÃO GESTOR"'));
});

test('estado sem dados usa traços; registro com contagem zero continua exibindo zero', () => {
  const a = load('painel.js'); a.run('renderMetrics(); renderEmptyState();');
  assert.equal(a.nodes.get('metricSubmissions').textContent, '—');
  assert.equal(a.nodes.get('metricRate').textContent, '—');
  assert.equal(a.nodes.get('emptyClearFilters').hidden, true);
  a.nodes.get('searchFilter').value = 'Busca sem resultado'; a.run('renderEmptyState()');
  assert.equal(a.nodes.get('emptyClearFilters').hidden, false);
  assert.equal(a.nodes.get('emptyStateTitle').textContent, 'Nenhum resultado para estes filtros');
  a.run('dashboardState.filtered=[{sim:0,nao:1}];renderMetrics()');
  assert.equal(a.nodes.get('metricYes').textContent, 0);
  assert.equal(a.nodes.get('metricRate').textContent, 0);
});

test('loading e erro de acesso têm estados acessíveis sem trocar a autenticação', () => {
  const a = load('painel.js');
  a.run(`setButtonLoading(document.getElementById('loginButton'),true,'Validando...');setLoginError('Senha inválida');`);
  assert.equal(a.nodes.get('loginButton').disabled, true);
  assert.equal(a.nodes.get('loginButton').attributes['aria-busy'], 'true');
  assert.equal(a.nodes.get('loginButton').classList.contains('is-loading'), true);
  assert.equal(a.nodes.get('loginPassword').attributes['aria-invalid'], 'true');
  a.run('togglePassword()');
  assert.equal(a.nodes.get('passwordToggle').attributes['aria-pressed'], 'true');
  a.run('togglePassword();setLoginError("");');
  assert.equal(a.nodes.get('passwordToggle').attributes['aria-pressed'], 'false');
  assert.equal(a.nodes.get('loginPassword').attributes['aria-invalid'], 'false');
});

test('Não exige justificativa antes da revisão; Sim não envia texto residual', () => {
  const a=load('script.js');
  a.run(`state.identificacao.eixo='COMPLEXO DA CIDADANIA'; getActiveMetas().forEach(item=>{state.metas[item.id]={resposta:'sim',justificativa:''}}); state.metas[getActiveMetas()[0].id].resposta='nao';`);
  assert.equal(a.run('validateAllMetas()'),false);
  const id=a.run('getActiveMetas()[0].id');
  assert.equal(a.nodes.get('reason-'+id).attributes['aria-invalid'],'true');
  a.run(`state.metas[getActiveMetas()[0].id].justificativa='Aguardando equipe.'`);
  assert.equal(a.run('validateAllMetas()'),true);
  assert.equal(a.run('buildPayload().metas[0].justificativa'),'Aguardando equipe.');
  a.run(`state.metas[getActiveMetas()[0].id].resposta='sim'`);
  assert.equal(a.run('buildPayload().metas[0].justificativa'),'');
});

test('novas metas mantêm texto e ano por eixo, exigem ambos e não alteram execução', () => {
  const a=load('script.js');
  a.run(`state.identificacao.eixo='COMPLEXO DA CIDADANIA'; state.novasMetasPorEixo[state.identificacao.eixo]=[{texto:'Meta futura',ano:''}];`);
  assert.equal(a.run('validateFutureGoals()'),false);
  a.run(`getFutureGoals()[0].ano='2027'`);assert.equal(a.run('validateFutureGoals()'),true);
  assert.equal(a.run('buildPayload().novasMetas[0].ano'),2027);
  assert.equal(a.run('getStats().total'),6);
  a.run(`state.identificacao.eixo='GESTÃO SUAS'`);assert.equal(a.run('getFutureGoals().length'),0);
  a.run(`state.identificacao.eixo='COMPLEXO DA CIDADANIA';getFutureGoals()[0].ano='2030'`);assert.equal(a.run('validateFutureGoals()'),false);
});

test('rascunho preserva justificativas e planejamento com ano sem misturar eixos', () => {
  const a=load('script.js');
  a.run(`state.identificacao.eixo='COMPLEXO DA CIDADANIA';state.metas[getActiveMetas()[0].id]={resposta:'nao',justificativa:'Motivo salvo.'};state.novasMetasPorEixo[state.identificacao.eixo]=[{texto:'Planejamento salvo',ano:'2028'}];saveState(false);state=loadState()`);
  assert.equal(a.run('state.metas[getActiveMetas()[0].id].justificativa'),'Motivo salvo.');
  assert.equal(a.run('getFutureGoals()[0].ano'),'2028');
});

test('campo de justificativa aparece e é obrigatório somente para Não', () => {
  const a=load('script.js');
  a.run(`state.identificacao.eixo='COMPLEXO DA CIDADANIA';state.metas[getActiveMetas()[0].id]={resposta:'nao',justificativa:'<texto de teste>'}`);
  let html=a.run('renderMetaCard(getActiveMetas()[0],categories[0])');
  assert(html.includes('&lt;texto de teste&gt;'));assert(!html.includes('hidden>'));
  assert(html.includes('maxlength="2000" required'));
  a.run(`state.metas[getActiveMetas()[0].id].resposta='sim'`);
  html=a.run('renderMetaCard(getActiveMetas()[0],categories[0])');
  assert(html.includes('hidden>'));assert(html.includes('maxlength="2000" disabled'));
});

test('servidor antigo bloqueia envio antes do POST para não descartar os novos campos', async () => {
  const a=sending();let posts=0;
  a.context.fetch=async(url,options)=>{if(options?.method==='POST')posts++;return{ok:true,json:async()=>({ok:true,configurado:true})}};
  await a.run('enviarFormulario()');
  assert.equal(posts,0);assert.equal(a.run('success'),false);assert.equal(a.run('cleared'),false);
  assert(a.alerts[0].includes('recebimento precisa ser atualizado'));
});

test('painel e CSV exibem motivos e planejamento anual com texto escapado', async () => {
  const a=load('painel.js');let blob;
  a.context.URL={createObjectURL:b=>{blob=b;return 'blob:teste'},revokeObjectURL(){}};
  a.context.document.createElement=()=>({click(){}});
  a.run(`dashboardState.submissions=dashboardState.filtered=[{id:'novo',sim:1,nao:1,metas:[{codigo:'X',texto:'Meta original',resposta:'nao',justificativa:'<script>motivo</script>'}],novasMetas:[{texto:'Planejamento <img>',ano:2028}]}];openDetails('novo');exportCsv()`);
  const details=a.nodes.get('detailContent').innerHTML;
  assert(details.includes('&lt;script&gt;motivo'));assert(details.includes('2028'));assert(details.includes('Planejamento &lt;img&gt;'));
  assert(!details.includes('<script>'));
  const csv=await blob.text();assert(csv.includes('Justificativas das metas não concluídas'));assert(csv.includes('2028: Planejamento <img>'));
});

test('etapa visual e navegação acessível acompanham a etapa real', () => {
  const a=load('script.js');
  a.context.document.documentElement={dataset:{}};
  a.context.window.scrollTo=()=>{};
  const first=a.context.document.getElementById('nav1'),second=a.context.document.getElementById('nav2');
  first.dataset.stepTarget='1';second.dataset.stepTarget='2';first.setAttribute('aria-current','step');
  a.context.document.querySelectorAll=selector=>selector==='.step-button'?[first,second]:[];
  a.run('setActiveStep(2)');
  assert.equal(a.context.document.documentElement.dataset.step,'2');
  assert.equal(second.attributes['aria-current'],'step');
  assert.equal(first.attributes['aria-current'],undefined);
  assert.equal(a.run('state.currentStep'),2);
});

test('janelas bloqueiam foco no formulário e devolvem foco ao fechar', () => {
  const a=load('script.js'),app={inert:false};let focusReturned=false;
  a.context.document.querySelector=selector=>selector==='.app-shell'?app:null;
  a.context.document.activeElement={isConnected:true,offsetParent:{},focus(){focusReturned=true}};
  a.run(`showModal(document.getElementById('successModal'),'button')`);
  assert.equal(app.inert,true);
  assert.equal(a.nodes.get('successModal').attributes['aria-hidden'],'false');
  a.run(`hideModal(document.getElementById('successModal'))`);
  assert.equal(app.inert,false);assert.equal(focusReturned,true);
  assert.equal(a.nodes.get('successModal').attributes['aria-hidden'],'true');
});
