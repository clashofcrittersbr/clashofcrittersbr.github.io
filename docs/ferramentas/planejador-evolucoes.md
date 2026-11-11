# Planejador de evoluções

## Como usar

1. **Busque e adicione uma família** pelo nome ou escolha na lista. Seu plano começa vazio e mostra somente as famílias que você adicionar.
2. Em cada cartão, marque **Tenho até** e, se quiser, **Minha meta**. A linha T1–T4 aparece só para as famílias do seu plano.
3. O navegador salva as escolhas automaticamente. Você pode exportar/importar um JSON e, ao entrar na conta, guardar ou carregar uma cópia privada. Use **Remover do plano** para ocultar uma família sem apagar as demais.

O planejador acompanha etapas declaradas por você. Ele não estima recursos nem recomenda qual Tatari evoluir.

!!! info "Base e limites"
    As formas e retratos vêm da [wiki.gg](https://clashofcritters.wiki.gg/wiki/Tatari), preservadas no [Horde Planner de Jeremy Canlas](https://github.com/jeremycanlas/clash-of-critters-horde-planner) no commit `ec83738f`, coletadas em **09/10/2026**. É uma fotografia histórica de 67 famílias, não uma sincronização com os patches atuais. Bonobean e Wattail, anunciados depois, ainda não constam dessa base. A prévia de Roost no servidor pioneiro também não integra o catálogo. Custos, tarefas das provas e materiais **não são calculados aqui**; confira a ficha e a versão exibida no jogo antes de gastar recursos.

<div class="evolution-planner" id="evolution-planner">
  <div class="planner-toolbar">
    <label>Buscar família ou forma <input type="search" data-planner-search placeholder="Nome do Tatari" autocomplete="off"></label>
    <label>Elemento <select data-planner-element><option value="all">Todos</option><option>Água</option><option>Fogo</option><option>Planta</option><option>Pedra</option><option>Elétrico</option></select></label>
    <label>Mostrar no plano <select data-planner-filter><option value="all">Minhas famílias</option><option value="unstarted">Ainda não iniciei</option><option value="started">Já iniciei</option><option value="pending">Meta pendente</option><option value="complete">Meta concluída</option><option value="final">Forma final alcançada</option></select></label>
  </div>
  <div class="planner-picker">
    <label>Adicionar família ao plano <select data-planner-pick><option value="">Escolha uma família</option></select></label>
    <button type="button" data-planner-add disabled>Adicionar família</button>
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

Os dados de nomes e linhagens derivados da wiki.gg mantêm a atribuição aos colaboradores e a licença [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Os retratos são artes do jogo referenciadas no espelho fixado; essa licença de texto não se estende às imagens.

Consulte os [guias de evolução](../conteudo/tataria/guias/evolucoes.md) e as fichas ligadas nos cartões para interpretar as formas, versões e limitações das fontes.
