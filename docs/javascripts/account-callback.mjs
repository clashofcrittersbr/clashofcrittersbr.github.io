// O callback é uma página HTML independente e não recebe os scripts registrados no MkDocs.
// Carregue a configuração explicitamente antes de criar o cliente Supabase.
import './supabase-config.mjs';
import { handleCallback } from './site-auth.mjs';

try {
  await handleCallback();
  window.location.replace('../conta/');
} catch (error) {
  const message = document.querySelector('[data-callback-message]');
  if (message) message.textContent = error.message || 'Não foi possível concluir o login.';
}
