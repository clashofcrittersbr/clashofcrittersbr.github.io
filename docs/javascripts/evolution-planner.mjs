import { currentUser, getSupabase } from './site-auth.mjs';
import { confirmDialog, notify } from './site-dialogs.mjs';

const CATALOG_URL = new URL('../assets/data/planner-families.json', import.meta.url);
const STORAGE_KEY = 'cocbr-evolution-plan-v1';
const EMPTY = () => ({ version: 1, progress: {} });
const normalizeText = (value) => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');

function normalizePlan(raw, families) {
  if (!raw || raw.version !== 1 || !raw.progress || typeof raw.progress !== 'object' || Array.isArray(raw.progress)) {
    throw new Error('Arquivo de plano incompatível.');
  }
  const plan = EMPTY();
  families.forEach((family) => {
    const entry = raw.progress[family.id];
    if (!entry || typeof entry !== 'object') return;
    const stage = (value) => Number.isInteger(value) && value >= 0 && value <= family.forms.length ? value : 0;
    const owned = stage(entry.owned);
    const goal = stage(entry.goal);
    if (owned || goal) plan.progress[family.id] = { owned, goal };
  });
  return plan;
}

function readLocal(families) {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? normalizePlan(JSON.parse(saved), families) : EMPTY();
  } catch { return EMPTY(); }
}

