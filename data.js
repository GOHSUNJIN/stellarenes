// ── EDIT YOUR MESSAGES HERE ──────────────────────────────────────────────
// 20 stars, one per feeling. Each star has a `notes` array. Every note has
// its own unlock { code }. Renes types a code → that message wakes inside
// its star. Add more { code, text } objects to give a star multiple messages
// (codes must be UNIQUE across the whole gift).
// Use \n inside text to split a message into separate lines on the card.
// ─────────────────────────────────────────────────────────────────────────

window.STARS = {

  DATA: [
    { id:'heartache', title:'When your heart aches', when:'for the broken days', color:'hsl(350,68%,76%)', x:26.1, y:37.6,
      notes:[ { code:'kintsugi', text:`Your heart aches, and I wish I could carry it for you.\nBroken things can be put back with gold in the cracks, stronger, somehow more beautiful.\nYou will love again. Until then, lean all your weight on me.` } ] },

    { id:'overwhelmed', title:'When you feel overwhelmed', when:'for the too-much days', color:'hsl(285,55%,76%)', x:12, y:38.3,
      notes:[ { code:'weightless', text:`It’s all too much right now, I know.\nPut it down for a second, just this one. You don’t have to carry everything at once.\nBreathe. Let yourself feel weightless, even just for a minute.` } ] },

    { id:'lost', title:'When you feel lost', when:'for the in-between days', color:'hsl(195,62%,70%)', x:23, y:47.2,
      notes:[ { code:'polaris', text:`You feel lost, and that’s allowed. Being lost only means you’re somewhere new.\nYou don’t owe anyone a finished map, just the next small step.\nAnd if you can’t find north, I’m your polaris. Look for me.` } ] },

    { id:'notenough', title:'When you feel not enough', when:'for the doubting days', color:'hsl(205,62%,72%)', x:30.3, y:70.1,
      notes:[ { code:'supernova', text:`You feel not enough today. I need you to hear this: you are so much more than enough.\nThe things that make you feel small are the exact things that make you rare.\nYou are not a flicker, Renes. You are a supernova.` } ] },

    { id:'spiralling', title:'When you feel yourself spiralling', when:'for the racing days', color:'hsl(165,55%,66%)', x:38.3, y:76,
      notes:[ { code:'drift', text:`Your mind is spiralling, I know that feeling.\nNothing has to be solved this second. Let yourself drift for a while, you don’t have to fight the current.\nIt always settles. I’ll be here when it does.` } ] },

    { id:'restless', title:'When you feel restless at night', when:'for the 3am days', color:'hsl(265,58%,78%)', x:40.1, y:37,
      notes:[ { code:'moonlight', text:`It’s late and you can’t settle, the quiet feels loud.\nYour worth isn’t decided by tonight, or any deadline waiting for tomorrow.\nLet the world go soft. I’ll keep watch under the moonlight.` } ] },

    { id:'held', title:'When you feel like being held', when:'for the tender days', color:'hsl(110,50%,68%)', x:88, y:38.3,
      notes:[ { code:'gravity', text:`If you opened this, you want to feel held. Consider yourself held.\nNo matter the distance, something keeps pulling me back to you, always has.\nThat’s not coincidence. That’s gravity.` } ] },

    { id:'faraway', title:'When you feel far from me', when:'for the far-apart days', color:'hsl(330,68%,75%)', x:66, y:56.2,
      notes:[ { code:'orbit', text:`You feel far from me right now. I feel it too.\nDistance is just space, it’s never once touched how I feel about you.\nWe’re just two things in the same orbit, always circling back.` } ] },

    { id:’afraid’, title:"When you’re afraid", when:’for the trembling days’, color:’hsl(10,72%,70%)’, x:26.5, y:84,
      notes:[ { code:'ignite', text:`You’re afraid, and that’s okay. Fear just means you care about the outcome.\nTake my hand. We’ll look at whatever it is together.\nYou can be terrified and brave in the same breath. Now go ignite.` } ] },

    { id:'nostalgic', title:'When you miss the old days', when:'for the looking-back days', color:'hsl(300,55%,76%)', x:73.5, y:84,
      notes:[ { code:'stardust', text:`Missing the old days? Me too, more than I say.\nNothing good really disappears, it just settles into you like stardust.\nWe’ll make new old-days. The best ones are still ahead.` } ] },

    { id:'loved', title:'When you feel loved', when:'for the certain days', color:'hsl(260,50%,70%)', x:69.7, y:70.1,
      notes:[ { code:'eclipse', text:`You feel loved right now, and I want you to trust it completely.\nEvery other feeling can fade in and out, but this one doesn’t, it just eclipses everything else.\nYou are loved. Fully. Always.` } ] },

    { id:'grateful', title:'When you feel grateful', when:'for the warm days', color:'hsl(50,70%,72%)', x:34, y:56.2,
      notes:[ { code:'luminous', text:`Thank you for being exactly who you are.\nThe world is softer, warmer, more luminous with you in it.\nI hope you feel, even for a moment, how much light you give back.` } ] },

    { id:'proud', title:'When you feel proud', when:'for the victory days', color:'hsl(135,55%,68%)', x:73.9, y:37.6,
      notes:[ { code:'zenith', text:`You did the thing, and I knew you would.\nI’m so proud of you I could burst, this is you at your zenith.\nGo tell someone. Better yet, tell me. I want every detail.` } ] },

    { id:'small', title:'When you feel small', when:'for the quiet days', color:'hsl(220,55%,72%)', x:50, y:68.1,
      notes:[ { code:'cosmos', text:`You feel small today, like the world is too big and you’re not enough of it.\nBut even the smallest star still holds its place in the cosmos.\nYou belong here. Exactly as you are.` } ] },

    { id:'peace', title:'When you feel at peace', when:'for the still days', color:'hsl(175,45%,70%)', x:61.7, y:76,
      notes:[ { code:'serene', text:`You feel at peace right now, and I’m so glad.\nHold onto this, the quiet, the stillness, the serene hum of a good moment.\nYou’ve earned every second of this calm.` } ] },

    { id:'free', title:'When you feel free', when:'for the wide-open days', color:'hsl(28,75%,68%)', x:45.1, y:23.5,
      notes:[ { code:'solstice', text:`You feel free today, wide open, unburdened.\nLet it stretch as long as it wants to, like the longest day of summer.\nThis is your solstice. Soak in every hour of it.` } ] },

    { id:'angry', title:'When you feel angry', when:'for the burning days', color:'hsl(14,75%,64%)', x:50, y:10,
      notes:[ { code:'solar', text:`You’re angry right now, and that’s allowed. Anger just means something mattered enough to sting.\nLet it burn through you, yell into a pillow, go for a hard walk, whatever gets it out safely.\nYou don’t have to be calm for me to love you. Even a solar flare fades, and I’ll still be here after.` } ] },

    { id:'notokay', title:'When you feel distant from me', when:'for the drifting-apart days', color:'hsl(225,30%,62%)', x:59.9, y:37,
      notes:[ { code:'tether', text:`You feel distant from me right now, and I notice it too.\nSometimes we drift out of sync, that doesn’t mean we’re broken, just human.\nCome back to me when you’re ready. I’ll still be right here, tethered.` } ] },

    { id:'playful', title:'When you feel playful', when:'for the silly days', color:'hsl(36,78%,68%)', x:77, y:47.2,
      notes:[ { code:'twinkle', text:`You’re feeling playful, you absolute menace.\nGood. Go be silly, go laugh too loud, go let that twinkle in your eye do whatever it wants.\nI love you like this most of all.` } ] },

    { id:'hopeful', title:'When you feel hopeful', when:'for the waiting days', color:'hsl(45,75%,70%)', x:54.9, y:23.5,
      notes:[ { code:'wish', text:`You feel hopeful, and I want to hand you a whole handful of it.\nWhatever you’re hoping for, I’m hoping right alongside you.\nMake the wish. I think it’s already coming true.` } ] }
  ],

  // ── Center birthday star ───────────────────────────────────────────────
  // First message: give Renes the code 'queen' on her actual birthday.
  // Second message '_complete' auto-unlocks once all 20 stars are lit.
  BDAY: { id:'birthday', title:'Happy birthday, Renes', when:'open me today', color:'#ffd27a', codeLabel:'with love, always',
    notes:[
      { code:'queen', text:`Happy birthday, Renes.\nTwenty years of you, twenty years the world has been brighter for having you in it. Before you go hunting down all the other stars, I wanted the very first thing you read today to be the simplest, truest one: I love you, and I am so glad you were born.\nHere’s to your best year yet. Now go light up your sky.` },
      { code:'_complete', text:`So that’s all of it. Every feeling I could think of, every word, every little star I hid for you in the dark.\nI made this because I won’t always be in the same room as you, and I wanted there to be one place you could always find me. Whatever you’re feeling on any given day, happy or heavy or lost or wide awake at 3am, there is already a version of me here, on your side, waiting.\nThank you for being you. For your laugh, your stubbornness, the way you care about things so completely. The world got better the day you were born, and it keeps getting better every year you stay in it.\nHappy twentieth, Renes. Here’s to lighting up every sky ahead of us, together.\nAll my love, always.\nP.S. Look up. One more star just appeared in your sky, right at the centre. That one is a secret I saved for last. Go find it.` }
    ] },

  // ── Easter egg star (secret word: 'forever') ───────────────────────────
  EGG: { id:'egg', title:'I love you', when:'a little secret', color:'#ff79b0', codeLabel:'— always yours',
    notes:[ { code:'forever', text:`You found the secret one. Of course you did.\nThere wasn’t a feeling for this, because it isn’t a mood, it’s the whole sky: I love you. Plainly, hugely, on the good days and the heavy ones and every ordinary Tuesday in between.\nHappy birthday, my favourite person.` } ] },

  // ── Playlist star (appears after all 20 stars are lit) ─────────────────
  PLAYLIST: { id:'playlist', title:'One more thing', when:'a secret, saved for last', color:'#5fd38a',
    notes:[ { code:'_playlist', text:`I made you a playlist.\nEvery song in here is one that, somewhere along the way, quietly started meaning you to me. Some are silly, some will wreck you a little, all of them are yours.\nPut your headphones in, lie back, and let it play the whole way through at least once. It’s the closest I can get to sitting right next to you.` } ] },

  // ── Spotify link ───────────────────────────────────────────────────────
  // Paste your Spotify playlist URL here. In Spotify: open the playlist →
  // tap … → Share → Copy link to playlist. Set to '' to hide the embed.
  SPOTIFY: 'https://open.spotify.com/playlist/46s03xVyDrJ32Al2tRjYlL'

};
