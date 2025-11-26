// globals.js – must load before ui.js and board.js

window.isGlyph  = () => false;
window.isFrozen = () => false;
window.isPoison = () => false;
window.isJunk   = () => false;
window.isEmpty  = (cell) => cell == null;
