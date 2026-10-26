/** PMAS 2026–2029 — cole este arquivo no Apps Script vinculado à nova planilha. */
const PMAS = Object.freeze({
  sistema: 'Sistema de Vigilância',
  abas: { envios: 'Envios', metas: 'Respostas das metas', incluidas: 'Metas concluídas incluídas', novas: 'Novas metas planejadas', resumo: 'Resumo' },
  envios: ['ID do envio', 'Recebido em', 'Enviado em', 'Nome', 'Cargo', 'Setor/Unidade', 'Data de preenchimento', 'Telefone', 'E-mail', 'Eixo', 'Total de metas', 'Sim', 'Não', 'Execução (%)', 'Metas concluídas incluídas', 'Situação', 'Chave do envio'],
  metas: ['ID do envio', 'Código', 'Categoria', 'Eixo', 'Meta', 'Resposta', 'Justificativa da não conclusão'],
  incluidas: ['ID do envio', 'Recebido em', 'Responsável', 'Setor/Unidade', 'Eixo', 'Meta concluída incluída'],
  novas: ['ID do envio', 'Recebido em', 'Responsável', 'Setor/Unidade', 'Eixo', 'Nova meta', 'Ano previsto de conclusão'],
  resumo: ['Eixo', 'Envios recebidos', 'Metas executadas', 'Metas não executadas', 'Execução (%)', 'Metas concluídas incluídas']
});

function onOpen() {
  SpreadsheetApp.getUi().createMenu('Monitoramento PMAS')
    .addItem('Criar ou verificar abas', 'criarAbas')
    .addItem('Atualizar resumo', 'atualizarResumo')
    .addToUi();
}

/** Execute UMA VEZ pelo editor. Pode repetir: não apaga respostas existentes. */
function criarAbas() {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  let senhaNova = '';
  try {
    const livro = SpreadsheetApp.getActiveSpreadsheet();
    if (!livro) throw new Error('Abra o Apps Script por Extensões > Apps Script na nova planilha.');
    const props = PropertiesService.getScriptProperties();
    const configurada = props.getProperty('PMAS_PLANILHA_ID');
    if (configurada && configurada !== livro.getId()) throw new Error('Este projeto já está vinculado a outra planilha. Crie um projeto na nova planilha.');
    [
      [PMAS.abas.envios, PMAS.envios], [PMAS.abas.metas, PMAS.metas],
      [PMAS.abas.incluidas, PMAS.incluidas], [PMAS.abas.novas, PMAS.novas], [PMAS.abas.resumo, PMAS.resumo]
    ].forEach(([nome, cabecalho]) => garantirAba_(livro, nome, cabecalho));
    eixos_().forEach(eixo => garantirAba_(livro, eixo.aba, cabecalhoEixo_(eixo)));
    props.setProperty('PMAS_PLANILHA_ID', livro.getId());
    if (!props.getProperty('PMAS_SENHA_PAINEL')) {
      senhaNova = Utilities.getUuid().replace(/-/g, '').slice(0, 20);
      props.setProperty('PMAS_SENHA_PAINEL', senhaNova);
    }
    atualizarResumoInterno_(livro);
    SpreadsheetApp.flush();
  } finally { lock.releaseLock(); }
  SpreadsheetApp.getUi().alert('Abas do PMAS preparadas',
    'As 14 abas estão prontas. Nenhuma resposta existente foi apagada.' +
    (senhaNova ? '\n\nGuarde a senha administrativa do painel:\n' + senhaNova : '\n\nA senha administrativa existente foi mantida.') +
    '\n\nA senha pode ser consultada ou alterada em Configurações do projeto > Propriedades do script > PMAS_SENHA_PAINEL.',
    SpreadsheetApp.getUi().ButtonSet.OK);
}

/** Endpoint de recebimento. O formulário atual já envia o JSON neste formato. */
function doPost(e) {
  try {
    const corpo = e && e.postData && e.postData.contents;
    if (!corpo || corpo.length > 250000) throw new Error('Corpo do envio ausente ou muito grande.');
    const payload = JSON.parse(corpo);
    if (payload.acao === 'painel') return json_(consultarPainel_(payload));
    return json_(receberResposta_(validarResposta_(payload)));
  } catch (erro) {
    return json_({ ok: false, mensagem: erro instanceof SyntaxError ? 'JSON inválido.' : erro.message });
  }
}

/** Consulta autenticada compatível com painel.js; sem ação, informa apenas disponibilidade. */
function doGet(e) {
  try {
    const p = (e && e.parameter) || {};
    if (p.acao === 'painel') return json_(consultarPainel_(p));
    const props = PropertiesService.getScriptProperties();
    return json_({ ok: true, servico: 'Monitoramento PMAS 2026–2029', configurado: Boolean(props.getProperty('PMAS_PLANILHA_ID')), versaoFormulario: 2 });
  } catch (erro) { return json_({ ok: false, mensagem: erro.message }); }
}

function receberResposta_(dados) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  const gravacoes = [];
  let livro;
  let resultado;
  try {
    livro = abrirPlanilha_();
    // Interrompe antes de gravar se a migração das novas colunas/abas não foi executada.
    const cabecalhoMetas = aba_(livro, PMAS.abas.metas).getRange(1, 1, 1, PMAS.metas.length).getValues()[0];
    const cabecalhoNovas = aba_(livro, PMAS.abas.novas).getRange(1, 1, 1, PMAS.novas.length).getValues()[0];
    if (JSON.stringify(cabecalhoMetas) !== JSON.stringify(PMAS.metas) || JSON.stringify(cabecalhoNovas) !== JSON.stringify(PMAS.novas)) throw new Error('Execute criarAbas para atualizar o recebimento antes de enviar respostas.');
    const envios = aba_(livro, PMAS.abas.envios);
    const anteriores = linhas_(envios);
    const repetido = anteriores.find(linha => linha[16] === dados.chave && linha[15] === 'Recebido');
    if (repetido) return { ok: true, id: repetido[0], duplicado: true, mensagem: 'Este envio já foi registrado.' };
    const id = Utilities.getUuid();
    const recebidoEm = new Date().toISOString();
    const i = dados.identificacao;
    const base = [id, recebidoEm, dados.enviadoEm, i.nome, i.cargo, i.setor, i.dataPreenchimento,
      i.telefone, i.email, i.eixo, dados.metas.length, dados.sim, dados.nao, dados.percentual,
      dados.inclusaoMetas.join('\n'), 'Recebido', dados.chave];
    // O índice geral é gravado por último: o painel só publica envios completos.
    anexar_(aba_(livro, PMAS.abas.metas), dados.metas.map(m => [id, m.id, m.categoria, i.eixo, m.texto, m.resposta === 'sim' ? 'Sim' : 'Não', m.justificativa]), gravacoes);
    anexar_(aba_(livro, PMAS.abas.incluidas), dados.inclusaoMetas.map(texto => [id, recebidoEm, i.nome, i.setor, i.eixo, texto]), gravacoes);
    anexar_(aba_(livro, PMAS.abas.novas), dados.novasMetas.map(meta => [id, recebidoEm, i.nome, i.setor, i.eixo, meta.texto, meta.ano]), gravacoes);
    anexar_(aba_(livro, dados.eixo.aba), [base.concat(dados.metas.map(m => m.resposta === 'sim' ? 'Sim' : 'Não'))], gravacoes);
    anexar_(envios, [base], gravacoes);
    SpreadsheetApp.flush();
    resultado = { ok: true, id: id, duplicado: false, mensagem: 'Resposta registrada na planilha.' };
  } catch (erro) {
    gravacoes.reverse().forEach(g => {
      try { g.aba.deleteRows(g.inicio, g.quantidade); } catch (falha) { console.error('Falha ao desfazer uma gravação incompleta na aba ' + g.aba.getName()); }
    });
    throw erro;
  } finally {
    if (resultado) {
      try { atualizarResumoInterno_(livro); SpreadsheetApp.flush(); }
      catch (erro) { resultado.aviso = 'Resposta salva. Atualize o Resumo pelo menu Monitoramento PMAS.'; }
    }
    lock.releaseLock();
  }
  return resultado;
}

