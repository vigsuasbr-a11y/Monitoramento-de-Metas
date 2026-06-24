const APPS_SCRIPT_WEB_APP_URL = window.PMAS_CONFIG?.appsScriptUrl || "https://script.google.com/macros/s/AKfycbz_RP1WzFbZFQ5SGMFPnxoC_fURp_Bo3NfPRCU8GQM5-DO6LXb0EbT5FErTOzLHKhTLtw/exec";
const STORAGE_KEY = "pmas-monitoramento-2026-2029";
const TOTAL_STEPS = 3;
const LEGACY_COMSEA_AXIS = "CONSELHO MUNICIPAL DE SEGURANÇA ALIMENTAR E NUTRICIONAL";
const COMSEA_AXIS = "CONSELHO MUNICIPAL DE SEGURANÇA ALIMENTAR E NUTRICIONAL (COMSEA)";

const categories = [
  {
    id: "complexo-cidadania",
    title: "Complexo da Cidadania",
    icon: "badge-check",
    description: "Documentação civil, busca ativa, identificação e atendimento humanizado à população.",
    metas: [
      meta("CC-001", "COMPLEXO DA CIDADANIA", "Fornecer isenções de 2° via de documentação para população, por meio de atendimentos sociais nas unidades CRAS, CREAS e Centro Pop"),
      meta("CC-002", "COMPLEXO DA CIDADANIA", "Conhecer a demanda que não chega espontaneamente, através de consultas médicas nos postos de saúde e das matrículas escolares"),
      meta("CC-003", "COMPLEXO DA CIDADANIA", "Registro civil de nascimento logo após o nascimento, através de relatórios enviados pelo RCPN"),
      meta("CC-004", "COMPLEXO DA CIDADANIA", "Identificação de crianças e adolescentes com foto e datiloscopia do município, através dos dados fornecidos pelos órgãos responsavéis"),
      meta("CC-005", "COMPLEXO DA CIDADANIA", "Realizar rodas de conversa nos CRAS e CREAS"),
      meta("CC-006", "COMPLEXO DA CIDADANIA", "Acolhimento humanizado com escuta qualificada e formação continuada para a equipe técnica")
    ]
  },
  {
    id: "gestao-institucional",
    title: "Gestão Institucional",
    icon: "building-2",
    description: "Estrutura administrativa, equipamentos, unidades, pessoal e organização da SEMASC.",
    metas: [
      meta("GI-001", "ORGÃO GESTOR", "Ampliar/adequar as equipes de referências da SEMASC"),
      meta("GI-002", "ORGÃO GESTOR", "Modernização dos hardwares e softwares"),
      meta("GI-003", "ORGÃO GESTOR", "Aquisição e manutenção de mobiliário e eletrodomésticos"),
      meta("GI-004", "ORGÃO GESTOR", "Aquisição e manutenção de material de expediente e escritório"),
      meta("GI-005", "ORGÃO GESTOR", "Aquisição de aparelho de telefonia móvel"),
      meta("GI-006", "ORGÃO GESTOR", "Aquisição de veículo adaptado tipo van"),
      meta("GI-007", "ORGÃO GESTOR", "Aquisição de veículo modelo popular"),
      meta("GI-008", "ORGÃO GESTOR", "Elaboração de concurso público para SEMASC"),
      meta("GI-009", "ORGÃO GESTOR", "Implantação de Sistema de ponto eletrônico."),
      meta("GI-010", "ORGÃO GESTOR", "Criação de um Sistema próprio de recursos humanos e modernização dos hardwares e softwares."),
      meta("GI-011", "ORGÃO GESTOR", "Revisar a lei municipal de regulação da política de assistência social (estrutura), observando os princípios, diretrizes e objetivos do SUAS."),
      meta("GI-012", "ORGÃO GESTOR", "Ampliar a cobertura da segurança alimentar e nutricional no munícipio, por meio de unidades fixas"),
      meta("GI-013", "GESTÃO SUAS", "Aquisição e manutenção de mobiliário e eletrodomésticos."),
      meta("GI-014", "GESTÃO SUAS", "Aquisição e manutenção de material de expediente e escritório."),
      meta("GI-015", "GESTÃO SUAS", "Aquisição de veículo modelo popular."),
      meta("GI-016", "GESTÃO SUAS", "Modernização dos hardwares e softwares"),
      meta("GI-017", "GESTÃO SUAS", "Modernização dos Hardwares e Softwares"),
      meta("GI-018", "GESTÃO SUAS", "Aquisição e manutenção de mobiliário e eletrodomésticos")
    ]
  },
  {
    id: "gestao-financeira",
    title: "Gestão Financeira",
    icon: "wallet-cards",
    description: "Orçamento, execução financeira, repasses, processos, prestações de contas e FMAS.",
    metas: [
      meta("GF-001", "ORGÃO GESTOR", "Alocar o orçamento autônomo e contínuo, execução de 100% da LOA aprovada"),
      meta("GF-009", "FUNDO MUNICIPAL", "Elaboração e revisão da proposta orçamentária do FMAS"),
      meta("GF-010", "FUNDO MUNICIPAL", "Realizar pagamentos de forma tempestiva e regular"),
      meta("GF-011", "FUNDO MUNICIPAL", "Acompanhar e controlar a execução orçamentária mensal do FMAS"),
      meta("GF-012", "FUNDO MUNICIPAL", "Elaboração de relatórios contábeis e prestação de contas"),
      meta("GF-013", "FUNDO MUNICIPAL", "Acompanhar e executar repasses federais e estaduais"),
      meta("GF-014", "FUNDO MUNICIPAL", "Implantação de rotina de conferência documental e financeira"),
      meta("GF-015", "FUNDO MUNICIPAL", "Avaliação trimestral de desempenho financeiro do FMAS"),
      meta("GF-016", "FUNDO MUNICIPAL", "Plano de execução e prestação de contas, planejamento de emendas.")
    ]
  },
  {
    id: "vigilancia-socioassistencial",
    title: "Vigilância Socioassistencial",
    icon: "radar",
    description: "Informação, cadastros, indicadores, assessoramento e análise territorial.",
    metas: [
      meta("VS-001", "ORGÃO GESTOR", "Efetivar/fortalecer a execução da Vigilância Socioassistêncial"),
      meta("VS-003", "GESTÃO SUAS", "Cadastros atualizados e visitas domiciliares."),
      meta("VS-004", "GESTÃO SUAS", "Lançamento de campanhas de conscientização sobre atualização cadastral."),
      meta("VS-005", "GESTÃO SUAS", "Realização de mutirões de atualização cadastral."),
      meta("VS-006", "GESTÃO SUAS", "Realização do assessoramento permanente aos CRAS."),
      meta("VS-007", "GESTÃO SUAS", "Realizar ações itinerantes – Mutirões Semestrais de cadastramento em bairros vulneráveis."),
      meta("VS-009", "GESTÃO SUAS", "Desenvolver ações da Vigilância Socioassistencial, as unidades, com visitas ao aprimoramento do sistema de informação, avaliação e monitoramento, conforme as normas vigentes"),
      meta("VS-010", "GESTÃO SUAS", "Fortalecer a Equipe de Vigilância Socioassistencial, com composição multiprofissional"),
      meta("VS-011", "GESTÃO SUAS", "Elaborar 2 boletins anuais da vigilância socioassistencial"),
      meta("VS-012", "GESTÃO SUAS", "Realização do Censo Pop Rua"),
      meta("VS-013", "GESTÃO SUAS", "Coordenar o processo de preenchimento do CensoSUAS"),
      meta("VS-008", "SEGURANÇA ALIMENTAR", "Aplicar questionário (e relatórios quando necessário) para conhecimento sobre situações de insegurança alimentar no município e melhor assertividade nas ações e projetos a serem realizados.")
    ]
  },
  {
    id: "protecao-social-basica",
    title: "Proteção Social Básica",
    icon: "home",
    description: "CRAS, PAIF, SCFV, programas, benefícios eventuais e acompanhamento familiar.",
    metas: [
      meta("PSB-001", "PROTEÇÃO SOCIAL BÁSICA (PSB)", "Realizar encontros intersetoriais com a rede socioassistencial e demais políticas públicas nos territórios dos CRAS."),
      meta("PSB-002", "PROTEÇÃO SOCIAL BÁSICA (PSB)", "Adequação das instalações físicas dos CRAS."),
      meta("PSB-003", "PROTEÇÃO SOCIAL BÁSICA (PSB)", "Ampliar a oferta e a capacidade de atendimento do PAIF."),
      meta("PSB-004", "PROTEÇÃO SOCIAL BÁSICA (PSB)", "Modernização dos hardwares e softwares."),
      meta("PSB-005", "PROTEÇÃO SOCIAL BÁSICA (PSB)", "Aquisição e manutenção de mobiliário e eletrodomésticos."),
      meta("PSB-006", "PROTEÇÃO SOCIAL BÁSICA (PSB)", "Aquisição e manutenção de material de expediente e escritório."),
      meta("PSB-007", "PROTEÇÃO SOCIAL BÁSICA (PSB)", "Aquisição de aparelho de telefonia móvel para as unidades."),
      meta("PSB-008", "PROTEÇÃO SOCIAL BÁSICA (PSB)", "Aquisição de veículo adaptado tipo van."),
      meta("PSB-009", "PROTEÇÃO SOCIAL BÁSICA (PSB)", "Aquisição de veículo modelo popular."),
      meta("PSB-010", "PROTEÇÃO SOCIAL BÁSICA (PSB)", "Estabelecer fluxo de rede com Poder Judiciário e o Sistema de Garantia de Direitos para encaminhamentos e estudos de caso de usuários e suas famílias."),
      meta("PSB-011", "PROTEÇÃO SOCIAL BÁSICA (PSB)", "Ampliar a oferta e a capacidade de atendimento dos Programas: Criança Feliz, Acessuas Trabalho e BPC na Escola."),
      meta("PSB-012", "PROTEÇÃO SOCIAL BÁSICA (PSB)", "Aprimorar e ampliar a cobertura de acompanhamento do PAIF nas famílias beneficiárias do PBF."),
      meta("PSB-013", "PROTEÇÃO SOCIAL BÁSICA (PSB)", "Estabelecer/fortalecer o fluxo CRAS/CREAS para referência e contrarreferência nos territórios."),
      meta("PSB-014", "PROTEÇÃO SOCIAL BÁSICA (PSB)", "Ampliar a oferta e capacidade de atendimento do SCFV, através de parcerias com a rede local."),
      meta("PSB-015", "PROTEÇÃO SOCIAL BÁSICA (PSB)", "Revisão da Lei de Benefícios Eventuais Municipal."),
      meta("PSB-016", "PROTEÇÃO SOCIAL BÁSICA (PSB)", "Ampliação da cobertura na oferta dos benefícios eventuais."),
      meta("PSB-017", "PROTEÇÃO SOCIAL BÁSICA (PSB)", "Qualificação do atendimento às pessoas com deficiência e suas famílias, promovendo acesso e garantia de direitos."),
      meta("PSB-018", "PROTEÇÃO SOCIAL BÁSICA (PSB)", "Elaboração de plano de ação, fluxos e instrumentos para atuação dos trabalhadores do SUAS."),
      meta("PSB-019", "PROTEÇÃO SOCIAL BÁSICA (PSB)", "Ampliar cobertura, garantir vínculo contínuo e promover intersetorialidade."),
      meta("PSB-020", "PROTEÇÃO SOCIAL BÁSICA (PSB)", "Reestruturar a equipe própria do Programa Criança Feliz."),
      meta("PSB-021", "PROTEÇÃO SOCIAL BÁSICA (PSB)", "Capacitação continuada com a equipe: Visitadores e Supervisores."),
      meta("PSB-022", "PROTEÇÃO SOCIAL BÁSICA (PSB)", "Articulação do público atendido no SCFV e do Programa Criança Feliz."),
      meta("PSB-023", "PROTEÇÃO SOCIAL BÁSICA (PSB)", "Expansão do Programa Primeira Infância para as comunidades em maior vulnerabilidade.")
    ]
  },
  {
    id: "protecao-social-especial",
    title: "Proteção Social Especial",
    icon: "hand-heart",
    description: "CREAS, acolhimento, residência inclusiva, família acolhedora e atendimento especializado.",
    metas: [
      meta("PSE-001", "PROTEÇÃO SOCIAL ESPECIAL (PSE)", "Implantar unidade de acolhimento de criança na faixa etária de 0 a 12 anos, com 20 vagas."),
      meta("PSE-002", "PROTEÇÃO SOCIAL ESPECIAL (PSE)", "Implantar unidade de acolhimento de adolescentes na faixa etária de 13 a 17 anos, com 20 vagas."),
      meta("PSE-003", "PROTEÇÃO SOCIAL ESPECIAL (PSE)", "Capacitar as equipes na construção do PPP (Projeto Político-Pedagógico)."),
      meta("PSE-004", "PROTEÇÃO SOCIAL ESPECIAL (PSE)", "Alinhar as necessidades de cada unidade e criar rotina semanal."),
      meta("PSE-005", "PROTEÇÃO SOCIAL ESPECIAL (PSE)", "Modernização dos hardwares e softwares."),
      meta("PSE-006", "PROTEÇÃO SOCIAL ESPECIAL (PSE)", "Aquisição e manutenção de mobiliário e eletrodomésticos."),
      meta("PSE-007", "PROTEÇÃO SOCIAL ESPECIAL (PSE)", "Aquisição e manutenção de material de expediente e escritório."),
      meta("PSE-008", "PROTEÇÃO SOCIAL ESPECIAL (PSE)", "Aquisição de aparelho de telefonia móvel para as unidades."),
      meta("PSE-009", "PROTEÇÃO SOCIAL ESPECIAL (PSE)", "Aquisição de veículo adaptado tipo van."),
      meta("PSE-010", "PROTEÇÃO SOCIAL ESPECIAL (PSE)", "Aquisição de veículo modelo popular."),
      meta("PSE-011", "PROTEÇÃO SOCIAL ESPECIAL (PSE)", "Implantar unidade de longa permanência para idoso, com 20 vagas."),
      meta("PSE-012", "PROTEÇÃO SOCIAL ESPECIAL (PSE)", "Implementar unidade de acolhimento na modalidade Residência Inclusiva."),
      meta("PSE-013", "PROTEÇÃO SOCIAL ESPECIAL (PSE)", "Captar famílias com perfil para o acolhimento familiar."),
      meta("PSE-014", "PROTEÇÃO SOCIAL ESPECIAL (PSE)", "Ampliar a divulgação do Serviço em Família Acolhedora, com trocas de experiência com outros municípios e estratégias locais voltadas para informação."),
      meta("PSE-015", "PROTEÇÃO SOCIAL ESPECIAL (PSE)", "Implantar nas unidades de acolhimento projeto de cuidado personalizado com base no histórico de cada criança/adolescente."),
      meta("PSE-016", "PROTEÇÃO SOCIAL ESPECIAL (PSE)", "Realizar visitas domiciliares mensais às famílias das unidades de acolhimento."),
      meta("PSE-017", "PROTEÇÃO SOCIAL ESPECIAL (PSE)", "Garantir matrícula escolar e frequência de todas as crianças e adolescentes das unidades de acolhimento."),
      meta("PSE-018", "PROTEÇÃO SOCIAL ESPECIAL (PSE)", "Inserir crianças/adolescentes das unidades de acolhimento em atividades externas culturais, esportivas e recreativas."),
      meta("PSE-019", "PROTEÇÃO SOCIAL ESPECIAL (PSE)", "Oferecer formações continuadas para educadores sociais e equipe técnica das unidades de acolhimento."),
      meta("PSE-020", "PROTEÇÃO SOCIAL ESPECIAL (PSE)", "Realizar reuniões mensais de supervisão técnica nas unidades de acolhimento."),
      meta("PSE-021", "PROTEÇÃO SOCIAL ESPECIAL (PSE)", "Realizar acompanhamento técnico e estudo de caso periódico com a rede de serviços, CRAS e CREAS."),
      meta("PSE-022", "PROTEÇÃO SOCIAL ESPECIAL (PSE)", "Realizar encontros intersetoriais com a rede socioassitencial e demais politicas públicas no território"),
      meta("PSE-023", "PROTEÇÃO SOCIAL ESPECIAL (PSE)", "Adequação das instalações físicas dos CREAS"),
      meta("PSE-024", "PROTEÇÃO SOCIAL ESPECIAL (PSE)", "Ampliar a oferta e a capacidade de atendimento do PAEFI"),
      meta("PSE-025", "PROTEÇÃO SOCIAL ESPECIAL (PSE)", "Estabelecer fluxo de rede com poder Judiciário e o Sistema de Garantia de Direitos, para encaminhamentos e estudos de caso de usuários de e suas famílias"),
      meta("PSE-026", "PROTEÇÃO SOCIAL ESPECIAL (PSE)", "Ampliar a oferta e a capacidade de atendimento de mulheres e idosos em situação de vulnerabilidade"),
      meta("PSE-027", "PROTEÇÃO SOCIAL ESPECIAL (PSE)", "Aprimorar a oferta do serviço MSE"),
      meta("PSE-028", "PROTEÇÃO SOCIAL ESPECIAL (PSE)", "Estabelecer/Fortalecer o fluxo CRAS/CREAS para referência e contra referência nos territórios, com padronização de instrumentos técnicos"),
      meta("PSE-029", "PROTEÇÃO SOCIAL ESPECIAL (PSE)", "Implantação de Unidade pública para atendimento às pessoas idosas (Centro Dia)"),
      meta("PSE-030", "PROTEÇÃO SOCIAL ESPECIAL (PSE)", "Implantação de unidades públicas para atendimento às pessoas em situação de vulnerabilidade e risco (CREAS)"),
      meta("PSE-031", "PROTEÇÃO SOCIAL ESPECIAL (PSE)", "Fortalecer o serviço de serviço abordagem social nos territórios, com prioridade às situações de abuso sexual e trabalho infantil"),
      meta("PSE-032", "PROTEÇÃO SOCIAL ESPECIAL (PSE)", "Fortalecer as ações planejadas para o atendimento à população em situação de rua (abordagem social e atendimento - Centro Pop)"),
      meta("PSE-033", "PROTEÇÃO SOCIAL ESPECIAL (PSE)", "Implantar unidade pública para acolhimento institucional, na modalidade Casa De Passagem, para até 50 usuários em situação de rua")
    ]
  },
  {
    id: "beneficios-socioassistenciais",
    title: "Benefícios Socioassistenciais",
    icon: "badge-dollar-sign",
    description: "Benefícios, transferência de renda, autonomia das famílias e segurança alimentar.",
    metas: [
      meta("BS-001", "GESTÃO SUAS", "Ampliar/aprimorar a oferta e capacidade dos serviços do SUAS"),
      meta("BS-002", "GESTÃO SUAS", "Propor reuniões periódicas com a Educação e Saúde para Ação Social."),
      meta("BS-003", "GESTÃO SUAS", "Aperfeiçoar a Equipe específica para a Gestão de benefício."),
      meta("BS-004", "GESTÃO SUAS", "Fortalecer o Comitê Intersetorial com representantes da educação, saúde, assistência social e conselhos municipais."),
      meta("BS-005", "GESTÃO SUAS", "Promover em conjunto com a PSB campanhas de sensibilização nas escolas e UBS."),
      meta("BS-006", "GESTÃO SUAS", "Contribuir para as Ações em conjunto com a equipe do ACESSUAS para a promoção da Autonomia das Famílias."),
      meta("BS-007", "SEGURANÇA ALIMENTAR", "Firmar a adesão do município de Belford Roxo aos programas federais de Cozinhas Comunitárias, Banco de Alimentos e Programa de Aquisição de Alimentos."),
      meta("BS-008", "SEGURANÇA ALIMENTAR", "Consolidar o Projeto “Teoria das Cores”, com o intuito de promover aprendizado sobre os benefícios principais de alimentos do dia a dia para os usuários dos Centros de Referência de Assistência Social."),
      meta("BS-009", "SEGURANÇA ALIMENTAR", "Retomar e investir no projeto “Hortas Comunitárias” nos Centros de Referência de Assistência Social, aumentando a segurança alimentar de famílias através de hortas comunitárias e nas instituições não governamentais do município."),
      meta("BS-010", "SEGURANÇA ALIMENTAR", "Implantar o projeto “Alimentação Consciente” através da promoção de Educação Alimentar e Nutricional (EAN) para pessoas atendidas pelos equipamentos da SAN e da Assistência Social, em todos os níveis de complexidade."),
      meta("BS-011", "SEGURANÇA ALIMENTAR", "Expansão e fortalecimento do projeto alimentação presente, ampliando a rede de parceiros integrantes"),
      meta("BS-012", "SEGURANÇA ALIMENTAR", "Promover interações entre usuários em situação de vulnerabilidade da rede de assistência, em alusão as datas comemorativas"),
      meta("BS-013", "SEGURANÇA ALIMENTAR", "Cozinha experimental, oficinas práticas de preparo de alimentos, aproveitando de cascas, talos e sobras")
    ]
  },
  {
    id: "controle-social",
    title: "Controle Social",
    icon: "landmark",
    description: "CMAS, COMSEA, conferências, comissões, conselhos e acompanhamento social.",
    metas: [
      meta("CS-001", "ORGÃO GESTOR", "Fortalecer o CMAS, estruturando e efetivando o quadro de RH"),
      meta("CS-002", "CONSELHO MUNICIPAL DE ASSISTÊNCIA SOCIAL (CMAS)", "Reuniões do CMAS, capacitações e conferências."),
      meta("CS-003", "CONSELHO MUNICIPAL DE ASSISTÊNCIA SOCIAL (CMAS)", "Modernização dos hardwares e softwares."),
      meta("CS-004", "CONSELHO MUNICIPAL DE ASSISTÊNCIA SOCIAL (CMAS)", "Aquisição e manutenção de mobiliário e eletrodomésticos."),
      meta("CS-005", "CONSELHO MUNICIPAL DE ASSISTÊNCIA SOCIAL (CMAS)", "Aquisição e manutenção de material de expediente e escritório."),
      meta("CS-006", "CONSELHO MUNICIPAL DE ASSISTÊNCIA SOCIAL (CMAS)", "Visita à Instituição Civil e Equipamentos da SEMASC."),
      meta("CS-007", "CONSELHO MUNICIPAL DE ASSISTÊNCIA SOCIAL (CMAS)", "Apresentação no CMAS da prestação de contas do terceiro quadrimestre."),
      meta("CS-008", "CONSELHO MUNICIPAL DE ASSISTÊNCIA SOCIAL (CMAS)", "Demonstrativo Sintético Anual de Execução Físico do Governo Estadual e do Governo Federal."),
      meta("CS-009", "CONSELHO MUNICIPAL DE ASSISTÊNCIA SOCIAL (CMAS)", "Reunião da Comissão Temática do CMAS."),
      meta("CS-010", "CONSELHO MUNICIPAL DE ASSISTÊNCIA SOCIAL (CMAS)", "Reuniões da Comissão Organizadora da Conferência Municipal de Assistência Social."),
      meta("CS-011", "CONSELHO MUNICIPAL DE ASSISTÊNCIA SOCIAL (CMAS)", "Reunião Ordinária do CMAS."),
      meta("CS-012", "CONSELHO MUNICIPAL DE ASSISTÊNCIA SOCIAL (CMAS)", "Relatório de Gestão do CMAS."),
      meta("CS-013", "CONSELHO MUNICIPAL DE ASSISTÊNCIA SOCIAL (CMAS)", "Apresentação do Plano de Ação para Cofinanciamento do Governo do Estado – Sistema Único de Assistência Social (SUAS)."),
      meta("CS-014", "CONSELHO MUNICIPAL DE ASSISTÊNCIA SOCIAL (CMAS)", "Apresentar no CMAS Proposta da LDO – Lei de Diretrizes Orçamentárias."),
      meta("CS-015", "CONSELHO MUNICIPAL DE ASSISTÊNCIA SOCIAL (CMAS)", "Realização da Conferência Municipal de Assistência Social."),
      meta("CS-016", "CONSELHO MUNICIPAL DE ASSISTÊNCIA SOCIAL (CMAS)", "Eleição do CMAS/BR – biênio."),
      meta("CS-017", "CONSELHO MUNICIPAL DE ASSISTÊNCIA SOCIAL (CMAS)", "Pré-Conferência nos equipamentos."),
      meta("CS-018", "CONSELHO MUNICIPAL DE SEGURANÇA ALIMENTAR E NUTRICIONAL (COMSEA)", "Reuniões do COMSEA, capacitações e conferências."),
      meta("CS-019", "CONSELHO MUNICIPAL DE SEGURANÇA ALIMENTAR E NUTRICIONAL (COMSEA)", "Modernização dos hardwares e softwares."),
      meta("CS-020", "CONSELHO MUNICIPAL DE SEGURANÇA ALIMENTAR E NUTRICIONAL (COMSEA)", "Aquisição e manutenção de mobiliário e eletrodomésticos."),
      meta("CS-021", "CONSELHO MUNICIPAL DE SEGURANÇA ALIMENTAR E NUTRICIONAL (COMSEA)", "Aquisição e manutenção de material de expediente e escritório."),
      meta("CS-022", "CONSELHO MUNICIPAL DE SEGURANÇA ALIMENTAR E NUTRICIONAL (COMSEA)", "Reunião dos grupos de trabalho permanente."),
      meta("CS-023", "CONSELHO MUNICIPAL DE SEGURANÇA ALIMENTAR E NUTRICIONAL (COMSEA)", "Realizar a Conferência Municipal de Segurança Alimentar."),
      meta("CS-024", "CONSELHO MUNICIPAL DE SEGURANÇA ALIMENTAR E NUTRICIONAL (COMSEA)", "Visita às Instituições Civis.")
    ]
  },
  {
    id: "educacao-permanente",
    title: "Educação Permanente",
    icon: "graduation-cap",
    description: "Capacitações, formações, qualificação de equipes e conselheiros.",
    metas: [
      meta("EP-001", "GESTÃO SUAS", "Capacitação inicial da equipe de entrevistadores."),
      meta("EP-002", "GESTÃO SUAS", "Capacitação para os profissionais da Gestão de benefícios."),
      meta("EP-003", "CONSELHO MUNICIPAL DE ASSISTÊNCIA SOCIAL (CMAS)", "Capacitação CMAS."),
      meta("EP-004", "CONSELHO MUNICIPAL DE SEGURANÇA ALIMENTAR E NUTRICIONAL (COMSEA)", "Capacitação dos Conselheiros."),
      meta("EP-005", "SEGURANÇA ALIMENTAR", "Capacitar os conselheiros municipais de assistência social"),
      meta("EP-006", "GESTÃO SUAS", "Ciclos de capacitação: Cursos, oficinas, capacitações e intercâmbios"),
      meta("EP-007", "GESTÃO SUAS", "Elaboração do Plano Municipal de Educação Permanente"),
      meta("EP-008", "GESTÃO SUAS", "Realização de formações técnicas e temáticas"),
      meta("EP-009", "GESTÃO SUAS", "Criação da Comissão de Gestão do Trabalho"),
      meta("EP-010", "GESTÃO SUAS", "Implementação da supervisão técnica"),
      meta("EP-011", "GESTÃO SUAS", "Diagnóstico das condições de trabalho")
    ]
  },
  {
    id: "resultados-monitoramento",
    title: "Resultados e Monitoramento",
    icon: "chart-no-axes-combined",
    description: "Articulação, ações itinerantes, acompanhamento, resultados e fortalecimento da rede.",
    metas: [
      meta("RM-001", "ORGÃO GESTOR", "Articular com a rede socioassistencial,  objetivando o fortalecimento do trabalho intersetorial."),
      meta("RM-002", "ORGÃO GESTOR", "Desenvolver ações sociais itinerantes, como estratégia de divulgação das ações desenvolvidas pela SEMASC.")
    ]
  }
];