function make(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

function stageSelect(family, field, value) {
  const label = make('label', 'planner-field', field === 'owned' ? 'Tenho até' : 'Minha meta');
  const select = make('select');
  select.dataset.stage = field;
  const first = new Option(field === 'owned' ? 'Nenhuma' : 'Sem meta', '0');
  select.add(first);
  family.forms.forEach((form) => select.add(new Option(`T${form.tier} · ${form.name}`, String(form.tier))));
  select.value = String(value);
  label.append(select);
  return label;
}

function createCard(family, entry) {
  const owned = entry?.owned || 0;
  const goal = entry?.goal || 0;
  const card = make('article', 'planner-card');
  card.dataset.family = family.id;
  const header = make('div', 'planner-card-head');
  const shown = family.forms.find((form) => form.tier === owned) || family.forms[0];
  const portrait = make('img', 'planner-portrait');
  portrait.src = shown.portrait;
  portrait.alt = `Retrato de ${shown.name}`;
  portrait.loading = 'lazy';
  portrait.width = 64;
  portrait.height = 64;
  portrait.addEventListener('error', () => { portrait.hidden = true; }, { once: true });
  const heading = make('div');
  const title = make('h3');
  const link = make('a', null, family.name);
  link.href = `../../tataris/${family.id}/`;
  title.append(link);
  const element = make('span', 'planner-element', family.element);
  heading.append(title, element);
  header.append(portrait, heading);
  const badge = make('span', 'planner-badge', goal
    ? (owned >= goal ? 'Meta concluída' : `Meta pendente · T${goal}`)
    : (owned === family.forms.length ? 'Forma final alcançada' : 'Sem meta'));
  const fields = make('div', 'planner-fields');
  fields.append(stageSelect(family, 'owned', owned), stageSelect(family, 'goal', goal));
  const line = make('ol', 'planner-line');
  family.forms.forEach((form) => {
    const item = make('li', form.tier <= owned ? 'is-owned' : '', `T${form.tier} · ${form.name}`);
    if (form.tier === goal) item.classList.add('is-goal');
    line.append(item);
  });
  card.append(header, badge, fields, line);
  return card;
}

async function initPlanner() {
  const root = document.getElementById('evolution-planner');
  if (!root) return;
  const status = root.querySelector('[data-planner-status]');
  const grid = root.querySelector('[data-planner-grid]');
  const summary = root.querySelector('[data-planner-summary]');
  const results = root.querySelector('[data-planner-results]');
  const search = root.querySelector('[data-planner-search]');
  const element = root.querySelector('[data-planner-element]');
  const filter = root.querySelector('[data-planner-filter]');
  let families, state;

  const message = (text, kind = 'info') => { status.textContent = text; status.dataset.kind = kind; };
  try {
    const response = await fetch(CATALOG_URL);
    if (!response.ok) throw new Error();
    const catalog = await response.json();
    if (catalog.schemaVersion !== 1 || !Array.isArray(catalog.families)) throw new Error();
    families = catalog.families;
    state = readLocal(families);
  } catch {
    message('Não foi possível carregar o catálogo. Atualize a página para tentar novamente.', 'error');
    return;
  }

  const saveLocal = () => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); return true; }
    catch { message('O navegador não conseguiu salvar neste dispositivo. Exporte uma cópia em JSON.', 'error'); return false; }
  };
  const progress = (family) => state.progress[family.id] || { owned: 0, goal: 0 };
  const render = () => {
    const started = families.filter((family) => progress(family).owned > 0).length;
    const final = families.filter((family) => progress(family).owned === family.forms.length).length;
    const pending = families.filter((family) => {
      const p = progress(family);
      return p.goal > p.owned;
    }).length;
    summary.replaceChildren(
      make('span', null, `${started} de ${families.length} famílias iniciadas`),
      make('span', null, `${final} na forma final`),
      make('span', null, `${pending} metas pendentes`)
    );
    const term = normalizeText(search.value.trim());
    const visible = families.filter((family) => {
      const p = progress(family);
      if (element.value !== 'all' && family.element !== element.value) return false;
      if (term && !normalizeText(family.name).includes(term) && !family.forms.some((form) => normalizeText(form.name).includes(term))) return false;
      return filter.value === 'all'
        || (filter.value === 'unstarted' && p.owned === 0)
        || (filter.value === 'started' && p.owned > 0)
        || (filter.value === 'pending' && p.goal > p.owned)
        || (filter.value === 'complete' && p.goal > 0 && p.owned >= p.goal)
        || (filter.value === 'final' && p.owned === family.forms.length);
    });
    grid.replaceChildren(...visible.map((family) => createCard(family, progress(family))));
    results.textContent = `${visible.length} de ${families.length} famílias exibidas.`;
  };

  search.addEventListener('input', render);
  element.addEventListener('change', render);
  filter.addEventListener('change', render);
  grid.addEventListener('change', (event) => {
    const select = event.target.closest('select[data-stage]');
    const card = select?.closest('[data-family]');
    if (!card) return;
    const family = families.find((item) => item.id === card.dataset.family);
    if (!family) return;
    const entry = { ...progress(family), [select.dataset.stage]: Number(select.value) };
    if (entry.owned || entry.goal) state.progress[family.id] = entry;
    else delete state.progress[family.id];
    saveLocal();
    render();
    grid.querySelector(`[data-family="${family.id}"] select[data-stage="${select.dataset.stage}"]`)?.focus();
  });

  root.querySelector('[data-planner-export]').addEventListener('click', () => {
    const payload = { ...state, catalog: '2026-10-09', exportedAt: new Date().toISOString() };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
    const link = make('a');
    link.href = url;
    link.download = 'clash-of-critters-plano-evolucoes.json';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  root.querySelector('[data-planner-import]').addEventListener('change', async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      if (file.size > 1024 * 1024) throw new Error('O arquivo é grande demais para um plano.');
      const incoming = normalizePlan(JSON.parse(await file.text()), families);
      if (Object.keys(state.progress).length && !(await confirmDialog('Importar este arquivo substituirá o plano deste dispositivo.', { title: 'Importar plano', action: 'Importar' }))) return;
      state = incoming;
      saveLocal();
      render();
      notify('Plano importado.');
    } catch (error) { message(error.message || 'Não foi possível importar o arquivo.', 'error'); }
  });
  root.querySelector('[data-planner-clear]').addEventListener('click', async () => {
    if (!(await confirmDialog('Limpar todo o progresso e todas as metas deste dispositivo?', { title: 'Limpar plano', action: 'Limpar', danger: true }))) return;
    state = EMPTY();
    saveLocal();
    render();
    notify('Plano local limpo. A cópia da conta, se houver, permanece salva.');
  });

  const cloudSave = root.querySelector('[data-planner-cloud-save]');
  const cloudLoad = root.querySelector('[data-planner-cloud-load]');
  const accountLabel = root.querySelector('[data-planner-account]');
  const supabase = getSupabase();
  let user = null;
  try { user = await currentUser(); } catch { /* O plano local continua disponível. */ }
  if (user && supabase) {
    accountLabel.textContent = 'Conta conectada. Você pode guardar ou recuperar uma cópia privada do plano.';
    cloudSave.disabled = false;
    cloudLoad.disabled = false;
  }
  cloudSave.addEventListener('click', async () => {
    if (!user) return;
    cloudSave.disabled = true;
    try {
      const { error } = await supabase.from('user_settings').upsert({
        id: user.id, collection_plan: state, updated_at: new Date().toISOString()
      }, { onConflict: 'id' });
      if (error) throw error;
      message('Plano salvo na sua conta.', 'success');
      notify('Plano salvo na conta.');
    } catch { message('Não foi possível salvar na conta. Seu plano local continua disponível.', 'error'); }
    finally { cloudSave.disabled = false; }
  });
  cloudLoad.addEventListener('click', async () => {
    if (!user) return;
    cloudLoad.disabled = true;
    try {
      const { data, error } = await supabase.from('user_settings').select('collection_plan').eq('id', user.id).maybeSingle();
      if (error) throw error;
      if (!data) { message('Ainda não há plano salvo nesta conta.', 'info'); return; }
      const incoming = normalizePlan(data.collection_plan, families);
      if (Object.keys(state.progress).length && !(await confirmDialog('O plano salvo na conta substituirá o progresso deste dispositivo.', { title: 'Carregar plano', action: 'Carregar' }))) return;
      state = incoming;
      saveLocal();
      render();
      message('Plano carregado da sua conta.', 'success');
    } catch { message('Não foi possível carregar o plano da conta. Seu plano local foi preservado.', 'error'); }
    finally { cloudLoad.disabled = false; }
  });

  message('Catálogo carregado. Seu progresso é privado.');
  render();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initPlanner);
else initPlanner();
