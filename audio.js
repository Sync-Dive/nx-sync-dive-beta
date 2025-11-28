/* audio.js — PROCEDURAL WEB AUDIO SYNTHESIZER */
(function() {
    const AudioSys = {
        ctx: null,
        muted: localStorage.getItem("nx_muted") === "true",
        bgmOscillators: [],
        bgmInterval: null,

        init() {
            try {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                this.ctx = new AudioContext();
                this.updateMuteState();
            } catch (e) {
                console.warn("Web Audio API not supported");
            }
        },

        // --- SYNTHESIS ENGINE ---
        playTone(freq, type, duration, vol = 0.1, slide = 0) {
            if (this.muted || !this.ctx) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = type; // 'sine', 'square', 'sawtooth', 'triangle'
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
            if (slide !== 0) {
                osc.frequency.exponentialRampToValueAtTime(freq + slide, this.ctx.currentTime + duration);
            }

            gain.gain.setValueAtTime(vol, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        },

        playNoise(duration, vol = 0.2) {
            if (this.muted || !this.ctx) return;
            const bufferSize = this.ctx.sampleRate * duration;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }

            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;
            const gain = this.ctx.createGain();
            
            // Bandpass filter for "Explosion" sound
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 1000;

            gain.gain.setValueAtTime(vol, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);
            noise.start();
        },

        // --- SFX PRESETS ---
        play(key) {
            if (this.muted || !this.ctx) return;
            // Resume context if browser suspended it (common policy)
            if (this.ctx.state === 'suspended') this.ctx.resume();

            switch (key) {
                case 'swap':
                    // High tech blip
                    this.playTone(800, 'sine', 0.1, 0.1, -400);
                    break;
                case 'match':
                    // Pleasant chime chord
                    this.playTone(440, 'triangle', 0.3, 0.1);
                    setTimeout(() => this.playTone(554, 'triangle', 0.3, 0.1), 50);
                    setTimeout(() => this.playTone(659, 'triangle', 0.3, 0.1), 100);
                    break;
                case 'cast':
                    // Power up sweep
                    this.playTone(200, 'sawtooth', 0.5, 0.1, 800);
                    break;
                case 'warning':
                    // Alarm siren
                    this.playTone(150, 'square', 0.4, 0.15);
                    setTimeout(() => this.playTone(100, 'square', 0.4, 0.15), 200);
                    break;
                case 'win':
                    // Victory fanfare
                    [523, 659, 783, 1046].forEach((f, i) => {
                        setTimeout(() => this.playTone(f, 'square', 0.4, 0.1), i * 150);
                    });
                    break;
                case 'lose':
                    // Sad drone
                    this.playTone(150, 'sawtooth', 1.0, 0.2, -50);
                    this.playTone(145, 'sawtooth', 1.0, 0.2, -50);
                    break;
                default:
                    // Generic click
                    this.playTone(300, 'sine', 0.05, 0.05);
            }
        },

        // --- PROCEDURAL BGM (Dark Ambient Drone) ---
        playBGM(key) {
            if (this.muted || !this.ctx) return;
            this.stopBGM(); // clear old

            // We will create a dark drone using 2 oscillators
            const osc1 = this.ctx.createOscillator();
            const osc2 = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            // Frequencies for C Minor Drone
            const root = key === 'bgm_battle' ? 130.81 : 65.41; // Higher for battle
            
            osc1.frequency.value = root;
            osc1.type = 'sawtooth';
            
            osc2.frequency.value = root * 1.5; // Fifth
            osc2.type = 'triangle';

            // LFO for movement
            const lfo = this.ctx.createOscillator();
            lfo.frequency.value = 0.1; // Slow pulse
            const lfoGain = this.ctx.createGain();
            lfoGain.gain.value = 500; // Filter sweep amount
            
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 600;

            // Routing
            osc1.connect(filter);
            osc2.connect(filter);
            lfo.connect(lfoGain);
            lfoGain.connect(filter.frequency);
            filter.connect(gain);
            gain.connect(this.ctx.destination);

            // Volume
            gain.gain.setValueAtTime(0, this.ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.05, this.ctx.currentTime + 2); // Fade in

            osc1.start();
            osc2.start();
            lfo.start();

            this.bgmOscillators = [osc1, osc2, lfo];
        },

        stopBGM() {
            if (this.bgmOscillators.length) {
                this.bgmOscillators.forEach(o => {
                    try { o.stop(); } catch(e){}
                });
                this.bgmOscillators = [];
            }
        },

        toggleMute() {
            this.muted = !this.muted;
            localStorage.setItem("nx_muted", this.muted);
            this.updateMuteState();
            
            if (this.muted) {
                if (this.ctx) this.ctx.suspend();
                this.stopBGM();
            } else {
                if (this.ctx) this.ctx.resume();
                // If in game, restart battle theme, else map theme
                const isGame = window.location.pathname.includes("game.html");
                this.playBGM(isGame ? 'bgm_battle' : 'bgm_map');
            }
            return this.muted;
        },

        updateMuteState() {
            const btn = document.getElementById("mute-btn");
            if (btn) {
                btn.textContent = this.muted ? "🔇" : "🔊";
                btn.style.opacity = this.muted ? "0.5" : "1";
            }
        }
    };

    window.AudioSys = AudioSys;
    AudioSys.init();
})();