function validarResposta_(payload) {
  if (!payload || typeof payload !== 'object') throw new Error('Envio inválido.');
  const entrada = payload.identificacao || {};
  const identificacao = {};
  ['nome', 'cargo', 'setor', 'dataPreenchimento', 'telefone', 'email', 'eixo'].forEach(campo => {
    identificacao[campo] = texto_(entrada[campo], campo, campo === 'email' ? 254 : 300);
  });
  ['nome', 'cargo', 'setor', 'dataPreenchimento', 'eixo'].forEach(campo => {
    if (!identificacao[campo]) throw new Error('Preencha o campo obrigatório: ' + campo + '.');
  });
  const dia = new Date(identificacao.dataPreenchimento + 'T12:00:00Z');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(identificacao.dataPreenchimento) || isNaN(dia.getTime()) || dia.toISOString().slice(0, 10) !== identificacao.dataPreenchimento) throw new Error('Data de preenchimento inválida.');
  if (identificacao.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identificacao.email)) throw new Error('E-mail inválido.');
  const eixo = eixos_().find(item => item.nome === identificacao.eixo);
  if (!eixo) throw new Error('Eixo não reconhecido.');
  const catalogo = CATALOGO_PMAS.filter(m => m.eixo === eixo.nome);
  if (!Array.isArray(payload.metas) || payload.metas.length !== catalogo.length) throw new Error('Responda todas as metas do eixo selecionado.');
  const respostas = new Map();
  payload.metas.forEach(m => {
    if (!m || !catalogo.some(c => c.id === m.id) || respostas.has(m.id) || !['sim', 'nao'].includes(m.resposta)) throw new Error('Meta desconhecida, repetida ou sem resposta válida.');
    const justificativa = m.resposta === 'nao' ? texto_(m.justificativa, 'justificativa', 2000) : '';
    if (m.resposta === 'nao' && !justificativa) throw new Error('Justifique por que a meta ' + m.id + ' não foi concluída.');
    respostas.set(m.id, { resposta: m.resposta, justificativa });
  });
  const metas = catalogo.map(m => ({ id: m.id, categoria: m.categoria, texto: m.texto, resposta: respostas.get(m.id).resposta, justificativa: respostas.get(m.id).justificativa }));
  const futuras = payload.novasMetas === undefined ? [] : payload.novasMetas;
  if (!Array.isArray(futuras) || futuras.length > 100) throw new Error('Inclua no máximo 100 novas metas por envio.');
  const novasMetas = futuras.map(meta => {
    if (!meta || typeof meta !== 'object') throw new Error('Nova meta inválida.');
    const texto = texto_(meta.texto, 'nova meta', 1000);
    const ano = Number(meta.ano);
    if (!texto || ![2026, 2027, 2028, 2029].includes(ano) || !['string', 'number'].includes(typeof meta.ano)) throw new Error('Informe a descrição e um ano de conclusão entre 2026 e 2029 para cada nova meta.');
    return { texto, ano };
  });
  if (novasMetas.map(meta => meta.texto).join('\n').length > 40000) throw new Error('As novas metas ultrapassaram o limite de texto por envio.');
  const extras = payload.inclusaoMetas === undefined ? [] : payload.inclusaoMetas;
  if (!Array.isArray(extras) || extras.length > 100) throw new Error('Inclua no máximo 100 metas concluídas por envio.');
  const inclusaoMetas = [];
  const vistas = new Set();
  extras.forEach(item => {
    const texto = texto_(item, 'meta concluída incluída', 1000);
    const chave = texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').toLowerCase();
    if (texto && !vistas.has(chave)) { inclusaoMetas.push(texto); vistas.add(chave); }
  });
  if (inclusaoMetas.join('\n').length > 40000) throw new Error('As metas incluídas ultrapassaram o limite de texto por envio.');
  const enviadoEm = texto_(payload.enviadoEm, 'enviadoEm', 40);
  if (!enviadoEm || isNaN(new Date(enviadoEm).getTime())) throw new Error('Data de envio inválida.');
  const sim = metas.filter(m => m.resposta === 'sim').length;
  // Ignora totais e textos vindos do navegador: utiliza o catálogo e recalcula no servidor.
  const dados = { identificacao, eixo, metas, inclusaoMetas, novasMetas, enviadoEm, sim, nao: metas.length - sim, percentual: Math.round(sim / metas.length * 100) };
  dados.chave = digest_(JSON.stringify([identificacao, enviadoEm, metas, inclusaoMetas, novasMetas]));
  return dados;
}

function consultarPainel_(credenciais) {
  const senha = PropertiesService.getScriptProperties().getProperty('PMAS_SENHA_PAINEL');
  if (!senha || credenciais.sistema !== PMAS.sistema || typeof credenciais.senha !== 'string' || credenciais.senha.length > 300 || digest_(credenciais.senha) !== digest_(senha)) throw new Error('Sistema ou senha inválidos.');
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const livro = abrirPlanilha_();
    const detalhes = new Map();
    linhas_(aba_(livro, PMAS.abas.metas)).forEach(r => {
      if (!detalhes.has(r[0])) detalhes.set(r[0], []);
      detalhes.get(r[0]).push({ id: r[1], codigo: r[1], categoria: r[2], eixoOriginal: r[3], texto: r[4], resposta: r[5], justificativa: r[6] || '' });
    });
    const incluidas = new Map();
    linhas_(aba_(livro, PMAS.abas.incluidas)).forEach(r => {
      if (!incluidas.has(r[0])) incluidas.set(r[0], []);
      incluidas.get(r[0]).push(r[5]);
    });
    const novas = new Map();
    const abaNovas = livro.getSheetByName(PMAS.abas.novas);
    if (abaNovas) linhas_(abaNovas).forEach(r => {
      if (!novas.has(r[0])) novas.set(r[0], []);
      novas.get(r[0]).push({ texto: r[5], ano: Number(r[6]) });
    });
    const envios = linhas_(aba_(livro, PMAS.abas.envios)).filter(r => r[15] === 'Recebido').map(r => ({
      id: r[0], recebidoEm: r[1], enviadoEm: r[2], nome: r[3], cargo: r[4], setor: r[5], dataPreenchimento: r[6], telefone: r[7], email: r[8], eixo: r[9],
      total: Number(r[10]), sim: Number(r[11]), nao: Number(r[12]), percentualExecucao: Number(r[13]),
      metas: detalhes.get(r[0]) || [], inclusaoMetas: incluidas.get(r[0]) || [], novasMetas: novas.get(r[0]) || []
    })).reverse();
    return { ok: true, autenticado: true, atualizadoEm: new Date().toISOString(), eixos: eixos_().map(e => e.nome), envios };
  } finally { lock.releaseLock(); }
}

function atualizarResumo() {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try { atualizarResumoInterno_(abrirPlanilha_()); SpreadsheetApp.flush(); }
  finally { lock.releaseLock(); }
}

