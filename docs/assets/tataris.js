/* Progressive enhancement: every card and form remains readable without scripts. */
(() => {
  const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const catalog = document.querySelector('.tc-catalog');
  if (catalog) {
    const search = catalog.querySelector('#tc-search');
    const selects = ['element', 'tier', 'use'].map(key => catalog.querySelector(`#tc-${key}`));
    const cards = [...catalog.querySelectorAll('.tc-card')];
    function filter() {
      const query = normalize(search.value.trim());
      let total = 0;
      cards.forEach(card => {
        const matches = normalize(card.dataset.name).includes(query) && selects.every(input => !input.value || card.dataset[input.id.slice(3)] === input.value);
        card.hidden = !matches;
        total += Number(matches);
      });
      catalog.querySelector('#tc-count').textContent = `${total} ${total === 1 ? 'forma encontrada' : 'formas encontradas'} de ${cards.length}`;
      catalog.querySelector('#tc-empty').hidden = total !== 0;
    }
    search.addEventListener('input', filter);
    selects.forEach(input => input.addEventListener('change', filter));
    catalog.querySelector('#tc-clear').addEventListener('click', () => {
      search.value = '';
      selects.forEach(input => { input.value = ''; });
      filter();
      search.focus();
    });
    catalog.querySelector('.tc-filters').hidden = false;
  }
  const profile = document.querySelector('.tc-profile');
  if (!profile) return;
  const tabs = [...profile.querySelectorAll('[data-form]')];
  const bar = profile.querySelector('.tc-form-tabs');
  const panels = [...profile.querySelectorAll('.tc-form')];
  bar.setAttribute('role', 'tablist');
  function select(key, writeUrl = true) {
    if (!tabs.some(tab => tab.dataset.form === key)) key = 't1';
    tabs.forEach(tab => {
      const active = tab.dataset.form === key;
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    panels.forEach(panel => {
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', `tab-${panel.id.slice(6)}`);
      panel.tabIndex = 0;
      panel.hidden = panel.id !== `forma-${key}`;
    });
    if (writeUrl) {
      const url = new URL(location.href);
      url.searchParams.set('tier', key);
      if (/^#forma-t[1-4]$/.test(url.hash)) url.hash = ''; // A stale fragment must not override the chosen tab on reload.
      history.replaceState(null, '', url);
    }
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => select(tab.dataset.form));
    tab.addEventListener('keydown', event => {
      let target;
      if (event.key === 'ArrowRight') target = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') target = (index + tabs.length - 1) % tabs.length;
      if (event.key === 'Home') target = 0;
      if (event.key === 'End') target = tabs.length - 1;
      if (target === undefined) return;
      event.preventDefault();
      select(tabs[target].dataset.form);
      tabs[target].focus();
    });
  });
  const initial = () => {
    const hash = location.hash.match(/^#forma-(t[1-4])$/);
    select(hash?.[1] || new URL(location.href).searchParams.get('tier')?.toLowerCase(), false);
  };
  initial();
  window.addEventListener('popstate', initial);
  window.addEventListener('hashchange', initial);
})();
