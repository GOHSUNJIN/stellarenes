// ── Canvas & particles ─────────────────────────────────────────────────────
// Background star field, shooting stars, burst particles, and heart shower.

window.AppMethods = window.AppMethods || {};
Object.assign(window.AppMethods, {

  drawHeart(ctx, x, y, s, color) {
    ctx.save(); ctx.translate(x, y);
    const k = s / 16; ctx.scale(k, k); ctx.fillStyle = color;
    ctx.beginPath(); ctx.moveTo(0, 4);
    ctx.bezierCurveTo(-2, -2, -9, -1, -9, 4);
    ctx.bezierCurveTo(-9, 9, -2, 12, 0, 15);
    ctx.bezierCurveTo(2, 12, 9, 9, 9, 4);
    ctx.bezierCurveTo(9, -1, 2, -2, 0, 4);
    ctx.closePath(); ctx.fill(); ctx.restore();
  },

  heartShower() {
    const c = this.canvasEl; if (!c || !this.particles) return;
    const colors = ['#ff79b0', '#ff9ecb', '#ff5e9a', '#ffd1e6'];
    let n = 0;
    const fire = () => {
      const cc = this.canvasEl; if (!cc) return;
      const w = cc.width, h = cc.height;
      for (let i = 0; i < 22; i++) {
        this.particles.push({
          x: Math.random() * w, y: h + 10,
          vx: (Math.random() - .5) * 1.5 * this.dpr, vy: -(1.6 + Math.random() * 2.4) * this.dpr,
          life: 1, decay: .005 + Math.random() * .006,
          size: (6 + Math.random() * 8) * this.dpr,
          color: colors[Math.floor(Math.random() * colors.length)], heart: true
        });
      }
      n++; if (n < 7) setTimeout(fire, 170);
    };
    fire();
  },

  sizeCanvas() {
    const c = this.canvasEl; if (!c) return;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = c.clientWidth * this.dpr; c.height = c.clientHeight * this.dpr;
    this.makeStars();
  },

  makeStars() {
    const c = this.canvasEl; if (!c) return;
    const n = Math.round((c.width * c.height) / (14000 * this.dpr));
    this.stars = [];
    for (let i = 0; i < n; i++) {
      this.stars.push({
        x: Math.random() * c.width, y: Math.random() * c.height,
        r: (Math.random() * 1.3 + .3) * this.dpr,
        base: Math.random() * .5 + .15, amp: Math.random() * .4 + .2,
        tw: Math.random() * 2 + .5, ph: Math.random() * 6.28,
        vy: (Math.random() * .12 + .02) * this.dpr
      });
    }
    this._shoot = 0;
  },

  burstAt(id) {
    const el = document.querySelector('[data-orb="' + id + '"]'); const c = this.canvasEl;
    if (!el || !c || !this.particles) return;
    const r = el.getBoundingClientRect(), cr = c.getBoundingClientRect();
    const x = (r.left + r.width / 2 - cr.left) * this.dpr, y = (r.top + r.height / 2 - cr.top) * this.dpr;
    const color = ([...this.DATA, this.BDAY].find(e => e.id === id) || {}).color || '#fff';
    for (let i = 0; i < 78; i++) {
      const ang = Math.random() * 6.283, sp = (1 + Math.random() * 5.5) * this.dpr;
      this.particles.push({ x, y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, life: 1, decay: .008 + Math.random() * .02, size: (1 + Math.random() * 2.6) * this.dpr, color });
    }
  },

  celebrate() {
    const c = this.canvasEl; if (!c || !this.particles) return;
    const colors = this.DATA.map(e => e.color);
    let n = 0;
    const fire = () => {
      const cc = this.canvasEl; if (!cc) return;
      const w = cc.width;
      for (let i = 0; i < 46; i++) {
        this.particles.push({
          x: Math.random() * w, y: -10,
          vx: (Math.random() - .5) * 3 * this.dpr, vy: (1 + Math.random() * 3) * this.dpr,
          life: 1, decay: .004 + Math.random() * .006,
          size: (1.4 + Math.random() * 2.6) * this.dpr,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }
      n++; if (n < 10) setTimeout(fire, 150);
    };
    fire();
  },

});
