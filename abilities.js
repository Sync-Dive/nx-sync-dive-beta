/* abilities.js — SCALED DAMAGE FOR NEW HP POOLS */
(function () {
  const GS = window.GameState || window.gameState;
  const UI = window.UI;
  const Board = window.Board; 

  const isEmpty = window.isEmpty || (cell => cell == null);
  const delay = window.delay || (ms => new Promise(res => setTimeout(res, ms)));

  function applyHeroDamage(sourceHero, rawDamage) {
    if (!GS.discipleHP || GS.discipleHP <= 0) return;
    
    const actual = Math.max(0, Math.floor(rawDamage));
    GS.discipleHP = Math.max(0, GS.discipleHP - actual);

    if(UI && UI.updateStats) UI.updateStats();

    if (GS.discipleHP <= 0) {
      // Victory handled by loop
    } else {
      if (actual > 50 && UI && UI.flashAlert) {
         UI.flashAlert(`${sourceHero.toUpperCase()} HIT: -${actual} HP`);
      }
    }
  }

  async function clearAndFill(cellsToClear) {
      if (!cellsToClear.length) return;
      cellsToClear.forEach(({ r, c }) => {
        const el = document.getElementById(`cell-${r}-${c}`);
        if (el && el.firstChild) {
            el.firstChild.style.transition = "transform .2s ease, opacity .2s ease";
            el.firstChild.style.transform = "scale(0)";
            el.firstChild.style.opacity = "0";
        }
      });
      await delay(200);
      cellsToClear.forEach(({ r, c }) => GS.board[r][c] = null);
      if (window.Board && window.Board.forceFill) await window.Board.forceFill();
      if(UI && UI.renderBoard) UI.renderBoard();
      await delay(100);
      if (window.Board && window.Board.processBoardUntilStable) await window.Board.processBoardUntilStable();
  }

  // --- BUFFED ABILITIES (Approx 5x-8x stronger) ---

  async function activateAelia() {
    if (GS.isProcessing || GS.aeliaCharge < 10) return;
    GS.isProcessing = true;
    try {
      applyHeroDamage("aelia", 600); // Was 150
      GS.aeliaCharge = 0;
      if (GS.discipleHP <= 0) { GS.isProcessing = false; return; }

      const row = Math.floor(Math.random() * GS.GRID_SIZE);
      const toClear = [];
      for (let c = 0; c < GS.GRID_SIZE; c++) {
        const cell = GS.board[row][c];
        if (!isEmpty(cell)) toClear.push({ r: row, c });
      }
      await clearAndFill(toClear);

    } catch(e) { console.error(e); } finally {
       if (GS.discipleHP > 0) GS.isProcessing = false;
       if(UI) { UI.updateStats(); UI.updateAbilityUI(); }
    }
  }

  async function activateNocta() {
    if (GS.isProcessing || GS.noctaCharge < 12) return;
    GS.isProcessing = true;
    try {
      // Nocta: Utility focused, so lower damage, but useful clear
      GS.noctaCharge = 0;
      const N = GS.GRID_SIZE;
      const candidates = [];
      for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
          if (!isEmpty(GS.board[r][c])) candidates.push({ r, c });
      }
      for (let i = candidates.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
      }
      const toClear = candidates.slice(0, Math.min(9, candidates.length));
      
      if(UI && UI.flashAlert) UI.flashAlert("NOCTA PURGE", 900);
      await clearAndFill(toClear);

    } catch(e) { console.error(e); } finally {
      if (GS.discipleHP > 0) GS.isProcessing = false;
      if(UI) { UI.updateStats(); UI.updateAbilityUI(); }
    }
  }

  async function activateVyra() {
    if (GS.isProcessing || GS.vyraCharge < 15) return;
    GS.isProcessing = true;
    try {
      applyHeroDamage("vyra", 900); // Was 200
      GS.vyraCharge = 0;
      if (GS.discipleHP <= 0) { GS.isProcessing = false; return; }

      const max = GS.GRID_SIZE - 2;
      const r0 = 1 + Math.floor(Math.random() * max);
      const c0 = 1 + Math.floor(Math.random() * max);
      const toClear = [];
      for (let r = r0 - 1; r <= r0 + 1; r++) {
        for (let c = c0 - 1; c <= c0 + 1; c++) {
          const cell = GS.board[r][c];
          if (!isEmpty(cell)) toClear.push({ r, c });
        }
      }
      await clearAndFill(toClear);

    } catch(e) { console.error(e); } finally {
      if (GS.discipleHP > 0) GS.isProcessing = false;
      if(UI) { UI.updateStats(); UI.updateAbilityUI(); }
    }
  }

  async function activateIona() {
    if (GS.isProcessing || GS.ionaCharge < 18) return;
    GS.isProcessing = true;
    try {
      applyHeroDamage("iona", 1400); // Was 250
      GS.ionaCharge = 0;
      if (GS.discipleHP <= 0) { GS.isProcessing = false; return; }

      const types = [];
      for (let r=0; r<GS.GRID_SIZE; r++) for (let c=0; c<GS.GRID_SIZE; c++) {
          const cell = GS.board[r][c];
          if (window.isGlyph(cell) && !types.includes(cell.type)) types.push(cell.type);
      }
      if (!types.length) { GS.isProcessing = false; return; }

      const t = types[Math.floor(Math.random() * types.length)];
      const toClear = [];
      for (let r=0; r<GS.GRID_SIZE; r++) for (let c=0; c<GS.GRID_SIZE; c++) {
          if (window.isGlyph(GS.board[r][c]) && GS.board[r][c].type === t) toClear.push({ r, c });
      }
      await clearAndFill(toClear);

    } catch(e) { console.error(e); } finally {
      if (GS.discipleHP > 0) GS.isProcessing = false;
      if(UI) { UI.updateStats(); UI.updateAbilityUI(); }
    }
  }

  window.addEventListener("DOMContentLoaded", () => {
    const bind = (id, fn) => {
        const el = document.getElementById(id + "-ability-ring");
        if(el) {
            const newEl = el.cloneNode(true);
            el.parentNode.replaceChild(newEl, el);
            newEl.addEventListener("click", fn);
        }
    };
    bind("aelia", activateAelia);
    bind("nocta", activateNocta);
    bind("vyra", activateVyra);
    bind("iona", activateIona);
  });

  window.Abilities = { activateAelia, activateNocta, activateVyra, activateIona, applyHeroDamage };
})();