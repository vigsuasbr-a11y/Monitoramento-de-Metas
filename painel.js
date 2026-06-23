const APPS_SCRIPT_WEB_APP_URL = window.PMAS_CONFIG?.appsScriptUrl || "https://script.google.com/macros/s/AKfycbzfo9c1kZ-Ht8z-6ucX3G_rwrhvz_2SPSNCWUNaUACvC9p9kPYCAwUL5FxkG9recuu0eg/exec";
const SESSION_KEY = "pmas-vigilancia-session";
const PAGE_SIZE = 10;

const dashboardState = {
  credentials: null,
  submissions: [],
  filtered: [],
  axes: [],
  page: 1
};

document.addEventListener("DOMContentLoaded", () => {
  bindDashboardEvents();
  restoreSession();
  refreshIcons();
});

function bindDashboardEvents() {
  document.getElementById("loginForm").addEventListener("submit", handleLogin);
  document.getElementById("passwordToggle").addEventListener("click", togglePassword);
  document.getElementById("logoutButton").addEventListener("click", logout);
  document.getElementById("refreshButton").addEventListener("click", refreshDashboard);
  document.getElementById("clearFiltersButton").addEventListener("click", clearFilters);
  document.getElementById("exportButton").addEventListener("click", exportCsv);
  document.getElementById("closeDetailButton").addEventListener("click", closeDetails);
  document.getElementById("previousPage").addEventListener("click", () => changePage(-1));
  document.getElementById("nextPage").addEventListener("click", () => changePage(1));

  ["searchFilter", "axisFilter", "dateFromFilter", "dateToFilter"].forEach((id) => {
    document.getElementById(id).addEventListener(id === "searchFilter" ? "input" : "change", applyFilters);
  });

  document.getElementById("responsesTableBody").addEventListener("click", (event) => {
    const button = event.target.closest("[data-view-id]");
    if (button) openDetails(button.dataset.viewId);
  });

  document.getElementById("axisNavigation").addEventListener("click", (event) => {
    const button = event.target.closest("[data-axis-filter]");
    if (!button) return;
    document.getElementById("axisFilter").value = button.dataset.axisFilter;
    applyFilters();
  });

  document.getElementById("detailModal").addEventListener("click", (event) => {
    if (event.target.id === "detailModal") closeDetails();
  });
}

async function handleLogin(event) {
  event.preventDefault();
  const credentials = {
    sistema: document.getElementById("loginSystem").value,
    senha: document.getElementById("loginPassword").value
  };

  const button = document.getElementById("loginButton");
  setLoginError("");
  setButtonLoading(button, true, "Validando...");

  try {
    const data = await requestDashboard(credentials);
    dashboardState.credentials = credentials;
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(credentials));
    enterDashboard(data);
  } catch (error) {
    setLoginError(error.message);
  } finally {
    setButtonLoading(button, false, "Entrar");
  }
}

async function requestDashboard(credentials) {
  if (!APPS_SCRIPT_WEB_APP_URL.trim()) {
    throw new Error("Configure a URL do Apps Script no arquivo config.js.");
  }

  const url = new URL(APPS_SCRIPT_WEB_APP_URL);
  url.searchParams.set("acao", "painel");
  url.searchParams.set("sistema", credentials.sistema);
  url.searchParams.set("senha", credentials.senha);
  url.searchParams.set("_", Date.now());

  const response = await fetch(url.toString(), { method: "GET", cache: "no-store" });
  if (!response.ok) throw new Error("Não foi possível consultar a planilha.");

  const data = await response.json();
  if (!data.ok) throw new Error(data.mensagem || "Acesso não autorizado.");
  if (data.autenticado !== true) throw new Error("Atualize a implantação do Apps Script para habilitar o painel.");
  return data;
}

