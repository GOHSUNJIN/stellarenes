// ── Audio engine ───────────────────────────────────────────────────────────
// Web Audio API tone generation and the ambient music player (music.mp3).

window.AppMethods = window.AppMethods || {};
Object.assign(window.AppMethods, {

  initAudio() {
    if (this._actx) return this._actx;
    try { this._actx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) { this._actx = null; }
    return this._actx;
  },

  playTones(freqs, opts) {
    if (this.state.muted) return;
    const ac = this.initAudio(); if (!ac) return;
    if (ac.state === 'suspended') { try { ac.resume(); } catch(e) {} }
    const now = ac.currentTime, stagger = (opts && opts.stagger) || 0.08, warm = opts && opts.warm, peak = (opts && opts.peak) || 0.15;
    freqs.forEach((f, i) => {
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = warm ? 'triangle' : 'sine';
      o.frequency.value = f;
      const t = now + i * stagger;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(peak, t + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
      o.connect(g); g.connect(ac.destination);
      o.start(t); o.stop(t + 1.2);
    });
  },

  playUnlock()   { this.playTones([659.25, 987.77, 1318.5],           { stagger: 0.06, peak: 0.12 }); },
  playBirthday() { this.playTones([523.25, 659.25, 783.99, 1046.5, 1318.5], { stagger: 0.11, warm: true, peak: 0.16 }); },
  playError()    { this.playTones([220, 185],                          { stagger: 0.04, peak: 0.07 }); },

  startAmbient() {
    if (this.state.muted || this._amb) return;
    const ac = this.initAudio(); if (!ac) return;
    if (!this._audio) {
      this._audio = new Audio();
      this._audio.loop = true;
      this._audio.src = './music.mp3';
    }
    const doPlay = () => {
      if (!this._ambGain) {
        try {
          const src = ac.createMediaElementSource(this._audio);
          this._ambGain = ac.createGain();
          src.connect(this._ambGain); this._ambGain.connect(ac.destination);
        } catch(e) { return; }
      }
      try { this._ambGain.gain.cancelScheduledValues(0); } catch(e) {}
      this._ambGain.gain.setValueAtTime(0.0001, ac.currentTime);
      this._ambGain.gain.exponentialRampToValueAtTime(this.state.active ? 0.15 : 0.55, ac.currentTime + 4);
      this._amb = true;
      // Only call play() if actually paused — avoids iOS restrictions on
      // calling play() repeatedly on a Web Audio connected element
      if (this._audio.paused) {
        this._audio.play().catch(() => { this._amb = null; });
      }
    };
    if (ac.state === 'suspended') {
      ac.resume().then(doPlay).catch(() => {});
    } else {
      doPlay();
    }
  },

  _setGain(target, tc) {
    if (!this._ambGain || !this._actx) return;
    try { this._ambGain.gain.cancelScheduledValues(0); this._ambGain.gain.setTargetAtTime(target, this._actx.currentTime, tc); } catch(e) {}
  },

  stopAmbient() {
    if (!this._amb) return;
    this._amb = null;
    this._setGain(0.0001, 0.8);
    // Never pause the audio element — silencing via gain is enough.
    // Pausing then re-playing a Web Audio connected element on iOS often fails silently.
  },

  duckAmbient()   { if (!this._amb) return; this._setGain(0.12, 0.6); },
  unduckAmbient() { if (!this._amb) return; this._setGain(0.55, 0.8); },

});
