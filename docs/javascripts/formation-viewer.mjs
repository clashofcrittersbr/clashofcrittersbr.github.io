// Amplia apenas o quadro da consulta. Não acessa dados ou controles do site externo.
for (const viewer of document.querySelectorAll('[data-formation-viewer]')) {
  const button = viewer.querySelector('[data-formation-fullscreen]');
  const status = viewer.querySelector('[data-formation-status]');
  if (!button || !status || !document.fullscreenEnabled || !viewer.requestFullscreen) continue;
  button.hidden = false;

  document.addEventListener('fullscreenchange', () => {
    const expanded = document.fullscreenElement === viewer;
    button.textContent = expanded ? 'Sair da tela cheia' : 'Tela cheia';
    button.setAttribute('aria-pressed', String(expanded));
    if (expanded) status.textContent = 'Pressione Esc ou use o botão para sair da tela cheia.';
    else {
      status.textContent = '';
      if (button.dataset.expanded === 'true') button.focus({ preventScroll: true });
    }
    button.dataset.expanded = String(expanded);
  });

  button.addEventListener('click', async () => {
    try {
      if (document.fullscreenElement === viewer) await document.exitFullscreen();
      else await viewer.requestFullscreen();
    } catch {
      status.textContent = 'Não foi possível ampliar neste navegador. Use Abrir em nova aba para consultar em uma página inteira.';
    }
  });
}
