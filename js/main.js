/*!
 * KS Web — main.js (vanilla JS, no dependencies)
 * Header + mega menu, mobile menu, scroll-reveal, portfolio filter,
 * FAQ accordion, testimonials slider, contact form (validation + toast).
 */
(function () {
  'use strict';

  /* ---------- Config ---------- */
  var CONFIG = {
    // Paste a form endpoint (Formspree / Web3Forms / your webhook) to receive real inquiries.
    // Leave empty to simulate a successful send (same as the original demo behaviour).
    inquiryEndpoint: '',
    whatsapp: '919914424131'
  };

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var cls = function (el, add, remove) {
    (remove || []).forEach(function (c) { el.classList.remove(c); });
    (add || []).forEach(function (c) { el.classList.add(c); });
  };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Toast ---------- */
  function toast(msg, type) {
    var box = $('#toasts'); if (!box) return;
    var t = document.createElement('div');
    t.className = 'toast' + (type === 'error' ? ' error' : '');
    t.setAttribute('role', 'status'); t.textContent = msg;
    box.appendChild(t);
    setTimeout(function () { t.classList.add('out'); setTimeout(function () { t.remove(); }, 260); }, 4200);
  }

  /* ---------- Header, mega menu, scroll progress ---------- */
  var header = $('header');
  var mega = header && $('header > div.absolute');
  var megaTrigger = header && $('nav a[aria-haspopup]', header);
  var megaWrap = megaTrigger && megaTrigger.parentNode;
  var megaOpen = false, megaTimer = null;

  function paintHeader() {
    if (!header) return;
    var solid = window.scrollY > 12 || megaOpen;
    ['border-border', 'bg-background/85', 'backdrop-blur-xl'].forEach(function (c) { header.classList.toggle(c, solid); });
    ['border-transparent', 'bg-background/0'].forEach(function (c) { header.classList.toggle(c, !solid); });
  }
  function setMega(open) {
    megaOpen = open;
    if (mega) {
      ['visible', 'translate-y-0', 'opacity-100'].forEach(function (c) { mega.classList.toggle(c, open); });
      ['invisible', '-translate-y-2', 'opacity-0'].forEach(function (c) { mega.classList.toggle(c, !open); });
    }
    if (megaTrigger) {
      megaTrigger.setAttribute('aria-expanded', String(open));
      var chev = $('svg', megaTrigger); if (chev) chev.classList.toggle('rotate-180', open);
    }
    paintHeader();
  }
  function openMega() { clearTimeout(megaTimer); setMega(true); }
  function closeMegaSoon() { megaTimer = setTimeout(function () { setMega(false); }, 120); }
  if (megaWrap && mega) {
    [megaWrap, mega].forEach(function (el) { el.addEventListener('mouseenter', openMega); el.addEventListener('mouseleave', closeMegaSoon); });
    megaTrigger.addEventListener('focus', openMega);
    megaTrigger.addEventListener('click', function () { setMega(false); });
    $$('a', mega).forEach(function (a) { a.addEventListener('click', function () { setMega(false); }); });
  }
  var bar = $('#scroll-progress');
  function onScroll() {
    paintHeader();
    if (bar) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, window.scrollY / h) : 0) + ')';
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var mm = $('#mobile-menu');
  var mmOpen = false;
  function setMenu(open) {
    if (!mm || open === mmOpen) return;
    mmOpen = open;
    var st = open ? 'open' : 'closed';
    if (open) { mm.hidden = false; }
    mm.dataset.state = st;
    $('[data-overlay]', mm).dataset.state = st;
    $('[data-panel]', mm).dataset.state = st;
    document.body.classList.toggle('menu-open', open);
    if (!open) setTimeout(function () { if (!mmOpen) mm.hidden = true; }, 300);
    else setTimeout(function () { var b = $('[data-close][aria-label]', mm); if (b) b.focus(); }, 50);
    var trig = $('button[aria-label="Open menu"]'); if (trig) trig.setAttribute('aria-expanded', String(open));
  }
  var openBtn = $('button[aria-label="Open menu"]');
  if (openBtn) openBtn.addEventListener('click', function () { setMenu(true); });
  if (mm) {
    $('[data-overlay]', mm).addEventListener('click', function () { setMenu(false); });
    $$('[data-close]', mm).forEach(function (el) { el.addEventListener('click', function () { setMenu(false); }); });
    var tgl = $('[data-svc-toggle]', mm), list = $('[data-svc-list]', mm);
    if (tgl) tgl.addEventListener('click', function () {
      var o = tgl.getAttribute('aria-expanded') === 'true';
      tgl.setAttribute('aria-expanded', String(!o)); list.hidden = o; $('[data-chev]', tgl).classList.toggle('open', !o);
    });
  }
  window.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { setMega(false); setMenu(false); }
  });
  window.addEventListener('resize', function () { if (window.innerWidth >= 1024) setMenu(false); });

  /* ---------- Scroll reveal (fade-up) ---------- */
  var HIDDEN = ['translate-y-6', 'opacity-0'], SHOWN = ['translate-y-0', 'opacity-100'];
  var revealEls = $$('.duration-700.ease-out.opacity-0');
  function show(el) { cls(el, SHOWN, HIDDEN); }
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { show(en.target); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
    window.__ksReveal = io;
  } else { revealEls.forEach(show); }

  /* ---------- Portfolio filter ---------- */
  var tablist = $('[role=tablist][aria-label="Filter projects"]');
  if (tablist) {
    var grid = tablist.nextElementSibling;
    var cards = $$('article', grid);
    cards.forEach(function (c) { c.dataset.cat = $('span.absolute', c).textContent.trim(); });
    var empty = document.createElement('p');
    empty.className = 'mt-12 text-muted-foreground'; empty.textContent = 'New projects in this category coming soon.'; empty.hidden = true;
    grid.parentNode.appendChild(empty);
    var ON = ['border-primary', 'bg-primary', 'text-primary-foreground'];
    var OFF = ['border-border', 'text-muted-foreground', 'hover:border-border-strong', 'hover:text-foreground'];
    $$('[role=tab]', tablist).forEach(function (tab) {
      tab.addEventListener('click', function () {
        var f = tab.textContent.trim();
        $$('[role=tab]', tablist).forEach(function (t) {
          var on = t === tab; t.setAttribute('aria-selected', String(on));
          cls(t, on ? ON : OFF, on ? OFF : ON);
        });
        var i = 0;
        cards.forEach(function (c) {
          var match = f === 'All' || c.dataset.cat === f;
          c.hidden = !match; c.style.display = match ? '' : 'none';
          if (match) {
            c.style.transitionDelay = ((i % 3) * 80) + 'ms'; i++;
            if (!reduceMotion) { cls(c, HIDDEN, SHOWN); void c.offsetWidth; requestAnimationFrame(function () { requestAnimationFrame(function () { show(c); }); }); }
            else show(c);
          }
        });
        empty.hidden = i !== 0;
      });
    });
  }

  /* ---------- FAQ accordion (single, collapsible) ---------- */
  var faqRoot = $('div.w-full[data-orientation=vertical]');
  if (faqRoot) {
    var items = $$(':scope > div[data-state]', faqRoot);
    var setItem = function (item, open) {
      var st = open ? 'open' : 'closed';
      var btn = $('button', item), region = $('[role=region]', item), h3 = $('h3', item);
      item.dataset.state = st; h3.dataset.state = st; btn.dataset.state = st; btn.setAttribute('aria-expanded', String(open));
      if (open) {
        region.hidden = false;
        region.style.setProperty('--radix-collapsible-content-height', region.scrollHeight + 'px');
        region.dataset.state = 'open';
      } else {
        region.style.setProperty('--radix-collapsible-content-height', region.scrollHeight + 'px');
        region.dataset.state = 'closed';
        setTimeout(function () { if (region.dataset.state === 'closed') region.hidden = true; }, 200);
      }
    };
    items.forEach(function (item) {
      var region = $('[role=region]', item);
      if (item.dataset.state === 'closed') region.hidden = true;
      $('button', item).addEventListener('click', function () {
        var isOpen = item.dataset.state === 'open';
        items.forEach(function (o) { if (o !== item && o.dataset.state === 'open') setItem(o, false); });
        setItem(item, !isOpen);
      });
    });
  }

  /* ---------- Testimonials slider (loop, buttons + swipe) ---------- */
  var car = $('[aria-roledescription=carousel]');
  if (car) {
    var vp = $('.overflow-hidden', car), track = $('.flex', vp);
    track.classList.add('ks-track');
    var count = track.children.length, cur = 0, busy = false;
    var dots = $$('span', car.parentNode.querySelector('[aria-hidden=true].mt-8'));
    var DON = ['w-10', 'bg-primary'], DOFF = ['w-4', 'bg-border-strong'];
    var paintDots = function () { dots.forEach(function (d, i) { cls(d, i === cur ? DON : DOFF, i === cur ? DOFF : DON); }); };
    var step = function () { return track.children[0].getBoundingClientRect().width; };
    var move = function (dir) {
      if (busy || count < 2) return; busy = true;
      var w = step(), dur = reduceMotion ? 0 : 450;
      track.style.transition = 'none';
      if (dir < 0) { track.insertBefore(track.lastElementChild, track.firstElementChild); track.style.transform = 'translate3d(' + (-w) + 'px,0,0)'; void track.offsetWidth; }
      track.style.transition = 'transform ' + dur + 'ms cubic-bezier(.2,.7,.2,1)';
      track.style.transform = 'translate3d(' + (dir > 0 ? -w : 0) + 'px,0,0)';
      cur = (cur + dir + count) % count; paintDots();
      setTimeout(function () {
        track.style.transition = 'none';
        if (dir > 0) track.appendChild(track.firstElementChild);
        track.style.transform = 'translate3d(0,0,0)'; busy = false;
      }, dur + 20);
    };
    var prev = $('button[aria-label="Previous testimonial"]'), next = $('button[aria-label="Next testimonial"]');
    if (prev) prev.addEventListener('click', function () { move(-1); });
    if (next) next.addEventListener('click', function () { move(1); });
    var sx = null;
    vp.addEventListener('pointerdown', function (e) { sx = e.clientX; track.classList.add('dragging'); });
    window.addEventListener('pointerup', function (e) {
      if (sx === null) return; var dx = e.clientX - sx; sx = null; track.classList.remove('dragging');
      if (Math.abs(dx) > 50) move(dx < 0 ? 1 : -1);
    });
    paintDots();
  }

  /* ---------- Contact form ---------- */
  var SERVICES = ['Web Development', 'Graphic & UI/UX Design', 'SEO & Digital Marketing', 'Social Media Management', 'Maintenance & Support', 'Other'];
  var CHECK = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check size-4" aria-hidden="true"><path d="M20 6 9 17l-5-5"></path></svg>';
  var form = $('#inquiry form');
  if (form) {
    var panel = form.parentNode, formHTML = panel.innerHTML;
    var BUDGETS = ['Under $1,000', '$1,000 – $3,000', '$3,000 – $7,500', '$7,500 – $15,000', '$15,000+', 'Not sure yet'];
    var wa = function (msg) { return 'https://wa.me/' + CONFIG.whatsapp + '?text=' + encodeURIComponent(msg); };
    var ICON_WA = $('a[href^="https://wa.me"] svg', $('#inquiry'));
    var ICON_CHECK_BIG = CHECK.replace('size-4', 'size-8');
    var state;
    function bind() {
      form = $('#inquiry form'); if (!form) return;
      state = { services: [], budget: '' };
      /* chips */
      $$('fieldset button[aria-pressed]', form).forEach(function (b) {
        var label = b.textContent.trim();
        b.addEventListener('click', function () {
          var on = state.services.indexOf(label) === -1;
          state.services = on ? state.services.concat(label) : state.services.filter(function (s) { return s !== label; });
          b.setAttribute('aria-pressed', String(on));
          var ON = ['border-primary', 'bg-primary', 'text-primary-foreground'], OFF = ['border-border', 'text-muted-foreground', 'hover:border-border-strong', 'hover:text-foreground'];
          cls(b, on ? ON : OFF, on ? OFF : ON);
          var svg = $('svg', b);
          if (on && !svg) b.insertAdjacentHTML('afterbegin', CHECK); else if (!on && svg) svg.remove();
          clearErr($('fieldset', form));
        });
      });
      /* budget select */
      var trig = $('#budget', form), wrap = document.createElement('div');
      wrap.className = 'ks-select'; trig.parentNode.insertBefore(wrap, trig); wrap.appendChild(trig);
      var ul = document.createElement('ul'); ul.setAttribute('role', 'listbox'); ul.tabIndex = -1;
      BUDGETS.forEach(function (b) {
        var li = document.createElement('li'); li.setAttribute('role', 'option'); li.tabIndex = 0; li.dataset.v = b; li.textContent = b;
        li.setAttribute('aria-selected', 'false'); ul.appendChild(li);
      });
      wrap.appendChild(ul);
      var label = $('span', trig);
      var toggle = function (o) { wrap.classList.toggle('open', o); trig.setAttribute('aria-expanded', String(o)); };
      trig.addEventListener('click', function () { toggle(!wrap.classList.contains('open')); });
      var pick = function (li) {
        state.budget = li.dataset.v; label.textContent = li.dataset.v; trig.removeAttribute('data-placeholder');
        $$('[role=option]', ul).forEach(function (o) { o.setAttribute('aria-selected', String(o === li)); });
        toggle(false); trig.focus(); clearErr(wrap.parentNode);
      };
      ul.addEventListener('click', function (e) { var li = e.target.closest('[role=option]'); if (li) pick(li); });
      ul.addEventListener('keydown', function (e) {
        var li = e.target.closest('[role=option]'); if (!li) return;
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(li); }
        if (e.key === 'ArrowDown' && li.nextElementSibling) { e.preventDefault(); li.nextElementSibling.focus(); }
        if (e.key === 'ArrowUp' && li.previousElementSibling) { e.preventDefault(); li.previousElementSibling.focus(); }
      });
      document.addEventListener('click', function (e) { if (!wrap.contains(e.target)) toggle(false); });
      /* clear errors while typing */
      $$('input,textarea', form).forEach(function (i) { i.addEventListener('input', function () { clearErr(i.parentNode); }); });
      form.addEventListener('submit', onSubmit);
    }
    function setErr(box, msg, cls2) {
      clearErr(box); var p = document.createElement('p'); p.setAttribute('role', 'alert');
      p.className = cls2 || 'text-sm text-destructive'; p.textContent = msg; p.dataset.err = '1'; box.appendChild(p);
    }
    function clearErr(box) { if (!box) return; $$('[data-err]', box).forEach(function (p) { p.remove(); }); }
    function onSubmit(e) {
      e.preventDefault();
      var v = {
        fullName: $('#fullName', form).value.trim(), email: $('#email', form).value.trim(),
        phone: $('#phone', form).value.trim(), company: $('#company', form).value.trim(),
        services: state.services.slice(), budget: state.budget, details: $('#details', form).value.trim()
      };
      var ok = true, first = null;
      var fail = function (box, msg, c) { setErr(box, msg, c); ok = false; if (!first) first = box; };
      ['fullName', 'email', 'phone', 'company'].forEach(function (id) { clearErr($('#' + id, form).parentNode); });
      clearErr($('fieldset', form)); clearErr($('#budget', form).closest('.ks-select').parentNode); clearErr($('#details', form).parentNode);
      if (v.fullName.length < 2) fail($('#fullName', form).parentNode, 'Please enter your full name');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email)) fail($('#email', form).parentNode, 'Please enter a valid email address');
      if (v.phone && !/^[+\d\s()-]*$/.test(v.phone)) fail($('#phone', form).parentNode, 'Please enter a valid phone number');
      if (!v.services.length) fail($('fieldset', form), 'Select at least one service', 'mt-2 text-sm text-destructive');
      if (!v.budget) fail($('#budget', form).closest('.ks-select').parentNode, 'Select an estimated budget');
      if (v.details.length < 20) fail($('#details', form).parentNode, 'Tell us a little more (at least 20 characters)');
      if (!ok) { if (first) first.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' }); return; }
      var btn = $('button[type=submit]', form), orig = btn.innerHTML;
      btn.disabled = true; btn.style.opacity = '.7';
      btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>Sending…';
      send(v).then(function () { success(v); toast('Thanks! Your project inquiry has been received.'); })
        .catch(function () { btn.disabled = false; btn.style.opacity = ''; btn.innerHTML = orig; toast('Something went wrong. Please try again or reach us on WhatsApp.', 'error'); });
    }
    function send(v) {
      if (CONFIG.inquiryEndpoint) {
        return fetch(CONFIG.inquiryEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(v) })
          .then(function (r) { if (!r.ok) throw new Error('fail'); });
      }
      return new Promise(function (r) { setTimeout(r, 600); });
    }
    function message(v) {
      return ['New project inquiry from ' + v.fullName, v.company ? 'Company: ' + v.company : null, 'Email: ' + v.email,
        v.phone ? 'Phone: ' + v.phone : null, 'Services: ' + v.services.join(', '), 'Budget: ' + v.budget, '', v.details]
        .filter(function (l) { return l !== null; }).join('\n');
    }
    function success(v) {
      var heroCls = (window.__btnHero || ''), ghostCls = (window.__btnGhost || '');
      panel.innerHTML = '<div class="flex min-h-[360px] md:min-h-[480px] flex-col items-start justify-center">' +
        '<span class="grid size-16 place-items-center rounded-full bg-primary text-primary-foreground">' + ICON_CHECK_BIG + '</span>' +
        '<h3 class="mt-8 text-3xl font-bold">Thank you, ' + esc(v.fullName.split(' ')[0]) + '!</h3>' +
        '<p class="mt-4 max-w-md text-lg leading-relaxed text-muted-foreground">We\'ve received your inquiry and will get back to you shortly. Want a faster reply? Send the same details on WhatsApp.</p>' +
        '<div class="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap">' +
        '<a href="' + wa(message(v)) + '" target="_blank" rel="noopener noreferrer" class="' + heroCls + ' h-12">' + (ICON_WA ? ICON_WA.outerHTML.replace('size-6', 'size-5') : '') + ' Send on WhatsApp</a>' +
        '<button type="button" data-again class="' + ghostCls + ' h-12">Send another inquiry</button></div></div>';
      $('[data-again]', panel).addEventListener('click', function () { panel.innerHTML = formHTML; bind(); });
      panel.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
    }
    function esc(s) { return s.replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
    var tc = $('#toasts');
    window.__btnHero = (tc && tc.dataset.btnHero) || '';
    window.__btnGhost = (tc && tc.dataset.btnGhost) || '';
    bind();
  }
})();
/*!
 * KS Web — main.js (vanilla JS, no dependencies)
 * Header + mega menu, mobile menu, scroll-reveal, portfolio filter,
 * FAQ accordion, testimonials slider, contact form (validation + toast).
 */
