/* economy.js — STRICT CAP (MAX 10) */
(function () {
  const LS = {
    energy: "nx_energy",
    lastEnergyAt: "nx_last_energy_timestamp",
    prisma: "nx_prisma",
    aurum: "nx_aurum",
    lastLogin: "nx_last_login_date"
  };

  const economy = {
    maxEnergy: 10,       
    regenMinutes: 6,     
    levelCost: 1,
    prismaToEnergyCost: 50,
    aurumToPrismaRate: 100,
    adWatchReward: 3,
    dailyLoginAurum: 3,

    LS_KEYS: LS,

    // --- GETTERS ---
    getEnergy() { return parseInt(localStorage.getItem(LS.energy) || "10", 10); },
    getPrisma() { return parseInt(localStorage.getItem(LS.prisma) || "0", 10); },
    getAurum() { return parseInt(localStorage.getItem(LS.aurum) || "0", 10); },

    // --- SETTERS ---
    setEnergy(n) {
      // STRICT CAP: Never go below 0, never go above maxEnergy
      const val = Math.max(0, Math.min(this.maxEnergy, n));
      localStorage.setItem(LS.energy, String(val));
      
      // If full, reset the regen timer timestamp so it doesn't "accumulate" time
      if (val >= this.maxEnergy) {
        localStorage.setItem(LS.lastEnergyAt, String(Date.now()));
      }
    },

    // --- CORE ACTIONS ---
    addPrisma(n) { 
        localStorage.setItem(LS.prisma, String(this.getPrisma() + n)); 
    },
    
    addAurum(n) { 
        localStorage.setItem(LS.aurum, String(this.getAurum() + n)); 
    },

    addEnergy(n) {
      const e = this.getEnergy();
      // FIX: Strict Cap applied here. 
      // Previously: Math.min(this.maxEnergy * 2, e + n);
      // Now: Math.min(this.maxEnergy, e + n);
      const newVal = Math.min(this.maxEnergy, e + n);
      
      this.setEnergy(newVal);
    },

    spendPrisma(n) {
      const cur = this.getPrisma();
      if (cur < n) return false;
      localStorage.setItem(LS.prisma, String(cur - n));
      return true;
    },

    spendAurum(n) {
      const cur = this.getAurum();
      if (cur < n) return false;
      localStorage.setItem(LS.aurum, String(cur - n));
      return true;
    },

    spendEnergyForLevel() {
      this.regenerateEnergy(); // Check for regen first
      const e = this.getEnergy();
      if (e < this.levelCost) return false;
      
      // We use setEnergy to ensure strict bounds, though subtraction is safe here
      this.setEnergy(e - this.levelCost);
      return true;
    },

    // --- SHOP ACTIONS ---
    buyEnergyWithPrisma() {
      // Check if full first to avoid wasting currency
      if (this.getEnergy() >= this.maxEnergy) return false;

      if (this.spendPrisma(this.prismaToEnergyCost)) {
        this.addEnergy(1);
        return true;
      }
      return false;
    },

    watchAdForEnergy() {
      if (this.getEnergy() >= this.maxEnergy) return false;
      this.addEnergy(this.adWatchReward);
      return true;
    },

    exchangeAurumToPrisma() {
      if (this.spendAurum(1)) {
        this.addPrisma(this.aurumToPrismaRate);
        return true;
      }
      return false;
    },

    // --- INIT & REGEN ---
    init() {
      if (!localStorage.getItem(LS.energy)) localStorage.setItem(LS.energy, String(this.maxEnergy));
      if (!localStorage.getItem(LS.prisma)) localStorage.setItem(LS.prisma, "100");
      if (!localStorage.getItem(LS.aurum))  localStorage.setItem(LS.aurum, "0");
      if (!localStorage.getItem(LS.lastEnergyAt)) localStorage.setItem(LS.lastEnergyAt, String(Date.now()));

      this.regenerateEnergy();
      this.checkDailyLogin();
    },

    regenerateEnergy() {
      let cur = this.getEnergy();
      if (cur >= this.maxEnergy) {
        // If full, keep timestamp current so we don't regen immediately upon spending
        localStorage.setItem(LS.lastEnergyAt, String(Date.now()));
        return;
      }
      
      const last = parseInt(localStorage.getItem(LS.lastEnergyAt) || "0", 10);
      const now = Date.now();
      const diff = now - last;
      const msPerEnergy = this.regenMinutes * 60 * 1000;

      if (diff >= msPerEnergy) {
        const gained = Math.floor(diff / msPerEnergy);
        const newTotal = Math.min(this.maxEnergy, cur + gained);
        this.setEnergy(newTotal);
        
        // Keep the remainder time
        const remainder = diff % msPerEnergy;
        localStorage.setItem(LS.lastEnergyAt, String(now - remainder));
      }
    },

    checkDailyLogin() {
      const lastDate = localStorage.getItem(LS.lastLogin);
      const today = new Date().toDateString();
      if (lastDate !== today) {
        this.addAurum(this.dailyLoginAurum);
        localStorage.setItem(LS.lastLogin, today);
        setTimeout(() => {
            if(window.alert) alert(`DAILY LOGIN: +${this.dailyLoginAurum} Aurum!`);
        }, 500);
      }
    }
  };

  window.economy = economy;
  economy.init();
})();