const allMetas = categories.flatMap((category) =>
  category.metas.map((item) => ({
    ...item,
    categoryId: category.id,
    categoryTitle: category.title
  }))
);

const initialState = {
  currentStep: 1,
  tutorialShown: false,
  identificacao: {
    nome: "",
    cargo: "",
    setor: "",
    dataPreenchimento: "",
    telefone: "",
    email: "",
    eixo: ""
  },
  metas: Object.fromEntries(
    allMetas.map((item) => [
      item.id,
      {
        resposta: ""
      }
    ])
  )
};

let state = loadState();
let autosaveTimer = null;

document.addEventListener("DOMContentLoaded", () => {
  hydrateDate();
  renderCategories();
  bindFormFields();
  bindActions();
  renderAll();
  refreshIcons();
});

function meta(id, eixoOriginal, texto) {
  return { id, eixoOriginal, texto };
}

function hydrateDate() {
  if (!state.identificacao.dataPreenchimento) {
    state.identificacao.dataPreenchimento = new Date().toISOString().slice(0, 10);
  }
}

function loadState() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!stored) return structuredCloneSafe(initialState);

    const merged = structuredCloneSafe(initialState);
    merged.currentStep = stored.currentStep || 1;
    merged.tutorialShown = Boolean(stored.tutorialShown);
    merged.identificacao = { ...merged.identificacao, ...(stored.identificacao || {}) };
    if (merged.identificacao.eixo === LEGACY_COMSEA_AXIS) {
      merged.identificacao.eixo = COMSEA_AXIS;
    }
    const allowedIdentificationFields = new Set(Object.keys(initialState.identificacao));
    Object.keys(merged.identificacao).forEach((field) => {
      if (!allowedIdentificationFields.has(field)) delete merged.identificacao[field];
    });
    merged.metas = Object.fromEntries(
      Object.entries({ ...merged.metas, ...(stored.metas || {}) }).map(([id, data]) => [
        id,
        { resposta: data?.resposta || "" }
      ])
    );
    return merged;
  } catch (error) {
    console.warn("Não foi possível carregar o rascunho salvo.", error);
    return structuredCloneSafe(initialState);
  }
}