function enterDashboard(data) {
  dashboardState.submissions = Array.isArray(data.envios) ? data.envios : [];
  dashboardState.axes = Array.isArray(data.eixos) ? data.eixos : [];
  dashboardState.page = 1;
  document.getElementById("loginView").hidden = true;
  document.getElementById("dashboardApp").hidden = false;
  document.getElementById("lastUpdate").textContent = `Atualizado em ${formatDateTime(data.atualizadoEm)}`;
  populateAxes();
  setLoading(false);
  applyFilters();
  refreshIcons();
}

async function refreshDashboard() {
  if (!dashboardState.credentials) return;
  const button = document.getElementById("refreshButton");
  button.disabled = true;
  setLoading(true);

  try {
    const data = await requestDashboard(dashboardState.credentials);
    enterDashboard(data);
  } catch (error) {
    setLoading(false);
    window.alert(error.message);
  } finally {
    button.disabled = false;
  }
}

function restoreSession() {
  try {
    const credentials = JSON.parse(sessionStorage.getItem(SESSION_KEY));
    if (!credentials?.sistema || !credentials?.senha || !APPS_SCRIPT_WEB_APP_URL.trim()) return;
    dashboardState.credentials = credentials;
    document.getElementById("loginSystem").value = credentials.sistema;
    document.getElementById("loginPassword").value = credentials.senha;
    handleLogin(new Event("submit"));
  } catch (error) {
    sessionStorage.removeItem(SESSION_KEY);
  }
}

function logout() {
  sessionStorage.removeItem(SESSION_KEY);
  dashboardState.credentials = null;
  dashboardState.submissions = [];
  dashboardState.filtered = [];
  document.getElementById("dashboardApp").hidden = true;
  document.getElementById("loginView").hidden = false;
  document.getElementById("loginPassword").value = "";
  setLoginError("");
}

function populateAxes() {
  const select = document.getElementById("axisFilter");
  const current = select.value;
  select.innerHTML = `<option value="">Todos os eixos</option>${dashboardState.axes
    .map((axis) => `<option value="${escapeHTML(axis)}">${escapeHTML(axis)}</option>`)
    .join("")}`;
  select.value = dashboardState.axes.includes(current) ? current : "";

  document.getElementById("axisNavigation").innerHTML = dashboardState.axes
    .map((axis) => `
      <button type="button" class="nav-item" data-axis-filter="${escapeHTML(axis)}" title="${escapeHTML(axis)}">
        <i data-lucide="chevron-right"></i>
        <span>${escapeHTML(shortAxis(axis))}</span>
      </button>
    `)
    .join("");
}

function applyFilters() {
  const search = normalizeText(document.getElementById("searchFilter").value);
  const axis = document.getElementById("axisFilter").value;
  const dateFrom = document.getElementById("dateFromFilter").value;
  const dateTo = document.getElementById("dateToFilter").value;

  dashboardState.filtered = dashboardState.submissions.filter((submission) => {
    const haystack = normalizeText([submission.nome, submission.cargo, submission.setor, submission.email, submission.eixo].join(" "));
    const submissionDate = String(submission.recebidoEm || submission.dataPreenchimento || "").slice(0, 10);
    return (!search || haystack.includes(search))
      && (!axis || submission.eixo === axis)
      && (!dateFrom || submissionDate >= dateFrom)
      && (!dateTo || submissionDate <= dateTo);
  });

  dashboardState.page = 1;
  renderDashboard();
}

function renderDashboard() {
  renderMetrics();
  renderTable();
  renderNavigationState();
  document.getElementById("resultCount").textContent = `${dashboardState.filtered.length} ${dashboardState.filtered.length === 1 ? "registro encontrado" : "registros encontrados"}`;
  refreshIcons();
}

function renderMetrics() {
  const totalYes = dashboardState.filtered.reduce((sum, item) => sum + Number(item.sim || 0), 0);
  const totalNo = dashboardState.filtered.reduce((sum, item) => sum + Number(item.nao || 0), 0);
  const rate = totalYes + totalNo ? Math.round((totalYes / (totalYes + totalNo)) * 100) : 0;
  setText("metricSubmissions", dashboardState.filtered.length);
  setText("metricYes", totalYes);
  setText("metricNo", totalNo);
  setText("metricRate", rate);
}

