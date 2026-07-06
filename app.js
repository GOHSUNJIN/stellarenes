// ── App logic — mixed into Component.prototype at the bottom of index.html ──
// Regular (non-arrow) methods live here. Arrow methods that need a bound
// `this` stay as class fields inside the DC script in index.html.

window.AppMethods = {

  // ── Persistence (localStorage as offline cache) ──────────────────────────
  load()      { try{ return JSON.parse(localStorage.getItem('renes-gift-v2'))||{}; }catch(e){ return {}; } },
  save(u)     { try{ localStorage.setItem('renes-gift-v2', JSON.stringify(u)); }catch(e){} },
  loadMuted() { try{ return localStorage.getItem('renes-muted')==='1'; }catch(e){ return false; } },

  showMilestone(txt){
    clearTimeout(this._mt);
    this.setState({milestone:txt});
    this._mt=setTimeout(()=>this.setState({milestone:''}),5000);
  },
  armIdle(){
    clearTimeout(this._idle);
    this._idle=setTimeout(()=>{
      if(this.count()===0 && !this.state.active && !this.state.showIntro)
        this.setState({hintMsg:'✦ tap any star to see what it holds, or type a word'});
    }, 9000);
  },

  // ── Supabase ─────────────────────────────────────────────────────────────
  getDeviceId(){ return 'renes'; },
  getSupabase(){
    if(this._sb) return this._sb;
    let url='', key='';
    try{ url=typeof SUPABASE_URL!=='undefined'?SUPABASE_URL:''; key=typeof SUPABASE_KEY!=='undefined'?SUPABASE_KEY:''; }catch(e){}
    if(!window.supabase||!url||!key||url.includes('your-project')) return null;
    this._sb=window.supabase.createClient(url, key);
    return this._sb;
  },
  syncFromSupabase(){
    const sb=this.getSupabase(); if(!sb) return;
    sb.from('unlocks').select('code, unlocked_at').eq('device_id',this.getDeviceId()).then(({data,error})=>{
      if(error||!data) return;
      const unlocked={};
      data.forEach(row=>{ unlocked[row.code]=new Date(row.unlocked_at).getTime(); });
      const allDone=this.DATA.every(e=>(e.notes||[]).some(n=>unlocked[n.code]));
      if(allDone) unlocked['_complete']=true;
      this.save(unlocked);
      this.setState({ unlocked, finale:!!unlocked['_complete'] });
    });
  },
  saveUnlockToSupabase(code, starId, starTitle){
    const sb=this.getSupabase(); if(!sb) return;
    if(code[0]==='_') return;
    sb.from('unlocks')
      .upsert({ code, star_id:starId, star_title:starTitle, device_id:this.getDeviceId() }, { onConflict:'code,device_id' })
      .then(({error})=>{ if(error) console.warn('Supabase save failed:', error.message); });
  },
  subscribeToRealtime(){
    const sb=this.getSupabase(); if(!sb) return;
    const did=this.getDeviceId();
    sb.channel('stellarenes-'+did)
      .on('postgres_changes',{ event:'*', schema:'public', table:'unlocks', filter:'device_id=eq.'+did },
        ()=>this.syncFromSupabase())
      .subscribe();
  },

  // ── Audio engine ─────────────────────────────────────────────────────────
  initAudio(){
    if(this._actx) return this._actx;
    try{ this._actx=new (window.AudioContext||window.webkitAudioContext)(); }catch(e){ this._actx=null; }
    return this._actx;
  },
  playTones(freqs,opts){
    if(this.state.muted) return;
    const ac=this.initAudio(); if(!ac) return;
    if(ac.state==='suspended'){ try{ac.resume();}catch(e){} }
    const now=ac.currentTime, st=(opts&&opts.stagger)||0.08, warm=opts&&opts.warm, peak=(opts&&opts.peak)||0.15;
    freqs.forEach((f,i)=>{
      const o=ac.createOscillator(), g=ac.createGain();
      o.type=warm?'triangle':'sine'; o.frequency.value=f;
      const t=now+i*st;
      g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(peak,t+0.03); g.gain.exponentialRampToValueAtTime(0.0001,t+1.1);
      o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t+1.2);
    });
  },
  playUnlock()  { this.playTones([659.25,987.77,1318.5],{stagger:0.06,peak:0.12}); },
  playBirthday(){ this.playTones([523.25,659.25,783.99,1046.5,1318.5],{stagger:0.11,warm:true,peak:0.16}); },
  startAmbient(){
    if(this.state.muted||this._amb) return;
    const ac=this.initAudio(); if(!ac) return;
    if(ac.state==='suspended'){ try{ac.resume();}catch(e){} }
    if(!this._audio){
      this._audio=new Audio();
      this._audio.loop=true;
      this._audio.src='./music.mp3';
    }
    if(!this._ambGain){
      try{
        const src=ac.createMediaElementSource(this._audio);
        this._ambGain=ac.createGain();
        src.connect(this._ambGain); this._ambGain.connect(ac.destination);
      }catch(e){ return; }
    }
    try{ this._ambGain.gain.cancelScheduledValues(0); }catch(e){}
    this._ambGain.gain.setValueAtTime(0.0001,ac.currentTime);
    this._ambGain.gain.exponentialRampToValueAtTime(0.55,ac.currentTime+4);
    this._amb=true;
    this._audio.play().catch(()=>{ this._amb=null; });
  },
  stopAmbient(){
    if(!this._amb) return; this._amb=null;
    if(this._ambGain&&this._actx){
      try{ this._ambGain.gain.cancelScheduledValues(0); this._ambGain.gain.setTargetAtTime(0.0001,this._actx.currentTime,0.8); }catch(e){}
    }
    setTimeout(()=>{ try{ if(this._audio) this._audio.pause(); }catch(e){} },2000);
  },

  // ── Canvas & particles ───────────────────────────────────────────────────
  drawHeart(ctx,x,y,s,color){
    ctx.save(); ctx.translate(x,y); const k=s/16; ctx.scale(k,k); ctx.fillStyle=color;
    ctx.beginPath(); ctx.moveTo(0,4); ctx.bezierCurveTo(-2,-2,-9,-1,-9,4); ctx.bezierCurveTo(-9,9,-2,12,0,15);
    ctx.bezierCurveTo(2,12,9,9,9,4); ctx.bezierCurveTo(9,-1,2,-2,0,4); ctx.closePath(); ctx.fill(); ctx.restore();
  },
  heartShower(){
    const c=this.canvasEl; if(!c||!this.particles) return;
    const colors=['#ff79b0','#ff9ecb','#ff5e9a','#ffd1e6']; let n=0;
    const fire=()=>{
      const cc=this.canvasEl; if(!cc) return;
      const w=cc.width, h=cc.height;
      for(let i=0;i<22;i++){
        this.particles.push({ x:Math.random()*w, y:h+10, vx:(Math.random()-.5)*1.5*this.dpr, vy:-(1.6+Math.random()*2.4)*this.dpr, life:1, decay:.005+Math.random()*.006, size:(6+Math.random()*8)*this.dpr, color:colors[Math.floor(Math.random()*colors.length)], heart:true });
      }
      n++; if(n<7) setTimeout(fire,170);
    };
    fire();
  },
  sizeCanvas(){
    const c=this.canvasEl; if(!c) return;
    this.dpr=Math.min(window.devicePixelRatio||1,2);
    c.width=c.clientWidth*this.dpr; c.height=c.clientHeight*this.dpr;
    this.makeStars();
  },
  makeStars(){
    const c=this.canvasEl; if(!c) return;
    const n=Math.round((c.width*c.height)/(14000*this.dpr));
    this.stars=[];
    for(let i=0;i<n;i++){
      this.stars.push({ x:Math.random()*c.width, y:Math.random()*c.height, r:(Math.random()*1.3+.3)*this.dpr, base:Math.random()*.5+.15, amp:Math.random()*.4+.2, tw:Math.random()*2+.5, ph:Math.random()*6.28, vy:(Math.random()*.12+.02)*this.dpr });
    }
    this._shoot=0;
  },
  burstAt(id){
    const el=document.querySelector('[data-orb="'+id+'"]'); const c=this.canvasEl;
    if(!el||!c||!this.particles) return;
    const r=el.getBoundingClientRect(), cr=c.getBoundingClientRect();
    const x=(r.left+r.width/2-cr.left)*this.dpr, y=(r.top+r.height/2-cr.top)*this.dpr;
    const color=([...this.DATA,this.BDAY].find(e=>e.id===id)||{}).color||'#fff';
    for(let i=0;i<78;i++){
      const ang=Math.random()*6.283, sp=(1+Math.random()*5.5)*this.dpr;
      this.particles.push({ x,y, vx:Math.cos(ang)*sp, vy:Math.sin(ang)*sp, life:1, decay:.008+Math.random()*.02, size:(1+Math.random()*2.6)*this.dpr, color });
    }
  },
  celebrate(){
    const c=this.canvasEl; if(!c||!this.particles) return;
    const colors=this.DATA.map(e=>e.color); let n=0;
    const fire=()=>{
      const cc=this.canvasEl; if(!cc) return;
      const w=cc.width;
      for(let i=0;i<46;i++){
        this.particles.push({ x:Math.random()*w, y:-10, vx:(Math.random()-.5)*3*this.dpr, vy:(1+Math.random()*3)*this.dpr, life:1, decay:.004+Math.random()*.006, size:(1.4+Math.random()*2.6)*this.dpr, color:colors[Math.floor(Math.random()*colors.length)] });
      }
      n++; if(n<10) setTimeout(fire,150);
    };
    fire();
  },

  // ── Lifecycle ────────────────────────────────────────────────────────────
  componentDidMount(){
    this.particles=[]; this._par={x:0,y:0,tx:0,ty:0};
    try{ document.title='Stellarenes ✦'; }catch(e){}
    try{ this.reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(e){ this.reduced=false; }
    this._onResize=()=>{ this.sizeCanvas(); const wide=window.innerWidth>=681; if(wide!==this.state.isWide) this.setState({isWide:wide}); };
    this._onMove=(e)=>{ const w=window.innerWidth||1, h=window.innerHeight||1; this._par.tx=(e.clientX/w-0.5)*16; this._par.ty=(e.clientY/h-0.5)*16; };
    window.addEventListener('resize', this._onResize);
    if(!this.reduced) window.addEventListener('mousemove', this._onMove);
    this._onVisible=()=>{ if(document.visibilityState==='visible'&&!this.state.muted&&this._actx){ try{this._actx.resume();}catch(e){} if(!this._amb) this.startAmbient(); } };
    document.addEventListener('visibilitychange',this._onVisible);
    this.syncFromSupabase();
    this.subscribeToRealtime();
  },
  componentWillUnmount(){
    window.removeEventListener('resize', this._onResize);
    window.removeEventListener('mousemove', this._onMove);
    if(this._onVisible) document.removeEventListener('visibilitychange',this._onVisible);
    this.stopAmbient(); clearTimeout(this._idle); clearTimeout(this._mt); clearTimeout(this._ch); clearTimeout(this._hk); clearTimeout(this._sh); cancelAnimationFrame(this._raf);
    const sb=this.getSupabase();
    if(sb) sb.removeAllChannels();
  },

  // ── Data helpers ─────────────────────────────────────────────────────────
  unlockedNotesFor(e){ if(!e||!e.notes) return []; if(e.id==='playlist') return e.notes; return e.notes.filter(n=>this.state.unlocked[n.code]); },
  foundTotal(){ return this.DATA.reduce((a,e)=>a+this.unlockedNotesFor(e).length,0); },
  count(){ return this.DATA.filter(e=>this.unlockedNotesFor(e).length>0).length; },
  entryById(id){ if(id==='birthday') return this.BDAY; if(id==='egg') return this.EGG; if(id==='playlist') return this.PLAYLIST; return this.DATA.find(x=>x.id===id); },
  noteCount(){ const e=this.entryById(this.state.active); return this.unlockedNotesFor(e).length; },

  // ── Interaction ──────────────────────────────────────────────────────────
  clickOrb(orb){
    if(orb.unlocked){ this.setState({active:orb.id, noteIndex:0}); }
    else {
      this.setState({hintMsg:'✦ '+orb.title+', type its word to light it'});
      if(this.inputEl && !navigator.maxTouchPoints) this.inputEl.focus();
      clearTimeout(this._hk); this._hk=setTimeout(()=>this.setState({hintMsg:''}),3400);
    }
  },
  stop(e){ e.stopPropagation(); },

  // ── Render ───────────────────────────────────────────────────────────────
  renderVals(){
    const count=this.count(), foundTotal=this.foundTotal(), total=this.DATA.length;
    const wide=this.state.isWide;
    const P=this.DATA.map((e,i)=>{
      if(!wide) return {x:e.x,y:e.y};
      const t=i/(total-1), ang=t*1.75*2*Math.PI+Math.PI*0.1, rad=0.32+0.68*Math.pow(t,0.85);
      return { x:Math.round((50+46*rad*Math.cos(ang))*10)/10, y:Math.round((50+40*rad*Math.sin(ang))*10)/10 };
    });
    this._P=P;
    const orbs=this.DATA.map((e,i)=>{
      const found=this.unlockedNotesFor(e).length, unlocked=found>0;
      return { id:e.id, title:e.title, unlocked, locked:!unlocked, found, foundLabel:found>1?(found+' messages'):'', aria:unlocked?e.title:'a locked star',
        wrap:{ position:'absolute', left:P[i].x+'%', top:P[i].y+'%', width:'52px', height:'52px', background:'transparent', border:0, padding:0, cursor:'pointer', '--c':e.color, '--lblo':'0', zIndex:1, transition:'filter .35s ease, transform .2s ease', animation:'orbIn .9s cubic-bezier(.2,.8,.2,1) both', animationDelay:(i*.05)+'s' },
        hover: unlocked ? { '--lblo':'1', zIndex:6, filter:'brightness(1.4)', transform:'translate(-50%,-50%) scale(1.08)' } : { '--lblo':'1', zIndex:6, filter:'brightness(1.35)' },
        onClick:()=>this.clickOrb({id:e.id,unlocked,title:e.title}) };
    });
    let active=null; const id=this.state.active;
    if(id){
      const e=this.entryById(id);
      if(e){
        const notes=this.unlockedNotesFor(e), tot=notes.length, idx=tot?((this.state.noteIndex%tot)+tot)%tot:0;
        const anim=(idx%2)?'textRiseB':'textRise', note=notes[idx];
        const bodyLines=((note&&note.text)||'').split('\n');
        const _ts=note?this.state.unlocked[note.code]:0;
        const foundOn=(typeof _ts==='number'&&_ts>0)?('Found '+new Date(_ts).toLocaleDateString(undefined,{month:'long',day:'numeric'})):'';
        let spotify='';
        if(id==='playlist'&&this.SPOTIFY){ const m=this.SPOTIFY.match(/playlist\/([a-zA-Z0-9]+)/); const pid=m?m[1]:this.SPOTIFY; spotify='https://open.spotify.com/embed/playlist/'+pid+'?utm_source=generator&theme=0'; }
        active={
          when:e.when, title:e.title, color:e.color, foundOn, spotify, hasSpotify:!!spotify, multi:tot>1, counter:(idx+1)+' / '+tot,
          prevNote:this.prevNote, nextNote:this.nextNote, shuffleNote:this.shuffleNote,
          codeLabel:id==='birthday'?e.codeLabel:(id==='playlist'?'a secret, saved for last':((note&&note.code[0]!=='_')?'woke to “'+note.code+'”':'')),
          lines:bodyLines.map((t,i)=>({ text:t, style:{ margin:'0 0 15px', fontFamily:"'Instrument Serif',serif", fontSize:'clamp(20px,2.8vw,26px)', lineHeight:1.55, color:'rgba(238,234,250,.9)', opacity:0, animation:anim+' .7s cubic-bezier(.2,.8,.2,1) forwards', animationDelay:(.06+i*.14)+'s' } }))
        };
      }
    }

    const inputStyle={ width:'min(56vw,300px)', height:'52px', padding:'0 22px', borderRadius:'40px', background:'rgba(20,16,40,.6)', color:'#f0ecff', fontSize:'15px', letterSpacing:'.08em', textAlign:'center', outline:'none', border:'1px solid rgba(180,160,255,.25)', boxShadow:'0 0 22px rgba(120,90,220,.12)', transition:'border-color .25s, box-shadow .25s' };
    const barStyle={ display:'flex', gap:'10px', alignItems:'center' };
    const cardColor=active?active.color:'#c4a9ff';
    const progressPct=total>0?Math.round(count/total*100):0;
    const progressBarStyle={ height:'100%', borderRadius:'1px', background:'linear-gradient(90deg,#b69bff,#7c5cdc)', transition:'width .8s cubic-bezier(.2,.8,.2,1)', width:progressPct+'%' };
    const shareColor=active?active.color:'#c4a9ff';
    const shareCardStyle={ position:'relative', width:'min(88vw,420px)', borderRadius:'20px', overflow:'hidden', boxShadow:'0 40px 100px rgba(0,0,0,.85),0 0 0 1px rgba(255,255,255,.06)', '--share-c':shareColor };
    const cardStyle={ position:'relative', width:'min(92vw,640px)', maxHeight:'82vh', overflowY:'auto', padding:'48px clamp(28px,6vw,56px) 36px', borderRadius:'22px', background:'linear-gradient(180deg,rgba(24,19,46,.96),rgba(12,10,26,.97))', border:'1px solid rgba(180,160,255,.16)', boxShadow:'0 30px 90px rgba(0,0,0,.6), 0 0 80px rgba(120,90,220,.18)', '--c':cardColor, animation:'cardIn .6s cubic-bezier(.2,.85,.25,1) both' };

    const bdayAwake=this.unlockedNotesFor(this.BDAY).length>0;
    const _all=[...this.DATA], _found=[];
    _all.forEach(e=>{ (e.notes||[]).forEach(n=>{ const ts=this.state.unlocked[n.code]; if(ts&&n.code[0]!=='_'){ _found.push({e,code:n.code,ts:(typeof ts==='number'?ts:0)}); } }); });
    _found.sort((a,b)=>a.ts-b.ts);
    const foundList=_found.map(f=>{
      const un=this.unlockedNotesFor(f.e), idx=un.findIndex(x=>x.code===f.code);
      const dateLabel=f.ts?new Date(f.ts).toLocaleDateString(undefined,{month:'short',day:'numeric'}):'';
      return { word:f.code, title:f.e.title, dateLabel,
        haloStyle:{ position:'absolute', left:'50%', top:'50%', transform:'translate(-50%,-50%)', width:'20px', height:'20px', borderRadius:'50%', background:'radial-gradient(circle,'+f.e.color+',transparent 70%)', filter:'blur(3px)', opacity:.65 },
        dotStyle:{ position:'relative', width:'8px', height:'8px', borderRadius:'50%', flexShrink:0, background:f.e.color, boxShadow:'0 0 8px '+f.e.color },
        onClick:()=>this.setState({active:f.e.id, noteIndex:idx<0?0:idx, listOpen:false}) };
    });
    const eggFound=!!this.state.unlocked['forever'];
    return { count, total, foundTotal, orbs, showCenter:bdayAwake, centerLocked:!bdayAwake, clickCenter:this.clickCenter, showPlaylist:(total>0&&count>=total), openPlaylist:this.openPlaylist, showEgg:eggFound, openEgg:this.openEgg, foundList, hasFound:foundList.length>0, foundCount:foundList.length, listOpen:this.state.listOpen, toggleList:this.toggleList, modalOpen:!!active, active, openBday:this.openBday, closeMessage:this.closeMessage, stop:this.stop, submit:this.submit, onInput:this.onInput, onKey:this.onKey, setCanvas:this.setCanvas, setContainer:this.setContainer, setInput:this.setInput, setIntro:this.setIntro, codeInput:this.state.codeInput, hintMsg:this.state.hintMsg, muted:this.state.muted, soundOn:!this.state.muted, toggleMute:this.toggleMute, showIntro:this.state.showIntro, dismissIntro:this.dismissIntro, milestone:this.state.milestone, hasMilestone:!!this.state.milestone, inputStyle, barStyle, cardStyle, shareOpen:this.state.shareOpen&&!!active, openShare:this.openShare, closeShare:this.closeShare, progressBarStyle, shareCardStyle, onCardTouchStart:this.onCardTouchStart, onCardTouchEnd:this.onCardTouchEnd, copyShareText:this.copyShareText, muteLabel:this.state.muted?'Unmute music':'Mute music' };
  }

};