(function () {
  'use strict';

  /* ---------- Config ---------- */
  var CONFIG = {
    // Paste a form endpoint (Formspree / Web3Forms / your webhook) to receive real inquiries.
    // Leave empty to simulate a successful send (same as the original demo behaviour).
    inquiryEndpoint: '',
    whatsapp: '919914424131'
  };

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var cls = function (el, add, remove) {
    (remove || []).forEach(function (c) { el.classList.remove(c); });
    (add || []).forEach(function (c) { el.classList.add(c); });
  };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Toast ---------- */
  function toast(msg, type) {
    var box = $('#toasts'); if (!box) return;
    var t = document.createElement('div');
    t.className = 'toast' + (type === 'error' ? ' error' : '');
    t.setAttribute('role', 'status'); t.textContent = msg;
    box.appendChild(t);
    setTimeout(function () { t.classList.add('out'); setTimeout(function () { t.remove(); }, 260); }, 4200);
  }

  /* ---------- Header, mega menu, scroll progress ---------- */
  var header = $('header');
  var mega = header && $('header > div.absolute');
  var megaTrigger = header && $('nav a[aria-haspopup]', header);
  var megaWrap = megaTrigger && megaTrigger.parentNode;
  var megaOpen = false, megaTimer = null;

  function paintHeader() {
    if (!header) return;
    var solid = window.scrollY > 12 || megaOpen;
    ['border-border', 'bg-background/85', 'backdrop-blur-xl'].forEach(function (c) { header.classList.toggle(c, solid); });
    ['border-transparent', 'bg-background/0'].forEach(function (c) { header.classList.toggle(c, !solid); });
  }
  function setMega(open) {
    megaOpen = open;
    if (mega) {
      ['visible', 'translate-y-0', 'opacity-100'].forEach(function (c) { mega.classList.toggle(c, open); });
      ['invisible', '-translate-y-2', 'opacity-0'].forEach(function (c) { mega.classList.toggle(c, !open); });
    }
    if (megaTrigger) {
      megaTrigger.setAttribute('aria-expanded', String(open));
      var chev = $('svg', megaTrigger); if (chev) chev.classList.toggle('rotate-180', open);
    }
    paintHeader();
  }
  function openMega() { clearTimeout(megaTimer); setMega(true); }
  function closeMegaSoon() { megaTimer = setTimeout(function () { setMega(false); }, 120); }
  if (megaWrap && mega) {
    [megaWrap, mega].forEach(function (el) { el.addEventListener('mouseenter', openMega); el.addEventListener('mouseleave', closeMegaSoon); });
    megaTrigger.addEventListener('focus', openMega);
    megaTrigger.addEventListener('click', function () { setMega(false); });
    $$('a', mega).forEach(function (a) { a.addEventListener('click', function () { setMega(false); }); });
  }
  var bar = $('#scroll-progress');
  function onScroll() {
    paintHeader();
    if (bar) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, window.scrollY / h) : 0) + ')';
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var mm = $('#mobile-menu');
  var mmOpen = false;
  function setMenu(open) {
    if (!mm || open === mmOpen) return;
    mmOpen = open;
    var st = open ? 'open' : 'closed';
    if (open) { mm.hidden = false; }
    mm.dataset.state = st;
    $('[data-overlay]', mm).dataset.state = st;
    $('[data-panel]', mm).dataset.state = st;
    document.body.classList.toggle('menu-open', open);
    if (!open) setTimeout(function () { if (!mmOpen) mm.hidden = true; }, 300);
    else setTimeout(function () { var b = $('[data-close][aria-label]', mm); if (b) b.focus(); }, 50);
    var trig = $('button[aria-label="Open menu"]'); if (trig) trig.setAttribute('aria-expanded', String(open));
  }
  var openBtn = $('button[aria-label="Open menu"]');
  if (openBtn) openBtn.addEventListener('click', function () { setMenu(true); });
  if (mm) {
    $('[data-overlay]', mm).addEventListener('click', function () { setMenu(false); });
    $$('[data-close]', mm).forEach(function (el) { el.addEventListener('click', function () { setMenu(false); }); });
    var tgl = $('[data-svc-toggle]', mm), list = $('[data-svc-list]', mm);
    if (tgl) tgl.addEventListener('click', function () {
      var o = tgl.getAttribute('aria-expanded') === 'true';
      tgl.setAttribute('aria-expanded', String(!o)); list.hidden = o; $('[data-chev]', tgl).classList.toggle('open', !o);
    });
  }
  window.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { setMega(false); setMenu(false); }
  });
  window.addEventListener('resize', function () { if (window.innerWidth >= 1024) setMenu(false); });

  /* ---------- Scroll reveal (fade-up) ---------- */
  var HIDDEN = ['translate-y-6', 'opacity-0'], SHOWN = ['translate-y-0', 'opacity-100'];
  var revealEls = $$('.duration-700.ease-out.opacity-0');
  function show(el) { cls(el, SHOWN, HIDDEN); }
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { show(en.target); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
    window.__ksReveal = io;
  } else { revealEls.forEach(show); }

  /* ---------- Portfolio filter ---------- */
  var tablist = $('[role=tablist][aria-label="Filter projects"]');
  if (tablist) {
    var grid = tablist.nextElementSibling;
    var cards = $$('article', grid);
    cards.forEach(function (c) { c.dataset.cat = $('span.absolute', c).textContent.trim(); });
    var empty = document.createElement('p');
    empty.className = 'mt-12 text-muted-foreground'; empty.textContent = 'New projects in this category coming soon.'; empty.hidden = true;
    grid.parentNode.appendChild(empty);
    var ON = ['border-primary', 'bg-primary', 'text-primary-foreground'];
    var OFF = ['border-border', 'text-muted-foreground', 'hover:border-border-strong', 'hover:text-foreground'];
    $$('[role=tab]', tablist).forEach(function (tab) {
      tab.addEventListener('click', function () {
        var f = tab.textContent.trim();
        $$('[role=tab]', tablist).forEach(function (t) {
          var on = t === tab; t.setAttribute('aria-selected', String(on));
          cls(t, on ? ON : OFF, on ? OFF : ON);
        });
        var i = 0;
        cards.forEach(function (c) {
          var match = f === 'All' || c.dataset.cat === f;
          c.hidden = !match; c.style.display = match ? '' : 'none';
          if (match) {
            c.style.transitionDelay = ((i % 3) * 80) + 'ms'; i++;
            if (!reduceMotion) { cls(c, HIDDEN, SHOWN); void c.offsetWidth; requestAnimationFrame(function () { requestAnimationFrame(function () { show(c); }); }); }
            else show(c);
          }
        });
        empty.hidden = i !== 0;
      });
    });
  }

  /* ---------- FAQ accordion (single, collapsible) ---------- */
  var faqRoot = $('div.w-full[data-orientation=vertical]');
  if (faqRoot) {
    var items = $$(':scope > div[data-state]', faqRoot);
    var setItem = function (item, open) {
      var st = open ? 'open' : 'closed';
      var btn = $('button', item), region = $('[role=region]', item), h3 = $('h3', item);
      item.dataset.state = st; h3.dataset.state = st; btn.dataset.state = st; btn.setAttribute('aria-expanded', String(open));
      if (open) {
        region.hidden = false;
        region.style.setProperty('--radix-collapsible-content-height', region.scrollHeight + 'px');
        region.dataset.state = 'open';
      } else {
        region.style.setProperty('--radix-collapsible-content-height', region.scrollHeight + 'px');
        region.dataset.state = 'closed';
        setTimeout(function () { if (region.dataset.state === 'closed') region.hidden = true; }, 200);
      }
    };
    items.forEach(function (item) {
      var region = $('[role=region]', item);
      if (item.dataset.state === 'closed') region.hidden = true;
      $('button', item).addEventListener('click', function () {
        var isOpen = item.dataset.state === 'open';
        items.forEach(function (o) { if (o !== item && o.dataset.state === 'open') setItem(o, false); });
        setItem(item, !isOpen);
      });
    });
  }

  /* ---------- Testimonials slider (loop, buttons + swipe) ---------- */
  var car = $('[aria-roledescription=carousel]');
  if (car) {
    var vp = $('.overflow-hidden', car), track = $('.flex', vp);
    track.classList.add('ks-track');
    var count = track.children.length, cur = 0, busy = false;
    var dots = $$('span', car.parentNode.querySelector('[aria-hidden=true].mt-8'));
    var DON = ['w-10', 'bg-primary'], DOFF = ['w-4', 'bg-border-strong'];
    var paintDots = function () { dots.forEach(function (d, i) { cls(d, i === cur ? DON : DOFF, i === cur ? DOFF : DON); }); };
    var step = function () { return track.children[0].getBoundingClientRect().width; };
    var move = function (dir) {
      if (busy || count < 2) return; busy = true;
      var w = step(), dur = reduceMotion ? 0 : 450;
      track.style.transition = 'none';
      if (dir < 0) { track.insertBefore(track.lastElementChild, track.firstElementChild); track.style.transform = 'translate3d(' + (-w) + 'px,0,0)'; void track.offsetWidth; }
      track.style.transition = 'transform ' + dur + 'ms cubic-bezier(.2,.7,.2,1)';
      track.style.transform = 'translate3d(' + (dir > 0 ? -w : 0) + 'px,0,0)';
      cur = (cur + dir + count) % count; paintDots();
      setTimeout(function () {
        track.style.transition = 'none';
        if (dir > 0) track.appendChild(track.firstElementChild);
        track.style.transform = 'translate3d(0,0,0)'; busy = false;
      }, dur + 20);
    };
    var prev = $('button[aria-label="Previous testimonial"], button[aria-label="Previous project"]'), next = $('button[aria-label="Next testimonial"], button[aria-label="Next project"]');
    if (prev) prev.addEventListener('click', function () { move(-1); });
    if (next) next.addEventListener('click', function () { move(1); });
    var sx = null;
    vp.addEventListener('pointerdown', function (e) { sx = e.clientX; track.classList.add('dragging'); });
    window.addEventListener('pointerup', function (e) {
      if (sx === null) return; var dx = e.clientX - sx; sx = null; track.classList.remove('dragging');
      if (Math.abs(dx) > 50) move(dx < 0 ? 1 : -1);
    });
    paintDots();
  }

  /* ---------- Contact form ---------- */
  var SERVICES = ['Web Development', 'Graphic & UI/UX Design', 'SEO & Digital Marketing', 'Social Media Management', 'Maintenance & Support', 'Other'];
  var CHECK = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check size-4" aria-hidden="true"><path d="M20 6 9 17l-5-5"></path></svg>';
  var form = $('#inquiry form');
  if (form) {
    var panel = form.parentNode, formHTML = panel.innerHTML;
    var BUDGETS = ['Under $1,000', '$1,000 – $3,000', '$3,000 – $7,500', '$7,500 – $15,000', '$15,000+', 'Not sure yet'];
    var wa = function (msg) { return 'https://wa.me/' + CONFIG.whatsapp + '?text=' + encodeURIComponent(msg); };
    var ICON_WA = $('a[href^="https://wa.me"] svg', $('#inquiry'));
    var ICON_CHECK_BIG = CHECK.replace('size-4', 'size-8');
    var state;
    function bind() {
      form = $('#inquiry form'); if (!form) return;
      state = { services: [], budget: '' };
      /* chips */
      $$('fieldset button[aria-pressed]', form).forEach(function (b) {
        var label = b.textContent.trim();
        b.addEventListener('click', function () {
          var on = state.services.indexOf(label) === -1;
          state.services = on ? state.services.concat(label) : state.services.filter(function (s) { return s !== label; });
          b.setAttribute('aria-pressed', String(on));
          var ON = ['border-primary', 'bg-primary', 'text-primary-foreground'], OFF = ['border-border', 'text-muted-foreground', 'hover:border-border-strong', 'hover:text-foreground'];
          cls(b, on ? ON : OFF, on ? OFF : ON);
          var svg = $('svg', b);
          if (on && !svg) b.insertAdjacentHTML('afterbegin', CHECK); else if (!on && svg) svg.remove();
          clearErr($('fieldset', form));
        });
      });
      /* budget select */
      var trig = $('#budget', form), wrap = document.createElement('div');
      wrap.className = 'ks-select'; trig.parentNode.insertBefore(wrap, trig); wrap.appendChild(trig);
      var ul = document.createElement('ul'); ul.setAttribute('role', 'listbox'); ul.tabIndex = -1;
      BUDGETS.forEach(function (b) {
        var li = document.createElement('li'); li.setAttribute('role', 'option'); li.tabIndex = 0; li.dataset.v = b; li.textContent = b;
        li.setAttribute('aria-selected', 'false'); ul.appendChild(li);
      });
      wrap.appendChild(ul);
      var label = $('span', trig);
      var toggle = function (o) { wrap.classList.toggle('open', o); trig.setAttribute('aria-expanded', String(o)); };
      trig.addEventListener('click', function () { toggle(!wrap.classList.contains('open')); });
      var pick = function (li) {
        state.budget = li.dataset.v; label.textContent = li.dataset.v; trig.removeAttribute('data-placeholder');
        $$('[role=option]', ul).forEach(function (o) { o.setAttribute('aria-selected', String(o === li)); });
        toggle(false); trig.focus(); clearErr(wrap.parentNode);
      };
      ul.addEventListener('click', function (e) { var li = e.target.closest('[role=option]'); if (li) pick(li); });
      ul.addEventListener('keydown', function (e) {
        var li = e.target.closest('[role=option]'); if (!li) return;
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(li); }
        if (e.key === 'ArrowDown' && li.nextElementSibling) { e.preventDefault(); li.nextElementSibling.focus(); }
        if (e.key === 'ArrowUp' && li.previousElementSibling) { e.preventDefault(); li.previousElementSibling.focus(); }
      });
      document.addEventListener('click', function (e) { if (!wrap.contains(e.target)) toggle(false); });
      /* clear errors while typing */
      $$('input,textarea', form).forEach(function (i) { i.addEventListener('input', function () { clearErr(i.parentNode); }); });
      form.addEventListener('submit', onSubmit);
    }
    function setErr(box, msg, cls2) {
      clearErr(box); var p = document.createElement('p'); p.setAttribute('role', 'alert');
      p.className = cls2 || 'text-sm text-destructive'; p.textContent = msg; p.dataset.err = '1'; box.appendChild(p);
    }
    function clearErr(box) { if (!box) return; $$('[data-err]', box).forEach(function (p) { p.remove(); }); }
    function onSubmit(e) {
      e.preventDefault();
      var v = {
        fullName: $('#fullName', form).value.trim(), email: $('#email', form).value.trim(),
        phone: $('#phone', form).value.trim(), company: $('#company', form).value.trim(),
        services: state.services.slice(), budget: state.budget, details: $('#details', form).value.trim()
      };
      var ok = true, first = null;
      var fail = function (box, msg, c) { setErr(box, msg, c); ok = false; if (!first) first = box; };
      ['fullName', 'email', 'phone', 'company'].forEach(function (id) { clearErr($('#' + id, form).parentNode); });
      clearErr($('fieldset', form)); clearErr($('#budget', form).closest('.ks-select').parentNode); clearErr($('#details', form).parentNode);
      if (v.fullName.length < 2) fail($('#fullName', form).parentNode, 'Please enter your full name');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email)) fail($('#email', form).parentNode, 'Please enter a valid email address');
      if (v.phone && !/^[+\d\s()-]*$/.test(v.phone)) fail($('#phone', form).parentNode, 'Please enter a valid phone number');
      if (!v.services.length) fail($('fieldset', form), 'Select at least one service', 'mt-2 text-sm text-destructive');
      if (!v.budget) fail($('#budget', form).closest('.ks-select').parentNode, 'Select an estimated budget');
      if (v.details.length < 20) fail($('#details', form).parentNode, 'Tell us a little more (at least 20 characters)');
      if (!ok) { if (first) first.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' }); return; }
      var btn = $('button[type=submit]', form), orig = btn.innerHTML;
      btn.disabled = true; btn.style.opacity = '.7';
      btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>Sending…';
      send(v).then(function () { success(v); toast('Thanks! Your project inquiry has been received.'); })
        .catch(function () { btn.disabled = false; btn.style.opacity = ''; btn.innerHTML = orig; toast('Something went wrong. Please try again or reach us on WhatsApp.', 'error'); });
    }
    function send(v) {
      if (CONFIG.inquiryEndpoint) {
        return fetch(CONFIG.inquiryEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(v) })
          .then(function (r) { if (!r.ok) throw new Error('fail'); });
      }
      return new Promise(function (r) { setTimeout(r, 600); });
    }
    function message(v) {
      return ['New project inquiry from ' + v.fullName, v.company ? 'Company: ' + v.company : null, 'Email: ' + v.email,
        v.phone ? 'Phone: ' + v.phone : null, 'Services: ' + v.services.join(', '), 'Budget: ' + v.budget, '', v.details]
        .filter(function (l) { return l !== null; }).join('\n');
    }
    function success(v) {
      var heroCls = (window.__btnHero || ''), ghostCls = (window.__btnGhost || '');
      panel.innerHTML = '<div class="flex min-h-[360px] md:min-h-[480px] flex-col items-start justify-center">' +
        '<span class="grid size-16 place-items-center rounded-full bg-primary text-primary-foreground">' + ICON_CHECK_BIG + '</span>' +
        '<h3 class="mt-8 text-3xl font-bold">Thank you, ' + esc(v.fullName.split(' ')[0]) + '!</h3>' +
        '<p class="mt-4 max-w-md text-lg leading-relaxed text-muted-foreground">We\'ve received your inquiry and will get back to you shortly. Want a faster reply? Send the same details on WhatsApp.</p>' +
        '<div class="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap">' +
        '<a href="' + wa(message(v)) + '" target="_blank" rel="noopener noreferrer" class="' + heroCls + ' h-12">' + (ICON_WA ? ICON_WA.outerHTML.replace('size-6', 'size-5') : '') + ' Send on WhatsApp</a>' +
        '<button type="button" data-again class="' + ghostCls + ' h-12">Send another inquiry</button></div></div>';
      $('[data-again]', panel).addEventListener('click', function () { panel.innerHTML = formHTML; bind(); });
      panel.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
    }
    function esc(s) { return s.replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
    var tc = $('#toasts');
    window.__btnHero = (tc && tc.dataset.btnHero) || '';
    window.__btnGhost = (tc && tc.dataset.btnGhost) || '';
    bind();
  }
})();
