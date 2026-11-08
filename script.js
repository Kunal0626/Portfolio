(() => {
  'use strict';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const LINKS = {
    email: 'kunalsinghh0626@gmail.com',
    github: 'https://github.com/Kunal0626',
    linkedin: 'https://www.linkedin.com/in/kunal-singh-b7a807318/',
    resume: 'assets/Kunal_Singh_Resume.pdf'
  };

  /* ---------- Project data (shown in the details dialog and the terminal) ---------- */
  const PROJECTS = {
    chainlog: {
      name: 'ChainLog', file: 'CHAINLOG.BIN', label: 'DATA INTEGRITY',
      sum: 'A tamper-evident audit log engine in C++. Any edit, deletion or reordering of past records is detectable, and you can prove a record is in the log with a short Merkle proof.',
      how: [
        'Each record stores the hash of the previous record (SHA-256), forming a hash chain.',
        'Records are batched into a Merkle tree; the root is stored as a checkpoint.',
        'An inclusion proof is just the sibling hashes along one path, so it is O(log n) in size.',
        'Appends go through a write-ahead log first (the DBMS recovery idea), so a crash mid-write cannot corrupt history.',
        'A verifier CLI recomputes the chain and reports the first record that does not match.'
      ],
      concepts: ['Trees (DSA)', 'Hashing', 'Write-ahead logging (DBMS)', 'Crash safety']
    },
    sandboxlite: {
      name: 'SandboxLite', file: 'SANDBOXLITE.BIN', label: 'OPERATING SYSTEMS',
      sum: 'A Linux sandbox that runs an untrusted program, watches every system call it makes, and blocks anything outside an allowlist.',
      how: [
        'The parent forks a child that calls ptrace(TRACEME) and then execve()s the target program.',
        'The parent stops the child at every syscall and reads the syscall number from its registers.',
        'A per-program policy file lists allowed syscalls; a disallowed one kills the child and is logged.',
        'seccomp-bpf moves the same filtering into the kernel so overhead can be compared with ptrace.',
        'A Python report builds a baseline of syscall sequences from clean runs and flags runs that deviate.'
      ],
      concepts: ['Processes & signals (OS)', 'System calls', 'Kernel filtering (seccomp-bpf)', 'Anomaly detection']
    },
    queryshield: {
      name: 'QueryShield', file: 'QUERYSHIELD.JAR', label: 'WEB & DATABASE SECURITY',
      sum: 'A Java reverse proxy that screens incoming requests for SQL-injection payloads before they reach the database-backed app.',
      how: [
        'Requests are URL-decoded and normalised so tricks like case changes and comment padding do not hide a payload.',
        'An Aho–Corasick automaton matches many known attack signatures in a single linear pass.',
        'A small SQL tokenizer catches structure that plain string matching misses.',
        'Blocked requests get a 403; clean ones are forwarded to the app unchanged.',
        'Evaluated against a deliberately vulnerable MySQL app with a labelled set of attack and normal inputs.',
        'On a held-out test split: 100% detection at a 2.1% false-positive rate (98% precision).'
      ],
      concepts: ['Aho–Corasick (DSA)', 'Tokenizing & parsing', 'SQL injection', 'Precision vs false positives']
    },
    chokepoint: {
      name: 'ChokePoint', file: 'CHOKEPOINT.PY', label: 'GRAPH ALGORITHMS',
      sum: 'An analyzer that finds how an attacker would reach a critical asset, and which few fixes would cut off every route.',
      how: [
        'The network is a directed, weighted graph: hosts are nodes, exploit difficulty sets edge weights.',
        'Dijkstra finds the cheapest route from the entry point to the crown-jewel asset.',
        'Max-flow (Edmonds–Karp) computes the bottleneck; the min-cut is the smallest set of links to fix.',
        'Output is a ranked patch list plus a graph picture with the cut edges highlighted.'
      ],
      concepts: ['Shortest paths (DAA)', 'Max-flow / min-cut', 'Graph modelling', 'Risk prioritisation']
    },
    shadowpot: {
      name: 'ShadowPot', file: 'SHADOWPOT.PY', label: 'THREAT INTELLIGENCE',
      sum: 'An SSH honeypot built on Cowrie, with SQL analytics to study how attackers behave once they think they are inside.',
      how: [
        'Cowrie presents a fake SSH server and records every login attempt and command.',
        'Session logs are loaded into a normalized SQL schema (sessions, credentials, commands, source IPs).',
        'Queries rank the most-tried credentials, repeat source IPs and common post-login commands.'
      ],
      concepts: ['Honeypots', 'Log parsing', 'Normalization & SQL aggregation', 'Attacker behaviour']
    },
    disaster: {
      name: 'ResNav', file: 'RESNAV.SQL', label: 'FULL-STACK / DBMS',
      sum: 'Relief logistics where the database, not the application, guarantees that stock is never promised twice.',
      how: [
        'A React console calls a Flask API, which hands the allocation decision to MySQL rather than making it.',
        'A stored procedure locks every candidate stock row in primary-key order, then assigns the nearest centre with stock by haversine distance \u2014 so the plan the operator sees is the dispatch that happens.',
        'Ten triggers and twenty-two CHECK constraints hold the invariants against any client, including a direct SQL session.',
        'Two-session tests show the old read-then-write design committing 20 units against 10 in stock, and the locked version refusing to.'
      ],
      concepts: ['Stored procedures', 'Triggers', 'Row locking', 'Isolation levels', 'Deadlocks', 'Normalization (3NF/BCNF)', 'Transactions']
    }
  };

  const STATUS_TEXT = { building: 'IN PROGRESS', done: 'SHIPPED' };

  /* ---------- Project cards: status, repo links, NOW.LOG ---------- */
  const nowLog = $('#now-log');
  $$('.proj').forEach(card => {
    const st = card.dataset.status === 'done' ? 'done' : 'building';
    $('.status', card).textContent = 'STATUS: ' + STATUS_TEXT[st];
    // Live demo link, same shape as the repo link below: it exists only on
    // cards carrying data-live, and is removed rather than left dangling.
    const live = $('.live', card);
    const liveUrl = (card.dataset.live || '').trim();
    if (live) {
      if (liveUrl) { live.href = liveUrl; }
      else { live.remove(); }
    }

    const gh = $('.gh', card);
    const repo = (card.dataset.repo || '').trim();
    if (gh) {
      if (repo) { gh.href = repo; }
      else {
        gh.removeAttribute('href'); gh.removeAttribute('target'); gh.removeAttribute('rel');
        gh.setAttribute('aria-disabled', 'true'); gh.classList.remove('btn-black'); gh.classList.add('btn-off');
        gh.textContent = 'Code soon';
      }
    }
    if (nowLog) {
      const li = document.createElement('li');
      const tag = document.createElement('span');
      tag.className = 'tag ' + (st === 'done' ? 'green' : 'amber');
      tag.textContent = STATUS_TEXT[st];
      const txt = document.createElement('span');
      txt.textContent = $('h3', card).textContent + ' · ' + $('.tech li', card).textContent;
      li.append(tag, txt);
      nowLog.appendChild(li);
    }
  });
  if (nowLog) {
    const li = document.createElement('li');
    const tag = document.createElement('span'); tag.className = 'tag blue'; tag.textContent = 'SEEKING';
    const txt = document.createElement('span'); txt.textContent = 'Summer 2027 internship';
    li.append(tag, txt); nowLog.appendChild(li);
  }

  /* ---------- Theme ---------- */
  const root = document.documentElement;
  const themeBtn = $('#theme-btn'), themeLabel = $('#theme-label');
  function applyTheme(t, save) {
    root.setAttribute('data-theme', t);
    themeLabel.textContent = t === 'night' ? 'Day mode' : 'Night mode';
    themeBtn.setAttribute('aria-pressed', String(t === 'day'));
    const meta = $('meta[name="theme-color"]'); if (meta) meta.content = t === 'night' ? '#0d0d12' : '#cfe0ff';
    if (save) { try { localStorage.setItem('ks-theme', t); } catch (e) {} }
  }
  applyTheme(root.getAttribute('data-theme') || 'night', false);
  themeBtn.addEventListener('click', () => applyTheme(root.getAttribute('data-theme') === 'night' ? 'day' : 'night', true));

  /* ---------- Starfield ---------- */
  (function stars() {
    const c = $('#stars'); if (!c) return;
    const ctx = c.getContext('2d'); if (!ctx) return;
    let w = 0, h = 0, list = [], raf = 0;
    function size() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth; h = window.innerHeight;
      c.width = w * dpr; c.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(160, (w * h) / 9000));
      list = Array.from({ length: n }, () => ({ x: Math.random() * w, y: Math.random() * h, r: Math.random() * 1.5 + .4, p: Math.random() * 6.28, s: Math.random() * .6 + .2 }));
    }
    function draw(t) {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#fff';
      for (const s of list) {
        ctx.globalAlpha = .35 + .65 * Math.abs(Math.sin(s.p + t * .0006 * s.s));
        ctx.fillRect(s.x, s.y, s.r, s.r);
        if (!reduceMotion) { s.y -= s.s * .04; if (s.y < -2) { s.y = h + 2; s.x = Math.random() * w; } }
      }
      ctx.globalAlpha = 1;
      if (!reduceMotion && !document.hidden) raf = requestAnimationFrame(draw);
    }
    size(); draw(0);
    window.addEventListener('resize', () => { size(); if (reduceMotion) draw(0); });
    document.addEventListener('visibilitychange', () => { cancelAnimationFrame(raf); if (!document.hidden && !reduceMotion) raf = requestAnimationFrame(draw); });
  })();

  /* ---------- Typed role ---------- */
  (function typed() {
    const el = $('#typed'); if (!el || reduceMotion) return;
    const roles = ['Cyber Security Student', 'Security Tool Builder', 'C · C++ · Java · Python', 'DSA · DAA · OS · DBMS'];
    let i = 0, j = roles[0].length, del = true;
    function tick() {
      const word = roles[i];
      el.textContent = word.slice(0, j);
      let delay = del ? 38 : 70;
      if (!del && j === word.length) { del = true; delay = 1700; }
      else if (del && j === 0) { del = false; i = (i + 1) % roles.length; delay = 300; }
      else j += del ? -1 : 1;
      setTimeout(tick, delay);
    }
    setTimeout(tick, 2200);
  })();

  /* ---------- Reveal on scroll ---------- */
  (function reveal() {
    root.classList.add('js');
    const els = $$('.reveal');
    if (!('IntersectionObserver' in window) || reduceMotion) { els.forEach(e => e.classList.add('in')); return; }
    const io = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .08 });
    els.forEach(e => io.observe(e));
    setTimeout(() => els.forEach(e => e.classList.add('in')), 4000);
  })();

  /* ---------- Active nav link ---------- */
  (function navActive() {
    const links = $$('.nav nav a[href^="#"]');
    const map = new Map(links.map(a => [a.getAttribute('href').slice(1), a]));
    if (!('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { links.forEach(l => l.classList.remove('on')); const a = map.get(e.target.id); if (a) a.classList.add('on'); }
    }), { rootMargin: '-35% 0px -60% 0px' });
    map.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
  })();

  /* ---------- Explorer ---------- */
  const FOLDERS = {
    languages: ['C', 'C++', 'Java', 'Python', 'SQL'],
    core: ['DSA', 'DAA', 'Operating Systems', 'DBMS'],
    security: ['Honeypots (Cowrie)', 'Syscall tracing', 'SQL-injection detection', 'SHA-256 & Merkle trees'],
    tools: ['Linux', 'Git', 'MySQL', 'SQLite']
  };
  (function explorer() {
    const out = $('#folder-out'); if (!out) return;
    $$('.folder').forEach(btn => btn.addEventListener('click', () => {
      $$('.folder').forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
      const name = btn.dataset.folder, items = FOLDERS[name] || [];
      out.textContent = '';
      const head = document.createElement('div'); head.textContent = 'C:\\SKILLS\\' + $('span', btn).textContent.toUpperCase() + '\\';
      const ul = document.createElement('ul');
      items.forEach(t => { const li = document.createElement('li'); li.textContent = t; ul.appendChild(li); });
      out.append(head, ul);
      const count = $('#fs-count'); if (count) count.textContent = items.length + ' object(s)';
    }));
  })();

  /* ---------- Details dialog ---------- */
  const dlg = $('#dlg');
  function openProject(id) {
    const p = PROJECTS[id]; if (!p || !dlg) return;
    $('#dlg-file').textContent = '▣ ' + p.file;
    $('#dlg-label').textContent = p.label;
    $('#dlg-title').textContent = p.name;
    $('#dlg-sum').textContent = p.sum;
    const how = $('#dlg-how'); how.textContent = '';
    p.how.forEach(s => { const li = document.createElement('li'); li.textContent = s; how.appendChild(li); });
    const cc = $('#dlg-concepts'); cc.textContent = '';
    p.concepts.forEach(s => { const li = document.createElement('li'); li.textContent = s; cc.appendChild(li); });
    const card = document.querySelector('.proj[data-id="' + id + '"]');
    const st = card && card.dataset.status === 'done' ? 'done' : 'building';
    $('#dlg-status').textContent = 'STATUS: ' + STATUS_TEXT[st] + (st === 'building' ? ' (being built now; code will be on GitHub)' : '');
    if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
  }
  document.addEventListener('click', e => {
    const o = e.target.closest('[data-open]'); if (o) { openProject(o.dataset.open); return; }
    if (e.target === dlg) dlg.close();
  });
  const dlgClose = $('#dlg-close'); if (dlgClose) dlgClose.addEventListener('click', () => dlg.close());

  /* ---------- Copy email ---------- */
  (function copy() {
    const b = $('#copy-email'), s = $('#copy-status'); if (!b) return;
    b.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(LINKS.email); s.textContent = 'Copied ' + LINKS.email + ' ✓'; }
      catch (e) { s.textContent = 'Copy blocked by your browser. Email: ' + LINKS.email; }
      setTimeout(() => { s.textContent = ''; }, 3500);
    });
  })();


  /* ---------- Footer one-liners ---------- */
  (function quips() {
    const b = $('#quip'); if (!b) return;
    const lines = [
      "There's no place like 127.0.0.1",
      "It works on my machine. Let me check yours.",
      "sudo make me a sandwich",
      "Trust, but verify (the hash).",
      "Weak passwords are just open doors with extra steps.",
      "Segfaults: the OS politely saying no.",
      "Merkle trees: because trusting one record is not enough.",
      "There are 10 kinds of people: those who read binary, and those who don't.",
      "Have you tried turning it off and on again? (Please don't, it's a honeypot.)"
    ];
    let i = 0;
    b.addEventListener('click', () => { i = (i + 1 + Math.floor(Math.random() * (lines.length - 1))) % lines.length; b.textContent = lines[i] + ' ↻'; });
  })();

  /* ---------- Terminal ---------- */
  (function terminal() {
    const out = $('#term-out'), input = $('#term-in'), body = $('#term'), form = $('#term-form');
    if (!out || !input) return;
    const history = []; let hi = 0;

    function row(parts, cls) {
      const d = document.createElement('div'); d.className = 'ln' + (cls ? ' ' + cls : '');
      (Array.isArray(parts) ? parts : [parts]).forEach(p => {
        if (typeof p === 'string') d.appendChild(document.createTextNode(p));
        else if (p.b) { const b = document.createElement('b'); b.textContent = p.b; d.appendChild(b); }
        else if (p.a) { const a = document.createElement('a'); a.textContent = p.a[0]; a.href = p.a[1]; if (/^https?:/.test(p.a[1])) { a.target = '_blank'; a.rel = 'noopener noreferrer'; } d.appendChild(a); }
      });
      out.appendChild(d); body.scrollTop = body.scrollHeight;
    }
    const blank = () => row('');
    const ids = Object.keys(PROJECTS);
    const findProject = q => { q = (q || '').toLowerCase().replace(/[^a-z]/g, ''); return ids.find(id => id === q || PROJECTS[id].name.toLowerCase().replace(/[^a-z]/g, '').startsWith(q)) || null; };

    const cmds = {
      help() {
        row([{ b: 'Available commands' }]);
        [['whoami', 'who is Kunal'], ['about', 'short bio'], ['education', 'where I study'], ['skills', 'languages, core CS, security'],
         ['projects', 'list projects and status'], ['open <name>', 'open a project, e.g. open chainlog'], ['contact', 'email, LinkedIn, GitHub'],
         ['resume', 'download my résumé'], ['theme', 'toggle day / night'], ['ls', 'list files'], ['clear', 'clear the screen']]
          .forEach(([c, d]) => row(['  ', { b: c.padEnd(14) }, d]));
      },
      whoami() { row('kunal-singh: cyber security student, tool builder, VIT Chennai (2028).'); },
      about() {
        row('B.Tech Cyber Security @ VIT Chennai, CGPA 8.2/10.');
        row('I build security tools from scratch in C, C++, Java and Python, using DSA, DAA, OS and DBMS on real defensive problems.');
        row('Looking for a Summer 2027 internship.');
      },
      education() {
        row([{ b: 'VIT Chennai' }, ' · B.Tech Cyber Security · 2024–2028 · CGPA 8.2/10']);
        row('D.A.V Public School, Ludhiana · Class XII (2024), Class X (2022)');
      },
      skills() {
        row([{ b: 'Languages  ' }, 'C, C++, Java, Python, SQL']);
        row([{ b: 'Core CS    ' }, 'DSA, DAA, Operating Systems, DBMS']);
        row([{ b: 'Security   ' }, 'Honeypots, syscall tracing, SQLi detection, SHA-256 / Merkle trees']);
        row([{ b: 'Tools      ' }, 'Linux, Git, MySQL, SQLite']);
      },
      projects() {
        ids.forEach(id => {
          const card = document.querySelector('.proj[data-id="' + id + '"]');
          const st = card && card.dataset.status === 'done' ? 'SHIPPED    ' : 'IN PROGRESS';
          row(['  ', { b: PROJECTS[id].name.padEnd(30) }, st]);
        });
        row('Type "open <name>" for details.', 'dim');
      },
      open(arg) {
        const id = findProject(arg);
        if (!id) { row('usage: open <project>   (try: ' + ids.join(', ') + ')', 'err'); return; }
        row('opening ' + PROJECTS[id].file + ' ...'); openProject(id);
      },
      contact() {
        row([{ b: 'email     ' }, { a: [LINKS.email, 'mailto:' + LINKS.email] }]);
        row([{ b: 'linkedin  ' }, { a: ['kunal-singh-b7a807318', LINKS.linkedin] }]);
        row([{ b: 'github    ' }, { a: ['Kunal0626', LINKS.github] }]);
      },
      resume() { row([{ a: ['Download Kunal_Singh_Resume.pdf', LINKS.resume] }]); },
      github() { row([{ a: [LINKS.github, LINKS.github] }]); },
      linkedin() { row([{ a: [LINKS.linkedin, LINKS.linkedin] }]); },
      theme() { themeBtn.click(); row('theme: ' + root.getAttribute('data-theme')); },
      ls() { row('about.txt  projects/  skills/  contact.txt  Kunal_Singh_Resume.pdf'); },
      cat(arg) {
        if (/^about(\.txt)?$/.test(arg || '')) cmds.about();
        else if (/^contact(\.txt)?$/.test(arg || '')) cmds.contact();
        else row('cat: ' + (arg || '') + ': No such file (try: cat about.txt)', 'err');
      },
      date() { row(new Date().toString()); },
      echo(arg) { row(arg || ''); },
      sudo() { row('kunal is not in the sudoers file. This incident will be reported.', 'err'); },
      clear() { out.textContent = ''; },
      exit() { row('There is no escape. Try "projects".', 'dim'); }
    };

    function run(raw) {
      const line = raw.trim(); if (!line) return;
      row(['kunal@portfolio:~$ ', line], 'cmd');
      history.push(line); hi = history.length;
      const [name, ...rest] = line.split(/\s+/); const arg = rest.join(' ');
      if (/rm\s+-rf/.test(line)) { row('Nice try. This portfolio is read-only.', 'err'); return; }
      const fn = cmds[name.toLowerCase()];
      if (fn && Object.prototype.hasOwnProperty.call(cmds, name.toLowerCase())) fn(arg);
      else row(name + ': command not found. Type "help".', 'err');
    }

    form.addEventListener('submit', e => { e.preventDefault(); run(input.value); input.value = ''; });
    input.addEventListener('keydown', e => {
      if (e.key === 'ArrowUp') { e.preventDefault(); if (hi > 0) input.value = history[--hi]; }
      else if (e.key === 'ArrowDown') { e.preventDefault(); hi = Math.min(hi + 1, history.length); input.value = history[hi] || ''; }
      else if (e.key === 'Tab') {
        e.preventDefault();
        const v = input.value, [first, ...rest] = v.split(/\s+/);
        if (!rest.length) { const m = Object.keys(cmds).filter(c => c.startsWith(first.toLowerCase())); if (m.length === 1) input.value = m[0] + ' '; }
        else if (first.toLowerCase() === 'open') { const m = ids.filter(id => id.startsWith(rest[0].toLowerCase())); if (m.length === 1) input.value = 'open ' + m[0]; }
      }
    });
    body.addEventListener('click', e => { if (!window.getSelection().toString() && e.target.tagName !== 'A') input.focus({ preventScroll: true }); });
    $$('.term-chips .chip').forEach(b => b.addEventListener('click', () => run(b.dataset.cmd)));

    row('Kunal Singh · portfolio shell v1.0 · type "help" for commands', 'dim');
    row('Welcome. Try: whoami, projects, open chainlog', 'dim');
    blank();
  })();
})();
