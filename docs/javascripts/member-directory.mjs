import { getSupabase } from './site-auth.mjs';

const DAY = 24 * 60 * 60 * 1000;
const INACTIVE_AFTER = 15 * DAY;

function memberCard(member) {
  const item = document.createElement('li');
  const name = document.createElement('span');
  name.className = 'members-name';
  name.textContent = member.display_name;
  const uid = document.createElement('span');
  uid.className = 'members-uid';
  uid.textContent = `UID: ${member.game_uid}`;
  item.append(name, uid);
  return item;
}

function renderGroup(target, countTarget, members) {
  countTarget.textContent = `(${members.length})`;
  target.replaceChildren();
  if (!members.length) {
    const empty = document.createElement('li');
    empty.className = 'members-empty';
    empty.textContent = 'Nenhum membro nesta lista por enquanto.';
    target.append(empty);
    return;
  }
  members.forEach((member) => target.append(memberCard(member)));
}

async function initDirectory() {
  const root = document.querySelector('[data-members-directory]');
  if (!root) return;
  const status = root.querySelector('[data-members-status]');
  const supabase = getSupabase();
  if (!supabase) {
    status.textContent = 'A lista de membros está temporariamente indisponível.';
    status.dataset.kind = 'error';
    return;
  }

  try {
    // A paginação evita que o limite padrão de linhas da API esconda membros.
    const members = [];
    const pageSize = 200;
    for (let offset = 0; ; offset += pageSize) {
      const { data, error } = await supabase.from('member_directory')
        .select('display_name, game_uid, last_seen_at')
        .order('display_name', { ascending: true })
        .range(offset, offset + pageSize - 1);
      if (error) throw error;
      members.push(...data);
      if (data.length < pageSize) break;
    }
    const now = Date.now();
    const active = [];
    const inactive = [];
    members.forEach((member) => {
      const lastSeen = Date.parse(member.last_seen_at);
      (Number.isFinite(lastSeen) && now - lastSeen < INACTIVE_AFTER ? active : inactive).push(member);
    });
    const byName = (a, b) => a.display_name.localeCompare(b.display_name, 'pt-BR');
    active.sort(byName);
    inactive.sort(byName);
    renderGroup(root.querySelector('[data-members-active]'), root.querySelector('[data-members-active-count]'), active);
    renderGroup(root.querySelector('[data-members-inactive]'), root.querySelector('[data-members-inactive-count]'), inactive);
    status.hidden = true;
  } catch {
    status.textContent = 'Não foi possível carregar a lista agora. Tente novamente mais tarde.';
    status.dataset.kind = 'error';
  }
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initDirectory);
else initDirectory();
