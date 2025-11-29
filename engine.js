/* engine.js — ENERGY DEDUCTION FIX */
(function () {
  const GS = window.GameState || window.gameState || (window.gameState = {});
  const delay = window.delay || (ms => new Promise(res => setTimeout(res, ms)));

  let victoryTriggered = false; 

  function getSafeRandomGlyph() {
    const candidates = [];
    const N = GS.GRID_SIZE;
    for(let r=0; r<N; r++){
        for(let c=0; c<N; c++){
            const cell = GS.board[r][c];
            if(cell && cell.kind === "glyph") candidates.push({r,c});
        }
    }
    if(!candidates.length) return null;
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  function performDiscipleAttack(type) {
    if(window.AudioSys) AudioSys.play('warning');

    const target = getSafeRandomGlyph();
    if(target) {
        if (window.FX && FX.shake) FX.shake(1);
        const {r, c} = target;
        if (type === "poison") GS.board[r][c] = { kind: "poison" };
        else if (type === "drain") GS.board[r][c] = { kind: "lava" };
        else if (type === "deceit") GS.board[r][c] = { kind: "frozen" };
        else GS.board[r][c] = { kind: "junk" };
    }
    if(window.UI && UI.renderBoard) UI.renderBoard();
  }

  function discipleAttackIfReady() {
    if (!GS.disciple || GS.discipleHP <= 0) return;
    const every = GS.discipleAttackRate || 3; 
    
    if (GS.turnsTaken > 0 && GS.turnsTaken % every === 0) {
        // TWEAK: Reduced warning time for better flow
        if (window.UI && UI.flashAlert) {
            UI.flashAlert(`WARNING: ${GS.disciple.name} ATTACK!`, 1500); // Was 2500
        }
        
        // Match the attack timing (wait for alert to be half done)
        setTimeout(() => { 
            performDiscipleAttack(GS.disciple.attack || "greed"); 
        }, 800); 
    }
    }

  // --- VICTORY ---
  async function handleVictory() {
    if (victoryTriggered) return; 
    victoryTriggered = true;
    GS.isProcessing = true; 
    
    if(window.AudioSys) { AudioSys.stopBGM(); AudioSys.play('win'); }

    const reward = 20 + (GS.movesLeft * 2);
    if (window.economy) {
      if(window.economy.addPrisma) window.economy.addPrisma(reward);
      // NOTE: We do NOT give energy back on win, we just don't charge extra.
      // Or if you want +1 energy on win:
      // if(window.economy.addEnergy) window.economy.addEnergy(1); 
    }
    const nextLevelId = GS.currentLevelId + 1;
    if (window.StorageAPI?.setLevelUnlocked) StorageAPI.setLevelUnlocked(nextLevelId);

    const overlay = document.getElementById("end-overlay");
    const msgEl = document.getElementById("end-message");
    const imgEl = document.getElementById("end-chibi");
    const btnNext = document.getElementById("btn-next-level");

    if (msgEl) { msgEl.textContent = `VICTORY! +${reward} Prisma`; msgEl.className = "victory-title"; }
    
    if (btnNext) {
        const nextLevelExists = window.LEVELS && window.LEVELS.some(l => l.id === nextLevelId);
        if (nextLevelExists) {
            btnNext.style.display = "block";
            // FIX: CHARGE ENERGY FOR NEXT LEVEL
            btnNext.onclick = () => {
                if (window.economy && window.economy.spendEnergyForLevel()) {
                    window.location.href = `game.html?level=${nextLevelId}`;
                } else {
                    if(confirm("Not enough Energy! Go to Shop?")) window.location.href = "shop.html";
                }
            };
        } else {
            btnNext.style.display = "none"; 
            if (msgEl) msgEl.textContent = "CAMPAIGN COMPLETE!";
        }
    }
    
    const HERO_FOR_DISCIPLE = { GREED:"aelia", PLAGUE:"nocta", WAR:"vyra", DECEIT:"iona" };
    let hId = "aelia";
    if(GS.disciple) hId = HERO_FOR_DISCIPLE[GS.disciple.id] || "aelia";

    if (imgEl) imgEl.src = `assets/${hId}_wink.png`;
    if (overlay) overlay.style.display = "flex";
  }

  function handleDefeat() {
    if (victoryTriggered) return;
    victoryTriggered = true;
    GS.isProcessing = true;
    
    if(window.AudioSys) { AudioSys.stopBGM(); AudioSys.play('lose'); }

    const overlay = document.getElementById("end-overlay");
    const msgEl = document.getElementById("end-message");
    const imgEl = document.getElementById("end-chibi");
    const btnNext = document.getElementById("btn-next-level");

    if (msgEl) { msgEl.textContent = "DEFEAT"; msgEl.className = "defeat-title"; }
    if (btnNext) btnNext.style.display = "none";

    if (imgEl && GS.disciple) {
        imgEl.src = `assets/disciple_${GS.disciple.id.toLowerCase()}.jpg`;
        imgEl.onerror = function() { this.src = "assets/tile_greed.png"; };
    }

    if(overlay) overlay.style.display = "flex";
  }

  async function trySwap(r1, c1, r2, c2) {
    if (GS.isProcessing || GS.movesLeft <= 0 || victoryTriggered) return false;
    try {
        const valid = window.Board.performSwap(r1, c1, r2, c2);
        if (valid) {
            GS.isProcessing = true;
            if (window.UI) UI.renderBoard();
            await delay(250);
            await window.Board.processBoardUntilStable();
            GS.movesLeft--;
            GS.turnsTaken++;
            if (window.UI) { UI.updateStats(); UI.updateAbilityUI(); }
            if (GS.discipleHP <= 0) { await handleVictory(); return true; } 
            discipleAttackIfReady();
            if (GS.movesLeft <= 0) { handleDefeat(); return true; }
            return true;
        } 
    } catch(err) { console.error(err); } finally {
        if (!victoryTriggered) GS.isProcessing = false;
    }
    return false;
  }

  async function requestShuffle() {
      if (GS.isProcessing || victoryTriggered) return;
      if (GS.movesLeft <= 1) {
          if(window.UI && UI.flashAlert) UI.flashAlert("NOT ENOUGH MOVES");
          return;
      }
      if (window.confirm("Shuffle Board? Cost: 1 Move")) {
          GS.isProcessing = true;
          GS.movesLeft--;
          if (window.UI) UI.updateStats();
          await window.Board.shuffleBoard();
          if (window.UI) UI.renderBoard();
          GS.isProcessing = false;
      }
  }

  function bootLevel(lvlId) {
    const id = typeof lvlId === 'number' ? lvlId : window.readLevelIdFromURL();
    const lvl = (window.LEVELS || []).find((L) => L.id === id) || window.LEVELS[0];

    GS.currentLevelId = id;
    GS.activeLevel = lvl;
    GS.disciple = lvl.disciple;
    GS.discipleMaxHP = lvl.discipleMaxHP || 800;
    GS.discipleHP = GS.discipleMaxHP;
    GS.discipleAttackRate = lvl.attackRate || 3; 

    GS.GRID_SIZE = 9;
    GS.movesLeft = lvl.moves || 25;
    GS.score = 0;
    GS.turnsTaken = 0;
    GS.aeliaCharge = 0; GS.noctaCharge = 0; GS.vyraCharge = 0; GS.ionaCharge = 0;
    
    GS.isProcessing = false;
    victoryTriggered = false;

    if(window.AudioSys) AudioSys.playBGM('bgm_battle');

    if (window.Board?.initBoard) {
        Board.initBoard(GS.GRID_SIZE);
        if(Board.processBoardUntilStable) Board.processBoardUntilStable();
    }
    
    if (window.UI) {
      UI.renderBoard(); UI.updateStats(); UI.updateDiscipleBadge();
      UI.updateChibiUI(); UI.updateAbilityUI();
    }
  }

  // FIX: RESTART CHARGES ENERGY
  function restartLevel() {
      if (window.economy && window.economy.spendEnergyForLevel()) {
          bootLevel(GS.currentLevelId);
          // Hide overlay if open
          document.getElementById("end-overlay").style.display = "none";
      } else {
          if(confirm("Not enough Energy! Go to Shop?")) window.location.href = "shop.html";
      }
  }

  window.Engine = { bootLevel, restartLevel, trySwap, handleVictory, requestShuffle };
})();