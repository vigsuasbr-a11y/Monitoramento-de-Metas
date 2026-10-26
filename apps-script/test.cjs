const fs = require('node:fs');
const vm = require('node:vm');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const { test } = require('node:test');

function ambiente() {
  const props = new Map();
  let falharNaAba = '';
  let sequencia = 0;
  const livro = {
    abas: new Map(), getId: () => 'planilha-de-teste',
    getSheetByName(nome) { return this.abas.get(nome); },
    insertSheet(nome) { const aba = new Folha(nome); this.abas.set(nome, aba); return aba; }
  };
  class Folha {
    constructor(nome) { this.nome = nome; this.rows = []; this.maxRows = 1000; this.maxCols = 26; }
    getName() { return this.nome; }
    getLastRow() { return this.rows.length; }
    getLastColumn() { return Math.max(0, ...this.rows.map(r => r.length)); }
    getMaxRows() { return this.maxRows; }
    getMaxColumns() { return this.maxCols; }
    insertRowsAfter(n, q) { this.maxRows += q; }
    insertColumnsAfter(n, q) { this.maxCols += q; }
    deleteRows(inicio, qtd) { this.rows.splice(inicio - 1, qtd); this.maxRows -= qtd; }
    getFilter() { return this.filter || null; }
    setFrozenRows() {} setTabColor() {} setRowHeight() {} setColumnWidths() {}
    getRange(inicio, coluna, linhas, colunas) {
      const folha = this;
      const range = {
        getValues() { return Array.from({ length: linhas }, (_, r) => Array.from({ length: colunas }, (_, c) => (folha.rows[inicio - 1 + r] || [])[coluna - 1 + c] ?? '')); },
        setValues(valores) {
          if (falharNaAba === folha.nome && inicio > 1) { falharNaAba = ''; throw new Error('Falha de gravação simulada'); }
          assert.equal(valores.length, linhas);
          valores.forEach((row, r) => {
            assert.equal(row.length, colunas);
            if (!folha.rows[inicio - 1 + r]) folha.rows[inicio - 1 + r] = [];
            row.forEach((v, c) => { folha.rows[inicio - 1 + r][coluna - 1 + c] = v; });
          });
          return range;
        },
        setBackground() { return range; }, setFontColor() { return range; },
        setFontWeight() { return range; }, setWrap() { return range; }, setNumberFormat() { return range; },
        createFilter() { folha.filter = true; return range; }
      };
      return range;
    }
  }
  const ui = { alert() {}, ButtonSet: { OK: 'OK' } };
  const context = {
    console, Map, Set,
    SpreadsheetApp: { getActiveSpreadsheet: () => livro, openById: () => livro, getUi: () => ui, flush() {} },
    PropertiesService: { getScriptProperties: () => ({ getProperty: k => props.get(k) || null, setProperty(k, v) { props.set(k, v); } }) },
    LockService: { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) },
    ContentService: { MimeType: { JSON: 'json' }, createTextOutput: text => ({ text, setMimeType() { return this; } }) },
    Utilities: {
      DigestAlgorithm: { SHA_256: 'sha256' }, Charset: { UTF_8: 'utf8' },
      getUuid: () => `00000000-0000-4000-8000-${String(++sequencia).padStart(12, '0')}`,
      computeDigest: (alg, val) => [...crypto.createHash('sha256').update(val).digest()]
    }
  };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(__dirname + '/Code.gs', 'utf8'), context);
  const executar = code => vm.runInContext(code, context);
  const catalogo = executar('CATALOGO_PMAS');
  const payload = (eixo = 'GESTÃO SUAS') => ({
    enviadoEm: '2026-10-26T12:00:00.000Z',
    identificacao: { nome: 'Teste', cargo: 'Técnico', setor: 'Vigilância', dataPreenchimento: '2026-10-26', telefone: '(21) 99999-0000', email: 'teste@example.com', eixo },
    totais: { sim: 999, percentualExecucao: 999 },
    metas: catalogo.filter(m => m.eixo === eixo).map((m, i) => ({ id: m.id, texto: 'Texto adulterado', resposta: i % 2 ? 'nao' : 'sim', justificativa: i % 2 ? 'A contratação prevista ainda está em andamento.' : '' })),
    inclusaoMetas: ['Meta concluída A', 'Meta concluída B'],
    novasMetas: [{ texto: 'Nova meta planejada A', ano: 2027 }, { texto: 'Nova meta planejada B', ano: 2029 }]
  });
  const post = value => JSON.parse(context.doPost({ postData: { contents: JSON.stringify(value) } }).text);
  const painel = senha => JSON.parse(context.doGet({ parameter: { acao: 'painel', sistema: 'Sistema de Vigilância', senha } }).text);
  return { context, executar, livro, props, catalogo, payload, post, painel, falhar: nome => { falharNaAba = nome; } };
}

