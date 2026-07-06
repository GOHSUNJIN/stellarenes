// ── Star config — positions, colours, unlock codes ───────────────────────
// Edit messages.js to change what Renes reads. Don't touch this file
// unless you want to move a star or change its colour.
// ─────────────────────────────────────────────────────────────────────────

const M = window.MESSAGES;

window.STARS = {

  DATA: [
    { id:'heartache',   title:'When your heart aches',           when:'for the broken days',       color:'hsl(350,68%,76%)', x:26.1, y:37.6, notes:[ { code:'kintsugi',   text:M.kintsugi   } ] },
    { id:'overwhelmed', title:'When you feel overwhelmed',        when:'for the too-much days',      color:'hsl(285,55%,76%)', x:12,   y:38.3, notes:[ { code:'weightless', text:M.weightless } ] },
    { id:'lost',        title:'When you feel lost',               when:'for the in-between days',    color:'hsl(195,62%,70%)', x:23,   y:47.2, notes:[ { code:'polaris',    text:M.polaris    } ] },
    { id:'notenough',   title:'When you feel not enough',         when:'for the doubting days',      color:'hsl(205,62%,72%)', x:30.3, y:70.1, notes:[ { code:'supernova',  text:M.supernova  } ] },
    { id:'spiralling',  title:"When you're spiralling",          when:'for the racing days',        color:'hsl(165,55%,66%)', x:38.3, y:76,   notes:[ { code:'drift',      text:M.drift      } ] },
    { id:'restless',    title:"When you can't sleep",            when:'for the 3am days',           color:'hsl(265,58%,78%)', x:40.1, y:37,   notes:[ { code:'moonlight',  text:M.moonlight  } ] },
    { id:'held',        title:'When you feel like being held',    when:'for the tender days',        color:'hsl(110,50%,68%)', x:88,   y:38.3, notes:[ { code:'gravity',    text:M.gravity    } ] },
    { id:'faraway',     title:'When you feel far from me',        when:'for the far-apart days',     color:'hsl(330,68%,75%)', x:66,   y:56.2, notes:[ { code:'orbit',      text:M.orbit      } ] },
    { id:'afraid',      title:"When you're afraid",               when:'for the trembling days',     color:'hsl(10,72%,70%)',  x:26.5, y:84,   notes:[ { code:'ignite',     text:M.ignite     } ] },
    { id:'exhausted',   title:'When you feel exhausted',          when:'for the empty days',         color:'hsl(260,30%,62%)', x:73.5, y:84,   notes:[ { code:'dusk',       text:M.dusk       } ] },
    { id:'loved',       title:'When you feel loved',              when:'for the certain days',       color:'hsl(260,50%,70%)', x:69.7, y:70.1, notes:[ { code:'eclipse',    text:M.eclipse    } ] },
    { id:'grateful',    title:'When you feel grateful',           when:'for the warm days',          color:'hsl(50,70%,72%)',  x:34,   y:56.2, notes:[ { code:'luminous',   text:M.luminous   } ] },
    { id:'proud',       title:'When you feel proud',              when:'for the victory days',       color:'hsl(135,55%,68%)', x:73.9, y:37.6, notes:[ { code:'zenith',     text:M.zenith     } ] },
    { id:'small',       title:'When you feel small',              when:'for the quiet days',         color:'hsl(220,55%,72%)', x:50,   y:68.1, notes:[ { code:'cosmos',     text:M.cosmos     } ] },
    { id:'peace',       title:'When you feel at peace',           when:'for the still days',         color:'hsl(175,45%,70%)', x:61.7, y:76,   notes:[ { code:'serene',     text:M.serene     } ] },
    { id:'sick',        title:'When you feel sick',               when:'for the unwell days',        color:'hsl(195,45%,72%)', x:45.1, y:23.5, notes:[ { code:'nebula',     text:M.nebula     } ] },
    { id:'angry',       title:'When you feel angry',              when:'for the burning days',       color:'hsl(14,75%,64%)',  x:50,   y:10,   notes:[ { code:'solar',      text:M.solar      } ] },
    { id:'notokay',     title:'When you feel distant from me',    when:'for the drifting-apart days',color:'hsl(225,30%,62%)', x:59.9, y:37,   notes:[ { code:'tether',     text:M.tether     } ] },
    { id:'playful',     title:'When you feel playful',            when:'for the silly days',         color:'hsl(36,78%,68%)',  x:77,   y:47.2, notes:[ { code:'twinkle',    text:M.twinkle    } ] },
    { id:'lonely',      title:'When you feel lonely',             when:'for the invisible days',     color:'hsl(235,40%,68%)', x:54.9, y:23.5, notes:[ { code:'void',       text:M.void       } ] }
  ],

  BDAY: { id:'birthday', title:'Happy birthday, Renes', when:'open me today', color:'#ffd27a', codeLabel:'with love, always',
    notes:[
      { code:'queen',     text:M.queen     },
      { code:'_complete', text:M._complete }
    ] },

  EGG: { id:'egg', title:'I love you', when:'a little secret', color:'#ff79b0', codeLabel:'— always yours',
    notes:[ { code:'forever', text:M.forever } ] },

  PLAYLIST: { id:'playlist', title:'One more thing', when:'a secret, saved for last', color:'#5fd38a',
    notes:[ { code:'_playlist', text:M._playlist } ] },

  SPOTIFY: M.SPOTIFY

};
