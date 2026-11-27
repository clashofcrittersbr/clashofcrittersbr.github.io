import { getSupabase } from './site-auth.mjs';

const db = getSupabase();
let revision = 0;

function accountLink() {
  const header = document.querySelector('.md-header__inner');
  if (!header) return null;
  let link = header.querySelector('[data-site-account]');
  if (link) return link;

  const widget = document.createElement('div');
  widget.className = 'site-account-widget';
  link = document.createElement('a');
  link.href = '/conta/';
  link.className = 'site-account-link';
  link.dataset.siteAccount = '';
  link.setAttribute('aria-label', 'Entrar ou abrir minha conta');

  const icon = document.createElement('span');
  icon.className = 'site-account-icon';
  icon.textContent = '●';
  icon.setAttribute('aria-hidden', 'true');
  const details = document.createElement('span');
  details.className = 'site-account-details';
  const label = document.createElement('span');
  label.className = 'site-account-label';
  label.textContent = 'Entrar';
  const meta = document.createElement('span');
  meta.className = 'site-account-meta';
  meta.hidden = true;
  details.append(label, meta);
  link.append(icon, details);

  const copy = document.createElement('button');
  copy.type = 'button';
  copy.className = 'site-account-copy';
  copy.textContent = '⧉';
  copy.title = 'Copiar UID';
  copy.setAttribute('aria-label', 'Copiar UID do jogo');
  copy.hidden = true;
  copy.addEventListener('click', async () => {
    if (!copy.dataset.uid) return;
    try {
      await navigator.clipboard.writeText(copy.dataset.uid);
      window.notify?.('UID copiado.');
    } catch {
      window.notify?.('Não foi possível copiar o UID.');
    }
  });
  widget.append(link, copy);
  const source = header.querySelector('.md-header__source');
  if (source) source.insertAdjacentElement('afterend', widget);
  else header.append(widget);
  return link;
}

async function renderSession(session) {
  const current = ++revision;
  const link = accountLink();
  if (!link) return;
  const label = link.querySelector('.site-account-label');
  const meta = link.querySelector('.site-account-meta');
  const icon = link.querySelector('.site-account-icon');
  const copy = link.parentElement.querySelector('.site-account-copy');
  const homeLink = document.querySelector('.wiki-join-actions a[href*="conta"]');
  icon.replaceChildren();
  copy.hidden = true;
  copy.dataset.uid = '';
  meta.textContent = '';
  meta.hidden = true;
  if (!session?.user || !db) {
    icon.textContent = '●';
    label.textContent = 'Entrar';
    link.setAttribute('aria-label', 'Entrar ou criar perfil');
    if (homeLink) homeLink.textContent = 'Entrar ou criar perfil';
    return;
  }
  icon.textContent = '●';
  label.textContent = 'Minha conta';
  link.setAttribute('aria-label', 'Abrir minha conta');
  if (homeLink) homeLink.textContent = 'Ver meu perfil';
  const { data, error } = await db.from('profiles')
    .select('display_name,game_uid,trainer_level,avatar_url').eq('id', session.user.id).maybeSingle();
  if (current !== revision || error) return;

  const nick = data?.display_name || 'Minha conta';
  const uid = data?.game_uid || '';
  const level = data?.trainer_level;
  label.textContent = nick;
  const parts = [];
  if (Number.isInteger(level) && level > 0) parts.push(`Nível ${level}`);
  if (uid) parts.push(`UID ${uid}`);
  meta.textContent = parts.join(' · ');
  meta.hidden = !parts.length;
  link.setAttribute('aria-label', `${nick}${parts.length ? ', ' + parts.join(', ') : ''}. Abrir perfil para editar.`);
  if (uid) {
    copy.dataset.uid = uid;
    copy.hidden = false;
    copy.setAttribute('aria-label', `Copiar UID ${uid}`);
  }
  if (data?.avatar_url && /^https:\/\//.test(data.avatar_url)) {
    const img = document.createElement('img');
    img.src = data.avatar_url;
    img.alt = '';
    img.width = 28;
    img.height = 28;
    img.onerror = () => { img.remove(); icon.textContent = '●'; };
    icon.replaceChildren(img);
  }
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