function structuredCloneSafe(value) {
  return JSON.parse(JSON.stringify(value));
}

function saveState(showToast = true) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  if (showToast) showAutosaveToast();
}

function scheduleSave() {
  window.clearTimeout(autosaveTimer);
  autosaveTimer = window.setTimeout(() => saveState(true), 350);
}

function bindFormFields() {
  document.querySelectorAll("[data-field]").forEach((field) => {
    field.value = state.identificacao[field.dataset.field] || "";
    field.addEventListener("input", (event) => {
      state.identificacao[event.target.dataset.field] = event.target.value;
      clearInvalid(event.target);
      if (event.target.dataset.field === "eixo") {
        handleAxisChange();
      }
      scheduleSave();
      renderReview();
    });

    field.addEventListener("change", (event) => {
      state.identificacao[event.target.dataset.field] = event.target.value;
      clearInvalid(event.target);
      if (event.target.dataset.field === "eixo") {
        handleAxisChange();
      }
      scheduleSave();
      renderReview();
    });
  });

}

function bindActions() {
  document.body.addEventListener("click", (event) => {
    const stepTarget = event.target.closest("[data-step-target]");
    if (stepTarget) {
      goToStep(Number(stepTarget.dataset.stepTarget));
      return;
    }

    const action = event.target.closest("[data-action]");
    if (action) {
      handleAction(action.dataset.action);
      return;
    }

    const categoryTrigger = event.target.closest("[data-category-trigger]");
    if (categoryTrigger) {
      const card = categoryTrigger.closest(".category-card");
      card.classList.toggle("is-open");
      categoryTrigger.setAttribute("aria-expanded", card.classList.contains("is-open"));
      return;
    }

    const choice = event.target.closest("[data-choice]");
    if (choice) {
      setMetaChoice(choice.dataset.metaId, choice.dataset.choice);
    }
  });

  document.getElementById("submitButton").addEventListener("click", enviarFormulario);
}

