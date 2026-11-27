import { getSupabase } from './site-auth.mjs';

const db = getSupabase();
let revision = 0;

function accountLink() {
  const header = document.querySelector('.md-header__inner');
  if (!header) return null;
  let link = header.querySelector('[data-site-account]');
  if (link) return link;
  link = document.createElement('a');
  link.href = '/conta/';
  link.className = 'site-account-link';
  link.dataset.siteAccount = '';
  link.setAttribute('aria-label', 'Entrar ou abrir minha conta');
  const icon = document.createElement('span');
  icon.className = 'site-account-icon';
  icon.textContent = '●';
  icon.setAttribute('aria-hidden', 'true');
  const label = document.createElement('span');
  label.className = 'site-account-label';
  label.textContent = 'Entrar';
  link.append(icon, label);
  const source = header.querySelector('.md-header__source');
  if (source) source.insertAdjacentElement('afterend', link);
  else header.append(link);
  return link;
}

async function renderSession(session) {
  const current = ++revision;
  const link = accountLink();
  if (!link) return;
  const label = link.querySelector('.site-account-label');
  const icon = link.querySelector('.site-account-icon');
  icon.replaceChildren();
  if (!session?.user || !db) {
    icon.textContent = '●';
    label.textContent = 'Entrar';
    link.setAttribute('aria-label', 'Entrar ou criar perfil');
    return;
  }
  icon.textContent = '●';
  label.textContent = 'Minha conta';
  link.setAttribute('aria-label', 'Abrir minha conta');
  const homeLink = document.querySelector('.wiki-join-actions a[href*="conta"]');
  if (homeLink) homeLink.textContent = 'Ver meu perfil';
  const { data, error } = await db.from('profiles')
    .select('display_name,avatar_url').eq('id', session.user.id).maybeSingle();
  if (current !== revision) return;
  if (error) return;
  if (data?.display_name) {
    label.textContent = data.display_name;
    link.setAttribute('aria-label', `Minha conta: ${data.display_name}`);
  }
  if (data?.avatar_url && /^https:\/\//.test(data.avatar_url)) {
    const img = document.createElement('img');
    img.src = data.avatar_url;
    img.alt = '';
    img.width = 28;
    img.height = 28;
    img.onerror = () => { img.remove(); icon.textContent = '●'; };
    icon.replaceChildren(img);
  } else icon.textContent = '●';
}

function initHeaderAccount() {
  accountLink();
  if (!db) return;
  db.auth.getSession().then(({ data }) => renderSession(data.session)).catch(() => {});
  db.auth.onAuthStateChange((_event, session) => {
    setTimeout(() => renderSession(session), 0);
  });
  window.addEventListener('wiki:account-updated', () => {
    db.auth.getSession().then(({ data }) => renderSession(data.session)).catch(() => {});
  });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initHeaderAccount);
else initHeaderAccount();
