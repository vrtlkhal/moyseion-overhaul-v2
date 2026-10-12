/* MOYΣEION · shared page motion. Same language as the homepage: Lenis for the glide, GSAP/ScrollTrigger
   for reveals, gold motes in the background, words that ignite from deep gold to bright gold as they are read. */
(function(){
  var root = document.documentElement;
  root.classList.add('js');
  var LIGHTMODE = document.documentElement.getAttribute('data-theme') === 'light';
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var PHONE = function(){ return window.innerWidth <= 700; };

  // ---- viewport unit, as on the homepage: one number for CSS and JS
  function vh(){ root.style.setProperty('--vh', (window.innerHeight / 100) + 'px'); }
  vh(); window.addEventListener('resize', vh);

  // ---- films: muted loops that play while on screen
  (function(){
    var vids = document.querySelectorAll('video'); if (!vids.length) return;
    function go(v){ v.muted = true; var p = v.play(); if (p && p.catch) p.catch(function(){}); }
    if ('IntersectionObserver' in window){
      var io = new IntersectionObserver(function(es){ es.forEach(function(e){ if (e.isIntersecting) go(e.target); else e.target.pause(); }); }, { threshold:.05 });
      vids.forEach(function(v){ io.observe(v); });
    } else vids.forEach(go);
    ['pointerdown','touchstart','scroll'].forEach(function(t){ window.addEventListener(t, function(){ vids.forEach(function(v){ if (v.paused && v.getBoundingClientRect().bottom > 0 && v.getBoundingClientRect().top < innerHeight) go(v); }); }, { once:true, passive:true }); });
  })();


  // ---- "+" after the title: language (EN / IT) and ambient sound unfold from it
  (function(){
    var wrap = document.querySelector('.tools-wrap'); if (!wrap) return;
    var plus = wrap.querySelector('.plus');
    function setOpen(o){ wrap.classList.toggle('open', o); plus.setAttribute('aria-expanded', o ? 'true' : 'false'); }
    plus.addEventListener('click', function(e){ e.stopPropagation(); setOpen(!wrap.classList.contains('open')); });
    document.addEventListener('click', function(e){ if (!wrap.contains(e.target)) setOpen(false); });
    document.addEventListener('keydown', function(e){ if (e.key === 'Escape') setOpen(false); });

    // language: the navigation, buttons and footer switch to Italian; page copy stays as written
    var IT = {'Inhabit Moyseion':'Abita il Moyseion','Explore Moyseion':'Esplora il Moyseion','Journal':'Journal','About':'Chi siamo','Plan your stay':'Pianifica il soggiorno','Book your stay':'Prenota il soggiorno',
      'Your Day at Moyseion':'Un giorno al Moyseion','Your Day':'Il giorno','Plan Your Stay':'Pianifica il soggiorno','Water Sanctuary':'Santuario delle Acque','Akratisma':'Akratisma','The Houses':'Le case','The Idea':'L\u2019idea',
      'Archaeological Research':'Ricerca archeologica','Research':'Ricerca','Press':'Stampa','Contact':'Contatti','Privacy':'Privacy','Terms':'Termini','Newsletter':'Newsletter','Sound':'Suono','Inhabit':'Abita','Explore':'Esplora',
      'Plan a stay':'Pianifica un soggiorno','See the houses':'Guarda le case','Back to Inhabit Moyseion':'Torna ad Abita il Moyseion','Visit the Foundation':'Visita la Fondazione'};
    var targets = document.querySelectorAll('.menu a, .menu .dd-btn, .dd a, .nav-cta a, .sheet a, .sheet h4, .site-foot nav a, .tools-pop .snd, .finale .btn, .news');
    function swap(lang){
      targets.forEach(function(el){
        var tn = null; el.childNodes.forEach(function(n){ if (n.nodeType === 3 && n.nodeValue.trim()) tn = n; });
        if (!tn) return;
        if (el.__en === undefined) el.__en = tn.nodeValue;
        var en = el.__en.trim();
        tn.nodeValue = (lang === 'it' && IT[en]) ? el.__en.replace(en, IT[en]) : el.__en;
      });
      document.documentElement.lang = lang;
      wrap.querySelectorAll('.lang-opt').forEach(function(b){ b.setAttribute('aria-pressed', String(b.dataset.lang === lang)); });
      try { localStorage.setItem('moy-lang', lang); } catch (e) {}
    }
    wrap.querySelectorAll('.lang-opt').forEach(function(b){ b.addEventListener('click', function(){ swap(b.dataset.lang); }); });
    try { var saved = localStorage.getItem('moy-lang'); if (saved === 'it') swap('it'); } catch (e) {}

    // light / dark
    var thm = wrap.querySelector('.thm'), isLight = document.documentElement.getAttribute('data-theme') === 'light';
    if (thm){ thm.textContent = isLight ? 'Dark' : 'Light'; thm.addEventListener('click', function(){ window.__moySetTheme(isLight ? 'dark' : 'light'); }); }

    // ambient sound: synthesised room tone, off by default, started by the click itself
    var snd = wrap.querySelector('.snd'), audio = null;
    snd.addEventListener('click', function(){
      var on = snd.getAttribute('aria-pressed') === 'true';
      if (on){ if (audio) audio.gain.gain.linearRampToValueAtTime(0, audio.ctx.currentTime + 1.2); snd.setAttribute('aria-pressed', 'false'); return; }
      if (!audio){
        var Ctx = window.AudioContext || window.webkitAudioContext; if (!Ctx) return;
        var ctx = new Ctx(), gain = ctx.createGain(); gain.gain.value = 0;
        var filter = ctx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 420; filter.Q.value = .7;
        [55, 82.41, 110.5].forEach(function(f, i){
          var o = ctx.createOscillator(); o.type = i === 2 ? 'triangle' : 'sine'; o.frequency.value = f; o.detune.value = (i - 1) * 6;
          var g = ctx.createGain(); g.gain.value = i === 2 ? .16 : .4; o.connect(g); g.connect(filter); o.start();
        });
        var lfo = ctx.createOscillator(); lfo.frequency.value = .06; var lg = ctx.createGain(); lg.gain.value = 60; lfo.connect(lg); lg.connect(filter.frequency); lfo.start();
        filter.connect(gain); gain.connect(ctx.destination); audio = { ctx: ctx, gain: gain };
      }
      if (audio.ctx.state === 'suspended') audio.ctx.resume();
      audio.gain.gain.linearRampToValueAtTime(.09, audio.ctx.currentTime + 2.5); snd.setAttribute('aria-pressed', 'true');
    });
    document.addEventListener('visibilitychange', function(){ if (!audio) return; audio.gain.gain.linearRampToValueAtTime(document.hidden ? 0 : (snd.getAttribute('aria-pressed') === 'true' ? .09 : 0), audio.ctx.currentTime + .4); });
  })();

  // ---- header: solid after a little scroll, sheet menu on small screens
  var nav = document.querySelector('.nav');
  function navState(){ if (nav) nav.classList.toggle('solid', window.scrollY > 24); }
  window.addEventListener('scroll', navState, { passive: true }); navState();
  var burger = document.querySelector('.burger'), sheet = document.querySelector('.sheet');
  function closeMenu(){ if (!nav) return; nav.classList.remove('open'); if (sheet) sheet.classList.remove('open'); if (burger) burger.setAttribute('aria-expanded', 'false'); }
  if (burger) burger.addEventListener('click', function(e){
    e.stopPropagation();
    var o = nav.classList.toggle('open'); if (sheet) sheet.classList.toggle('open', o);
    burger.setAttribute('aria-expanded', o ? 'true' : 'false');
  });
  document.addEventListener('click', function(e){ if (sheet && !sheet.contains(e.target) && !(nav && nav.contains(e.target))) closeMenu(); });
  document.addEventListener('keydown', function(e){ if (e.key === 'Escape') closeMenu(); });
  if (sheet) sheet.addEventListener('click', function(e){ if (e.target.closest('a')) closeMenu(); });

  // ---- ambient motes (gold warm / champagne / white), round soft sprites, few of them
  (function particles(){
    var c = document.querySelector('.bg-particles'); if (!c || REDUCED) return;
    var ctx = c.getContext('2d'), W = 0, H = 0, N = PHONE() ? 60 : 138, dpr = Math.min(window.devicePixelRatio || 1, PHONE() ? 1.5 : 2);
    var tints = [[197,163,85],[241,220,164],[255,255,255]];
    var sprites = tints.map(function(t){
      var s = 64, k = document.createElement('canvas'); k.width = k.height = s;
      var g = k.getContext('2d'), h = s / 2, gr = g.createRadialGradient(h,h,0,h,h,h);
      gr.addColorStop(0,'rgba(255,255,255,1)'); gr.addColorStop(.16,'rgba('+t+',0.9)'); gr.addColorStop(.4,'rgba('+t+',0.12)'); gr.addColorStop(1,'rgba('+t+',0)');
      g.fillStyle = gr; g.fillRect(0,0,s,s); return k;
    });
    var P = [];
    function size(){ W = window.innerWidth; H = window.innerHeight; c.width = Math.round(W*dpr); c.height = Math.round(H*dpr); ctx.setTransform(dpr,0,0,dpr,0,0); }
    size(); window.addEventListener('resize', size);
    for (var i = 0; i < N; i++) P.push({ x:Math.random(), y:Math.random(), r:.6+Math.pow(Math.random(),2)*1.2, t:Math.random()<.5?0:(Math.random()<.5?1:2),
      d:.15+Math.random()*.55, ph:Math.random()*6.28, tw:.4+Math.random()*.5, sp:.2+Math.random()*.28, ax:.012+Math.random()*.02, ay:.016+Math.random()*.028 });
    function frame(ms){
      var time = ms / 1000, sy = window.scrollY;
      ctx.clearRect(0,0,W,H); ctx.globalCompositeOperation = 'lighter';
      for (var i = 0; i < N; i++){
        var p = P[i];
        var x = (((p.x + Math.sin(time*p.sp+p.ph)*p.ax) % 1) + 1) % 1;
        var y = (((p.y - sy*p.d/H + Math.cos(time*p.sp*.8+p.ph)*p.ay) % 1) + 1) % 1;
        var fl = .35 + .35*Math.sin(time*p.tw + p.ph), d = p.r*3.2;
        ctx.globalAlpha = Math.min(1, fl*1.1);
        ctx.drawImage(sprites[p.t], x*W - d/2, y*H - d/2, d, d);
      }
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
      if (!document.hidden) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    document.addEventListener('visibilitychange', function(){ if (!document.hidden) requestAnimationFrame(frame); });
  })();


  // ---- mirror link: only when framed by Moyseion-overhaul-mirror.html. Reports where each section starts and
  // the scroll position, obeys a position sent back, and shows a small red "back" button in fullscreen.
  (function(){
    if (window.parent === window) return;
    function anchors(){
      var a = [0], y = window.scrollY;
      document.querySelectorAll('main > section, .site-foot').forEach(function(e){ a.push(Math.round(e.getBoundingClientRect().top + y)); });
      a.push(Math.max(0, document.documentElement.scrollHeight - window.innerHeight));
      return a;
    }
    var quietUntil = 0, queued = false;
    function report(kind){
      if (queued) return; queued = true;
      requestAnimationFrame(function(){
        queued = false;
        if (kind === 'scroll' && performance.now() < quietUntil) return;
        window.parent.postMessage({ type: kind === 'scroll' ? 'moy-scroll' : 'moy-anchors', y: window.scrollY, anchors: anchors() }, '*');
      });
    }
    window.addEventListener('scroll', function(){ report('scroll'); }, { passive:true });
    window.addEventListener('resize', function(){ setTimeout(function(){ report('anchors'); }, 400); });
    [800, 2500, 5000].forEach(function(t){ setTimeout(function(){ report('anchors'); }, t); });
    var back = document.createElement('button');
    back.type = 'button'; back.textContent = 'Back to both views';
    back.style.cssText = 'display:none;position:fixed;left:14px;bottom:14px;z-index:9999;font:600 11px/1 system-ui,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#fff;background:#d6322b;border:0;border-radius:999px;padding:9px 14px;cursor:pointer;box-shadow:0 2px 10px rgba(0,0,0,.45)';
    back.addEventListener('click', function(){ window.parent.postMessage({ type:'moy-exit-full' }, '*'); });
    document.body.appendChild(back);
    window.addEventListener('message', function(e){
      var d = e.data; if (!d) return;
      if (d.type === 'moy-full') back.style.display = d.on ? 'block' : 'none';
      if (d.type === 'moy-goto'){ quietUntil = performance.now() + 220; window.scrollTo(0, d.y); }
    });
  })();

  // ---- everything below needs gsap; without it the page simply shows (no hidden content)
  if (!window.gsap || !window.ScrollTrigger || REDUCED){ root.classList.add(REDUCED ? 'reduce' : 'no-js'); return; }
  gsap.registerPlugin(ScrollTrigger);

  var lenis = null;
  if (typeof Lenis === 'function' && !PHONE()){
    lenis = new Lenis({ lerp: .085, smoothWheel: true, syncTouch: false });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function(t){ lenis.raf(t*1000); });
    gsap.ticker.lagSmoothing(0);
  }
  // in-page anchors glide
  document.querySelectorAll('a[href^="#"]').forEach(function(a){
    a.addEventListener('click', function(e){
      var id = a.getAttribute('href'); if (id.length < 2) return;
      var t = document.querySelector(id); if (!t) return; e.preventDefault();
      var off = -(document.querySelector('.tabs') ? 150 : 90);
      if (lenis) lenis.scrollTo(t, { offset: off, duration: 1.1 }); else window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY + off, behavior: 'smooth' });
    });
  });

  // ---- reveals: fade-up once, staggered inside a group
  function reveals(){
    gsap.utils.toArray('[data-stagger]').forEach(function(g){
      var items = g.querySelectorAll(':scope > .rv'); if (!items.length) return;
      gsap.to(items, { opacity:1, y:0, duration:1, ease:'power3.out', stagger:.12,
        scrollTrigger:{ trigger:g, start:'top 86%', once:true } });
    });
    gsap.utils.toArray('.rv').forEach(function(el){
      if (el.parentElement && el.parentElement.hasAttribute('data-stagger')) return;
      gsap.to(el, { opacity:1, y:0, duration:1.05, ease:'power3.out', scrollTrigger:{ trigger:el, start:'top 90%', once:true } });
    });
  }

  // ---- ignite: every piece of reading text is carried from deep gold to bright gold, word by word, as it
  // crosses the reading band, and stays lit (same idea as the homepage). Applied to all body copy, not a few lines.
  var LIT = '.hero-copy .lede, .hero-copy h1, .hero-copy p:not(.eyebrow):not(.word), .ml p, .closing p, .card p, .card h3, .pcard h3, .pcard p, .step .tx p, .step .tx h3, .step .po p, .box p, .box li, .box h3, .found p, .found h2, .found h4, .kit > div > span, .quote q, .quote small, .cta-band h2, .cta-band p, .section-label, h2.section-label, .reel figcaption, .finale .word, .eyebrow';
  function ignite(){
    var els = [], seen = new Set();
    document.querySelectorAll(LIT).forEach(function(el){ if (!seen.has(el)){ seen.add(el); els.push(el); } });
    els.forEach(function(el){
      if (el.closest('.btn, .nav, .sheet, .site-foot')) return;
      el.classList.add('ign');
      var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), nodes = [], n;
      while ((n = walker.nextNode())) if (n.nodeValue.trim()) nodes.push(n);
      var words = [];
      nodes.forEach(function(node){
        var frag = document.createDocumentFragment();
        node.nodeValue.split(/(\s+)/).forEach(function(part){
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
          var s = document.createElement('span'); s.className = 'w'; s.textContent = part; frag.appendChild(s); words.push(s);
        });
        node.parentNode.replaceChild(frag, node);
      });
      if (!words.length) return;
      var long = words.length > 14;
      gsap.fromTo(words, { color: LIGHTMODE ? '#a08c70' : '#836d30' }, { color: LIGHTMODE ? '#1b1713' : '#f1dca4', ease:'none', stagger: long ? .5 : .25,
        scrollTrigger:{ trigger:el, start:'top 92%', end: long ? 'bottom 46%' : 'top 56%', scrub:.3 } });
    });
  }

  // ---- parallax on hero art and ritual panels
  function parallax(){
    gsap.utils.toArray('.hero-art img, .hero-art video').forEach(function(img){
      gsap.fromTo(img, { yPercent:-5 }, { yPercent:7, ease:'none', scrollTrigger:{ trigger:img.closest('.hero'), start:'top top', end:'bottom top', scrub:.4 } });
    });
    gsap.utils.toArray('.step .pic img, .found .art img').forEach(function(img){
      gsap.fromTo(img, { yPercent:-8 }, { yPercent:0, ease:'none', scrollTrigger:{ trigger:img.parentElement, start:'top bottom', end:'bottom top', scrub:.4 } });
    });
  }

  // ---- plan page: tab bar follows the reader
  function spy(){
    var tabs = document.querySelectorAll('.tabs a[href^="#"]'); if (!tabs.length) return;
    tabs.forEach(function(a){
      var t = document.querySelector(a.getAttribute('href')); if (!t) return;
      ScrollTrigger.create({ trigger:t, start:'top 45%', end:'bottom 45%',
        onToggle:function(self){ if (self.isActive){ tabs.forEach(function(x){ x.classList.remove('on'); }); a.classList.add('on'); } } });
    });
  }

  reveals(); ignite(); parallax(); spy();
  ScrollTrigger.refresh();
  window.addEventListener('load', function(){ ScrollTrigger.refresh(); });
})();
