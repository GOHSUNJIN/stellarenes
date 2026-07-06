// ── Core app logic ─────────────────────────────────────────────────────────
// Lifecycle, persistence, data helpers, interaction, and render.
// Audio  → audio.js  |  Canvas/particles → canvas.js  |  Supabase → sync.js

window.AppMethods = window.AppMethods || {};
Object.assign(window.AppMethods, {

  // ── Persistence (localStorage as offline cache) ──────────────────────────
  load()      { try { return JSON.parse(localStorage.getItem('renes-gift-v2')) || {}; } catch(e) { return {}; } },
  save(u)     { try { localStorage.setItem('renes-gift-v2', JSON.stringify(u)); } catch(e) {} },
  loadMuted() { try { return localStorage.getItem('renes-muted') === '1'; } catch(e) { return false; } },

  // ── Gyroscope (iOS requires permission from a user gesture) ─────────────
  requestGyroscope() {
    if (typeof DeviceOrientationEvent === 'undefined' ||
        typeof DeviceOrientationEvent.requestPermission !== 'function') return;
    DeviceOrientationEvent.requestPermission()
      .then(s => { if (s === 'granted') window.addEventListener('deviceorientation', this._onOrient); })
      .catch(() => {});
  },

  // ── UI helpers ───────────────────────────────────────────────────────────
  showMilestone(txt) {
    clearTimeout(this._mt);
    this.setState({ milestone: txt });
    this._mt = setTimeout(() => this.setState({ milestone: '' }), 5000);
  },

  armIdle() {
    clearTimeout(this._idle);
    this._idle = setTimeout(() => {
      if (this.count() === 0 && !this.state.active && !this.state.showIntro)
        this.setState({ hintMsg: '✦ tap any star to see what it holds, or type a word' });
    }, 9000);
  },

  // ── Lifecycle ────────────────────────────────────────────────────────────
  componentDidMount() {
    this.particles = []; this._par = { x: 0, y: 0, tx: 0, ty: 0 };
    try { document.title = 'Stellarenes ✦'; } catch(e) {}
    try { this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch(e) { this.reduced = false; }

    this._onResize = () => {
      this.sizeCanvas();
      const wide = window.innerWidth >= 681;
      if (wide !== this.state.isWide) this.setState({ isWide: wide });
    };
    this._onMove = (e) => {
      const w = window.innerWidth || 1, h = window.innerHeight || 1;
      this._par.tx = (e.clientX / w - 0.5) * 16;
      this._par.ty = (e.clientY / h - 0.5) * 16;
    };
    this._onVisible = () => {
      if (document.visibilityState === 'visible' && !this.state.muted && this._actx) {
        try { this._actx.resume(); } catch(e) {}
        if (!this._amb) this.startAmbient();
      }
    };

    this._onOrient = (e) => {
      const g = e.gamma || 0, b = e.beta || 0;
      if (this._orientBase == null) this._orientBase = b;
      this._par.tx = Math.max(-12, Math.min(12, g * 0.35));
      this._par.ty = Math.max(-12, Math.min(12, (b - this._orientBase) * 0.25));
    };

    window.addEventListener('resize', this._onResize);
    if (!this.reduced) window.addEventListener('mousemove', this._onMove);
    document.addEventListener('visibilitychange', this._onVisible);
    // Non-iOS Android: attach gyroscope immediately (no permission needed)
    if (typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission !== 'function') {
      window.addEventListener('deviceorientation', this._onOrient);
    }
    this.syncFromSupabase();
    this.subscribeToRealtime();
  },

  componentWillUnmount() {
    window.removeEventListener('resize', this._onResize);
    window.removeEventListener('mousemove', this._onMove);
    if (this._onOrient) window.removeEventListener('deviceorientation', this._onOrient);
    if (this._onVisible) document.removeEventListener('visibilitychange', this._onVisible);
    this.stopAmbient();
    clearTimeout(this._idle); clearTimeout(this._mt); clearTimeout(this._ch); clearTimeout(this._hk); clearTimeout(this._sh);
    cancelAnimationFrame(this._raf);
    const sb = this.getSupabase(); if (sb) sb.removeAllChannels();
  },

  // ── Data helpers ─────────────────────────────────────────────────────────
  unlockedNotesFor(e) {
    if (!e || !e.notes) return [];
    if (e.id === 'playlist') return e.notes;
    return e.notes.filter(n => this.state.unlocked[n.code]);
  },
  foundTotal() { return this.DATA.reduce((a, e) => a + this.unlockedNotesFor(e).length, 0); },
  count()      { return this.DATA.filter(e => this.unlockedNotesFor(e).length > 0).length; },
  noteCount()  { const e = this.entryById(this.state.active); return this.unlockedNotesFor(e).length; },
  entryById(id) {
    if (id === 'birthday') return this.BDAY;
    if (id === 'egg')      return this.EGG;
    if (id === 'playlist') return this.PLAYLIST;
    return this.DATA.find(x => x.id === id);
  },

  // ── Interaction ──────────────────────────────────────────────────────────
  clickOrb(orb) {
    if (this.inputEl) this.inputEl.blur();
    if (orb.unlocked) {
      this.setState({ active: orb.id, noteIndex: 0 });
    } else {
      this.setState({ hintMsg: '✦ ' + orb.title + ', type its word to light it' });
      clearTimeout(this._hk); this._hk = setTimeout(() => this.setState({ hintMsg: '' }), 3400);
    }
  },

  stop(e) { e.stopPropagation(); },

  // ── Render ───────────────────────────────────────────────────────────────
  renderVals() {
    const count = this.count(), foundTotal = this.foundTotal(), total = this.DATA.length;
    const wide = this.state.isWide;

    // Star positions — spiral layout on wide screens, fixed positions on mobile
    const P = this.DATA.map((e, i) => {
      if (!wide) return { x: e.x, y: e.y };
      const t = i / (total - 1), ang = t * 1.75 * 2 * Math.PI + Math.PI * 0.1, rad = 0.32 + 0.68 * Math.pow(t, 0.85);
      return { x: Math.round((50 + 46 * rad * Math.cos(ang)) * 10) / 10, y: Math.round((50 + 40 * rad * Math.sin(ang)) * 10) / 10 };
    });
    this._P = P;

    // Orb objects for sc-for
    const orbs = this.DATA.map((e, i) => {
      const found = this.unlockedNotesFor(e).length, unlocked = found > 0;
      return {
        id: e.id, title: e.title, unlocked, locked: !unlocked, found,
        foundLabel: found > 1 ? (found + ' messages') : '',
        aria: unlocked ? e.title : 'a locked star',
        wrap:  { position: 'absolute', left: P[i].x + '%', top: P[i].y + '%', width: '52px', height: '52px', background: 'transparent', border: 0, padding: 0, cursor: 'pointer', '--c': e.color, '--lblo': '0', zIndex: 1, transition: 'filter .35s ease, transform .2s ease', animation: 'orbIn .9s cubic-bezier(.2,.8,.2,1) both', animationDelay: (i * .05) + 's' },
        hover: unlocked ? { '--lblo': '1', zIndex: 6, filter: 'brightness(1.4)', transform: 'translate(-50%,-50%) scale(1.08)' } : { '--lblo': '1', zIndex: 6, filter: 'brightness(1.35)' },
        onClick: () => this.clickOrb({ id: e.id, unlocked, title: e.title })
      };
    });

    // Active message card data
    let active = null;
    const id = this.state.active;
    if (id) {
      const e = this.entryById(id);
      if (e) {
        const notes = this.unlockedNotesFor(e), tot = notes.length, idx = tot ? ((this.state.noteIndex % tot) + tot) % tot : 0;
        const anim = (idx % 2) ? 'textRiseB' : 'textRise', note = notes[idx];
        const bodyLines = ((note && note.text) || '').split('\n');
        const _ts = note ? this.state.unlocked[note.code] : 0;
        const foundOn = (typeof _ts === 'number' && _ts > 0) ? ('Found ' + new Date(_ts).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })) : '';
        let spotify = '';
        if (id === 'playlist' && this.SPOTIFY) {
          const m = this.SPOTIFY.match(/playlist\/([a-zA-Z0-9]+)/); const pid = m ? m[1] : this.SPOTIFY;
          spotify = 'https://open.spotify.com/embed/playlist/' + pid + '?utm_source=generator&theme=0';
        }
        const codeLabel = id === 'birthday' ? e.codeLabel
          : id === 'playlist' ? 'a secret, saved for last'
          : (note && note.code[0] !== '_') ? 'woke to "' + note.code + '"'
          : '';
        active = {
          when: e.when, title: e.title, color: e.color, foundOn, spotify, hasSpotify: !!spotify,
          multi: tot > 1, counter: (idx + 1) + ' / ' + tot, codeLabel,
          prevNote: this.prevNote, nextNote: this.nextNote, shuffleNote: this.shuffleNote,
          lines: bodyLines.map((t, i) => ({
            text: t,
            style: { margin: '0 0 15px', fontFamily: "'Instrument Serif',serif", fontSize: 'clamp(20px,2.8vw,26px)', lineHeight: 1.55, color: 'rgba(238,234,250,.9)', opacity: 0, animation: anim + ' .7s cubic-bezier(.2,.8,.2,1) forwards', animationDelay: (.06 + i * .14) + 's' }
          }))
        };
      }
    }

    // Styles
    const cardColor     = active ? active.color : '#c4a9ff';
    const shareColor    = active ? active.color : '#c4a9ff';
    const progressPct   = total > 0 ? Math.round(count / total * 100) : 0;
    const inputStyle    = { width: 'min(56vw,300px)', height: '52px', padding: '0 22px', borderRadius: '40px', background: 'rgba(20,16,40,.6)', color: '#f0ecff', fontSize: '15px', letterSpacing: '.08em', textAlign: 'center', outline: 'none', border: '1px solid rgba(180,160,255,.25)', boxShadow: '0 0 22px rgba(120,90,220,.12)', transition: 'border-color .25s, box-shadow .25s' };
    const barStyle      = { display: 'flex', gap: '10px', alignItems: 'center' };
    const cardStyle     = { position: 'relative', background: 'linear-gradient(180deg,rgba(24,19,46,.97),rgba(12,10,26,.98))', border: '1px solid rgba(180,160,255,.16)', boxShadow: '0 30px 90px rgba(0,0,0,.6), 0 0 80px rgba(120,90,220,.18)', '--c': cardColor, animation: 'cardIn .6s cubic-bezier(.2,.85,.25,1) both' };
    const shareCardStyle = { position: 'relative', overflow: 'hidden', boxShadow: '0 40px 100px rgba(0,0,0,.85),0 0 0 1px rgba(255,255,255,.06)', '--share-c': shareColor };
    const progressBarStyle = { height: '100%', borderRadius: '1px', background: 'linear-gradient(90deg,#b69bff,#7c5cdc)', transition: 'width .8s cubic-bezier(.2,.8,.2,1)', width: progressPct + '%' };

    // Archive list
    const _found = [];
    this.DATA.forEach(e => {
      (e.notes || []).forEach(n => {
        const ts = this.state.unlocked[n.code];
        if (ts && n.code[0] !== '_') _found.push({ e, code: n.code, ts: typeof ts === 'number' ? ts : 0 });
      });
    });
    _found.sort((a, b) => a.ts - b.ts);
    const foundList = _found.map(f => {
      const un = this.unlockedNotesFor(f.e), idx = un.findIndex(x => x.code === f.code);
      const dateLabel = f.ts ? new Date(f.ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '';
      return {
        word: f.code, title: f.e.title, dateLabel,
        haloStyle: { position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: '20px', height: '20px', borderRadius: '50%', background: 'radial-gradient(circle,' + f.e.color + ',transparent 70%)', filter: 'blur(3px)', opacity: .65 },
        dotStyle:  { position: 'relative', width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0, background: f.e.color, boxShadow: '0 0 8px ' + f.e.color },
        onClick: () => this.setState({ active: f.e.id, noteIndex: idx < 0 ? 0 : idx, listOpen: false })
      };
    });

    return {
      // Counts & progress
      count, total, foundTotal, progressBarStyle,
      // Orbs
      orbs,
      // Modals
      modalOpen: !!active, active,
      shareOpen: this.state.shareOpen && !!active,
      listOpen:  this.state.listOpen,
      // Archive
      foundList, hasFound: foundList.length > 0, foundCount: foundList.length,
      // Special stars
      showCenter:   this.unlockedNotesFor(this.BDAY).length > 0,
      centerLocked: this.unlockedNotesFor(this.BDAY).length === 0,
      showPlaylist: total > 0 && count >= total,
      showEgg:      !!this.state.unlocked['forever'],
      // Styles
      inputStyle, barStyle, cardStyle, shareCardStyle,
      // State passthrough
      codeInput: this.state.codeInput,
      hintMsg:   this.state.hintMsg,
      muted:     this.state.muted,
      soundOn:   !this.state.muted,
      showIntro: this.state.showIntro,
      milestone: this.state.milestone,
      hasMilestone: !!this.state.milestone,
      muteLabel: this.state.muted ? 'Unmute music' : 'Mute music',
      copyLabel: this.state.copied ? 'copied ✓' : 'copy',
      // Handlers
      clickCenter:    this.clickCenter,
      openPlaylist:   this.openPlaylist,
      openEgg:        this.openEgg,
      openBday:       this.openBday,
      closeMessage:   this.closeMessage,
      openShare:      this.openShare,
      closeShare:     this.closeShare,
      toggleList:     this.toggleList,
      toggleMute:     this.toggleMute,
      dismissIntro:   this.dismissIntro,
      submit:         this.submit,
      onInput:        this.onInput,
      onKey:          this.onKey,
      onCardTouchStart: this.onCardTouchStart,
      onCardTouchEnd:   this.onCardTouchEnd,
      copyShareText:  this.copyShareText,
      stop:           this.stop,
      // Refs
      setCanvas:    this.setCanvas,
      setContainer: this.setContainer,
      setInput:     this.setInput,
      setIntro:     this.setIntro,
    };
  },

});