test('cria 14 abas; repetir a instalação preserva respostas e senha', () => {
  const a = ambiente(); a.context.criarAbas();
  assert.equal(a.livro.abas.size, 14); assert.equal(a.catalogo.length, 151);
  a.post(a.payload());
  const senha = a.props.get('PMAS_SENHA_PAINEL');
  a.context.criarAbas();
  assert.equal(a.props.get('PMAS_SENHA_PAINEL'), senha);
  assert.equal(a.livro.getSheetByName('Envios').getLastRow(), 2);
});

test('recebe todos os eixos; recalcula totais; organiza detalhes e metas adicionais', () => {
  const a = ambiente(); a.context.criarAbas();
  for (const eixo of a.executar('eixos_()')) assert.equal(a.post(a.payload(eixo.nome)).ok, true);
  const resultado = a.painel(a.props.get('PMAS_SENHA_PAINEL'));
  assert.equal(resultado.envios.length, 9);
  const suas = resultado.envios.find(e => e.eixo === 'GESTÃO SUAS');
  assert.equal(suas.total, 30); assert.equal(suas.sim, 15); assert.equal(suas.nao, 15); assert.equal(suas.percentualExecucao, 50);
  assert.equal(suas.metas.length, 30); assert.notEqual(suas.metas[0].texto, 'Texto adulterado');
  assert.deepEqual(suas.inclusaoMetas, ['Meta concluída A', 'Meta concluída B']);
  assert.equal(a.livro.getSheetByName('Respostas das metas').getLastRow(), 152);
  assert.equal(a.livro.getSheetByName('Metas concluídas incluídas').getLastRow(), 19);
});

test('mesmo envio não duplica linhas; outro horário permite novo monitoramento', () => {
  const a = ambiente(); a.context.criarAbas(); const p = a.payload();
  const primeiro = a.post(p), segundo = a.post(p);
  assert.equal(segundo.id, primeiro.id); assert.equal(segundo.duplicado, true);
  p.enviadoEm = '2026-10-26T13:00:00.000Z'; assert.equal(a.post(p).duplicado, false);
  assert.equal(a.livro.getSheetByName('Envios').getLastRow(), 3);
});

test('senha inválida não permite ler respostas; senha válida retorna contrato do painel', () => {
  const a = ambiente(); a.context.criarAbas(); a.post(a.payload());
  assert.equal(a.painel('senha-errada').ok, false);
  const retorno = a.painel(a.props.get('PMAS_SENHA_PAINEL'));
  assert.equal(retorno.autenticado, true); assert.equal(retorno.eixos.length, 9);
});

test('rejeita campos inválidos sem registrar linhas', () => {
  const a = ambiente(); a.context.criarAbas();
  const mudar = [p => p.metas.pop(), p => p.metas[0].resposta = 'talvez', p => p.metas[0].id = 'inexistente', p => p.metas[0].id = p.metas[1].id, p => p.identificacao.nome = '', p => p.identificacao.eixo = 'Eixo falso', p => p.identificacao.dataPreenchimento = '2026-02-30', p => p.inclusaoMetas = [4]];
  mudar.forEach(fn => { const p = a.payload(); fn(p); assert.equal(a.post(p).ok, false); });
  assert.equal(a.livro.getSheetByName('Envios').getLastRow(), 1);
});

test('falha na gravação desfaz os detalhes já escritos; nova tentativa funciona', () => {
  const a = ambiente(); a.context.criarAbas(); a.falhar('Envios');
  assert.equal(a.post(a.payload()).ok, false);
  for (const nome of ['Envios', 'Respostas das metas', 'Metas concluídas incluídas', 'Novas metas planejadas', 'Gestão SUAS']) assert.equal(a.livro.getSheetByName(nome).getLastRow(), 1);
  assert.equal(a.post(a.payload()).ok, true);
});

test('neutraliza fórmulas e não sobrescreve cabeçalhos incompatíveis', () => {
  const a = ambiente(); a.context.criarAbas(); const p = a.payload();
  p.identificacao.nome = '=1+1'; p.inclusaoMetas = ['=HYPERLINK("https://example.com")'];
  assert.equal(a.post(p).ok, true);
  assert.equal(a.livro.getSheetByName('Envios').rows[1][3], "'=1+1");
  assert.equal(a.livro.getSheetByName('Metas concluídas incluídas').rows[1][5][0], "'");
  a.livro.getSheetByName('Envios').rows[0][0] = 'Cabeçalho alterado';
  assert.throws(() => a.context.criarAbas(), /Cabeçalho incompatível/);
  assert.equal(a.livro.getSheetByName('Envios').getLastRow(), 2);
});

