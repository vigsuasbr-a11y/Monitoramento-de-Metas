(() => {
  "use strict";

  const STORAGE_KEY = "pmas-institutional-onboarding-v1";
  const slides = [
    {
      label: "Boas-vindas",
      title: "O FUTURO DA ASSISTÊNCIA SOCIAL COMEÇA COM PLANEJAMENTO.",
      paragraphs: [
        "Bem-vindo ao Monitoramento das Metas do Plano Municipal de Assistência Social de Belford Roxo — 2026–2029.",
        "Um instrumento de acompanhamento, avaliação e fortalecimento da política pública de assistência social."
      ],
      visual: `<div class="ob-plan" aria-hidden="true">
        <div class="ob-orbit ob-orbit-one"></div><div class="ob-orbit ob-orbit-two"></div>
        <div class="ob-orbit-particle ob-orbit-particle-one"></div><div class="ob-orbit-particle ob-orbit-particle-two"></div>
        <svg class="ob-plan-lines" viewBox="0 0 440 400" fill="none"><path d="M40 310H400M40 230H400M40 150H400" stroke="currentColor" opacity=".12"/><path class="ob-draw" d="M60 295L145 245L225 258L305 160L385 105" stroke="#E5B649" stroke-width="3"/><circle cx="145" cy="245" r="5" fill="#E5B649"/><circle cx="305" cy="160" r="5" fill="#E5B649"/></svg>
        <div class="ob-seal-stage"><div class="ob-seal-tilt"><div class="ob-seal"><span>PLANO MUNICIPAL DE</span><span>ASSISTÊNCIA SOCIAL</span><strong>PMAS</strong><b>2026–2029</b><i></i><small>Planejar. Acompanhar. Fortalecer.</small></div></div></div>
        <div class="ob-orbit-icon ob-orbit-icon-top"><svg viewBox="0 0 32 32"><path d="M10 5H6v23h20V5h-4M12 3h8v5h-8zM11 14h10M11 19h10M11 24h6"/></svg></div>
        <div class="ob-orbit-icon ob-orbit-icon-right"><svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="12"/><circle cx="16" cy="16" r="7"/><path d="m16 16 10-10M22 5h5v5"/></svg></div>
        <div class="ob-floating ob-floating-top"><svg viewBox="0 0 24 24"><path d="m5 19 14-14M6 5h13v13"/></svg><span>Planejamento</span></div>
        <div class="ob-floating ob-floating-bottom"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/></svg><span>Compromisso coletivo</span></div>
      </div>`
    },
    {
      label: "Por que monitorar?",
      title: "MONITORAR É COMPREENDER, AVALIAR E AVANÇAR.",
      paragraphs: [
        "O acompanhamento contínuo das metas permite reconhecer os resultados alcançados, identificar desafios e aprimorar as ações socioassistenciais.",
        "Mais do que registrar informações, monitorar significa produzir conhecimento para orientar decisões e fortalecer a gestão."
      ],
      visual: `<div class="ob-concepts">
        <div class="ob-concept"><span class="ob-vector" aria-hidden="true"><svg viewBox="0 0 32 32"><path d="M4 25h24M7 21v-5m9 5V10m9 11V5M6 10l8-5 7 2 6-4"/></svg></span><div><h3>ACOMPANHAR</h3><p>Observar continuamente o desenvolvimento das ações planejadas.</p></div></div>
        <div class="ob-concept"><span class="ob-vector" aria-hidden="true"><svg viewBox="0 0 32 32"><circle cx="14" cy="14" r="9"/><path d="m21 21 7 7M10 14l3 3 5-6"/></svg></span><div><h3>AVALIAR</h3><p>Identificar avanços, desafios e necessidades de aprimoramento.</p></div></div>
        <div class="ob-concept"><span class="ob-vector" aria-hidden="true"><svg viewBox="0 0 32 32"><path d="m5 24 8-8 5 4L28 7M19 7h9v9"/></svg></span><div><h3>APRIMORAR</h3><p>Transformar os resultados do monitoramento em melhorias para a gestão e os serviços.</p></div></div>
      </div>`
    },
    {
      label: "Sua participação faz a diferença",
      title: "CADA INFORMAÇÃO CONTRIBUI PARA UMA GESTÃO MAIS EFICIENTE.",
      paragraphs: [
        "O monitoramento das metas depende da participação responsável dos profissionais e setores envolvidos na execução das ações previstas no Plano Municipal de Assistência Social.",
        "Cada registro contribui para a construção de uma visão mais completa das atividades realizadas, dos desafios identificados e dos resultados alcançados."
      ],
      quote: "SUA PARTICIPAÇÃO TRANSFORMA INFORMAÇÕES EM DECISÕES.",
      visual: `<div class="ob-network" role="img" aria-label="Gestão, unidades, equipes e conselhos conectados ao Monitoramento PMAS, representando integração e cooperação.">
        <svg class="ob-network-links" viewBox="0 0 440 440" aria-hidden="true"><circle class="ob-network-ring" cx="220" cy="220" r="115"/><circle class="ob-network-ring ob-network-ring-outer" cx="220" cy="220" r="155"/><g class="ob-draw" stroke="#E5B649" stroke-opacity=".6" fill="none"><path d="M85 65 220 220 355 65M85 375 220 220 355 375"/></g><g class="ob-flow" stroke="#FFE3A0" stroke-width="3" fill="none"><path d="M85 65 220 220 355 65M85 375 220 220 355 375"/></g></svg>
        <div class="ob-network-core"><span>MONITORAMENTO</span><strong>PMAS</strong><b>2026–2029</b><i></i><small>Construção coletiva</small></div>
        <div class="ob-node ob-node-a"><span class="ob-node-icon" aria-hidden="true"><svg viewBox="0 0 32 32"><circle cx="16" cy="10" r="5"/><path d="M7 27v-4a9 9 0 0 1 18 0v4M5 8a4 4 0 0 0 0 8M2 25v-3a6 6 0 0 1 5-6M27 8a4 4 0 0 1 0 8M30 25v-3a6 6 0 0 0-5-6"/></svg></span><div><strong>Gestão</strong><small>Planejamento e coordenação das ações.</small></div></div>
        <div class="ob-node ob-node-b"><span class="ob-node-icon" aria-hidden="true"><svg viewBox="0 0 32 32"><path d="M6 28V5h15v23M21 12h6v16M3 28h27M10 10h2m4 0h1m-7 5h2m4 0h1M10 20h2m4 0h1M12 28v-4h4v4"/></svg></span><div><strong>Unidades</strong><small>Execução das ações no território.</small></div></div>
        <div class="ob-node ob-node-c"><span class="ob-node-icon" aria-hidden="true"><svg viewBox="0 0 32 32"><circle cx="12" cy="10" r="5"/><path d="M3 28v-4a9 9 0 0 1 18 0v4M23 5a5 5 0 0 1 0 10M25 18a8 8 0 0 1 5 7v3"/></svg></span><div><strong>Equipes</strong><small>Registros qualificados e acompanhamento contínuo.</small></div></div>
        <div class="ob-node ob-node-d"><span class="ob-node-icon" aria-hidden="true"><svg viewBox="0 0 32 32"><path d="M4 28h24M7 24V14h5v10m3 0V8h5v16m3 0V4h5v20"/></svg></span><div><strong>Conselhos</strong><small>Controle social e fortalecimento das políticas públicas.</small></div></div>
      </div>`
    },
    {
      label: "Vamos começar?",
      title: "VAMOS TRANSFORMAR INFORMAÇÕES EM RESULTADOS?",
      paragraphs: [
        "Agora é o momento de contribuir para o acompanhamento das metas do PMAS 2026–2029.",
        "Preencha as informações solicitadas com atenção e registre a situação real de cada meta, considerando as ações desenvolvidas pelo setor ou unidade responsável."
      ],
      quote: "O MONITORAMENTO COMEÇA COM A SUA CONTRIBUIÇÃO.",
      visual: `<ol class="ob-checklist">
        <li><span class="ob-guide-icon" aria-hidden="true"><svg viewBox="0 0 32 32"><circle cx="16" cy="10" r="6"/><path d="M4 29v-3a12 12 0 0 1 24 0v3z"/></svg></span><span class="ob-guide-check" aria-hidden="true">✓</span><div><small>IDENTIFICAÇÃO</small><h3>Identifique o responsável pelo preenchimento.</h3></div></li>
        <li><span class="ob-guide-icon" aria-hidden="true"><svg viewBox="0 0 32 32"><path d="M7 3h13l6 6v20H7zM19 3v7h7M11 15h11M11 20h11M11 25h7"/></svg></span><span class="ob-guide-check" aria-hidden="true">✓</span><div><small>METAS EXECUTADAS</small><h3>Informe a situação de execução das metas.</h3></div></li>
        <li><span class="ob-guide-icon" aria-hidden="true"><svg viewBox="0 0 32 32"><circle cx="14" cy="14" r="9"/><path d="m21 21 8 8M10 14l3 3 5-6"/></svg></span><span class="ob-guide-check" aria-hidden="true">✓</span><div><small>REVISÃO E ENVIO</small><h3>Revise as informações antes de concluir.</h3></div></li>
      </ol>`
    }
  ];

  function initialize() {
    const aboutButton = document.getElementById("pmasAboutButton");
    if (!aboutButton || typeof HTMLDialogElement === "undefined") return;
    const dialog = document.createElement("dialog");
    dialog.className = "pmas-onboarding";
    dialog.setAttribute("aria-labelledby", "obTitle");
    dialog.innerHTML = `
      <div class="ob-photo" aria-hidden="true"></div>
      <div class="ob-light ob-light-one" aria-hidden="true"></div><div class="ob-light ob-light-two" aria-hidden="true"></div>
      <div class="ob-scenery" aria-hidden="true"><i></i><i></i><i></i></div>
      <svg class="ob-landscape-lines" viewBox="0 0 1440 300" preserveAspectRatio="none" aria-hidden="true"><path d="M-100 140C180 30 340 290 720 155S1210 45 1540 130"/><path d="M-100 175C180 65 340 325 720 190S1210 80 1540 165"/><path d="M-100 195C260 330 390 10 790 170S1280 295 1540 65"/></svg>
      <div class="ob-shell">
        <header class="ob-header"><div class="ob-institution"><img class="ob-prefeitura-logo" src="assets/prefeitura-logo-branca.png" width="1837" height="856" alt="Prefeitura de Belford Roxo"><div><strong>PREFEITURA MUNICIPAL DE BELFORD ROXO</strong><span>SECRETARIA MUNICIPAL DE ASSISTÊNCIA SOCIAL E CIDADANIA</span></div></div><div class="ob-header-actions"><p>Conheça o monitoramento</p><button type="button" class="ob-skip">Ir direto ao formulário <span aria-hidden="true">→</span></button></div></header>
        <main class="ob-content"><div class="ob-composition"><section class="ob-copy"><p class="ob-eyebrow"></p><h2 id="obTitle" tabindex="-1"></h2><div class="ob-paragraphs"></div><p class="ob-quote"></p></section><section class="ob-visual" aria-label="Planejamento e monitoramento"></section></div></main>
        <footer class="ob-footer"><div class="ob-stage"><p class="ob-count" role="status" aria-live="polite" aria-atomic="true"></p><div class="ob-progress" role="progressbar" aria-label="Progresso da introdução ao monitoramento" aria-valuemin="0" aria-valuemax="4"><span></span></div><div class="ob-dots" aria-hidden="true"><i></i><i></i><i></i><i></i></div></div><nav class="ob-navigation" aria-label="Navegação da introdução ao monitoramento"><button type="button" class="ob-back">← Voltar</button><button type="button" class="ob-next"></button></nav></footer>
        <p class="ob-bottomline">PMAS 2026–2029 <span>Planejamento a serviço das pessoas.</span></p>
      </div>`;
    document.body.append(dialog);
    const find = (selector) => dialog.querySelector(selector);
    const content = find(".ob-content");
    const composition = find(".ob-composition");
    const next = find(".ob-next");
    const back = find(".ob-back");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let current = 0;
    let busy = false;
    let returnFocus = null;
    let scrollPosition = 0;
    let transitionTimer = null;
    let unlockTimer = null;
    let fitFrame = null;

    function fitComposition() {
      if (!dialog.open) return;
      // A área visível muda com as barras do Safari e com a orientação do celular.
      const viewport = window.visualViewport;
      dialog.style.setProperty("--ob-viewport-height", `${viewport?.height || window.innerHeight}px`);
      dialog.style.setProperty("--ob-viewport-top", `${viewport?.offsetTop || 0}px`);
      if (!content.clientHeight || !composition.offsetHeight) return;
      const fit = Math.min(1, (content.clientHeight - 4) / composition.offsetHeight);
      composition.style.setProperty("--ob-fit", String(Math.max(.1, fit)));
    }

    function scheduleFit() {
      window.cancelAnimationFrame(fitFrame);
      fitFrame = window.requestAnimationFrame(fitComposition);
    }

    if (typeof ResizeObserver !== "undefined") {
      const fitObserver = new ResizeObserver(scheduleFit);
      fitObserver.observe(content);
      fitObserver.observe(composition);
    }
    window.addEventListener("resize", scheduleFit);
    window.visualViewport?.addEventListener("resize", scheduleFit);
    window.visualViewport?.addEventListener("scroll", scheduleFit);
    document.fonts?.ready.then(scheduleFit);

    function render(focus = false) {
      const slide = slides[current];
      dialog.classList.toggle("ob-first-screen", current === 0);
      dialog.dataset.obStep = String(current + 1);
      find(".ob-eyebrow").textContent = `PMAS 2026–2029 / ${slide.label}`;
      const title = find("#obTitle");
      title.textContent = slide.title;
      if (current === 0) {
        title.innerHTML = '<span class="ob-title-line">O FUTURO DA <em>ASSISTÊNCIA</em> </span><span class="ob-title-line"><em>SOCIAL</em> COMEÇA </span><span class="ob-title-line">COM PLANEJAMENTO.</span>';
      } else if (current === 1) {
        title.innerHTML = 'MONITORAR É <em>COMPREENDER,</em> AVALIAR E AVANÇAR.';
      } else if (current === 2) {
        title.innerHTML = 'CADA INFORMAÇÃO CONTRIBUI PARA UMA <em>GESTÃO MAIS EFICIENTE.</em>';
      } else {
        title.innerHTML = 'VAMOS TRANSFORMAR <em>INFORMAÇÕES</em> EM RESULTADOS?';
      }
      find(".ob-paragraphs").replaceChildren(...slide.paragraphs.map((text) => {
        const paragraph = document.createElement("p");
        paragraph.textContent = text;
        return paragraph;
      }));
      find(".ob-quote").textContent = slide.quote || "";
      find(".ob-visual").innerHTML = slide.visual;
      find(".ob-visual").setAttribute("aria-label", slide.label);
      find(".ob-count").textContent = `0${current + 1} / 04 · ${slide.label}`;
      find(".ob-progress").setAttribute("aria-valuenow", String(current + 1));
      find(".ob-progress").setAttribute("aria-valuetext", `Tela ${current + 1} de 4`);
      find(".ob-progress span").style.width = `${(current + 1) * 25}%`;
      find(".ob-dots").querySelectorAll("i").forEach((dot, index) => {
        dot.classList.toggle("is-current", index === current);
        dot.classList.toggle("is-visited", index < current);
      });
      back.disabled = current === 0 || busy;
      back.classList.toggle("ob-back-hidden", current === 0);
      next.disabled = busy;
      const label = current === 3 ? "Preencher metas" : current === 0 ? "Iniciar monitoramento" : "Continuar";
      next.innerHTML = `<span>${label}</span><span class="ob-button-arrow" aria-hidden="true">→</span>`;
      dialog.scrollTop = 0;
      content.scrollTop = 0;
      fitComposition();
      if (focus) find("#obTitle").focus({ preventScroll: true });
    }

    function move(direction) {
      if (busy || current + direction < 0 || current + direction >= slides.length) return;
      busy = true;
      next.disabled = true;
      back.disabled = true;
      dialog.classList.remove("ob-opening");
      content.classList.toggle("ob-moving-back", direction < 0);
      content.classList.add("ob-changing");
      transitionTimer = window.setTimeout(() => {
        current += direction;
        render(true);
        content.classList.remove("ob-changing");
        content.classList.remove("ob-entering");
        void content.offsetWidth;
        content.classList.add("ob-entering");
        unlockTimer = window.setTimeout(() => {
          busy = false;
          next.disabled = false;
          back.disabled = current === 0;
        }, reduceMotion.matches ? 0 : 500);
      }, reduceMotion.matches ? 0 : 250);
    }

    function dismiss(reason) {
      if (dialog.classList.contains("ob-closing")) return;
      busy = true;
      window.clearTimeout(transitionTimer);
      window.clearTimeout(unlockTimer);
      dialog.classList.remove("ob-opening");
      content.classList.remove("ob-changing");
      try { localStorage.setItem(STORAGE_KEY, reason); } catch { /* O formulário permanece acessível sem armazenamento. */ }
      dialog.classList.add("ob-closing");
      window.setTimeout(() => {
        dialog.close();
        dialog.classList.remove("ob-closing");
        document.documentElement.classList.remove("pmas-onboarding-open");
        if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
        window.scrollTo({ top: scrollPosition, behavior: "instant" });
        busy = false;
      }, reduceMotion.matches ? 0 : 600);
    }

    function open(replay = false) {
      if (dialog.open || busy) return;
      returnFocus = replay ? document.activeElement : document.querySelector('[data-field="nome"]');
      scrollPosition = window.scrollY;
      current = 0;
      render();
      content.classList.remove("ob-moving-back");
      content.classList.add("ob-entering");
      dialog.classList.add("ob-opening");
      window.scrollTo({ top: 0, behavior: "instant" });
      dialog.showModal();
      dialog.scrollTop = 0;
      fitComposition();
      document.documentElement.classList.add("pmas-onboarding-open");
      find("#obTitle").focus({ preventScroll: true });
    }

    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const visual = find(".ob-visual");
    function resetTilt() {
      const card = visual.querySelector(".ob-seal-tilt");
      card?.style.removeProperty("--ob-tilt-x");
      card?.style.removeProperty("--ob-tilt-y");
    }
    visual.addEventListener("pointermove", (event) => {
      if (reduceMotion.matches || !finePointer.matches || event.pointerType !== "mouse") return;
      const card = visual.querySelector(".ob-seal-tilt");
      if (!card) return;
      const bounds = card.getBoundingClientRect();
      const x = Math.min(1, Math.max(-1, (event.clientX - bounds.left) / bounds.width * 2 - 1));
      const y = Math.min(1, Math.max(-1, (event.clientY - bounds.top) / bounds.height * 2 - 1));
      card.style.setProperty("--ob-tilt-x", `${(-y * 3).toFixed(2)}deg`);
      card.style.setProperty("--ob-tilt-y", `${(x * 3).toFixed(2)}deg`);
    });
    visual.addEventListener("pointerleave", resetTilt);
    reduceMotion.addEventListener("change", resetTilt);

    next.addEventListener("click", () => current === 3 ? dismiss("completed") : move(1));
    back.addEventListener("click", () => move(-1));
    find(".ob-skip").addEventListener("click", () => dismiss("skipped"));
    dialog.addEventListener("cancel", (event) => { event.preventDefault(); dismiss("skipped"); });
    dialog.addEventListener("keydown", (event) => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      if (event.key === "ArrowRight") { event.preventDefault(); move(1); }
      if (event.key === "ArrowLeft") { event.preventDefault(); move(-1); }
    });
    aboutButton.addEventListener("click", () => open(true));
    let seen = false;
    try { seen = ["completed", "skipped"].includes(localStorage.getItem(STORAGE_KEY)); } catch { /* Exibe a apresentação sem exigir persistência. */ }
    if (!seen) open();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize);
  else initialize();
})();
