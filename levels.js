/* levels.js — AUTO-GENERATED 50 LEVEL CAMPAIGN */
(function () {
  const DISCIPLES = {
    WAR:    { id: "WAR",    name: "WAR",    attack: "drain"  }, 
    GREED:  { id: "GREED",  name: "GREED",  attack: "greed"  }, 
    PLAGUE: { id: "PLAGUE", name: "PLAGUE", attack: "poison" }, 
    DECEIT: { id: "DECEIT", name: "DECEIT", attack: "deceit" }  
  };

  function L(id, name, desc, disciple, moves, hp, rate) {
    return { id, name, desc, disciple, moves, discipleMaxHP: hp, attackRate: rate };
  }

  // Define Key Milestones (Zone Starts & Bosses)
  const KEY_LEVELS = {
      // ZONE 1 (Outskirts)
      1:  L(1,  "Neon Breach",      "Link init.",            DISCIPLES.DECEIT, 25, 8000, 3),
      10: L(10, "Data Citadel",     "BOSS: Source.",         DISCIPLES.GREED,  35, 25000, 2),
      
      // ZONE 2 (Industrial)
      11: L(11, "Smog District",    "Signal block.",         DISCIPLES.GREED,  26, 20000, 3),
      20: L(20, "The Overseer",     "BOSS: Titan.",          DISCIPLES.WAR,    40, 50000, 2),

      // ZONE 3 (Eco-Sector)
      21: L(21, "Greenhouse",       "Vines.",                DISCIPLES.PLAGUE, 26, 45000, 3),
      30: L(30, "Hive Queen",       "BOSS: Mother.",         DISCIPLES.PLAGUE, 40, 75000, 2),

      // ZONE 4 (High-Tech)
      31: L(31, "Quantum Lab",      "Shift.",                DISCIPLES.DECEIT, 26, 70000, 3),
      40: L(40, "The Architect",    "BOSS: Master.",         DISCIPLES.DECEIT, 45, 100000, 2),

      // ZONE 5 (Core)
      41: L(41, "Lower City",       "Descent.",              DISCIPLES.GREED,  25, 95000, 2),
      50: L(50, "OMEGA",            "FINAL BOSS.",           DISCIPLES.WAR,    50, 150000, 2)
  };

  // Helper to pick a disciple for filler levels based on Zone Theme
  function getZoneDisciple(lvlId) {
      if (lvlId <= 10) return DISCIPLES.DECEIT; // Zone 1 Theme
      if (lvlId <= 20) return DISCIPLES.WAR;    // Zone 2 Theme
      if (lvlId <= 30) return DISCIPLES.PLAGUE; // Zone 3 Theme
      if (lvlId <= 40) return DISCIPLES.DECEIT; // Zone 4 Theme
      return DISCIPLES.WAR;                     // Zone 5 Theme
  }

  // --- GENERATOR LOOP ---
  const FINAL_LEVELS = [];

  for (let i = 1; i <= 50; i++) {
      if (KEY_LEVELS[i]) {
          // Use the explicit definition
          FINAL_LEVELS.push(KEY_LEVELS[i]);
      } else {
          // Generate Filler Level
          // HP Scaling: Interpolate between previous key and next key
          // Simple heuristic: Base HP + (Level * Multiplier)
          
          let hp = 8000 + ((i - 1) * 2000); // Linear scaling
          
          // Zone modifiers
          if(i > 20) hp += 10000;
          if(i > 40) hp += 20000;

          FINAL_LEVELS.push(L(
              i, 
              `Sector ${i}`, 
              "System intrusion.", 
              getZoneDisciple(i), 
              25, // Standard moves
              hp, 
              3   // Standard attack rate
          ));
      }
  }

  window.LEVELS = FINAL_LEVELS;
})();