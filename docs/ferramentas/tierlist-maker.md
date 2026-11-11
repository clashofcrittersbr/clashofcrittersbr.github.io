# Tierlist Maker

Crie uma classificação personalizada dos Tataris diretamente no navegador. O resultado fica salvo neste dispositivo e pode ser exportado para reutilização ou compartilhamento manual.

!!! info "Classificação personalizada"
    O editor usa as famílias catalogadas na wiki. A classificação criada é uma opinião do jogador e não representa a tier list editorial da wiki.

<div id="tierlist-app"></div>

## Como usar

- Clique em um Tatari para movê-lo para o próximo nível.
- Arraste um cartão para qualquer nível.
- Use **Restaurar** para limpar a classificação.
- Exporte seu trabalho em JSON para guardar ou compartilhar manualmente.
- Importe um JSON previamente exportado neste navegador ou em outro dispositivo.

A classificação editorial continua em [Tier list de Tataris](../guias/tier-list.md). Para registrar fontes e justificativas, use as fichas individuais e a página de colaboração.

<script src="../../assets/tierlist-maker.js"></script>
<style>
.tierlist-actions{display:flex;flex-wrap:wrap;gap:.6rem;align-items:center;margin:1rem 0}.tierlist-actions button,.tier-import{background:var(--md-primary-fg-color);color:#fff;border:0;border-radius:.35rem;padding:.55rem .8rem;cursor:pointer}.tier-import input{display:none}.tierlist-actions span{opacity:.75;font-size:.9rem}.tierlist-board{display:grid;gap:.75rem}.tierlist-zone{display:grid;grid-template-columns:5rem 1fr;min-height:4rem;border:1px solid var(--md-default-fg-color--light);border-radius:.5rem;overflow:hidden;background:var(--md-code-bg-color)}.tierlist-zone h3{margin:0;padding:1rem .5rem;text-align:center;background:var(--md-primary-fg-color);color:#fff}.tierlist-zone[data-tier="T1"] h3{background:#bd2c3b}.tierlist-zone[data-tier="T2"] h3{background:#d77b24}.tierlist-zone[data-tier="T3"] h3{background:#c2a41e}.tierlist-zone[data-tier="T4"] h3{background:#45804a}.tierlist-zone[data-tier="pool"]{margin-top:1rem}.tierlist-zone[data-tier="pool"] h3{background:#566070}.tierlist-items{display:flex;flex-wrap:wrap;gap:.5rem;padding:.65rem;align-content:flex-start}.tierlist-card{border:1px solid var(--md-default-fg-color--light);background:var(--md-default-bg-color);color:var(--md-default-fg-color);border-radius:.3rem;padding:.5rem .65rem;cursor:grab}.tierlist-card:hover{border-color:var(--md-accent-fg-color);transform:translateY(-1px)}@media(max-width:600px){.tierlist-zone{grid-template-columns:3.5rem 1fr}.tierlist-zone h3{padding:.8rem .2rem}.tierlist-card{font-size:.8rem;padding:.4rem .45rem}}
</style>
