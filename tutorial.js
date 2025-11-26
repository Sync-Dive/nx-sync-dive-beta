/* tutorial.js — FIRST TIME GUIDE */
(function() {
    const LS_KEY = "nx_tutorial_seen";
    
    function showTutorial() {
        if (localStorage.getItem(LS_KEY)) return;
        
        // Pause Game
        const GS = window.gameState || window.GameState;
        if(GS) GS.isProcessing = true;

        const overlay = document.createElement("div");
        overlay.id = "tutorial-overlay";
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(2, 6, 23, 0.95); z-index: 9999;
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            color: #fff; text-align: center; padding: 2rem;
            backdrop-filter: blur(5px);
        `;

        const html = `
            <h2 style="color:#0ea5e9; font-size:1.8rem; margin-bottom:1rem; text-shadow:0 0 10px #0ea5e9;">SYSTEM LINK ESTABLISHED</h2>
            <div style="max-width:400px; line-height:1.6; color:#cbd5e1; margin-bottom:2rem;">
                <p><strong>1. MATCH GLYPHS:</strong><br>Swap tiles to create lines of 3 or more. This damages the DISCIPLE.</p>
                <p><strong>2. CHARGE HEROES:</strong><br>Matches charge your Hero Rings (bottom). Tap a glowing ring to unleash a powerful ability!</p>
                <p><strong>3. HAZARDS:</strong><br>Watch out for Poison and Lava. Clear tiles NEXT to them to destroy them before they spread.</p>
            </div>
            <button id="tut-btn" style="
                background: linear-gradient(135deg, #0ea5e9, #2563eb); border: none;
                color: white; padding: 1rem 2rem; font-weight: bold; font-size: 1rem;
                border-radius: 8px; cursor: pointer; box-shadow: 0 0 15px rgba(14,165,233,0.5);
            ">INITIATE COMBAT</button>
        `;

        overlay.innerHTML = html;
        document.body.appendChild(overlay);

        document.getElementById("tut-btn").onclick = () => {
            overlay.remove();
            localStorage.setItem(LS_KEY, "true");
            if(GS) GS.isProcessing = false;
        };
    }

    // Run on load only if on game page
    if (window.location.pathname.includes("game.html")) {
        // Wait for board to init
        setTimeout(showTutorial, 800);
    }
})();