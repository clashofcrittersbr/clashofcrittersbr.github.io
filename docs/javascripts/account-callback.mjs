// O callback é uma página independente do MkDocs.
import { handleCallback } from './site-auth.mjs?v=27';

try {
  await handleCallback();
  window.location.replace('../conta/');
} catch (error) {
  const message = document.querySelector('[data-callback-message]');
  if (message) message.textContent = error.message || 'Não foi possível concluir o login.';
}