function atualizarResumoInterno_(livro) {
  const recebidos = linhas_(aba_(livro, PMAS.abas.envios)).filter(r => r[15] === 'Recebido');
  const ids = new Set(recebidos.map(r => r[0]));
  const extras = linhas_(aba_(livro, PMAS.abas.incluidas)).filter(r => ids.has(r[0]));
  const resumo = eixos_().map(eixo => {
    const envios = recebidos.filter(r => r[9] === eixo.nome);
    const sim = envios.reduce((s, r) => s + Number(r[11]), 0);
    const nao = envios.reduce((s, r) => s + Number(r[12]), 0);
    return [eixo.nome, envios.length, sim, nao, sim + nao ? Math.round(sim / (sim + nao) * 100) : 0, extras.filter(r => r[4] === eixo.nome).length];
  });
  aba_(livro, PMAS.abas.resumo).getRange(2, 1, resumo.length, PMAS.resumo.length).setValues(resumo);
}

function garantirAba_(livro, nome, cabecalho) {
  const folha = livro.getSheetByName(nome) || livro.insertSheet(nome);
  if (folha.getMaxColumns() < cabecalho.length) folha.insertColumnsAfter(folha.getMaxColumns(), cabecalho.length - folha.getMaxColumns());
  if (folha.getLastRow()) {
    const atual = folha.getRange(1, 1, 1, cabecalho.length).getValues()[0];
    if (JSON.stringify(atual) !== JSON.stringify(cabecalho)) {
      const antigo = PMAS.metas.slice(0, 6);
      const podeMigrar = nome === PMAS.abas.metas && JSON.stringify(atual.slice(0, 6)) === JSON.stringify(antigo) && !atual[6]
        && (folha.getLastRow() < 2 || folha.getRange(2, 7, folha.getLastRow() - 1, 1).getValues().every(linha => linha[0] === ''));
      if (!podeMigrar) throw new Error('Cabeçalho incompatível na aba "' + nome + '". Nenhum dado foi apagado.');
      folha.getRange(1, 7, 1, 1).setValues([[PMAS.metas[6]]]);
    }
  } else {
    folha.getRange(1, 1, 1, cabecalho.length).setValues([cabecalho]);
  }
  folha.setFrozenRows(1);
  folha.setTabColor(nome === PMAS.abas.resumo ? '#E5B649' : '#0B5CAD');
  folha.getRange(1, 1, 1, cabecalho.length).setBackground('#0D2240').setFontColor('#FFFFFF').setFontWeight('bold').setWrap(true);
  folha.setRowHeight(1, 58);
  folha.setColumnWidths(1, cabecalho.length, 160);
  if (!folha.getFilter()) folha.getRange(1, 1, folha.getMaxRows(), cabecalho.length).createFilter();
  return folha;
}

function anexar_(folha, linhas, gravacoes) {
  if (!linhas.length) return;
  const inicio = folha.getLastRow() + 1;
  const ultima = inicio + linhas.length - 1;
  if (ultima > folha.getMaxRows()) folha.insertRowsAfter(folha.getMaxRows(), ultima - folha.getMaxRows());
  const intervalo = folha.getRange(inicio, 1, linhas.length, linhas[0].length);
  gravacoes.push({ aba: folha, inicio, quantidade: linhas.length });
  intervalo.setNumberFormat('@').setValues(linhas.map(linha => linha.map(valor =>
    typeof valor === 'string' && /^[\s]*[=+\-@]/.test(valor) ? "'" + valor : valor)));
}

function cabecalhoEixo_(eixo) {
  return PMAS.envios.concat(CATALOGO_PMAS.filter(m => m.eixo === eixo.nome).map(m => m.id + ' — ' + m.texto));
}
function abrirPlanilha_() {
  const id = PropertiesService.getScriptProperties().getProperty('PMAS_PLANILHA_ID');
  if (!id) throw new Error('Execute criarAbas no editor antes de receber respostas.');
  return SpreadsheetApp.openById(id);
}
function aba_(livro, nome) {
  const folha = livro.getSheetByName(nome);
  if (!folha) throw new Error('Aba ausente: ' + nome + '. Execute criarAbas no editor.');
  return folha;
}
function linhas_(folha) {
  return folha.getLastRow() > 1 ? folha.getRange(2, 1, folha.getLastRow() - 1, folha.getLastColumn()).getValues() : [];
}
function texto_(valor, campo, limite) {
  if (valor === undefined || valor === null) return '';
  if (typeof valor !== 'string' || valor.length > limite) throw new Error('Valor inválido ou muito longo em: ' + campo + '.');
  return valor.trim();
}
function digest_(valor) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, valor, Utilities.Charset.UTF_8)
    .map(b => ('0' + ((b + 256) % 256).toString(16)).slice(-2)).join('');
}
function json_(dados) { return ContentService.createTextOutput(JSON.stringify(dados)).setMimeType(ContentService.MimeType.JSON); }
function eixos_() {
  return [
    { nome: 'ORGÃO GESTOR', aba: 'Órgão Gestor' }, { nome: 'GESTÃO SUAS', aba: 'Gestão SUAS' },
    { nome: 'FUNDO MUNICIPAL', aba: 'Fundo Municipal' }, { nome: 'PROTEÇÃO SOCIAL BÁSICA (PSB)', aba: 'PSB' },
    { nome: 'PROTEÇÃO SOCIAL ESPECIAL (PSE)', aba: 'PSE' }, { nome: 'SEGURANÇA ALIMENTAR', aba: 'Segurança Alimentar' },
    { nome: 'COMPLEXO DA CIDADANIA', aba: 'Complexo da Cidadania' },
    { nome: 'CONSELHO MUNICIPAL DE ASSISTÊNCIA SOCIAL (CMAS)', aba: 'CMAS' },
    { nome: 'CONSELHO MUNICIPAL DE SEGURANÇA ALIMENTAR E NUTRICIONAL (COMSEA)', aba: 'COMSEA' }
  ];
}

