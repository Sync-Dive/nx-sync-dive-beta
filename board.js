/* board.js — DAMAGE TUNED (25) */
(function () {
  const GS = window.gameState || (window.gameState = {});

  // --- HELPERS (Standard) ---
  function randInt(n) { return Math.floor(Math.random() * n); }
  function makeGlyphCell(type) { return { kind: "glyph", type }; }
  function isGlyph(cell) { return cell && cell.kind === "glyph"; }
  function isPoison(cell) { return cell && cell.kind === "poison"; }
  function isFrozen(cell) { return cell && cell.kind === "frozen"; }
  function isJunk(cell) { return cell && cell.kind === "junk"; }
  function isLava(cell) { return cell && cell.kind === "lava"; }
  function isHazard(cell) { return (isPoison(cell) || isFrozen(cell) || isJunk(cell) || isLava(cell)); }
  function isEmpty(cell) { return cell == null; }
  function canFall(cell) { return cell && !isHazard(cell); } 

  window.isGlyph = isGlyph; window.isPoison = isPoison; window.isFrozen = isFrozen;
  window.isJunk = isJunk; window.isLava = isLava; window.isEmpty = isEmpty;

  // --- INIT ---
  function initBoard(N) {
    GS.GRID_SIZE = N;
    const board = Array.from({ length: N }, () => Array.from({ length: N }, () => null));
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        let t;
        do { t = randInt(4); board[r][c] = makeGlyphCell(t); } 
        while (checkMatchAtOnBoard(board, r, c).length >= 3);
      }
    }
    GS.board = board;
    window.board = board;
  }

  // --- MATCHING ---
  function checkMatchAtOnBoard(bd, r, c) {
    const N = bd.length;
    const cell = bd[r][c];
    if (!isGlyph(cell)) return [];
    const t = cell.type;
    let out = [];
    // Horizontal
    let temp = [{ r, c }];
    let x = c - 1;
    while (x >= 0 && isGlyph(bd[r][x]) && bd[r][x].type === t) { temp.push({ r, c: x }); x--; }
    x = c + 1;
    while (x < N && isGlyph(bd[r][x]) && bd[r][x].type === t) { temp.push({ r, c: x }); x++; }
    if (temp.length >= 3) out = out.concat(temp);
    // Vertical
    temp = [{ r, c }];
    let y = r - 1;
    while (y >= 0 && isGlyph(bd[y][c]) && bd[y][c].type === t) { temp.push({ r: y, c }); y--; }
    y = r + 1;
    while (y < N && isGlyph(bd[y][c]) && bd[y][c].type === t) { temp.push({ r: y, c }); y++; }
    if (temp.length >= 3) out = out.concat(temp);
    return out;
  }

  function findAllMatches() {
    const N = GS.GRID_SIZE;
    const matches = {};
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        const m = checkMatchAtOnBoard(GS.board, r, c);
        if (m.length >= 3) {
          for (const pos of m) matches[`${pos.r}-${pos.c}`] = pos;
        }
      }
    }
    return matches;
  }

  // --- HAZARDS & GRAVITY ---
  function cleanHazardsAdjacentTo(matches) {
    const N = GS.GRID_SIZE;
    const neighborsOffsets = [[-1, 0], [1, 0], [0, -1], [0, 1]]; 
    for (const key in matches) {
      const { r, c } = matches[key];
      neighborsOffsets.forEach(([dr, dc]) => {
        const nr = r + dr; const nc = c + dc;
        if (nr >= 0 && nr < N && nc >= 0 && nc < N) {
          const neighbor = GS.board[nr][nc];
          if (isHazard(neighbor) && !isJunk(neighbor)) { 
             GS.board[nr][nc] = null; 
          }
        }
      });
    }
  }

  function clearMatchesAndHazards(matches) {
    cleanHazardsAdjacentTo(matches);
    for (const key in matches) {
      const { r, c } = matches[key];
      GS.board[r][c] = null;
    }
  }

  async function applyGravity() {
    const N = GS.GRID_SIZE;
    for (let c = 0; c < N; c++) {
      for (let r = N - 1; r >= 0; r--) {
        if (GS.board[r][c] !== null) continue;
        let mover = null;
        for (let rr = r - 1; rr >= 0; rr--) {
          const cell = GS.board[rr][c];
          if (!cell) continue;
          if (canFall(cell)) { mover = { rr, cell }; break; }
          if (isHazard(cell)) break;
        }
        if (mover) {
          GS.board[r][c] = mover.cell;
          GS.board[mover.rr][c] = null;
        }
      }
    }
  }

  async function refillBoard() {
    const N = GS.GRID_SIZE;
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        if (GS.board[r][c] === null) GS.board[r][c] = makeGlyphCell(randInt(4));
      }
    }
  }

  async function forceFill() {
      await applyGravity();
      await refillBoard();
  }

  function neighbors(r, c) {
    const N = GS.GRID_SIZE;
    return [[r-1,c],[r+1,c],[r,c-1],[r,c+1]].filter(([rr,cc])=>rr>=0&&rr<N&&cc>=0&&cc<N);
  }
  function spreadPoison() {
    const N = GS.GRID_SIZE;
    const poisons = [];
    for(let r=0;r<N;r++) for(let c=0;c<N;c++) if(isPoison(GS.board[r][c])) poisons.push({r,c});
    if(!poisons.length) return;
    const seed = poisons[randInt(poisons.length)];
    const g = neighbors(seed.r, seed.c).filter(([rr,cc])=>isGlyph(GS.board[rr][cc]));
    if(g.length) { const [rr,cc] = g[randInt(g.length)]; GS.board[rr][cc] = {kind:"poison"}; }
  }
  function spreadLava() {
    const N = GS.GRID_SIZE;
    const lavas = [];
    for(let r=0;r<N;r++) for(let c=0;c<N;c++) if(isLava(GS.board[r][c])) lavas.push({r,c});
    if(!lavas.length) return;
    const seed = lavas[randInt(lavas.length)];
    const g = neighbors(seed.r, seed.c).filter(([rr,cc])=>isGlyph(GS.board[rr][cc]));
    if(g.length) { const [rr,cc] = g[randInt(g.length)]; GS.board[rr][cc] = {kind:"lava"}; }
  }

  // --- RESOLVE ---
  async function resolveMatchesOnceAndRefill() {
    const matches = findAllMatches();
    if (Object.keys(matches).length === 0) return false;

    const matchCount = Object.keys(matches).length;
    if (window.Abilities && window.Abilities.applyHeroDamage) {
        // BALANCE UPDATE: 25 Damage per tile
        const dmg = matchCount * 25; 
        window.Abilities.applyHeroDamage("board", dmg); 
        
        GS.aeliaCharge = Math.min(10, GS.aeliaCharge + (matchCount > 3 ? 2 : 1));
        GS.noctaCharge = Math.min(12, GS.noctaCharge + 1);
        GS.vyraCharge = Math.min(15, GS.vyraCharge + 1);
        GS.ionaCharge = Math.min(18, GS.ionaCharge + 1);
    }

    clearMatchesAndHazards(matches);
    await forceFill(); 
    if (window.delay) await window.delay(200);
    if (window.UI && UI.renderBoard) UI.renderBoard();
    spreadPoison();
    spreadLava();
    return true;
  }

  async function processBoardUntilStable() {
    let changed = true;
    let safeguard = 0;
    while (changed && safeguard < 12) {
      changed = await resolveMatchesOnceAndRefill();
      safeguard++;
    }
  }

  function performSwap(r1, c1, r2, c2) {
    const a = GS.board[r1][c1];
    const b = GS.board[r2][c2];
    GS.board[r1][c1] = b;
    GS.board[r2][c2] = a;
    const matches = findAllMatches();
    if (Object.keys(matches).length === 0) {
      GS.board[r1][c1] = a;
      GS.board[r2][c2] = b;
      return false;
    }
    return true;
  }
  
  function shuffleGlyphsOnly() {
    const N = GS.GRID_SIZE;
    const glyphs = [];
    const positions = [];
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
        if (isGlyph(GS.board[r][c])) { glyphs.push(GS.board[r][c]); positions.push({r, c}); }
    }
    for (let i = glyphs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [glyphs[i], glyphs[j]] = [glyphs[j], glyphs[i]];
    }
    positions.forEach((pos, i) => GS.board[pos.r][pos.c] = glyphs[i]);
  }

  async function shuffleBoard() {
      shuffleGlyphsOnly();
      await processBoardUntilStable();
  }

  window.Board = {
    initBoard,
    checkMatchAtOnBoard,
    findAllMatches,
    resolveMatchesOnceAndRefill,
    processBoardUntilStable,
    processAllMatches: processBoardUntilStable, 
    performSwap,
    forceFill,
    shuffleBoard
  };
})();