function renderTable() {
  const totalPages = Math.max(1, Math.ceil(dashboardState.filtered.length / PAGE_SIZE));
  if (dashboardState.page > totalPages) dashboardState.page = totalPages;
  const start = (dashboardState.page - 1) * PAGE_SIZE;
  const pageItems = dashboardState.filtered.slice(start, start + PAGE_SIZE);
  const tbody = document.getElementById("responsesTableBody");

  tbody.innerHTML = pageItems.map((item) => `
    <tr>
      <td>${escapeHTML(formatDateTime(item.recebidoEm))}</td>
      <td class="person-cell"><strong>${escapeHTML(item.nome || "Não informado")}</strong><small>${escapeHTML(item.cargo || "")}</small></td>
      <td>${escapeHTML(item.setor || "Não informado")}</td>
      <td><span class="axis-badge">${escapeHTML(item.eixo || "")}</span></td>
      <td class="number-yes">${Number(item.sim || 0)}</td>
      <td class="number-no">${Number(item.nao || 0)}</td>
      <td class="rate-cell">
        <div class="rate-value"><span>Execução</span><strong>${Number(item.percentualExecucao || 0)}%</strong></div>
        <div class="rate-track"><span style="width:${clampPercent(item.percentualExecucao)}%"></span></div>
      </td>
      <td><button type="button" class="icon-button view-button" data-view-id="${escapeHTML(item.id)}" title="Ver detalhes" aria-label="Ver detalhes"><i data-lucide="eye"></i></button></td>
    </tr>
  `).join("");

  const hasResults = pageItems.length > 0;
  document.getElementById("tableWrap").hidden = !hasResults;
  document.getElementById("emptyState").hidden = hasResults;
  document.getElementById("pagination").hidden = !hasResults;
  setText("pageInfo", `Página ${dashboardState.page} de ${totalPages}`);
  document.getElementById("previousPage").disabled = dashboardState.page <= 1;
  document.getElementById("nextPage").disabled = dashboardState.page >= totalPages;
}

function renderNavigationState() {
  const selectedAxis = document.getElementById("axisFilter").value;
  document.querySelectorAll("[data-axis-filter]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.axisFilter === selectedAxis);
  });
}

function openDetails(id) {
  const submission = dashboardState.submissions.find((item) => item.id === id);
  if (!submission) return;
  const yes = (submission.metas || []).filter((meta) => normalizeText(meta.resposta) === "sim");
  const no = (submission.metas || []).filter((meta) => normalizeText(meta.resposta) === "nao");

  setText("detailTitle", submission.nome || "Resposta");
  document.getElementById("detailContent").innerHTML = `
    <div class="detail-summary">
      ${detailItem("Responsável", submission.nome)}
      ${detailItem("Cargo", submission.cargo)}
      ${detailItem("Setor/Unidade", submission.setor)}
      ${detailItem("Eixo", submission.eixo)}
      ${detailItem("Data de preenchimento", formatDate(submission.dataPreenchimento))}
      ${detailItem("Recebido em", formatDateTime(submission.recebidoEm))}
      ${detailItem("Telefone", submission.telefone)}
      ${detailItem("E-mail", submission.email)}
      ${detailItem("Metas executadas", submission.sim)}
      ${detailItem("Percentual de execução", `${Number(submission.percentualExecucao || 0)}%`)}
    </div>
    <div class="detail-lists">
      ${detailList("Metas executadas", yes, "is-yes", "check-circle-2")}
      ${detailList("Metas não executadas", no, "is-no", "x-circle")}
    </div>
  `;

  const modal = document.getElementById("detailModal");
  modal.classList.add("is-visible");
  modal.setAttribute("aria-hidden", "false");
  refreshIcons();
}

function closeDetails() {
  const modal = document.getElementById("detailModal");
  modal.classList.remove("is-visible");
  modal.setAttribute("aria-hidden", "true");
}

