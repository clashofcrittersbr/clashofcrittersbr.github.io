import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.3/+esm';
import { WIKI_SUPABASE_CONFIG } from './supabase-config.mjs?v=27';

const config = WIKI_SUPABASE_CONFIG || {};
const supabase = config.url && config.publishableKey
  ? createClient(config.url, config.publishableKey, { auth: { flowType: 'pkce', persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } })
  : null;

export function getSupabase() { return supabase; }
export function isAuthConfigured() { return Boolean(supabase); }

export async function signIn(provider) {
  if (!supabase) throw new Error('A autenticação ainda não foi configurada.');
  const redirectTo = `${window.location.origin}/auth/callback.html`;
  const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo } });
  if (error) throw error;
}

export async function signOut() {
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function currentUser() {
  if (!supabase) return null;
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error && error.name !== 'AuthSessionMissingError') throw error;
  return user || null;
}

export async function loadAccount(userId) {
  if (!supabase) throw new Error('Supabase não configurado.');
  const [{ data: profile, error: profileError }, { data: settings, error: settingsError }] = await Promise.all([
    supabase.from('profiles').select('game_uid, display_name, avatar_url').eq('id', userId).maybeSingle(),
    supabase.from('user_settings').select('dojo_levels').eq('id', userId).maybeSingle()
  ]);
  if (profileError) throw profileError;
  if (settingsError) throw settingsError;
  return { profile: profile || {}, settings: settings || { dojo_levels: [0, 0, 0, 0, 0] } };
}

export async function saveAccount(userId, profile, dojoLevels) {
  if (!supabase) throw new Error('Supabase não configurado.');
  const [{ error: profileError }, { error: settingsError }] = await Promise.all([
    supabase.from('profiles').upsert({ id: userId, game_uid: profile.game_uid, display_name: profile.display_name, avatar_url: profile.avatar_url, updated_at: new Date().toISOString() }, { onConflict: 'id' }),
    supabase.from('user_settings').upsert({ id: userId, dojo_levels: dojoLevels, updated_at: new Date().toISOString() }, { onConflict: 'id' })
  ]);
  if (profileError) throw profileError;
  if (settingsError) throw settingsError;
}

export async function loadMembership(userId) {
  const { data, error } = await supabase.from('member_directory').select('id').eq('id', userId).maybeSingle();
  if (error) throw error;
  return Boolean(data);
}

export async function saveMembership(userId, profile, listed) {
  if (!listed) {
    const { error } = await supabase.from('member_directory').delete().eq('id', userId);
    if (error) throw error;
    return;
  }
  const { error } = await supabase.from('member_directory').upsert({
    id: userId,
    display_name: profile.display_name.trim(),
    game_uid: profile.game_uid.trim()
  }, { onConflict: 'id' });
  if (error) throw error;
}

async function refreshMemberPresence() {
  if (!supabase) return;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      // A trigger no banco registra o horário real da visita; só afeta quem aderiu à lista.
      await supabase.from('member_directory').update({ last_seen_at: new Date().toISOString() }).eq('id', session.user.id);
    }
  } catch { /* A página pública continua disponível se a lista falhar. */ }
}

export async function handleCallback() {
  if (!supabase) throw new Error('Supabase não configurado.');
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
}

function showStatus(message, kind = 'info') {
  const status = document.querySelector('[data-account-status]');
  if (status) { status.hidden = false; status.textContent = message; status.dataset.kind = kind; }
}

async function initAccountPage() {
  const root = document.querySelector('[data-account-page]');
  if (!root) return;
  const login = root.querySelector('[data-account-login]');
  const form = root.querySelector('[data-account-form]');
  const logout = root.querySelector('[data-account-logout]');
  if (!supabase) { showStatus('A conta ainda não está conectada ao Supabase. A configuração será habilitada em uma próxima etapa.', 'info'); return; }

  login.querySelectorAll('[data-provider]').forEach((button) => button.addEventListener('click', async () => {
    button.disabled = true;
    try { await signIn(button.dataset.provider); }
    catch (error) {
      showStatus(error.message || 'Não foi possível iniciar o login.', 'error');
      button.disabled = false;
    }
  }));

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      const user = await currentUser();
      const data = new FormData(form);
      const levels = [...Array(5)].map((_, i) => Math.max(0, Number(data.get(`dojo_${i}`)) || 0));
      const listing = form.querySelector('[data-member-opt-in]');
      const profile = {
        game_uid: String(data.get('game_uid') || '').trim(),
        display_name: String(data.get('display_name') || '').trim(),
        avatar_url: data.get('avatar_url')
      };
      if (!listing.disabled && listing.checked && (profile.display_name.length < 2 || !profile.game_uid)) {
        throw new Error('Para aparecer na lista, informe o nome de exibição e o UID do jogo.');
      }
      await saveAccount(user.id, {
        ...profile
      }, levels);
      if (!listing.disabled) await saveMembership(user.id, profile, listing.checked);
      showStatus('Dados salvos.', 'success');
      window.notify?.('Conta atualizada.');
    } catch (error) {
      showStatus(error.message || 'Não foi possível salvar.', 'error');
    }
  });

  logout.addEventListener('click', async () => {
    try { await signOut(); window.location.reload(); }
    catch (error) { showStatus(error.message, 'error'); }
  });

  try {
    const user = await currentUser();
    if (!user) { login.hidden = false; form.hidden = true; logout.hidden = true; root.querySelector('[data-account-status]').hidden = true; return; }
    login.hidden = true; form.hidden = false; logout.hidden = false;
    const account = await loadAccount(user.id);
    root.querySelector('[name="game_uid"]').value = account.profile.game_uid || '';
    root.querySelector('[name="display_name"]').value = account.profile.display_name || '';
    root.querySelector('[name="avatar_url"]').value = account.profile.avatar_url || '';
    (account.settings.dojo_levels || [0, 0, 0, 0, 0]).forEach((value, index) => {
      const field = root.querySelector(`[name="dojo_${index}"]`);
      if (field) field.value = value;
    });
    root.querySelector('[data-account-email]').textContent = user.email || 'Conta autenticada';
    root.querySelector('[data-account-status]').hidden = true;
    try {
      root.querySelector('[data-member-opt-in]').checked = await loadMembership(user.id);
    } catch {
      root.querySelector('[data-member-opt-in]').disabled = true;
      showStatus('A lista de membros está indisponível no momento. Os dados da conta continuam acessíveis.', 'error');
    }
  } catch (error) {
    showStatus(error.message || 'Não foi possível carregar a conta.', 'error');
  }
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initAccountPage);
else initAccountPage();

void refreshMemberPresence();