// Catálogo oficial extraído de script.js. Não remova: valida os códigos de cada eixo.
const CATALOGO_PMAS = [
  {
    "id": "CC-001",
    "eixo": "COMPLEXO DA CIDADANIA",
    "categoria": "Complexo da Cidadania",
    "texto": "Fornecer isenções de 2° via de documentação para população, por meio de atendimentos sociais nas unidades CRAS, CREAS e Centro Pop"
  },
  {
    "id": "CC-002",
    "eixo": "COMPLEXO DA CIDADANIA",
    "categoria": "Complexo da Cidadania",
    "texto": "Conhecer a demanda que não chega espontaneamente, através de consultas médicas nos postos de saúde e das matrículas escolares"
  },
  {
    "id": "CC-003",
    "eixo": "COMPLEXO DA CIDADANIA",
    "categoria": "Complexo da Cidadania",
    "texto": "Registro civil de nascimento logo após o nascimento, através de relatórios enviados pelo RCPN"
  },
  {
    "id": "CC-004",
    "eixo": "COMPLEXO DA CIDADANIA",
    "categoria": "Complexo da Cidadania",
    "texto": "Identificação de crianças e adolescentes com foto e datiloscopia do município, através dos dados fornecidos pelos órgãos responsavéis"
  },
  {
    "id": "CC-005",
    "eixo": "COMPLEXO DA CIDADANIA",
    "categoria": "Complexo da Cidadania",
    "texto": "Realizar rodas de conversa nos CRAS e CREAS"
  },
  {
    "id": "CC-006",
    "eixo": "COMPLEXO DA CIDADANIA",
    "categoria": "Complexo da Cidadania",
    "texto": "Acolhimento humanizado com escuta qualificada e formação continuada para a equipe técnica"
  },
  {
    "id": "GI-001",
    "eixo": "ORGÃO GESTOR",
    "categoria": "Gestão Institucional",
    "texto": "Ampliar/adequar as equipes de referências da SEMASC"
  },
  {
    "id": "GI-002",
    "eixo": "ORGÃO GESTOR",
    "categoria": "Gestão Institucional",
    "texto": "Modernização dos hardwares e softwares"
  },
  {
    "id": "GI-003",
    "eixo": "ORGÃO GESTOR",
    "categoria": "Gestão Institucional",
    "texto": "Aquisição e manutenção de mobiliário e eletrodomésticos"
  },
  {
    "id": "GI-004",
    "eixo": "ORGÃO GESTOR",
    "categoria": "Gestão Institucional",
    "texto": "Aquisição e manutenção de material de expediente e escritório"
  },
  {
    "id": "GI-005",
    "eixo": "ORGÃO GESTOR",
    "categoria": "Gestão Institucional",
    "texto": "Aquisição de aparelho de telefonia móvel"
  },
  {
    "id": "GI-006",
    "eixo": "ORGÃO GESTOR",
    "categoria": "Gestão Institucional",
    "texto": "Aquisição de veículo adaptado tipo van"
  },
  {
    "id": "GI-007",
    "eixo": "ORGÃO GESTOR",
    "categoria": "Gestão Institucional",
    "texto": "Aquisição de veículo modelo popular"
  },
  {
    "id": "GI-008",
    "eixo": "ORGÃO GESTOR",
    "categoria": "Gestão Institucional",
    "texto": "Elaboração de concurso público para SEMASC"
  },
  {
    "id": "GI-009",
    "eixo": "ORGÃO GESTOR",
    "categoria": "Gestão Institucional",
    "texto": "Implantação de Sistema de ponto eletrônico."
  },
  {
    "id": "GI-010",
    "eixo": "ORGÃO GESTOR",
    "categoria": "Gestão Institucional",
    "texto": "Criação de um Sistema próprio de recursos humanos e modernização dos hardwares e softwares."
  },
  {
    "id": "GI-011",
    "eixo": "ORGÃO GESTOR",
    "categoria": "Gestão Institucional",
    "texto": "Revisar a lei municipal de regulação da política de assistência social (estrutura), observando os princípios, diretrizes e objetivos do SUAS."
  },
  {
    "id": "GI-012",
    "eixo": "ORGÃO GESTOR",
    "categoria": "Gestão Institucional",
    "texto": "Ampliar a cobertura da segurança alimentar e nutricional no munícipio, por meio de unidades fixas"
  },
  {
    "id": "GI-013",
    "eixo": "GESTÃO SUAS",
    "categoria": "Gestão Institucional",
    "texto": "Aquisição e manutenção de mobiliário e eletrodomésticos."
  },
  {
    "id": "GI-014",
    "eixo": "GESTÃO SUAS",
    "categoria": "Gestão Institucional",
    "texto": "Aquisição e manutenção de material de expediente e escritório."
  },
  {
    "id": "GI-015",
    "eixo": "GESTÃO SUAS",
    "categoria": "Gestão Institucional",
    "texto": "Aquisição de veículo modelo popular."
  },
  {
    "id": "GI-016",
    "eixo": "GESTÃO SUAS",
    "categoria": "Gestão Institucional",
    "texto": "Modernização dos hardwares e softwares"
  },
  {
    "id": "GI-017",
    "eixo": "GESTÃO SUAS",
    "categoria": "Gestão Institucional",
    "texto": "Modernização dos Hardwares e Softwares"
  },
  {
    "id": "GI-018",
    "eixo": "GESTÃO SUAS",
    "categoria": "Gestão Institucional",
    "texto": "Aquisição e manutenção de mobiliário e eletrodomésticos"
  },
  {
    "id": "GF-001",
    "eixo": "ORGÃO GESTOR",
    "categoria": "Gestão Financeira",
    "texto": "Alocar o orçamento autônomo e contínuo, execução de 100% da LOA aprovada"
  },
  {
    "id": "GF-009",
    "eixo": "FUNDO MUNICIPAL",
    "categoria": "Gestão Financeira",
    "texto": "Elaboração e revisão da proposta orçamentária do FMAS"
  },
  {
    "id": "GF-010",
    "eixo": "FUNDO MUNICIPAL",
    "categoria": "Gestão Financeira",
    "texto": "Realizar pagamentos de forma tempestiva e regular"
  },
  {
    "id": "GF-011",
    "eixo": "FUNDO MUNICIPAL",
    "categoria": "Gestão Financeira",
    "texto": "Acompanhar e controlar a execução orçamentária mensal do FMAS"
  },
  {
    "id": "GF-012",
    "eixo": "FUNDO MUNICIPAL",
    "categoria": "Gestão Financeira",
    "texto": "Elaboração de relatórios contábeis e prestação de contas"
  },
  {
    "id": "GF-013",
    "eixo": "FUNDO MUNICIPAL",
    "categoria": "Gestão Financeira",
    "texto": "Acompanhar e executar repasses federais e estaduais"
  },
  {
    "id": "GF-014",
    "eixo": "FUNDO MUNICIPAL",
    "categoria": "Gestão Financeira",
    "texto": "Implantação de rotina de conferência documental e financeira"
  },
  {
    "id": "GF-015",
    "eixo": "FUNDO MUNICIPAL",
    "categoria": "Gestão Financeira",
    "texto": "Avaliação trimestral de desempenho financeiro do FMAS"
  },
  {
    "id": "GF-016",
    "eixo": "FUNDO MUNICIPAL",
    "categoria": "Gestão Financeira",
    "texto": "Plano de execução e prestação de contas, planejamento de emendas."
  },
  {
    "id": "VS-001",
    "eixo": "ORGÃO GESTOR",
    "categoria": "Vigilância Socioassistencial",
    "texto": "Efetivar/fortalecer a execução da Vigilância Socioassistêncial"
  },
  {
    "id": "VS-003",
    "eixo": "GESTÃO SUAS",
    "categoria": "Vigilância Socioassistencial",
    "texto": "Cadastros atualizados e visitas domiciliares."
  },
  {
    "id": "VS-004",
    "eixo": "GESTÃO SUAS",
    "categoria": "Vigilância Socioassistencial",
    "texto": "Lançamento de campanhas de conscientização sobre atualização cadastral."
  },
  {
    "id": "VS-005",
    "eixo": "GESTÃO SUAS",
    "categoria": "Vigilância Socioassistencial",
    "texto": "Realização de mutirões de atualização cadastral."
  },
  {
    "id": "VS-006",
    "eixo": "GESTÃO SUAS",
    "categoria": "Vigilância Socioassistencial",
    "texto": "Realização do assessoramento permanente aos CRAS."
  },
  {
    "id": "VS-007",
    "eixo": "GESTÃO SUAS",
    "categoria": "Vigilância Socioassistencial",
    "texto": "Realizar ações itinerantes – Mutirões Semestrais de cadastramento em bairros vulneráveis."
  },
  {
    "id": "VS-009",
    "eixo": "GESTÃO SUAS",
    "categoria": "Vigilância Socioassistencial",
    "texto": "Desenvolver ações da Vigilância Socioassistencial, as unidades, com visitas ao aprimoramento do sistema de informação, avaliação e monitoramento, conforme as normas vigentes"
  },
  {
    "id": "VS-010",
    "eixo": "GESTÃO SUAS",
    "categoria": "Vigilância Socioassistencial",
    "texto": "Fortalecer a Equipe de Vigilância Socioassistencial, com composição multiprofissional"
  },
  {
    "id": "VS-011",
    "eixo": "GESTÃO SUAS",
    "categoria": "Vigilância Socioassistencial",
    "texto": "Elaborar 2 boletins anuais da vigilância socioassistencial"
  },
  {
    "id": "VS-012",
    "eixo": "GESTÃO SUAS",
    "categoria": "Vigilância Socioassistencial",
    "texto": "Realização do Censo Pop Rua"
  },
  {
    "id": "VS-013",
    "eixo": "GESTÃO SUAS",
    "categoria": "Vigilância Socioassistencial",
    "texto": "Coordenar o processo de preenchimento do CensoSUAS"
  },
  {
    "id": "VS-008",
    "eixo": "SEGURANÇA ALIMENTAR",
    "categoria": "Vigilância Socioassistencial",
    "texto": "Aplicar questionário (e relatórios quando necessário) para conhecimento sobre situações de insegurança alimentar no município e melhor assertividade nas ações e projetos a serem realizados."
  },
  {
    "id": "PSB-001",
    "eixo": "PROTEÇÃO SOCIAL BÁSICA (PSB)",
    "categoria": "Proteção Social Básica",
    "texto": "Realizar encontros intersetoriais com a rede socioassistencial e demais políticas públicas nos territórios dos CRAS."
  },
  {
    "id": "PSB-002",
    "eixo": "PROTEÇÃO SOCIAL BÁSICA (PSB)",
    "categoria": "Proteção Social Básica",
    "texto": "Adequação das instalações físicas dos CRAS."
  },
  {
    "id": "PSB-003",
    "eixo": "PROTEÇÃO SOCIAL BÁSICA (PSB)",
    "categoria": "Proteção Social Básica",
    "texto": "Ampliar a oferta e a capacidade de atendimento do PAIF."
  },
  {
    "id": "PSB-004",
    "eixo": "PROTEÇÃO SOCIAL BÁSICA (PSB)",
    "categoria": "Proteção Social Básica",
    "texto": "Modernização dos hardwares e softwares."
  },
  {
    "id": "PSB-005",
    "eixo": "PROTEÇÃO SOCIAL BÁSICA (PSB)",
    "categoria": "Proteção Social Básica",
    "texto": "Aquisição e manutenção de mobiliário e eletrodomésticos."
  },
  {
    "id": "PSB-006",
    "eixo": "PROTEÇÃO SOCIAL BÁSICA (PSB)",
    "categoria": "Proteção Social Básica",
    "texto": "Aquisição e manutenção de material de expediente e escritório."
  },
  {
    "id": "PSB-007",
    "eixo": "PROTEÇÃO SOCIAL BÁSICA (PSB)",
    "categoria": "Proteção Social Básica",
    "texto": "Aquisição de aparelho de telefonia móvel para as unidades."
  },
  {
    "id": "PSB-008",
    "eixo": "PROTEÇÃO SOCIAL BÁSICA (PSB)",
    "categoria": "Proteção Social Básica",
    "texto": "Aquisição de veículo adaptado tipo van."
  },
  {
    "id": "PSB-009",
    "eixo": "PROTEÇÃO SOCIAL BÁSICA (PSB)",
    "categoria": "Proteção Social Básica",
    "texto": "Aquisição de veículo modelo popular."
  },
  {
    "id": "PSB-010",
    "eixo": "PROTEÇÃO SOCIAL BÁSICA (PSB)",
    "categoria": "Proteção Social Básica",
    "texto": "Estabelecer fluxo de rede com Poder Judiciário e o Sistema de Garantia de Direitos para encaminhamentos e estudos de caso de usuários e suas famílias."
  },
  {
    "id": "PSB-011",
    "eixo": "PROTEÇÃO SOCIAL BÁSICA (PSB)",
    "categoria": "Proteção Social Básica",
    "texto": "Ampliar a oferta e a capacidade de atendimento dos Programas: Criança Feliz, Acessuas Trabalho e BPC na Escola."
  },
  {
    "id": "PSB-012",
    "eixo": "PROTEÇÃO SOCIAL BÁSICA (PSB)",
    "categoria": "Proteção Social Básica",
    "texto": "Aprimorar e ampliar a cobertura de acompanhamento do PAIF nas famílias beneficiárias do PBF."
  },
  {
    "id": "PSB-013",
    "eixo": "PROTEÇÃO SOCIAL BÁSICA (PSB)",
    "categoria": "Proteção Social Básica",
    "texto": "Estabelecer/fortalecer o fluxo CRAS/CREAS para referência e contrarreferência nos territórios."
  },
  {
    "id": "PSB-014",
    "eixo": "PROTEÇÃO SOCIAL BÁSICA (PSB)",
    "categoria": "Proteção Social Básica",
    "texto": "Ampliar a oferta e capacidade de atendimento do SCFV, através de parcerias com a rede local."
  },
  {
    "id": "PSB-015",
    "eixo": "PROTEÇÃO SOCIAL BÁSICA (PSB)",
    "categoria": "Proteção Social Básica",
    "texto": "Revisão da Lei de Benefícios Eventuais Municipal."
  },
  {
    "id": "PSB-016",
    "eixo": "PROTEÇÃO SOCIAL BÁSICA (PSB)",
    "categoria": "Proteção Social Básica",
    "texto": "Ampliação da cobertura na oferta dos benefícios eventuais."
  },
  {
    "id": "PSB-017",
    "eixo": "PROTEÇÃO SOCIAL BÁSICA (PSB)",
    "categoria": "Proteção Social Básica",
    "texto": "Qualificação do atendimento às pessoas com deficiência e suas famílias, promovendo acesso e garantia de direitos."
  },
  {
    "id": "PSB-018",
    "eixo": "PROTEÇÃO SOCIAL BÁSICA (PSB)",
    "categoria": "Proteção Social Básica",
    "texto": "Elaboração de plano de ação, fluxos e instrumentos para atuação dos trabalhadores do SUAS."
  },
  {
    "id": "PSB-019",
    "eixo": "PROTEÇÃO SOCIAL BÁSICA (PSB)",
    "categoria": "Proteção Social Básica",
    "texto": "Ampliar cobertura, garantir vínculo contínuo e promover intersetorialidade."
  },
  {
    "id": "PSB-020",
    "eixo": "PROTEÇÃO SOCIAL BÁSICA (PSB)",
    "categoria": "Proteção Social Básica",
    "texto": "Reestruturar a equipe própria do Programa Criança Feliz."
  },
  {
    "id": "PSB-021",
    "eixo": "PROTEÇÃO SOCIAL BÁSICA (PSB)",
    "categoria": "Proteção Social Básica",
    "texto": "Capacitação continuada com a equipe: Visitadores e Supervisores."
  },
  {
    "id": "PSB-022",
    "eixo": "PROTEÇÃO SOCIAL BÁSICA (PSB)",
    "categoria": "Proteção Social Básica",
    "texto": "Articulação do público atendido no SCFV e do Programa Criança Feliz."
  },
  {
    "id": "PSB-023",
    "eixo": "PROTEÇÃO SOCIAL BÁSICA (PSB)",
    "categoria": "Proteção Social Básica",
    "texto": "Expansão do Programa Primeira Infância para as comunidades em maior vulnerabilidade."
  },
  {
    "id": "PSE-001",
    "eixo": "PROTEÇÃO SOCIAL ESPECIAL (PSE)",
    "categoria": "Proteção Social Especial",
    "texto": "Implantar unidade de acolhimento de criança na faixa etária de 0 a 12 anos, com 20 vagas."
  },
  {
    "id": "PSE-002",
    "eixo": "PROTEÇÃO SOCIAL ESPECIAL (PSE)",
    "categoria": "Proteção Social Especial",
    "texto": "Implantar unidade de acolhimento de adolescentes na faixa etária de 13 a 17 anos, com 20 vagas."
  },
  {
    "id": "PSE-003",
    "eixo": "PROTEÇÃO SOCIAL ESPECIAL (PSE)",
    "categoria": "Proteção Social Especial",
    "texto": "Capacitar as equipes na construção do PPP (Projeto Político-Pedagógico)."
  },
  {
    "id": "PSE-004",
    "eixo": "PROTEÇÃO SOCIAL ESPECIAL (PSE)",
    "categoria": "Proteção Social Especial",
    "texto": "Alinhar as necessidades de cada unidade e criar rotina semanal."
  },
  {
    "id": "PSE-005",
    "eixo": "PROTEÇÃO SOCIAL ESPECIAL (PSE)",
    "categoria": "Proteção Social Especial",
    "texto": "Modernização dos hardwares e softwares."
  },
  {
    "id": "PSE-006",
    "eixo": "PROTEÇÃO SOCIAL ESPECIAL (PSE)",
    "categoria": "Proteção Social Especial",
    "texto": "Aquisição e manutenção de mobiliário e eletrodomésticos."
  },
  {
    "id": "PSE-007",
    "eixo": "PROTEÇÃO SOCIAL ESPECIAL (PSE)",
    "categoria": "Proteção Social Especial",
    "texto": "Aquisição e manutenção de material de expediente e escritório."
  },
  {
    "id": "PSE-008",
    "eixo": "PROTEÇÃO SOCIAL ESPECIAL (PSE)",
    "categoria": "Proteção Social Especial",
    "texto": "Aquisição de aparelho de telefonia móvel para as unidades."
  },
  {
    "id": "PSE-009",
    "eixo": "PROTEÇÃO SOCIAL ESPECIAL (PSE)",
    "categoria": "Proteção Social Especial",
    "texto": "Aquisição de veículo adaptado tipo van."
  },
  {
    "id": "PSE-010",
    "eixo": "PROTEÇÃO SOCIAL ESPECIAL (PSE)",
    "categoria": "Proteção Social Especial",
    "texto": "Aquisição de veículo modelo popular."
  },
  {
    "id": "PSE-011",
    "eixo": "PROTEÇÃO SOCIAL ESPECIAL (PSE)",
    "categoria": "Proteção Social Especial",
    "texto": "Implantar unidade de longa permanência para idoso, com 20 vagas."
  },
  {
    "id": "PSE-012",
    "eixo": "PROTEÇÃO SOCIAL ESPECIAL (PSE)",
    "categoria": "Proteção Social Especial",
    "texto": "Implementar unidade de acolhimento na modalidade Residência Inclusiva."
  },
  {
    "id": "PSE-013",
    "eixo": "PROTEÇÃO SOCIAL ESPECIAL (PSE)",
    "categoria": "Proteção Social Especial",
    "texto": "Captar famílias com perfil para o acolhimento familiar."
  },
  {
    "id": "PSE-014",
    "eixo": "PROTEÇÃO SOCIAL ESPECIAL (PSE)",
    "categoria": "Proteção Social Especial",
    "texto": "Ampliar a divulgação do Serviço em Família Acolhedora, com trocas de experiência com outros municípios e estratégias locais voltadas para informação."
  },
  {
    "id": "PSE-015",
    "eixo": "PROTEÇÃO SOCIAL ESPECIAL (PSE)",
    "categoria": "Proteção Social Especial",
    "texto": "Implantar nas unidades de acolhimento projeto de cuidado personalizado com base no histórico de cada criança/adolescente."
  },
  {
    "id": "PSE-016",
    "eixo": "PROTEÇÃO SOCIAL ESPECIAL (PSE)",
    "categoria": "Proteção Social Especial",
    "texto": "Realizar visitas domiciliares mensais às famílias das unidades de acolhimento."
  },
  {
    "id": "PSE-017",
    "eixo": "PROTEÇÃO SOCIAL ESPECIAL (PSE)",
    "categoria": "Proteção Social Especial",
    "texto": "Garantir matrícula escolar e frequência de todas as crianças e adolescentes das unidades de acolhimento."
  },
  {
    "id": "PSE-018",
    "eixo": "PROTEÇÃO SOCIAL ESPECIAL (PSE)",
    "categoria": "Proteção Social Especial",
    "texto": "Inserir crianças/adolescentes das unidades de acolhimento em atividades externas culturais, esportivas e recreativas."
  },
  {
    "id": "PSE-019",
    "eixo": "PROTEÇÃO SOCIAL ESPECIAL (PSE)",
    "categoria": "Proteção Social Especial",
    "texto": "Oferecer formações continuadas para educadores sociais e equipe técnica das unidades de acolhimento."
  },
  {
    "id": "PSE-020",
    "eixo": "PROTEÇÃO SOCIAL ESPECIAL (PSE)",
    "categoria": "Proteção Social Especial",
    "texto": "Realizar reuniões mensais de supervisão técnica nas unidades de acolhimento."
  },
  {
    "id": "PSE-021",
    "eixo": "PROTEÇÃO SOCIAL ESPECIAL (PSE)",
    "categoria": "Proteção Social Especial",
    "texto": "Realizar acompanhamento técnico e estudo de caso periódico com a rede de serviços, CRAS e CREAS."
  },
  {
    "id": "PSE-022",
    "eixo": "PROTEÇÃO SOCIAL ESPECIAL (PSE)",
    "categoria": "Proteção Social Especial",
    "texto": "Realizar encontros intersetoriais com a rede socioassitencial e demais politicas públicas no território"
  },
  {
    "id": "PSE-023",
    "eixo": "PROTEÇÃO SOCIAL ESPECIAL (PSE)",
    "categoria": "Proteção Social Especial",
    "texto": "Adequação das instalações físicas dos CREAS"
  },
  {
    "id": "PSE-024",
    "eixo": "PROTEÇÃO SOCIAL ESPECIAL (PSE)",
    "categoria": "Proteção Social Especial",
    "texto": "Ampliar a oferta e a capacidade de atendimento do PAEFI"
  },
  {
    "id": "PSE-025",
    "eixo": "PROTEÇÃO SOCIAL ESPECIAL (PSE)",
    "categoria": "Proteção Social Especial",
    "texto": "Estabelecer fluxo de rede com poder Judiciário e o Sistema de Garantia de Direitos, para encaminhamentos e estudos de caso de usuários de e suas famílias"
  },
  {
    "id": "PSE-026",
    "eixo": "PROTEÇÃO SOCIAL ESPECIAL (PSE)",
    "categoria": "Proteção Social Especial",
    "texto": "Ampliar a oferta e a capacidade de atendimento de mulheres e idosos em situação de vulnerabilidade"
  },
  {
    "id": "PSE-027",
    "eixo": "PROTEÇÃO SOCIAL ESPECIAL (PSE)",
    "categoria": "Proteção Social Especial",
    "texto": "Aprimorar a oferta do serviço MSE"
  },
  {
    "id": "PSE-028",
    "eixo": "PROTEÇÃO SOCIAL ESPECIAL (PSE)",
    "categoria": "Proteção Social Especial",
    "texto": "Estabelecer/Fortalecer o fluxo CRAS/CREAS para referência e contra referência nos territórios, com padronização de instrumentos técnicos"
  },
  {
    "id": "PSE-029",
    "eixo": "PROTEÇÃO SOCIAL ESPECIAL (PSE)",
    "categoria": "Proteção Social Especial",
    "texto": "Implantação de Unidade pública para atendimento às pessoas idosas (Centro Dia)"
  },
  {
    "id": "PSE-030",
    "eixo": "PROTEÇÃO SOCIAL ESPECIAL (PSE)",
    "categoria": "Proteção Social Especial",
    "texto": "Implantação de unidades públicas para atendimento às pessoas em situação de vulnerabilidade e risco (CREAS)"
  },
  {
    "id": "PSE-031",
    "eixo": "PROTEÇÃO SOCIAL ESPECIAL (PSE)",
    "categoria": "Proteção Social Especial",
    "texto": "Fortalecer o serviço de serviço abordagem social nos territórios, com prioridade às situações de abuso sexual e trabalho infantil"
  },
  {
    "id": "PSE-032",
    "eixo": "PROTEÇÃO SOCIAL ESPECIAL (PSE)",
    "categoria": "Proteção Social Especial",
    "texto": "Fortalecer as ações planejadas para o atendimento à população em situação de rua (abordagem social e atendimento - Centro Pop)"
  },
  {
    "id": "PSE-033",
    "eixo": "PROTEÇÃO SOCIAL ESPECIAL (PSE)",
    "categoria": "Proteção Social Especial",
    "texto": "Implantar unidade pública para acolhimento institucional, na modalidade Casa De Passagem, para até 50 usuários em situação de rua"
  },
  {
    "id": "BS-001",
    "eixo": "GESTÃO SUAS",
    "categoria": "Benefícios Socioassistenciais",
    "texto": "Ampliar/aprimorar a oferta e capacidade dos serviços do SUAS"
  },
  {
    "id": "BS-002",
    "eixo": "GESTÃO SUAS",
    "categoria": "Benefícios Socioassistenciais",
    "texto": "Propor reuniões periódicas com a Educação e Saúde para Ação Social."
  },
  {
    "id": "BS-003",
    "eixo": "GESTÃO SUAS",
    "categoria": "Benefícios Socioassistenciais",
    "texto": "Aperfeiçoar a Equipe específica para a Gestão de benefício."
  },
  {
    "id": "BS-004",
    "eixo": "GESTÃO SUAS",
    "categoria": "Benefícios Socioassistenciais",
    "texto": "Fortalecer o Comitê Intersetorial com representantes da educação, saúde, assistência social e conselhos municipais."
  },
  {
    "id": "BS-005",
    "eixo": "GESTÃO SUAS",
    "categoria": "Benefícios Socioassistenciais",
    "texto": "Promover em conjunto com a PSB campanhas de sensibilização nas escolas e UBS."
  },
  {
    "id": "BS-006",
    "eixo": "GESTÃO SUAS",
    "categoria": "Benefícios Socioassistenciais",
    "texto": "Contribuir para as Ações em conjunto com a equipe do ACESSUAS para a promoção da Autonomia das Famílias."
  },
  {
    "id": "BS-007",
    "eixo": "SEGURANÇA ALIMENTAR",
    "categoria": "Benefícios Socioassistenciais",
    "texto": "Firmar a adesão do município de Belford Roxo aos programas federais de Cozinhas Comunitárias, Banco de Alimentos e Programa de Aquisição de Alimentos."
  },
  {
    "id": "BS-008",
    "eixo": "SEGURANÇA ALIMENTAR",
    "categoria": "Benefícios Socioassistenciais",
    "texto": "Consolidar o Projeto “Teoria das Cores”, com o intuito de promover aprendizado sobre os benefícios principais de alimentos do dia a dia para os usuários dos Centros de Referência de Assistência Social."
  },
  {
    "id": "BS-009",
    "eixo": "SEGURANÇA ALIMENTAR",
    "categoria": "Benefícios Socioassistenciais",
    "texto": "Retomar e investir no projeto “Hortas Comunitárias” nos Centros de Referência de Assistência Social, aumentando a segurança alimentar de famílias através de hortas comunitárias e nas instituições não governamentais do município."
  },
  {
    "id": "BS-010",
    "eixo": "SEGURANÇA ALIMENTAR",
    "categoria": "Benefícios Socioassistenciais",
    "texto": "Implantar o projeto “Alimentação Consciente” através da promoção de Educação Alimentar e Nutricional (EAN) para pessoas atendidas pelos equipamentos da SAN e da Assistência Social, em todos os níveis de complexidade."
  },
  {
    "id": "BS-011",
    "eixo": "SEGURANÇA ALIMENTAR",
    "categoria": "Benefícios Socioassistenciais",
    "texto": "Expansão e fortalecimento do projeto alimentação presente, ampliando a rede de parceiros integrantes"
  },
  {
    "id": "BS-012",
    "eixo": "SEGURANÇA ALIMENTAR",
    "categoria": "Benefícios Socioassistenciais",
    "texto": "Promover interações entre usuários em situação de vulnerabilidade da rede de assistência, em alusão as datas comemorativas"
  },
  {
    "id": "BS-013",
    "eixo": "SEGURANÇA ALIMENTAR",
    "categoria": "Benefícios Socioassistenciais",
    "texto": "Cozinha experimental, oficinas práticas de preparo de alimentos, aproveitando de cascas, talos e sobras"
  },
  {
    "id": "CS-001",
    "eixo": "ORGÃO GESTOR",
    "categoria": "Controle Social",
    "texto": "Fortalecer o CMAS, estruturando e efetivando o quadro de RH"
  },
  {
    "id": "CS-002",
    "eixo": "CONSELHO MUNICIPAL DE ASSISTÊNCIA SOCIAL (CMAS)",
    "categoria": "Controle Social",
    "texto": "Reuniões do CMAS, capacitações e conferências."
  },
  {
    "id": "CS-003",
    "eixo": "CONSELHO MUNICIPAL DE ASSISTÊNCIA SOCIAL (CMAS)",
    "categoria": "Controle Social",
    "texto": "Modernização dos hardwares e softwares."
  },
  {
    "id": "CS-004",
    "eixo": "CONSELHO MUNICIPAL DE ASSISTÊNCIA SOCIAL (CMAS)",
    "categoria": "Controle Social",
    "texto": "Aquisição e manutenção de mobiliário e eletrodomésticos."
  },
  {
    "id": "CS-005",
    "eixo": "CONSELHO MUNICIPAL DE ASSISTÊNCIA SOCIAL (CMAS)",
    "categoria": "Controle Social",
    "texto": "Aquisição e manutenção de material de expediente e escritório."
  },
  {
    "id": "CS-006",
    "eixo": "CONSELHO MUNICIPAL DE ASSISTÊNCIA SOCIAL (CMAS)",
    "categoria": "Controle Social",
    "texto": "Visita à Instituição Civil e Equipamentos da SEMASC."
  },
  {
    "id": "CS-007",
    "eixo": "CONSELHO MUNICIPAL DE ASSISTÊNCIA SOCIAL (CMAS)",
    "categoria": "Controle Social",
    "texto": "Apresentação no CMAS da prestação de contas do terceiro quadrimestre."
  },
  {
    "id": "CS-008",
    "eixo": "CONSELHO MUNICIPAL DE ASSISTÊNCIA SOCIAL (CMAS)",
    "categoria": "Controle Social",
    "texto": "Demonstrativo Sintético Anual de Execução Físico do Governo Estadual e do Governo Federal."
  },
  {
    "id": "CS-009",
    "eixo": "CONSELHO MUNICIPAL DE ASSISTÊNCIA SOCIAL (CMAS)",
    "categoria": "Controle Social",
    "texto": "Reunião da Comissão Temática do CMAS."
  },
  {
    "id": "CS-010",
    "eixo": "CONSELHO MUNICIPAL DE ASSISTÊNCIA SOCIAL (CMAS)",
    "categoria": "Controle Social",
    "texto": "Reuniões da Comissão Organizadora da Conferência Municipal de Assistência Social."
  },
  {
    "id": "CS-011",
    "eixo": "CONSELHO MUNICIPAL DE ASSISTÊNCIA SOCIAL (CMAS)",
    "categoria": "Controle Social",
    "texto": "Reunião Ordinária do CMAS."
  },
  {
    "id": "CS-012",
    "eixo": "CONSELHO MUNICIPAL DE ASSISTÊNCIA SOCIAL (CMAS)",
    "categoria": "Controle Social",
    "texto": "Relatório de Gestão do CMAS."
  },
  {
    "id": "CS-013",
    "eixo": "CONSELHO MUNICIPAL DE ASSISTÊNCIA SOCIAL (CMAS)",
    "categoria": "Controle Social",
    "texto": "Apresentação do Plano de Ação para Cofinanciamento do Governo do Estado – Sistema Único de Assistência Social (SUAS)."
  },
  {
    "id": "CS-014",
    "eixo": "CONSELHO MUNICIPAL DE ASSISTÊNCIA SOCIAL (CMAS)",
    "categoria": "Controle Social",
    "texto": "Apresentar no CMAS Proposta da LDO – Lei de Diretrizes Orçamentárias."
  },
  {
    "id": "CS-015",
    "eixo": "CONSELHO MUNICIPAL DE ASSISTÊNCIA SOCIAL (CMAS)",
    "categoria": "Controle Social",
    "texto": "Realização da Conferência Municipal de Assistência Social."
  },
  {
    "id": "CS-016",
    "eixo": "CONSELHO MUNICIPAL DE ASSISTÊNCIA SOCIAL (CMAS)",
    "categoria": "Controle Social",
    "texto": "Eleição do CMAS/BR – biênio."
  },
  {
    "id": "CS-017",
    "eixo": "CONSELHO MUNICIPAL DE ASSISTÊNCIA SOCIAL (CMAS)",
    "categoria": "Controle Social",
    "texto": "Pré-Conferência nos equipamentos."
  },
  {
    "id": "CS-018",
    "eixo": "CONSELHO MUNICIPAL DE SEGURANÇA ALIMENTAR E NUTRICIONAL (COMSEA)",
    "categoria": "Controle Social",
    "texto": "Reuniões do COMSEA, capacitações e conferências."
  },
  {
    "id": "CS-019",
    "eixo": "CONSELHO MUNICIPAL DE SEGURANÇA ALIMENTAR E NUTRICIONAL (COMSEA)",
    "categoria": "Controle Social",
    "texto": "Modernização dos hardwares e softwares."
  },
  {
    "id": "CS-020",
    "eixo": "CONSELHO MUNICIPAL DE SEGURANÇA ALIMENTAR E NUTRICIONAL (COMSEA)",
    "categoria": "Controle Social",
    "texto": "Aquisição e manutenção de mobiliário e eletrodomésticos."
  },
  {
    "id": "CS-021",
    "eixo": "CONSELHO MUNICIPAL DE SEGURANÇA ALIMENTAR E NUTRICIONAL (COMSEA)",
    "categoria": "Controle Social",
    "texto": "Aquisição e manutenção de material de expediente e escritório."
  },
  {
    "id": "CS-022",
    "eixo": "CONSELHO MUNICIPAL DE SEGURANÇA ALIMENTAR E NUTRICIONAL (COMSEA)",
    "categoria": "Controle Social",
    "texto": "Reunião dos grupos de trabalho permanente."
  },
  {
    "id": "CS-023",
    "eixo": "CONSELHO MUNICIPAL DE SEGURANÇA ALIMENTAR E NUTRICIONAL (COMSEA)",
    "categoria": "Controle Social",
    "texto": "Realizar a Conferência Municipal de Segurança Alimentar."
  },
  {
    "id": "CS-024",
    "eixo": "CONSELHO MUNICIPAL DE SEGURANÇA ALIMENTAR E NUTRICIONAL (COMSEA)",
    "categoria": "Controle Social",
    "texto": "Visita às Instituições Civis."
  },
  {
    "id": "EP-001",
    "eixo": "GESTÃO SUAS",
    "categoria": "Educação Permanente",
    "texto": "Capacitação inicial da equipe de entrevistadores."
  },
  {
    "id": "EP-002",
    "eixo": "GESTÃO SUAS",
    "categoria": "Educação Permanente",
    "texto": "Capacitação para os profissionais da Gestão de benefícios."
  },
  {
    "id": "EP-003",
    "eixo": "CONSELHO MUNICIPAL DE ASSISTÊNCIA SOCIAL (CMAS)",
    "categoria": "Educação Permanente",
    "texto": "Capacitação CMAS."
  },
  {
    "id": "EP-004",
    "eixo": "CONSELHO MUNICIPAL DE SEGURANÇA ALIMENTAR E NUTRICIONAL (COMSEA)",
    "categoria": "Educação Permanente",
    "texto": "Capacitação dos Conselheiros."
  },
  {
    "id": "EP-005",
    "eixo": "SEGURANÇA ALIMENTAR",
    "categoria": "Educação Permanente",
    "texto": "Capacitar os conselheiros municipais de assistência social"
  },
  {
    "id": "EP-006",
    "eixo": "GESTÃO SUAS",
    "categoria": "Educação Permanente",
    "texto": "Ciclos de capacitação: Cursos, oficinas, capacitações e intercâmbios"
  },
  {
    "id": "EP-007",
    "eixo": "GESTÃO SUAS",
    "categoria": "Educação Permanente",
    "texto": "Elaboração do Plano Municipal de Educação Permanente"
  },
  {
    "id": "EP-008",
    "eixo": "GESTÃO SUAS",
    "categoria": "Educação Permanente",
    "texto": "Realização de formações técnicas e temáticas"
  },
  {
    "id": "EP-009",
    "eixo": "GESTÃO SUAS",
    "categoria": "Educação Permanente",
    "texto": "Criação da Comissão de Gestão do Trabalho"
  },
  {
    "id": "EP-010",
    "eixo": "GESTÃO SUAS",
    "categoria": "Educação Permanente",
    "texto": "Implementação da supervisão técnica"
  },
  {
    "id": "EP-011",
    "eixo": "GESTÃO SUAS",
    "categoria": "Educação Permanente",
    "texto": "Diagnóstico das condições de trabalho"
  },
  {
    "id": "RM-001",
    "eixo": "ORGÃO GESTOR",
    "categoria": "Resultados e Monitoramento",
    "texto": "Articular com a rede socioassistencial,  objetivando o fortalecimento do trabalho intersetorial."
  },
  {
    "id": "RM-002",
    "eixo": "ORGÃO GESTOR",
    "categoria": "Resultados e Monitoramento",
    "texto": "Desenvolver ações sociais itinerantes, como estratégia de divulgação das ações desenvolvidas pela SEMASC."
  }
];
