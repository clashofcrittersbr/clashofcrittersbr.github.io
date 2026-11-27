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
    supabase.from('profiles').select('game_uid, display_name, avatar_url, trainer_level').eq('id', userId).maybeSingle(),
    supabase.from('user_settings').select('dojo_levels').eq('id', userId).maybeSingle()
  ]);
  if (profileError) throw profileError;
  if (settingsError) throw settingsError;
  return { profile: profile || {}, settings: settings || { dojo_levels: [0, 0, 0, 0, 0] } };
}

export async function saveAccount(userId, profile, dojoLevels) {
  if (!supabase) throw new Error('Supabase não configurado.');
  const [{ error: profileError }, { error: settingsError }] = await Promise.all([
    supabase.from('profiles').upsert({ id: userId, game_uid: profile.game_uid, display_name: profile.display_name, avatar_url: profile.avatar_url, trainer_level: profile.trainer_level, updated_at: new Date().toISOString() }, { onConflict: 'id' }),
    supabase.from('user_settings').upsert({ id: userId, dojo_levels: dojoLevels, updated_at: new Date().toISOString() }, { onConflict: 'id' })
  ]);
  if (profileError) throw profileError;
  if (settingsError) throw settingsError;
}

export async function loadMembership(userId) {
  const { data, error } = await supabase.from('member_directory').select('id,trainer_level,availability,event_goal').eq('id', userId).maybeSingle();
  if (error) throw error;
  return data;
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
    game_uid: profile.game_uid.trim(),
    trainer_level: profile.trainer_level,
    availability: profile.availability,
    event_goal: profile.event_goal
  }, { onConflict: 'id' });
  if (error) throw error;
}

async function uploadAvatar(userId, file) {
  const allowed = ['image/png', 'image/jpeg', 'image/webp'];
  if (!allowed.includes(file.type)) throw new Error('Escolha uma imagem PNG, JPG ou WebP.');
  if (file.size > 5 * 1024 * 1024) throw new Error('A imagem deve ter no máximo 5 MB.');
  const path = `${userId}/avatar`;
  const { error } = await supabase.storage.from('wiki-avatars').upload(path, file, {
    upsert: true, contentType: file.type, cacheControl: '3600'
  });
  if (error) throw new Error('Não foi possível enviar o avatar. Confira se a migração 007 foi aplicada.');
  const { data } = supabase.storage.from('wiki-avatars').getPublicUrl(path);
  return `${data.publicUrl}?v=${Date.now()}`;
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
  const avatarInput = root.querySelector('[name="avatar_upload"]');
  const avatarPreview = root.querySelector('[data-avatar-preview]');
  let currentAvatarUrl = '';
  let localPreviewUrl = '';
  avatarInput.addEventListener('change', () => {
    if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
    const file = avatarInput.files?.[0];
    localPreviewUrl = file ? URL.createObjectURL(file) : '';
    avatarPreview.src = localPreviewUrl || currentAvatarUrl;
    avatarPreview.hidden = !(localPreviewUrl || currentAvatarUrl);
  });
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
      const levelText = String(data.get('trainer_level') || '').trim();
      const level = Number(levelText);
      const file = avatarInput.files?.[0];
      if (levelText && (!/^\d+$/.test(levelText) || !Number.isInteger(level) || level < 1 || level > 9999)) {
        throw new Error('Informe um nível válido de 1 a 9999.');
      }
      const profile = {
        trainer_level: levelText ? level : null,
        game_uid: String(data.get('game_uid') || '').trim(),
        display_name: String(data.get('display_name') || '').trim(),
        avatar_url: currentAvatarUrl
      };
      if (!listing.disabled && listing.checked && (profile.display_name.length < 2 || !profile.game_uid)) {
        throw new Error('Para aparecer na lista, informe o nome de exibição e o UID do jogo.');
      }
      if (!listing.disabled && listing.checked && (!/^\d+$/.test(levelText) || !Number.isInteger(level) || level < 1 || level > 9999)) {
        throw new Error('Informe o nível atual da sua conta (de 1 a 9999) para participar dos times.');
      }
      if (file) profile.avatar_url = await uploadAvatar(user.id, file);
      await saveAccount(user.id, profile, levels);
      currentAvatarUrl = profile.avatar_url;
      avatarInput.value = '';
      if (localPreviewUrl) { URL.revokeObjectURL(localPreviewUrl); localPreviewUrl = ''; }
      avatarPreview.src = currentAvatarUrl;
      avatarPreview.hidden = !currentAvatarUrl;
      if (!listing.disabled) await saveMembership(user.id, {
        ...profile, trainer_level: level, availability: String(data.get('availability') || '').trim(),
        event_goal: String(data.get('event_goal') || '').trim()
      }, listing.checked);
      showStatus('Dados salvos.', 'success');
      window.dispatchEvent(new Event('wiki:account-updated'));
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
    currentAvatarUrl = account.profile.avatar_url || '';
    root.querySelector('[name="trainer_level"]').value = account.profile.trainer_level ?? '';
    avatarPreview.src = currentAvatarUrl;
    avatarPreview.hidden = !currentAvatarUrl;
    (account.settings.dojo_levels || [0, 0, 0, 0, 0]).forEach((value, index) => {
      const field = root.querySelector(`[name="dojo_${index}"]`);
      if (field) field.value = value;
    });
    root.querySelector('[data-account-email]').textContent = user.email || 'Conta autenticada';
    root.querySelector('[data-account-status]').hidden = true;
    try {
      const membership = await loadMembership(user.id);
      root.querySelector('[data-member-opt-in]').checked = Boolean(membership);
      if (!account.profile.trainer_level && membership?.trainer_level) {
        root.querySelector('[name="trainer_level"]').value = membership.trainer_level;
      }
      root.querySelector('[name="availability"]').value = membership?.availability || '';
      root.querySelector('[name="event_goal"]').value = membership?.event_goal || '';
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
