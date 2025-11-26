/* levels.js — CALIBRATED (Lv1 = 12-15 Moves) */
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

  const LEVELS = [
    /* ZONE 1: OUTSKIRTS (4,500 - 10,000 HP) */
    L(1,  "Neon Breach",      "Link init.",            DISCIPLES.DECEIT, 25, 4500, 3),
    L(2,  "Sector V",         "Greed corrosion.",      DISCIPLES.GREED,  25, 5000, 3),
    L(3,  "Railyard",         "Poison seep.",          DISCIPLES.PLAGUE, 25, 5500, 3),
    L(4,  "The Barricades",   "Warpath.",              DISCIPLES.WAR,    25, 6000, 3),
    L(5,  "Midnight Port",    "Cold storage.",         DISCIPLES.DECEIT, 25, 6500, 3),
    L(6,  "Arcade Vault",     "Locked patterns.",      DISCIPLES.GREED,  24, 7500, 3),
    L(7,  "Sub-grid 7",       "Acceleration.",         DISCIPLES.PLAGUE, 24, 8500, 3),
    L(8,  "Military Relay",   "Relentless.",           DISCIPLES.WAR,    24, 9500, 3),
    L(9,  "Central Hub",      "Chaos engine.",         DISCIPLES.DECEIT, 24, 10500, 3),
    L(10, "Data Citadel",     "BOSS: Source.",         DISCIPLES.GREED,  35, 15000, 2), 

    /* ZONE 2: INDUSTRIAL (15,000 - 25,000 HP) */
    L(11, "Smog District",    "Signal block.",         DISCIPLES.GREED,  26, 16000, 3),
    L(12, "Foundry Gate",     "Molten wall.",          DISCIPLES.WAR,    26, 17000, 3),
    L(13, "Scrap Heap",       "Junk data.",            DISCIPLES.GREED,  26, 18000, 3),
    L(14, "Blast Furnace",    "Heat rising.",          DISCIPLES.WAR,    26, 19000, 3),
    L(15, "Assembly Line",    "Automated.",            DISCIPLES.GREED,  25, 20000, 3),
    L(16, "Core Vent",        "Critical temp.",        DISCIPLES.WAR,    25, 21000, 3),
    L(17, "Recycler",         "No waste.",             DISCIPLES.GREED,  25, 22000, 3),
    L(18, "Magma Chamber",    "Lava flow.",            DISCIPLES.WAR,    25, 23000, 3),
    L(19, "Factory Floor",    "Buffer overflow.",      DISCIPLES.GREED,  24, 24000, 3),
    L(20, "The Overseer",     "BOSS: Titan.",          DISCIPLES.WAR,    40, 30000, 2), 

    /* ZONE 3: ECO-SECTOR (26,000 - 35,000 HP) */
    L(21, "Greenhouse",       "Vines.",                DISCIPLES.PLAGUE, 26, 26000, 3),
    L(22, "Hydro-plant",      "Frozen.",               DISCIPLES.DECEIT, 26, 27000, 3),
    L(23, "Spore Cloud",      "No visibility.",        DISCIPLES.PLAGUE, 26, 28000, 3),
    L(24, "Cryo-Stasis",      "Freeze.",               DISCIPLES.DECEIT, 26, 29000, 3),
    L(25, "Root Network",     "Deep rot.",             DISCIPLES.PLAGUE, 25, 30000, 3),
    L(26, "Glass Gardens",    "Shattered.",            DISCIPLES.DECEIT, 25, 31000, 3),
    L(27, "Toxic Bloom",      "Spreading.",            DISCIPLES.PLAGUE, 25, 32000, 3),
    L(28, "Zero Kelvin",      "Absolute zero.",        DISCIPLES.DECEIT, 24, 33000, 3),
    L(29, "Elder Tree",       "Ancient virus.",        DISCIPLES.PLAGUE, 24, 34000, 3),
    L(30, "Hive Queen",       "BOSS: Mother.",         DISCIPLES.PLAGUE, 40, 40000, 2), 

    /* ZONE 4: HIGH-TECH (35,000 - 50,000 HP) */
    L(31, "Quantum Lab",      "Shift.",                DISCIPLES.DECEIT, 26, 36000, 3),
    L(32, "Server Farm",      "Overheat.",             DISCIPLES.WAR,    26, 37000, 3),
    L(33, "Mirror Room",      "False signals.",        DISCIPLES.DECEIT, 25, 38000, 3),
    L(34, "Particle Beam",    "Precision.",            DISCIPLES.WAR,    25, 39000, 3),
    L(35, "Holo-Deck",        "Illusions.",            DISCIPLES.DECEIT, 24, 40000, 3),
    L(36, "Fusion Reactor",   "Unstable.",             DISCIPLES.WAR,    24, 42000, 3),
    L(37, "Cold Storage",     "Preservation.",         DISCIPLES.DECEIT, 24, 44000, 3),
    L(38, "Red Alert",        "Breach.",               DISCIPLES.WAR,    22, 46000, 3),
    L(39, "Deep Mind",        "Knowing.",              DISCIPLES.DECEIT, 22, 48000, 3),
    L(40, "The Architect",    "BOSS: Master.",         DISCIPLES.DECEIT, 45, 55000, 2), 

    /* ZONE 5: CORE (55,000 - 80,000 HP) */
    L(41, "Lower City",       "Descent.",              DISCIPLES.GREED,  25, 55000, 2),
    L(42, "Traffic Grid",     "Gridlock.",             DISCIPLES.WAR,    25, 57000, 2),
    L(43, "Sewers",           "Toxic waste.",          DISCIPLES.PLAGUE, 25, 60000, 2),
    L(44, "Subway",           "Derailment.",           DISCIPLES.WAR,    24, 62000, 2),
    L(45, "Data Stream",      "Fast flow.",            DISCIPLES.DECEIT, 24, 65000, 2),
    L(46, "Firewall",         "Burn it down.",         DISCIPLES.WAR,    24, 67000, 2),
    L(47, "Virus Vault",      "Contagion.",            DISCIPLES.PLAGUE, 24, 70000, 2),
    L(48, "Logic Core",       "Pure math.",            DISCIPLES.DECEIT, 22, 72000, 2),
    L(49, "The Throne",       "The end.",              DISCIPLES.GREED,  22, 75000, 2),
    L(50, "OMEGA",            "FINAL BOSS.",           DISCIPLES.WAR,    50, 90000, 2), 
  ];

  window.LEVELS = LEVELS;
})();