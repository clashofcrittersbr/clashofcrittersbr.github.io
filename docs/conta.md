# Minha conta

Esta área é opcional. A wiki pública continua disponível sem login. Ao autenticar, você poderá guardar seu nome, UID do jogo, avatar e os cinco níveis do Dojo associados à sua própria conta.

<div class="account-card" data-account-page markdown>

<svg class="dojo-symbols" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
  <symbol id="dojo-agua" viewBox="0 0 32 32"><path d="M16 2C12 8 6 14 6 20a10 10 0 0 0 20 0C26 14 20 8 16 2Z"/><path d="M11 21a5 5 0 0 0 5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></symbol>
  <symbol id="dojo-fogo" viewBox="0 0 32 32"><path d="M17 2c2 6-2 8-2 12-2-1-3-4-3-6C8 12 5 16 5 21a11 11 0 0 0 22 0c0-7-4-10-6-12 0 4-1 5-3 7 0-5 2-9-1-14Z"/><path d="M16 17c-1 4-4 5-4 8a4 4 0 0 0 8 0c0-3-2-5-4-8Z" fill="var(--account-surface)"/></symbol>
  <symbol id="dojo-planta" viewBox="0 0 32 32"><path d="M28 4C12 4 5 8 5 19a9 9 0 0 0 9 9C25 28 28 20 28 4Z"/><path d="M7 26c5-7 10-11 17-15" fill="none" stroke="var(--account-surface)" stroke-width="2" stroke-linecap="round"/></symbol>
  <symbol id="dojo-pedra" viewBox="0 0 32 32"><path d="M10 4h12l8 12-7 12H9L2 16 10 4Z"/><path d="m10 4 6 12-7 12m13-24-6 12 7 12M2 16h28" fill="none" stroke="var(--account-surface)" stroke-width="1.5" stroke-linejoin="round"/></symbol>
  <symbol id="dojo-eletrico" viewBox="0 0 32 32"><path d="M18 2 6 18h9l-2 12 13-17h-9l1-11Z"/></symbol>
</svg>

<p class="account-status" data-account-status role="status">Carregando…</p>

<section data-account-login markdown>
<h2>Entrar</h2>
<p>Escolha como entrar para guardar seus dados nesta conta.</p>
<div class="account-actions">
<button class="account-button" type="button" data-provider="google">Entrar com Google</button>
<button class="account-button account-button--secondary" type="button" data-provider="discord">Entrar com Discord</button>
</div>
</section>

<form class="account-form" data-account-form hidden markdown>
<h2>Dados da conta</h2>
<p>Conta autenticada: <strong data-account-email></strong></p>
<label>Nome de exibição<input name="display_name" maxlength="80" autocomplete="nickname"></label>
<label>UID do jogo<input name="game_uid" maxlength="80" inputmode="numeric"></label>
<label>URL do avatar (opcional)<input name="avatar_url" maxlength="500" type="url"></label>
<fieldset><legend>Níveis do Dojo</legend><div class="dojo-grid">
<label><span class="dojo-element dojo-element--agua"><svg viewBox="0 0 32 32" aria-hidden="true" focusable="false"><use href="#dojo-agua"></use></svg><span>Água</span></span><input name="dojo_0" type="number" min="0" step="1" inputmode="numeric" aria-label="Nível do Dojo de Água"></label>
<label><span class="dojo-element dojo-element--fogo"><svg viewBox="0 0 32 32" aria-hidden="true" focusable="false"><use href="#dojo-fogo"></use></svg><span>Fogo</span></span><input name="dojo_1" type="number" min="0" step="1" inputmode="numeric" aria-label="Nível do Dojo de Fogo"></label>
<label><span class="dojo-element dojo-element--planta"><svg viewBox="0 0 32 32" aria-hidden="true" focusable="false"><use href="#dojo-planta"></use></svg><span>Planta</span></span><input name="dojo_2" type="number" min="0" step="1" inputmode="numeric" aria-label="Nível do Dojo de Planta"></label>
<label><span class="dojo-element dojo-element--pedra"><svg viewBox="0 0 32 32" aria-hidden="true" focusable="false"><use href="#dojo-pedra"></use></svg><span>Pedra</span></span><input name="dojo_3" type="number" min="0" step="1" inputmode="numeric" aria-label="Nível do Dojo de Pedra"></label>
<label><span class="dojo-element dojo-element--eletrico"><svg viewBox="0 0 32 32" aria-hidden="true" focusable="false"><use href="#dojo-eletrico"></use></svg><span>Elétrico</span></span><input name="dojo_4" type="number" min="0" step="1" inputmode="numeric" aria-label="Nível do Dojo de Elétrico"></label>
</div></fieldset>
<div class="account-listing">
<label><input name="member_opt_in" type="checkbox" data-member-opt-in><span>Quero aparecer na lista pública de membros</span></label>
<p>Ao marcar, você publica seu nome de exibição, UID e status de atividade para qualquer visitante. Desmarque e salve para remover seus dados da lista. Seu e-mail e níveis do Dojo continuam privados.</p>
</div>
<div class="account-actions"><button class="account-button" type="submit">Salvar dados</button><button class="account-button account-button--secondary" data-account-logout type="button">Sair</button></div>
</form>

</div>

