(function () {
  var root = document.documentElement;
  var btn = document.getElementById('theme');

  function isDark() {
    var t = root.dataset.theme;
    return t ? t === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  }
  function paint() {
    if (!btn) return;
    btn.textContent = isDark() ? '☀' : '☾';
    btn.setAttribute('aria-pressed', String(isDark()));
  }
  if (btn) {
    btn.addEventListener('click', function () {
      var n = isDark() ? 'light' : 'dark';
      root.dataset.theme = n;
      try { localStorage.setItem('theme', n); } catch (e) {}
      paint();
    });
  }
  paint();

  var ua = navigator.userAgent || '';
  var pf = navigator.platform || '';
  var os = 'windows';
  if (/android/i.test(ua)) os = 'android';
  else if (/iPhone|iPad|iPod/.test(ua) || (pf === 'MacIntel' && navigator.maxTouchPoints > 1)) os = 'ios';
  else if (/Mac/.test(pf)) os = 'macos';

  var wrap = document.getElementById('dl-main');
  if (wrap) {
    var mine = wrap.querySelector('[data-os="' + os + '"]');
    if (mine) {
      mine.classList.add('btn-primary');
      mine.classList.remove('btn-secondary');
      wrap.insertBefore(mine, wrap.firstChild);
    }
  }

  // Store link not filled in yet? Show "Coming soon to Microsoft Store".
  function soonButton(a, text) {
    a.removeAttribute('href');
    a.setAttribute('aria-disabled', 'true');
    a.classList.add('is-soon');
    a.innerHTML = '';
    var l = document.createElement('span');
    l.textContent = a.dataset.label || '';
    var c = document.createElement('small');
    c.textContent = text;
    a.appendChild(l);
    a.appendChild(c);
  }
  var store = document.querySelector('#dl-main [data-store]');
  var storeSoon = !!store && /STORE_URL_TODO/.test(store.getAttribute('href') || '');
  if (storeSoon) soonButton(store, store.dataset.soon || 'Coming soon');

  // No release published yet? Show "Coming soon" instead of a GitHub error page.
  function comingSoon() {
    [].slice.call(document.querySelectorAll('#dl-main .btn')).forEach(function (a) {
      soonButton(a, a.dataset.soon || 'Coming soon');
    });
    var other = document.getElementById('dl-other');
    if (other) other.hidden = true;
    var st = document.getElementById('dl-status');
    if (st) st.hidden = false;
  }
  if (window.fetch) {
    fetch('https://api.github.com/repos/QuranTaha20114/SubScript/releases/latest', {
      headers: { Accept: 'application/vnd.github+json' }
    }).then(function (r) {
      // Only a clear "not found" means there is no release yet; any other
      // problem (offline, rate limit) keeps the normal links.
      if (r.status === 404) comingSoon();
    }).catch(function () {});
  }

  var tabs = [].slice.call(document.querySelectorAll('.tab'));
  function show(id) {
    tabs.forEach(function (t) {
      var on = t.dataset.guide === id;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById('guide-' + t.dataset.guide).hidden = !on;
    });
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { show(t.dataset.guide); });
    t.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      var n = tabs[(i + d + tabs.length) % tabs.length];
      n.focus();
      show(n.dataset.guide);
    });
  });
  if (tabs.length) show(os);
})();