function detailItem(label, value) {
  return `<div class="detail-item"><small>${escapeHTML(label)}</small><strong>${escapeHTML(value || "Não informado")}</strong></div>`;
}

function detailList(title, items, className, icon) {
  const content = items.length
    ? items.map((item) => `<li><strong>${escapeHTML(item.codigo || "")}</strong> ${escapeHTML(item.texto || "")}</li>`).join("")
    : `<li>Nenhuma meta nesta situação.</li>`;
  return `<section class="detail-list ${className}"><h3><i data-lucide="${icon}"></i>${escapeHTML(title)} (${items.length})</h3><ul>${content}</ul></section>`;
}

function clearFilters() {
  document.getElementById("searchFilter").value = "";
  document.getElementById("axisFilter").value = "";
  document.getElementById("dateFromFilter").value = "";
  document.getElementById("dateToFilter").value = "";
  applyFilters();
}

function changePage(direction) {
  const totalPages = Math.max(1, Math.ceil(dashboardState.filtered.length / PAGE_SIZE));
  dashboardState.page = Math.min(Math.max(dashboardState.page + direction, 1), totalPages);
  renderTable();
  refreshIcons();
}

function exportCsv() {
  if (!dashboardState.filtered.length) return;
  const rows = [
    ["Recebido em", "Responsável", "Cargo", "Setor/Unidade", "Eixo", "Total", "Sim", "Não", "% de execução"],
    ...dashboardState.filtered.map((item) => [item.recebidoEm, item.nome, item.cargo, item.setor, item.eixo, item.total, item.sim, item.nao, item.percentualExecucao])
  ];
  const csv = rows.map((row) => row.map(csvCell).join(";")).join("\r\n");
  const blob = new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `monitoramento-pmas-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

function csvCell(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function togglePassword() {
  const input = document.getElementById("loginPassword");
  const button = document.getElementById("passwordToggle");
  const showing = input.type === "text";
  input.type = showing ? "password" : "text";
  button.title = showing ? "Mostrar senha" : "Ocultar senha";
  button.setAttribute("aria-label", button.title);
  button.innerHTML = `<i data-lucide="${showing ? "eye" : "eye-off"}"></i>`;
  refreshIcons();
}

function setLoading(loading) {
  document.getElementById("loadingState").hidden = !loading;
  if (loading) {
    document.getElementById("tableWrap").hidden = true;
    document.getElementById("emptyState").hidden = true;
    document.getElementById("pagination").hidden = true;
  }
}

function setButtonLoading(button, loading, label) {
  button.disabled = loading;
  button.innerHTML = `${escapeHTML(label)} <i data-lucide="${loading ? "loader-circle" : "arrow-right"}"></i>`;
  refreshIcons();
}

function setLoginError(message) {
  setText("loginError", message);
}

function setText(id, value) {
  const node = document.getElementById(id);
  if (node) node.textContent = value;
}

function normalizeText(value) {
  return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function shortAxis(axis) {
  const names = {
    "PROTEÇÃO SOCIAL BÁSICA (PSB)": "Proteção Social Básica",
    "PROTEÇÃO SOCIAL ESPECIAL (PSE)": "Proteção Social Especial",
    "CONSELHO MUNICIPAL DE ASSISTÊNCIA SOCIAL (CMAS)": "CMAS",
    "CONSELHO MUNICIPAL DE SEGURANÇA ALIMENTAR E NUTRICIONAL (COMSEA)": "COMSEA"
  };
  return names[axis] || axis;
}

function formatDateTime(value) {
  if (!value) return "Não informado";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(date);
}

function formatDate(value) {
  if (!value) return "Não informado";
  const date = new Date(String(value).length === 10 ? `${value}T12:00:00` : value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(date);
}

function clampPercent(value) {
  return Math.min(Math.max(Number(value) || 0, 0), 100);
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
  if (window.lucide) window.lucide.createIcons();
}
