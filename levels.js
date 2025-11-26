/* levels.js — REBALANCED DIFFICULTY (Bosses are tougher) */
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
    /* ZONE 1: OUTSKIRTS */
    L(1,  "Neon Breach",      "Link init.",            DISCIPLES.DECEIT, 30, 600,  3),
    L(2,  "Sector V",         "Greed corrosion.",      DISCIPLES.GREED,  28, 650,  3),
    L(3,  "Railyard",         "Poison seep.",          DISCIPLES.PLAGUE, 28, 700,  3),
    L(4,  "The Barricades",   "Warpath.",              DISCIPLES.WAR,    28, 750,  3),
    L(5,  "Midnight Port",    "Cold storage.",         DISCIPLES.DECEIT, 26, 800,  3),
    L(6,  "Arcade Vault",     "Locked patterns.",      DISCIPLES.GREED,  26, 900,  3),
    L(7,  "Sub-grid 7",       "Acceleration.",         DISCIPLES.PLAGUE, 25, 1000, 3),
    L(8,  "Military Relay",   "Relentless.",           DISCIPLES.WAR,    25, 1100, 3),
    L(9,  "Central Hub",      "Chaos engine.",         DISCIPLES.DECEIT, 25, 1200, 3),
    /* BOSS 1: BUFFED TO 2200 HP */
    L(10, "Data Citadel",     "BOSS: Source.",         DISCIPLES.GREED,  40, 2200, 2), 

    /* ZONE 2: INDUSTRIAL */
    L(11, "Smog District",    "Signal block.",         DISCIPLES.GREED,  28, 1300, 3),
    L(12, "Foundry Gate",     "Molten wall.",          DISCIPLES.WAR,    28, 1400, 3),
    L(13, "Scrap Heap",       "Junk data.",            DISCIPLES.GREED,  26, 1500, 3),
    L(14, "Blast Furnace",    "Heat rising.",          DISCIPLES.WAR,    26, 1600, 3),
    L(15, "Assembly Line",    "Automated.",            DISCIPLES.GREED,  25, 1700, 3),
    L(16, "Core Vent",        "Critical temp.",        DISCIPLES.WAR,    25, 1800, 3),
    L(17, "Recycler",         "No waste.",             DISCIPLES.GREED,  24, 1900, 3),
    L(18, "Magma Chamber",    "Lava flow.",            DISCIPLES.WAR,    24, 2000, 3),
    L(19, "Factory Floor",    "Buffer overflow.",      DISCIPLES.GREED,  24, 2100, 3),
    /* BOSS 2: BUFFED TO 3200 HP */
    L(20, "The Overseer",     "BOSS: Titan.",          DISCIPLES.WAR,    40, 3200, 2), 

    /* ZONE 3: ECO-SECTOR */
    L(21, "Greenhouse",       "Vines.",                DISCIPLES.PLAGUE, 28, 2200, 3),
    L(22, "Hydro-plant",      "Frozen.",               DISCIPLES.DECEIT, 28, 2300, 3),
    L(23, "Spore Cloud",      "No visibility.",        DISCIPLES.PLAGUE, 26, 2400, 3),
    L(24, "Cryo-Stasis",      "Freeze.",               DISCIPLES.DECEIT, 26, 2500, 3),
    L(25, "Root Network",     "Deep rot.",             DISCIPLES.PLAGUE, 25, 2600, 3),
    L(26, "Glass Gardens",    "Shattered.",            DISCIPLES.DECEIT, 25, 2700, 3),
    L(27, "Toxic Bloom",      "Spreading.",            DISCIPLES.PLAGUE, 24, 2800, 3),
    L(28, "Zero Kelvin",      "Absolute zero.",        DISCIPLES.DECEIT, 24, 2900, 3),
    L(29, "Elder Tree",       "Ancient virus.",        DISCIPLES.PLAGUE, 24, 3000, 3),
    /* BOSS 3: BUFFED TO 4200 HP */
    L(30, "Hive Queen",       "BOSS: Mother.",         DISCIPLES.PLAGUE, 40, 4200, 2), 

    /* ZONE 4: HIGH-TECH */
    L(31, "Quantum Lab",      "Shift.",                DISCIPLES.DECEIT, 26, 3100, 3),
    L(32, "Server Farm",      "Overheat.",             DISCIPLES.WAR,    26, 3200, 3),
    L(33, "Mirror Room",      "False signals.",        DISCIPLES.DECEIT, 25, 3300, 3),
    L(34, "Particle Beam",    "Precision.",            DISCIPLES.WAR,    25, 3400, 3),
    L(35, "Holo-Deck",        "Illusions.",            DISCIPLES.DECEIT, 24, 3500, 3),
    L(36, "Fusion Reactor",   "Unstable.",             DISCIPLES.WAR,    24, 3600, 3),
    L(37, "Cold Storage",     "Preservation.",         DISCIPLES.DECEIT, 22, 3700, 3),
    L(38, "Red Alert",        "Breach.",               DISCIPLES.WAR,    22, 3800, 3),
    L(39, "Deep Mind",        "Knowing.",              DISCIPLES.DECEIT, 22, 3900, 3),
    /* BOSS 4: BUFFED TO 5000 HP */
    L(40, "The Architect",    "BOSS: Master.",         DISCIPLES.DECEIT, 40, 5000, 2), 

    /* ZONE 5: CORE */
    L(41, "Lower City",       "Descent.",              DISCIPLES.GREED,  25, 4100, 2),
    L(42, "Traffic Grid",     "Gridlock.",             DISCIPLES.WAR,    25, 4200, 2),
    L(43, "Sewers",           "Toxic waste.",          DISCIPLES.PLAGUE, 25, 4300, 2),
    L(44, "Subway",           "Derailment.",           DISCIPLES.WAR,    24, 4400, 2),
    L(45, "Data Stream",      "Fast flow.",            DISCIPLES.DECEIT, 24, 4500, 2),
    L(46, "Firewall",         "Burn it down.",         DISCIPLES.WAR,    24, 4600, 2),
    L(47, "Virus Vault",      "Contagion.",            DISCIPLES.PLAGUE, 22, 4700, 2),
    L(48, "Logic Core",       "Pure math.",            DISCIPLES.DECEIT, 22, 4800, 2),
    L(49, "The Throne",       "The end.",              DISCIPLES.GREED,  22, 4900, 2),
    /* FINAL BOSS: 6000 HP (Challenging but possible) */
    L(50, "OMEGA",            "FINAL BOSS.",           DISCIPLES.WAR,    45, 6000, 2), 
  ];

  window.LEVELS = LEVELS;
})();