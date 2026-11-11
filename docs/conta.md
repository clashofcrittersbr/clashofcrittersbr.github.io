# Minha conta

Esta área é opcional. A wiki pública continua disponível sem login. Ao autenticar, você poderá guardar seu nome, UID do jogo, avatar e os cinco níveis do Dojo associados à sua própria conta.

<div class="account-card" data-account-page markdown>

<p class="account-status" data-account-status role="status">Carregando…</p>

<section data-account-login markdown>
<h2>Entrar</h2>
<p>Use um provedor social configurado no Supabase.</p>
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
<label>1<input name="dojo_0" type="number" min="0" step="1"></label>
<label>2<input name="dojo_1" type="number" min="0" step="1"></label>
<label>3<input name="dojo_2" type="number" min="0" step="1"></label>
<label>4<input name="dojo_3" type="number" min="0" step="1"></label>
<label>5<input name="dojo_4" type="number" min="0" step="1"></label>
</div></fieldset>
<div class="account-actions"><button class="account-button" type="submit">Salvar dados</button><button class="account-button account-button--secondary" data-account-logout type="button">Sair</button></div>
</form>

</div>

!!! warning "Configuração necessária"
    Esta página só será ativada depois que a URL e a publishable key do Supabase forem preenchidas em `docs/javascripts/supabase-config.mjs`, e os provedores forem configurados no painel.