function handleAction(action) {
  const handlers = {
    next: () => goToStep(state.currentStep + 1),
    prev: () => goToStep(state.currentStep - 1),
    "expand-all": () => toggleAllCategories(true),
    "collapse-all": () => toggleAllCategories(false),
    "clear-local": clearLocalDraft,
    "close-modal": closeSuccessModal,
    "close-tutorial": closeTutorialModal
  };

  handlers[action]?.();
}

function handleAxisChange() {
  renderCategories();
  hideAnswersError();
  updateProgress();
  renderReview();
  refreshIcons();
}

function getActiveMetas() {
  const selectedAxis = state.identificacao.eixo;
  if (!selectedAxis) return [];
  return allMetas.filter((item) => item.eixoOriginal === selectedAxis);
}

function getVisibleCategories() {
  const selectedAxis = state.identificacao.eixo;
  if (!selectedAxis) return [];

  return categories
    .map((category) => ({
      ...category,
      metas: category.metas.filter((item) => item.eixoOriginal === selectedAxis)
    }))
    .filter((category) => category.metas.length > 0);
}

function renderCategories() {
  const container = document.getElementById("categoriesContainer");
  const visibleCategories = getVisibleCategories();

  if (!visibleCategories.length) {
    container.innerHTML = `
      <div class="empty-panel">
        <i data-lucide="list-filter"></i>
        <strong>Selecione um eixo na identificação</strong>
        <p>Depois de escolher o eixo vinculado, aparecerão aqui apenas as metas correspondentes a esse questionário.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = visibleCategories
    .map((category, index) => {
      const metas = category.metas
        .map((item) => renderMetaCard(item, category))
        .join("");

      return `
        <article class="category-card ${index === 0 ? "is-open" : ""}" data-category="${category.id}">
          <button class="category-trigger" type="button" data-category-trigger aria-expanded="${index === 0}">
            <span class="category-title">
              <span class="category-icon"><i data-lucide="${category.icon}"></i></span>
              <span>
                <h3>${escapeHTML(category.title)}</h3>
                <p>${escapeHTML(category.description)}</p>
              </span>
            </span>
            <span class="category-meta">
              <span data-category-count="${category.id}">0/${category.metas.length}</span>
              <i class="category-chevron" data-lucide="chevron-down"></i>
            </span>
          </button>
          <div class="category-content">
            ${metas}
          </div>
        </article>
      `;
    })
    .join("");
}

function renderMetaCard(item, category) {
  const saved = ensureMetaState(item.id);
  const status = saved.resposta || "pendente";

  return `
    <article class="meta-card" data-meta-card="${item.id}" data-status="${status}">
      <div class="meta-top">
        <div class="meta-title-wrap">
          <span class="meta-icon"><i data-lucide="${iconForMeta(category.id)}"></i></span>
          <div>
            <h4>${escapeHTML(item.texto)}</h4>
            <span class="meta-axis">${escapeHTML(item.eixoOriginal)}</span>
          </div>
        </div>
        <div class="meta-actions" role="group" aria-label="Resposta da meta ${escapeHTML(item.id)}">
          <button class="choice-btn ${saved.resposta === "sim" ? "is-selected" : ""}" type="button" data-meta-id="${item.id}" data-choice="sim">
            Sim
            <i data-lucide="check-circle-2"></i>
          </button>
          <button class="choice-btn ${saved.resposta === "nao" ? "is-selected" : ""}" type="button" data-meta-id="${item.id}" data-choice="nao">
            Não
            <i data-lucide="x-circle"></i>
          </button>
          <span class="status-pill ${statusClass(status)}" data-status-pill="${item.id}">${statusLabel(status)}</span>
        </div>
      </div>
    </article>
  `;
}

function iconForMeta(categoryId) {
  const icons = {
    "gestao-institucional": "briefcase-business",
    "gestao-financeira": "circle-dollar-sign",
    "vigilancia-socioassistencial": "scan-search",
    "protecao-social-basica": "users-round",
    "protecao-social-especial": "heart-handshake",
    "beneficios-socioassistenciais": "hand-coins",
    "controle-social": "landmark",
    "educacao-permanente": "book-open-check",
    "resultados-monitoramento": "activity"
  };

  return icons[categoryId] || "target";
}

function setMetaChoice(id, choice) {
  const item = ensureMetaState(id);
  item.resposta = choice;
  updateMetaCard(id);
  document.querySelector(`[data-meta-card="${id}"]`)?.classList.remove("is-required");
  updateProgress();
  updateAnswersError();
  renderReview();
  saveState(false);
}

function ensureMetaState(id) {
  if (!state.metas[id]) {
    state.metas[id] = { resposta: "" };
  }

  return state.metas[id];
}

function updateMetaCard(id) {
  const itemState = ensureMetaState(id);
  const status = itemState.resposta || "pendente";
  const card = document.querySelector(`[data-meta-card="${id}"]`);
  if (!card) return;

  card.dataset.status = status;
  card.querySelectorAll("[data-choice]").forEach((button) => {
    button.classList.toggle("is-selected", button.dataset.choice === itemState.resposta);
  });

  const pill = card.querySelector(`[data-status-pill="${id}"]`);
  if (pill) {
    pill.textContent = statusLabel(status);
    pill.className = `status-pill ${statusClass(status)}`;
  }
}

function renderAll() {
  if (state.currentStep > 2 && getStats().pendentes > 0) {
    state.currentStep = 2;
  }
  setActiveStep(state.currentStep);
  updateProgress();
  renderReview();
}

function updateProgress() {
  const stats = getStats();
  const answeredPercent = percent(stats.respondidas, stats.total);
  const executionPercent = percent(stats.sim, Math.max(stats.respondidas, 1));

  setText("totalMetas", stats.total);
  setText("simCount", stats.sim);
  setText("noCount", stats.nao);
  setText("completionPercent", answeredPercent);
  setText("sideCompletionText", `${answeredPercent}%`);
  setText("answeredSummary", `${stats.respondidas} de ${stats.total} metas respondidas`);
  setText("executionSummary", `${executionPercent}% de execução entre as metas respondidas`);

  document.getElementById("mainProgressBar").style.width = `${answeredPercent}%`;
  document.getElementById("sideProgressBar").style.width = `${Math.max(answeredPercent, percent(state.currentStep, TOTAL_STEPS))}%`;

  getVisibleCategories().forEach((category) => {
    const answeredInCategory = category.metas.filter((item) => ensureMetaState(item.id).resposta).length;
    const countNode = document.querySelector(`[data-category-count="${category.id}"]`);
    if (countNode) countNode.textContent = `${answeredInCategory}/${category.metas.length}`;
  });
}

function getStats() {
  const activeMetas = getActiveMetas();
  const total = activeMetas.length;
  const sim = activeMetas.filter((item) => ensureMetaState(item.id).resposta === "sim").length;
  const nao = activeMetas.filter((item) => ensureMetaState(item.id).resposta === "nao").length;
  const respondidas = sim + nao;

  return {
    total,
    sim,
    nao,
    respondidas,
    pendentes: total - respondidas,
    percentualPreenchimento: percent(respondidas, total),
    percentualExecucao: percent(sim, Math.max(respondidas, 1))
  };
}

function percent(value, total) {
  return total ? Math.round((value / total) * 100) : 0;
}

function setActiveStep(step) {
  const nextStep = Math.min(Math.max(step, 1), TOTAL_STEPS);
  state.currentStep = nextStep;
  setText("sideStepText", `${nextStep} de ${TOTAL_STEPS}`);

  document.querySelectorAll(".form-step").forEach((node) => {
    node.classList.toggle("is-active", Number(node.dataset.step) === nextStep);
  });

  document.querySelectorAll(".step-button").forEach((node) => {
    const target = Number(node.dataset.stepTarget);
    node.classList.toggle("is-active", target === nextStep);
    node.classList.toggle("is-complete", target < nextStep);
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
  saveState(false);
}

function goToStep(step) {
  const currentStep = state.currentStep;
  const movingForward = step > currentStep;

  if (movingForward && currentStep === 1 && !validateIdentification()) {
    return;
  }

  if (movingForward && step >= 3 && !validateAllMetas()) {
    setActiveStep(2);
    showTutorialOnce();
    return;
  }

  if (step === 3) {
    renderReview();
  }

  setActiveStep(step);

  if (currentStep === 1 && step === 2) {
    showTutorialOnce();
  }
}

function validateAllMetas() {
  const unanswered = getActiveMetas().filter((item) => !ensureMetaState(item.id).resposta);
  document.querySelectorAll(".meta-card.is-required").forEach((card) => card.classList.remove("is-required"));

  if (!unanswered.length) {
    hideAnswersError();
    return true;
  }

  unanswered.forEach((item) => {
    document.querySelector(`[data-meta-card="${item.id}"]`)?.classList.add("is-required");
  });

  const firstCard = document.querySelector(`[data-meta-card="${unanswered[0].id}"]`);
  const category = firstCard?.closest(".category-card");
  category?.classList.add("is-open");
  category?.querySelector("[data-category-trigger]")?.setAttribute("aria-expanded", "true");
  showAnswersError(unanswered.length);
  firstCard?.scrollIntoView({ behavior: "smooth", block: "center" });
  return false;
}

function updateAnswersError() {
  const alert = document.getElementById("answersError");
  if (!alert?.classList.contains("is-visible")) return;

  const unanswered = getStats().pendentes;
  if (!unanswered) {
    hideAnswersError();
    return;
  }

  showAnswersError(unanswered);
}

function showAnswersError(count) {
  const alert = document.getElementById("answersError");
  if (!alert) return;
  alert.querySelector("span").textContent = `Responda ${count} ${count === 1 ? "meta" : "metas"} antes de revisar o envio.`;
  alert.classList.add("is-visible");
}

function hideAnswersError() {
  document.getElementById("answersError")?.classList.remove("is-visible");
}

function validateIdentification() {
  const requiredFields = ["nome", "cargo", "setor", "dataPreenchimento", "eixo"];
  let isValid = true;

  requiredFields.forEach((fieldId) => {
    const field = document.getElementById(fieldId);
    const wrapper = field.closest(".field");
    const error = wrapper.querySelector(".field-error");
    const empty = !field.value.trim();

    wrapper.classList.toggle("is-invalid", empty);
    error.textContent = empty ? "Campo obrigatório." : "";
    if (empty) isValid = false;
  });

  if (!isValid) {
    document.querySelector(".field.is-invalid")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  return isValid;
}

function clearInvalid(field) {
  const wrapper = field.closest(".field");
  if (!wrapper) return;
  wrapper.classList.remove("is-invalid");
  const error = wrapper.querySelector(".field-error");
  if (error) error.textContent = "";
}

function renderReview() {
  const stats = getStats();
  const summary = document.getElementById("reviewSummary");
  if (!summary) return;

  summary.innerHTML = [
    reviewCard("Responsável", state.identificacao.nome || "Não informado"),
    reviewCard("Setor/Unidade", state.identificacao.setor || "Não informado"),
    reviewCard("Metas executadas", stats.sim),
    reviewCard("Metas não executadas", stats.nao),
    reviewCard("Percentual de execução", `${stats.percentualExecucao}%`),
    reviewCard("Total de metas", stats.total)
  ].join("");

  renderReviewList("executedList", "sim");
  renderReviewList("notExecutedList", "nao");
}

function reviewCard(label, value) {
  return `
    <article class="review-card">
      <small>${escapeHTML(label)}</small>
      <strong>${escapeHTML(String(value))}</strong>
    </article>
  `;
}

function renderReviewList(listId, status) {
  const node = document.getElementById(listId);
  if (!node) return;

  const items = getActiveMetas().filter((item) => ensureMetaState(item.id).resposta === status);
  node.innerHTML = items.length
    ? items.map((item) => `<li>${escapeHTML(item.texto)}</li>`).join("")
    : `<li class="empty-state">Nenhuma meta nesta situação.</li>`;
}

function buildPayload() {
  const stats = getStats();

  return {
    origem: "Monitoramento das Metas do Plano Municipal de Assistência Social 2026-2029",
    enviadoEm: new Date().toISOString(),
    identificacao: {
      nome: state.identificacao.nome,
      cargo: state.identificacao.cargo,
      setor: state.identificacao.setor,
      dataPreenchimento: state.identificacao.dataPreenchimento,
      telefone: state.identificacao.telefone,
      email: state.identificacao.email,
      eixo: state.identificacao.eixo
    },
    totais: stats,
    metas: getActiveMetas().map((item) => {
      const saved = ensureMetaState(item.id);
      return {
        id: item.id,
        categoria: item.categoryTitle,
        eixoOriginal: item.eixoOriginal,
        texto: item.texto,
        resposta: saved.resposta
      };
    })
  };
}

async function enviarFormulario() {
  if (!validateIdentification()) {
    setActiveStep(1);
    return;
  }

  if (!validateAllMetas()) {
    setActiveStep(2);
    return;
  }

  const button = document.getElementById("submitButton");
  const payload = buildPayload();
  button.disabled = true;
  button.innerHTML = `Enviando... <i data-lucide="loader-circle"></i>`;
  refreshIcons();

  console.log("Dados preenchidos para envio:", payload);

  try {
    if (APPS_SCRIPT_WEB_APP_URL.trim()) {
      await fetch(APPS_SCRIPT_WEB_APP_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify(payload)
      });
    }

    openSuccessModal();
    resetFormAfterSuccessfulSubmit();
  } catch (error) {
    console.error("Falha ao enviar o formulário.", error);
    alert("Não foi possível enviar agora. Os dados continuam salvos como rascunho neste navegador.");
  } finally {
    button.disabled = false;
    button.innerHTML = `Enviar monitoramento <i data-lucide="send"></i>`;
    refreshIcons();
  }
}

function resetFormAfterSuccessfulSubmit() {
  localStorage.removeItem(STORAGE_KEY);
  state = structuredCloneSafe(initialState);
  hydrateDate();

  document.querySelectorAll("[data-field]").forEach((field) => {
    field.value = state.identificacao[field.dataset.field] || "";
  });

  renderCategories();
  renderAll();
  refreshIcons();
}

function toggleAllCategories(open) {
  document.querySelectorAll(".category-card").forEach((card) => {
    card.classList.toggle("is-open", open);
    card.querySelector("[data-category-trigger]")?.setAttribute("aria-expanded", String(open));
  });
}

function clearLocalDraft() {
  const confirmed = window.confirm("Deseja limpar o rascunho salvo neste navegador?");
  if (!confirmed) return;

  localStorage.removeItem(STORAGE_KEY);
  state = structuredCloneSafe(initialState);
  hydrateDate();
  document.querySelectorAll("[data-field]").forEach((field) => {
    field.value = state.identificacao[field.dataset.field] || "";
  });
  renderCategories();
  renderAll();
  refreshIcons();
}

function showAutosaveToast() {
  const toast = document.getElementById("autosaveToast");
  toast.classList.add("is-visible");
  window.setTimeout(() => toast.classList.remove("is-visible"), 1500);
}

function openSuccessModal() {
  const modal = document.getElementById("successModal");
  const integrated = Boolean(APPS_SCRIPT_WEB_APP_URL.trim());
  setText("successTitle", integrated ? "Monitoramento enviado" : "Monitoramento preparado");
  setText(
    "successMessage",
    integrated
      ? "A resposta foi encaminhada para a aba correspondente ao eixo selecionado."
      : "O envio foi simulado. Configure a URL do Apps Script no arquivo script.js para registrar os dados na planilha."
  );
  modal.classList.add("is-visible");
  modal.setAttribute("aria-hidden", "false");
}

function showTutorialOnce() {
  if (state.tutorialShown) return;
  state.tutorialShown = true;
  saveState(false);
  const modal = document.getElementById("tutorialModal");
  modal.classList.add("is-visible");
  modal.setAttribute("aria-hidden", "false");
}

function closeTutorialModal() {
  const modal = document.getElementById("tutorialModal");
  modal.classList.remove("is-visible");
  modal.setAttribute("aria-hidden", "true");
}

function closeSuccessModal() {
  const modal = document.getElementById("successModal");
  modal.classList.remove("is-visible");
  modal.setAttribute("aria-hidden", "true");
}

function statusLabel(status) {
  const labels = {
    sim: "Executada",
    nao: "Não executada",
    pendente: "Obrigatória",
    "": "Obrigatória"
  };

  return labels[status] || "Obrigatória";
}

function statusClass(status) {
  if (status === "sim") return "is-yes";
  if (status === "nao") return "is-no";
  return "";
}

function setText(id, value) {
  const node = document.getElementById(id);
  if (node) node.textContent = value;
}

function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function refreshIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

window.enviarFormulario = enviarFormulario;
