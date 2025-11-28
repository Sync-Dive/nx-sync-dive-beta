/* ui.js — FINAL TIMING SYNC */
(function () {
  const GS = window.GameState || window.gameState || (window.gameState = {});
  const IS_GAME = window.location.pathname.includes("game.html");
  function el(id) { return document.getElementById(id); }

  const TILE_IMAGES = ["assets/tile_aelia.png", "assets/tile_nocta.png", "assets/tile_vyra.png", "assets/tile_iona.png"];
  
  const HAZARD_IMAGES = { 
      frozen: "assets/tile_deceit.png?v=103", 
      poison: "assets/tile_plague.png?v=103", 
      junk:   "assets/tile_greed.png?v=103", 
      lava:   "assets/tile_lava.png?v=103" 
  };

  const TUTORIAL_KEY = "nx_tutorial_seen_v6";
  function launchTutorial() {
      // Unlock if stuck
      if(GS.isProcessing) { GS.isProcessing = false; if(window.UI && UI.updateAbilityUI) UI.updateAbilityUI(); }

      if(document.getElementById("tutorial-overlay")) return;
      const overlay = document.createElement("div");
      overlay.id = "tutorial-overlay";
      overlay.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(2, 6, 23, 0.98); z-index: 20000; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #fff; text-align: center; padding: 2rem;`;
      overlay.innerHTML = `<h2 style="color:#38bdf8; margin-bottom:1rem; font-family:monospace; font-size: 2rem;">COMBAT MANUAL</h2><div style="text-align:left; color:#ccc; line-height:1.8; max-width:400px; margin-bottom:2rem; font-family:sans-serif;"><p><strong>1. MATCH 3:</strong> Swap tiles to damage the Disciple.</p><p><strong>2. HERO SKILLS:</strong> Matches charge the rings below. Tap when glowing!</p><p><strong>3. HAZARDS:</strong> Match NEXT to Poison/Lava to destroy them.</p></div><button id="tut-close-btn" style="padding:1rem 3rem; background:linear-gradient(135deg, #0ea5e9, #2563eb); border:none; border-radius:4px; font-weight:bold; cursor:pointer; color:#fff; font-size:1.1rem; box-shadow: 0 0 15px rgba(14,165,233,0.5);">INITIALIZE</button>`;
      document.body.appendChild(overlay);
      document.getElementById("tut-close-btn").onclick = () => { overlay.remove(); localStorage.setItem(TUTORIAL_KEY, "true"); if(UI.flashAlert) UI.flashAlert("SYSTEM READY", 1500); };
  }
  window.resetTutorial = launchTutorial;

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
      initAbilityIcons(); injectTutorialButton(); bindAbilityklClicks();
      if (!localStorage.getItem(TUTORIAL_KEY)) setTimeout(launchTutorial, 1000);
      setTimeout(() => { updateEnergyUI(); updatePrismaUI(); if(GS.board) renderBoard(); }, 50);
    });
  } else { window.UI = window.UI || {}; window.UI.updateEnergyUI = function(){}; window.UI.updateStats = function(){}; window.UI.renderBoard = function(){}; window.renderBoard = function(){}; return; }

  function bindAbilityklClicks() {
      const bind = (id, fnName) => {
          const el = document.getElementById(id + "-ability-ring");
          if(el) {
              const newEl = el.cloneNode(true);
              el.parentNode.replaceChild(newEl, el);
              newEl.onclick = () => {
                  if(GS.isProcessing) return; 
                  
                  const icon = document.getElementById(id + "-ability-icon");
                  if(!icon || !icon.classList.contains("ability-ready")) return;

                  newEl.style.background = "conic-gradient(#38bdf8 0deg, rgba(255,255,255,0.08) 0deg)";
                  icon.classList.remove("ability-ready");
                  
                  if(window.Abilities && window.Abilities[fnName]) { 
                      try { window.Abilities[fnName](); } 
                      catch(e) { console.error("Ability Error:", e); GS.isProcessing = false; } 
                  }
              };
          }
      };
      bind("aelia", "activateAelia"); bind("nocta", "activateNocta"); bind("vyra",  "activateVyra"); bind("iona",  "activateIona");
  }

  function injectTutorialButton() {
      const existing = document.getElementById("tut-trig"); if(existing) existing.remove();
      const btn = document.createElement("div");
      btn.id = "tut-trig";
      btn.innerText = "?";
      btn.style.cssText = `position:fixed; top:70px; right:15px; width:36px; height:36px; border:2px solid #38bdf8; color:#38bdf8; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:bold; cursor:pointer; z-index:15000; background:rgba(15,23,42,0.9); box-shadow: 0 0 10px rgba(0,0,0,0.5); font-family:monospace; font-size:1.2rem;`;
      btn.onclick = launchTutorial;
      document.body.appendChild(btn);
  }

  function initAbilityIcons() {
      const map = { "aelia": 0, "nocta": 1, "vyra": 2, "iona": 3 };
      for (const [hero, typeIdx] of Object.entries(map)) {
          const icon = el(hero + "-ability-icon");
          if(icon) { icon.classList.add(`glyph-type-${typeIdx}`); icon.style.transition = "transform 0.2s, filter 0.2s"; }
      }
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
              img.classList.add(`glyph-type-${cell.type}`);
          }
          img.onerror = function() { this.style.display='none'; this.parentNode.style.backgroundColor = '#333'; this.parentNode.innerText = '?'; };
          content.appendChild(img);
        }
        cellEl.appendChild(content);
        gridEl.appendChild(cellEl);
      }
    }
  }

  function updateAbilityUI() {
    if (!IS_GAME) return;
    const bar = el("ability-bar");
    if (GS.isProcessing) { if(bar) bar.style.opacity = "0.7"; } 
    else { if(bar) bar.style.opacity = "1"; }
    const A = [ { id: "aelia", charge: GS.aeliaCharge, max: 10 }, { id: "nocta", charge: GS.noctaCharge, max: 12 }, { id: "vyra",  charge: GS.vyraCharge,  max: 15 }, { id: "iona",  charge: GS.ionaCharge,  max: 18 } ];
    A.forEach((h) => {
      const ring = el(h.id + "-ability-ring");
      const icon = el(h.id + "-ability-icon");
      if (!ring || !icon) return;
      const pct = Math.min(1, h.charge / h.max);
      const deg = pct * 360;
      ring.style.background = `conic-gradient(#38bdf8 ${deg}deg, rgba(255,255,255,0.08) ${deg}deg)`;
      if (pct >= 1) icon.classList.add("ability-ready");
      else icon.classList.remove("ability-ready");
    });
  }

  // Helpers
  function updateDiscipleBadge(){const b=el("disciple-badge-live"),c=el("disciple-chibi-live"),d=GS.disciple;if(!d)return;if(b)b.textContent="Disciple: "+d.name;if(c){c.src="assets/disciple_"+d.id.toLowerCase()+".jpg";c.onerror=function(){this.onerror=null;let f="tile_greed.png";if(d.attack==="poison")f="tile_plague.png";if(d.attack==="drain")f="tile_war.png";if(d.attack==="deceit")f="tile_deceit.png";if(d.attack==="greed")f="tile_greed.png";this.src="assets/"+f;};c.style.display="block";}}
  function updateChibiUI(){const h=el("hero-chibi-live"),d=GS.disciple;if(!h||!d)return;const m={GREED:"aelia",PLAGUE:"nocta",WAR:"vyra",DECEIT:"iona"},n=m[d.id]||"aelia";h.src="assets/"+n+".png";h.onerror=function(){this.onerror=null;this.src="assets/tile_"+n+".png"};updateDiscipleBadge();}
  function updateStats(){if(!IS_GAME)return;const b=el("disciple-hp-bar"),l=el("disciple-hp-label"),m=el("moves-left");if(b&&GS.discipleHP!=null){const p=Math.max(0,GS.discipleHP/GS.discipleMaxHP);b.style.width=(p*100)+"%"}if(l&&GS.discipleHP!=null)l.textContent=GS.discipleHP+" HP";if(m)m.textContent=GS.movesLeft}
  function updateEnergyUI(){if(!window.economy)return;window.economy.regenerateEnergy();const c=window.economy.getEnergy(),m=window.economy.maxEnergy,ec=el("energy-count"),er=el("energy-regen-time");if(ec)ec.textContent=c+" / "+m;if(c>=m){if(er)er.textContent="FULL";if(window._energyInterval)clearInterval(window._energyInterval);return}function t(){const E=window.economy,L=parseInt(localStorage.getItem(E.LS_KEYS.lastEnergyAt),10)||Date.now(),R=E.regenMinutes*60000,N=L+R,l=N-Date.now();if(l<=0){E.regenerateEnergy();updateEnergyUI();return}const mm=Math.floor(l/60000),ss=Math.floor((l%60000)/1000);if(er)er.textContent=`${mm}:${ss.toString().padStart(2,'0')}`}if(window._energyInterval)clearInterval(window._energyInterval);t();window._energyInterval=setInterval(t,1000)}
  function updatePrismaUI(){const p=el("prisma-count"),a=el("aurum-count");if(window.economy){if(p)p.textContent=economy.getPrisma();if(a)a.textContent=economy.getAurum()}}
  
  // FIX: Default time to 2500ms to match CSS
  function flashAlert(t,d=2500){
      const b=el("alert-banner");
      if(!b)return;
      b.textContent=t;
      b.classList.add("alert-active");
      setTimeout(()=>b.classList.remove("alert-active"),d);
  }
})();