test('exige justificativa para Não; Sim não grava justificativa residual', () => {
  const a = ambiente(); a.context.criarAbas();
  const p = a.payload();
  for (const value of ['', '   ', undefined, 'x'.repeat(2001), 123]) {
    p.metas[1].justificativa = value;
    const result = a.post(p);
    assert.equal(result.ok, false);
    assert.equal(a.livro.getSheetByName('Envios').getLastRow(), 1);
  }
  p.metas[1].justificativa = 'Aguardando recursos.';
  p.metas[0].justificativa = 'Texto anterior, não deve ser enviado para Sim.';
  assert.equal(a.post(p).ok, true);
  const retorno = a.painel(a.props.get('PMAS_SENHA_PAINEL')).envios[0];
  assert.equal(retorno.metas[0].justificativa, '');
  assert.equal(retorno.metas[1].justificativa, 'Aguardando recursos.');
});

test('metas futuras exigem texto e ano do PMAS e não alteram os totais originais', () => {
  const a = ambiente(); a.context.criarAbas();
  for (const novasMetas of [[{texto:'',ano:2027}],[{texto:'Planejamento',ano:''}],[{texto:'Planejamento',ano:2030}],[{texto:'Planejamento',ano:2026.5}],[{texto:'Planejamento',ano:[]}],[{texto:'x'.repeat(1001),ano:2027}],['Meta sem ano'],Array(101).fill({texto:'Meta',ano:2027})]) {
    const p = a.payload(); p.novasMetas = novasMetas;
    assert.equal(a.post(p).ok, false);
  }
  assert.equal(a.livro.getSheetByName('Envios').getLastRow(),1);
  const p = a.payload();
  assert.equal(a.post(p).ok, true);
  const r = a.painel(a.props.get('PMAS_SENHA_PAINEL')).envios[0];
  assert.deepEqual(r.novasMetas, p.novasMetas);
  assert.equal(r.sim,15); assert.equal(r.nao,15); assert.equal(r.percentualExecucao,50);
  assert.equal(a.livro.getSheetByName('Novas metas planejadas').getLastRow(),3);
  p.enviadoEm='2026-10-26T14:00:00Z'; delete p.novasMetas;
  assert.equal(a.post(p).ok, true);
});

test('migração da planilha antiga mantém respostas, colunas de eixos e senha', () => {
  const a = ambiente(); a.context.criarAbas(); a.post(a.payload());
  const senha=a.props.get('PMAS_SENHA_PAINEL');
  const eixoAntes=JSON.stringify(a.livro.getSheetByName('Gestão SUAS').rows);
  const metas=a.livro.getSheetByName('Respostas das metas');
  metas.rows=metas.rows.map(row=>row.slice(0,6));
  a.livro.abas.delete('Novas metas planejadas');
  const antes=JSON.stringify(metas.rows);
  a.context.criarAbas();
  assert.equal(a.livro.abas.size,14);
  assert.equal(a.props.get('PMAS_SENHA_PAINEL'),senha);
  assert.equal(JSON.stringify(a.livro.getSheetByName('Gestão SUAS').rows),eixoAntes);
  assert.equal(JSON.stringify(metas.rows.map(row=>row.slice(0,6))),antes);
  assert.equal(metas.rows[0][6],'Justificativa da não conclusão');
  const retorno=a.painel(senha).envios[0];
  assert.equal(retorno.metas[1].justificativa,'');assert.deepEqual(retorno.novasMetas,[]);
  a.context.criarAbas();assert.equal(metas.getLastRow(),31);
});

test('chave de repetição considera justificativas e novas metas', () => {
  const a=ambiente();a.context.criarAbas();const p=a.payload();
  const primeiro=a.post(p);
  assert.equal(a.post(p).id,primeiro.id);
  p.metas[1].justificativa='Uma justificativa corrigida.';
  const segundo=a.post(p);assert.notEqual(segundo.id,primeiro.id);
  p.novasMetas[0].ano=2028;
  assert.notEqual(a.post(p).id,segundo.id);
});

test('não grava respostas sem migração e anuncia versão de formulário', () => {
  const a=ambiente();a.context.criarAbas();
  a.livro.abas.delete('Novas metas planejadas');
  assert.equal(a.post(a.payload()).ok,false);
  assert.equal(a.livro.getSheetByName('Respostas das metas').getLastRow(),1);
  const health=JSON.parse(a.context.doGet({parameter:{}}).text);
  assert.equal(health.versaoFormulario,2);
});
