/* ui.js — VISUAL UPDATES */
(function () {
  const GS = window.GameState || window.gameState || (window.gameState = {});
  const IS_GAME = window.location.pathname.includes("game.html");
  function el(id) { return document.getElementById(id); }

  const TILE_IMAGES = [
    "assets/tile_aelia.png", "assets/tile_nocta.png",
    "assets/tile_vyra.png",  "assets/tile_iona.png"
  ];
  const HAZARD_IMAGES = {
    frozen: "assets/tile_deceit.png", poison: "assets/tile_plague.png",
    junk:   "assets/tile_greed.png",  lava:   "assets/tile_war.png"
  };

  if (IS_GAME) {
    window.renderBoard = renderBoard;
    window.UI = window.UI || {};
    window.UI.renderBoard = renderBoard;
    window.UI.updateChibiUI = updateChibiUI;
    window.UI.updateDiscipleBadge = updateDiscipleBadge;
    window.UI.updateStats = updateStats;
    window.UI.updateAbilityUI = updateAbilityUI;
    window.UI.updateEnergyUI = updateEnergyUI;
    window.UI.flashAlert = flashAlert;
    window.UI.updatePrismaUI = updatePrismaUI;

    document.addEventListener("DOMContentLoaded", () => {
      setTimeout(() => {
        updateEnergyUI(); updatePrismaUI();
        if(GS.board) renderBoard();
      }, 50);
    });
  } else {
    window.UI = window.UI || {};
    window.UI.updateEnergyUI = function(){}; window.UI.updateStats = function(){};
    window.UI.renderBoard = function(){}; window.renderBoard = function(){};
    return; 
  }

  function renderBoard() {
    const gridEl = el("game-grid");
    if (!GS.board || !gridEl) return;
    const N = GS.GRID_SIZE;
    gridEl.innerHTML = "";

    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        const cell = GS.board[r][c];
        const cellEl = document.createElement("div");
        cellEl.className = "grid-cell tile3D";
        cellEl.id = `cell-${r}-${c}`;
        if (window.Input && window.Input.onCellPointerDown) {
          cellEl.addEventListener("pointerdown", (e) => window.Input.onCellPointerDown(e, r, c), { passive: false });
        }
        const content = document.createElement("div");
        content.className = "glyphContainer";

        if (cell) {
          const img = document.createElement("img");
          img.className = "tileIcon";
          
          if (cell.kind === "frozen") { img.src = HAZARD_IMAGES.frozen; cellEl.classList.add("frozenTile"); }
          else if (cell.kind === "poison") { img.src = HAZARD_IMAGES.poison; cellEl.classList.add("poisonTile"); }
          else if (cell.kind === "junk") { img.src = HAZARD_IMAGES.junk; cellEl.classList.add("junkTile"); }
          else if (cell.kind === "lava") { img.src = HAZARD_IMAGES.lava; cellEl.classList.add("lavaTile"); }
          else if (cell.kind === "glyph") { 
              img.src = TILE_IMAGES[cell.type] || "assets/tile_unknown.png"; 
              // UX FIX: Add type class for CSS coloring
              img.classList.add(`glyph-type-${cell.type}`);
          }
          
          img.onerror = function() { 
            this.style.display='none'; this.parentNode.style.backgroundColor = '#333'; this.parentNode.innerText = '?';
          };
          content.appendChild(img);
        }
        cellEl.appendChild(content);
        gridEl.appendChild(cellEl);
      }
    }
  }

  // ... [Keep updateDiscipleBadge, updateChibiUI, updateStats, updateAbilityUI, updateEnergyUI, updatePrismaUI, flashAlert SAME AS BEFORE] ...
  function updateDiscipleBadge() {
    const badge = el("disciple-badge-live");
    const chibi = el("disciple-chibi-live");
    const d = GS.disciple;
    if (!d) return;
    if (badge) badge.textContent = "Disciple: " + d.name;
    if (chibi) {
      chibi.src = "assets/disciple_" + d.id.toLowerCase() + ".jpg";
      chibi.onerror = function() { 
          this.onerror = null; 
          let fallback = "tile_greed.png"; 
          if(d.attack === "poison") fallback = "tile_plague.png";
          if(d.attack === "drain")  fallback = "tile_war.png";
          if(d.attack === "deceit") fallback = "tile_deceit.png";
          if(d.attack === "greed")  fallback = "tile_greed.png";
          this.src = "assets/" + fallback; 
      };
      chibi.style.display = "block";
    }
  }

  function updateChibiUI() {
    const heroEl = el("hero-chibi-live");
    const d = GS.disciple;
    if (!heroEl || !d) return;
    const HERO_MAP = { GREED: "aelia", PLAGUE: "nocta", WAR: "vyra", DECEIT: "iona" };
    const heroName = HERO_MAP[d.id] || "aelia";
    heroEl.src = "assets/" + heroName + ".png";
    heroEl.onerror = function() { this.onerror = null; this.src = "assets/tile_" + heroName + ".png"; };
    updateDiscipleBadge();
  }

  function updateStats() {
    if (!IS_GAME) return;
    const hpBar = el("disciple-hp-bar");
    const hpLabel = el("disciple-hp-label");
    const movesEl = el("moves-left");
    if (hpBar && GS.discipleHP != null) {
      const pct = Math.max(0, GS.discipleHP / GS.discipleMaxHP);
      hpBar.style.width = (pct * 100) + "%";
    }
    if (hpLabel && GS.discipleHP != null) hpLabel.textContent = GS.discipleHP + " HP";
    if (movesEl) movesEl.textContent = GS.movesLeft;
  }

  function updateAbilityUI() {
    if (!IS_GAME) return;
    const A = [
      { id: "aelia", charge: GS.aeliaCharge, max: 10 },
      { id: "nocta", charge: GS.noctaCharge, max: 12 },
      { id: "vyra",  charge: GS.vyraCharge,  max: 15 },
      { id: "iona",  charge: GS.ionaCharge,  max: 18 }
    ];
    A.forEach((h) => {
      const ring = el(h.id + "-ability-ring");
      const icon = el(h.id + "-ability-icon");
      if (!ring || !icon) return;
      const pct = Math.min(1, h.charge / h.max);
      const deg = pct * 360;
      ring.style.background = `conic-gradient(#38bdf8 ${deg}deg, rgba(255,255,255,0.08) ${deg}deg 360deg)`;
      if (pct >= 1) icon.classList.add("ability-ready");
      else icon.classList.remove("ability-ready");
    });
  }

  function updateEnergyUI() {
    if (!window.economy) return;
    window.economy.regenerateEnergy();
    const cur = window.economy.getEnergy();
    const max = window.economy.maxEnergy;
    const elc = el("energy-count");
    const elr = el("energy-regen-time");
    if (elc) elc.textContent = cur + " / " + max;
    if (cur >= max) {
      if (elr) elr.textContent = "FULL";
      if(window._energyInterval) clearInterval(window._energyInterval);
      return;
    }
    function tick() {
       const econ = window.economy;
       const last = parseInt(localStorage.getItem(econ.LS_KEYS.lastEnergyAt), 10) || Date.now();
       const regenMs = econ.regenMinutes * 60 * 1000;
       const nextAt = last + regenMs;
       const left = nextAt - Date.now();
       if (left <= 0) { econ.regenerateEnergy(); updateEnergyUI(); return; }
       const m = Math.floor(left / 60000);
       const s = Math.floor((left % 60000) / 1000);
       if (elr) elr.textContent = `${m}:${s.toString().padStart(2, '0')}`;
    }
    if(window._energyInterval) clearInterval(window._energyInterval);
    tick();
    window._energyInterval = setInterval(tick, 1000);
  }

  function updatePrismaUI() {
    const p = el("prisma-count");
    const a = el("aurum-count");
    let pv = 0, av = 0;
    if (window.economy) { pv = economy.getPrisma(); av = economy.getAurum(); }
    if (p) p.textContent = pv;
    if (a) a.textContent = av;
  }

  function flashAlert(text, duration = 800) {
    const b = el("alert-banner");
    if (!b) return;
    b.textContent = text;
    b.classList.add("alert-active");
    setTimeout(() => b.classList.remove("alert-active"), duration);
  }
})();