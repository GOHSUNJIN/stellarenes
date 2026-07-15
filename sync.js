// ── Supabase sync ─────────────────────────────────────────────────────────
// Handles reading and writing unlocks to Supabase, and subscribing
// to realtime changes so all devices stay in sync automatically.

window.AppMethods = window.AppMethods || {};
Object.assign(window.AppMethods, {

  getDeviceId() { return 'renes'; },

  getSupabase() {
    if (this._sb) return this._sb;
    let url = '', key = '';
    try { url = typeof SUPABASE_URL !== 'undefined' ? SUPABASE_URL : ''; key = typeof SUPABASE_KEY !== 'undefined' ? SUPABASE_KEY : ''; } catch(e) {}
    if (!window.supabase || !url || !key || url.includes('your-project')) return null;
    this._sb = window.supabase.createClient(url, key);
    return this._sb;
  },

  syncFromSupabase() {
    const sb = this.getSupabase(); if (!sb) return;
    sb.from('unlocks').select('code, unlocked_at').eq('device_id', this.getDeviceId())
      .then(({ data, error }) => {
        if (error || !data) return;
        const unlocked = {};
        data.forEach(row => { unlocked[row.code] = new Date(row.unlocked_at).getTime(); });
        const allDone = this.DATA.every(e => (e.notes || []).some(n => unlocked[n.code]));
        if (allDone && !unlocked['forever']) unlocked['forever'] = true;
        this.save(unlocked);
        this.setState({ unlocked, finale: allDone });
      });
  },

  saveUnlockToSupabase(code, starId, starTitle) {
    const sb = this.getSupabase(); if (!sb) return;
    if (code[0] === '_') return;
    sb.from('unlocks')
      .upsert({ code, star_id: starId, star_title: starTitle, device_id: this.getDeviceId() }, { onConflict: 'code,device_id' })
      .then(({ error }) => { if (error) console.warn('Supabase save failed:', error.message); });
  },

  subscribeToRealtime() {
    const sb = this.getSupabase(); if (!sb) return;
    const did = this.getDeviceId();
    sb.channel('stellarenes-' + did)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'unlocks', filter: 'device_id=eq.' + did },
        () => this.syncFromSupabase())
      .subscribe();
  },

});
