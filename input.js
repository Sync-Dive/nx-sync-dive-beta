// input.js — FIXED: CLICK + DRAG SUPPORT
(function () {
  const GS = window.gameState || window.GameState || (window.gameState = {});

  // State
  const drag = {
    active: false,
    startR: -1,
    startC: -1,
    startX: 0,
    startY: 0,
    pointerId: null,
    swapped: false
  };

  // For click-to-swap
  let selected = null; // {r, c}

  //--------------------------------------------------------------
  // HELPERS
  //--------------------------------------------------------------
  function isSwappable(cell) {
    if (!cell) return false;
    // Only glyphs can be moved
    return cell.kind === "glyph";
  }

  function resetDrag() {
    drag.active = false;
    drag.startR = -1;
    drag.startC = -1;
    drag.pointerId = null;
    drag.swapped = false;
  }

  function clearSelection() {
    if (selected) {
      const el = document.getElementById(`cell-${selected.r}-${selected.c}`);
      if (el) el.classList.remove("cell-selected");
    }
    selected = null;
  }

  function setSelection(r, c) {
    clearSelection();
    selected = { r, c };
    const el = document.getElementById(`cell-${r}-${c}`);
    if (el) el.classList.add("cell-selected");
  }

  function areNeighbors(r1, c1, r2, c2) {
    const dr = Math.abs(r1 - r2);
    const dc = Math.abs(c1 - c2);
    return (dr + dc === 1);
  }

  //--------------------------------------------------------------
  // POINTER DOWN
  //--------------------------------------------------------------
  function onCellPointerDown(e, r, c) {
    if (GS.isProcessing) return;
    if (!window.Board) return;

    // Must be a valid swappable tile
    const cell = GS.board?.[r]?.[c];
    if (!isSwappable(cell)) {
        clearSelection();
        return;
    }

    // --- DRAG SETUP ---
    drag.active = true;
    drag.pointerId = e.pointerId;
    drag.startR = r;
    drag.startC = c;
    drag.startX = e.clientX;
    drag.startY = e.clientY;
    drag.swapped = false;

    window.addEventListener("pointermove", onMove, { passive: false });
    window.addEventListener("pointerup", onUp, { passive: false });
    window.addEventListener("pointercancel", onCancel, { passive: false });
    
    // Prevent browser default drag/scroll behavior
    if (e.cancelable) e.preventDefault(); 
  }

  //--------------------------------------------------------------
  // POINTER MOVE (DRAG)
  //--------------------------------------------------------------
  function onMove(e) {
    if (!drag.active) return;
    if (e.pointerId !== drag.pointerId) return;
    if (drag.swapped || GS.isProcessing) return;

    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    // Threshold to consider it a drag
    if (absX < 20 && absY < 20) return;

    // Calculate target direction
    let r2 = drag.startR;
    let c2 = drag.startC;

    if (absX > absY) {
      if (dx < 0) c2--; else c2++;
    } else {
      if (dy < 0) r2--; else r2++;
    }

    // Check bounds
    const N = GS.GRID_SIZE;
    if (r2 < 0 || r2 >= N || c2 < 0 || c2 >= N) return;

    // Check target valid
    const targetCell = GS.board[r2][c2];
    if (!isSwappable(targetCell)) return;

    // EXECUTE SWAP
    drag.swapped = true;
    clearSelection(); // Clear selection if we dragged
    
    // Engine handles the logic/animation
    window.Engine.trySwap(drag.startR, drag.startC, r2, c2).then(() => {
        resetDrag();
    });
    
    e.preventDefault();
  }

  //--------------------------------------------------------------
  // POINTER UP (CLICK Logic)
  //--------------------------------------------------------------
  function onUp(e) {
    if (e.pointerId !== drag.pointerId) return;

    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
    window.removeEventListener("pointercancel", onCancel);

    // If we didn't drag, treat it as a CLICK
    if (!drag.swapped && !GS.isProcessing) {
      const r = drag.startR;
      const c = drag.startC;

      if (!selected) {
        // Case 1: No selection -> Select this
        setSelection(r, c);
      } else {
        // Case 2: Clicked same tile -> Deselect
        if (selected.r === r && selected.c === c) {
          clearSelection();
        } 
        // Case 3: Clicked neighbor -> Swap
        else if (areNeighbors(selected.r, selected.c, r, c)) {
           const r1 = selected.r, c1 = selected.c;
           clearSelection();
           window.Engine.trySwap(r1, c1, r, c);
        } 
        // Case 4: Clicked far away -> Select new
        else {
           setSelection(r, c);
        }
      }
    }

    resetDrag();
    if(e.cancelable) e.preventDefault();
  }

  function onCancel(e) {
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
    window.removeEventListener("pointercancel", onCancel);
    resetDrag();
    clearSelection();
  }

  //--------------------------------------------------------------
  // EXPORT
  //--------------------------------------------------------------
  window.Input = { onCellPointerDown };

})();