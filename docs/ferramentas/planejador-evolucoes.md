# Planejador de evoluções

Organize suas **67 famílias e 248 formas** catalogadas: marque até qual T você chegou e escolha uma meta por família. A página mostra o caminho T1–T4, as pendências e um resumo do seu progresso.

!!! info "Base e limites"
    As formas e retratos vêm da [wiki.gg](https://clashofcritters.wiki.gg/wiki/Tatari), preservadas no [Horde Planner de Jeremy Canlas](https://github.com/jeremycanlas/clash-of-critters-horde-planner) no commit `ec83738f`, coletadas em **09/10/2026**. É uma fotografia histórica de 67 famílias, não uma sincronização com os patches atuais. Bonobean e Wattail, anunciados depois, ainda não constam dessa base. Custos, tarefas das provas e materiais **não são calculados aqui**; confira a ficha e a versão exibida no jogo antes de gastar recursos.

<div class="evolution-planner" id="evolution-planner">
  <div class="planner-toolbar">
    <label>Buscar família ou forma <input type="search" data-planner-search placeholder="Nome do Tatari" autocomplete="off"></label>
    <label>Elemento <select data-planner-element><option value="all">Todos</option><option>Água</option><option>Fogo</option><option>Planta</option><option>Pedra</option><option>Elétrico</option></select></label>
    <label>Mostrar <select data-planner-filter><option value="all">Todas as famílias</option><option value="unstarted">Ainda não iniciei</option><option value="started">Já iniciei</option><option value="pending">Meta pendente</option><option value="complete">Meta concluída</option><option value="final">Forma final alcançada</option></select></label>
  </div>
  <p class="planner-status" role="status" data-planner-status>Carregando famílias…</p>
  <div class="planner-summary" data-planner-summary aria-live="polite"></div>
  <div class="planner-actions">
    <button type="button" data-planner-export>Exportar JSON</button>
    <label class="planner-import">Importar JSON <input type="file" accept=".json,application/json" data-planner-import></label>
    <button type="button" class="planner-secondary" data-planner-clear>Limpar progresso</button>
  </div>
  <div class="planner-cloud">
    <p data-planner-account>O progresso é salvo neste dispositivo. <a href="../../conta/">Entre na sua conta</a> para guardar uma cópia privada.</p>
    <div class="planner-actions">
      <button type="button" data-planner-cloud-save disabled>Salvar na conta</button>
      <button type="button" class="planner-secondary" data-planner-cloud-load disabled>Carregar da conta</button>
    </div>
  </div>
  <p class="planner-results" data-planner-results></p>
  <div class="planner-grid" data-planner-grid></div>
</div>

## Como usar

- **Tenho até:** selecione a forma mais avançada que você alcançou nessa família. Se ainda não a iniciou, deixe em “Nenhuma”.
- **Minha meta:** escolha uma forma da mesma família, ou deixe sem meta. O planejador compara apenas esses dois estágios; ele não estima recursos ou recomenda qual Tatari evoluir.
- O navegador guarda alterações automaticamente. **Exportar JSON** cria uma cópia para levar a outro dispositivo; **Importar JSON** substitui o plano local após sua confirmação.
- Com login, **Salvar na conta** guarda uma cópia privada em `user_settings`. **Carregar da conta** substitui o plano local após sua confirmação. Os níveis do Dojo e a lista pública de membros são independentes desse plano.

Os dados de nomes e linhagens derivados da wiki.gg mantêm a atribuição aos colaboradores e a licença [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Os retratos são artes do jogo referenciadas no espelho fixado; essa licença de texto não se estende às imagens.

Consulte os [guias de evolução](../conteudo/tataria/guias/evolucoes.md) e as fichas ligadas nos cartões para interpretar as formas, versões e limitações das fontes.
