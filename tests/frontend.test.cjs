const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { test } = require('node:test');
const root = require('node:path').join(__dirname, '..');

function load(file) {
  const nodes = new Map(), storage = new Map(), alerts = [];
  const node = id => {
    if (!nodes.has(id)) nodes.set(id, { value: '', textContent: '', innerHTML: '', style: {}, classList: { add() {}, remove() {} }, setAttribute() {} });
    return nodes.get(id);
  };
  const context = { console: { warn() {}, error() {}, log() {} }, URL, Blob, Date, Event,
    window: { PMAS_CONFIG: { appsScriptUrl: 'https://example.com/exec' }, setTimeout() {}, clearTimeout() {} },
    document: { addEventListener() {}, getElementById: node },
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

test('rejeição do servidor preserva rascunho e referência para nova tentativa', async () => {
  const a = sending();
  a.context.fetch = async () => ({ ok: true, json: async () => ({ ok: false, mensagem: 'Dados inválidos' }) });
  await a.run('enviarFormulario()');
  assert.equal(a.run('cleared'), false); assert.equal(a.run('success'), false);
  assert(a.alerts[0].includes('Dados inválidos'));
  const previous = a.run('prepareSubmissionPayload().enviadoEm');
  assert.equal(a.run('prepareSubmissionPayload().enviadoEm'), previous);
});

test('resposta sem ID ou erro de rede não mostra sucesso', async () => {
  for (const response of [async () => ({ ok: true, json: async () => ({ ok: true }) }), async () => { throw Error('Falha de conexão'); }]) {
    const a = sending(); a.context.fetch = response;
    await a.run('enviarFormulario()');
    assert.equal(a.run('cleared'), false); assert.equal(a.run('success'), false);
  }
});

test('apenas confirmação explícita de gravação permite concluir o envio', async () => {
  const a = sending(); let options;
  a.context.fetch = async (url, config) => { options = config; return { ok: true, json: async () => ({ ok: true, id: 'id-confirmado' }) }; };
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
