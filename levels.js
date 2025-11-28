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

  // Key Levels
  const KEY_LEVELS = {
      1:  L(1,  "Neon Breach",      "Link init.",            DISCIPLES.DECEIT, 25, 8000, 3),
      10: L(10, "Data Citadel",     "BOSS: Source.",         DISCIPLES.GREED,  35, 25000, 2),
      20: L(20, "The Overseer",     "BOSS: Titan.",          DISCIPLES.WAR,    40, 50000, 2),
      30: L(30, "Hive Queen",       "BOSS: Mother.",         DISCIPLES.PLAGUE, 40, 75000, 2),
      40: L(40, "The Architect",    "BOSS: Master.",         DISCIPLES.DECEIT, 45, 100000, 2),
      50: L(50, "OMEGA",            "FINAL BOSS.",           DISCIPLES.WAR,    50, 150000, 2)
  };

  function getZoneDisciple(lvlId) {
      if (lvlId <= 10) return DISCIPLES.DECEIT;
      if (lvlId <= 20) return DISCIPLES.WAR;
      if (lvlId <= 30) return DISCIPLES.PLAGUE;
      if (lvlId <= 40) return DISCIPLES.DECEIT;
      return DISCIPLES.WAR;
  }

  // Generator
  const FINAL_LEVELS = [];
  for (let i = 1; i <= 50; i++) {
      if (KEY_LEVELS[i]) {
          FINAL_LEVELS.push(KEY_LEVELS[i]);
      } else {
          // HP Scaling: 8000 base + 2000 per level
          let hp = 8000 + ((i - 1) * 2000);
          if(i > 20) hp += 10000; // Difficulty bump
          
          FINAL_LEVELS.push(L(i, `Sector ${i}`, "System intrusion.", getZoneDisciple(i), 25, hp, 3));
      }
  }

  window.LEVELS = FINAL_LEVELS;
})();