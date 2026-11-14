import { getSupabase, currentUser } from './site-auth.mjs';
import { confirmDialog, alertDialog, notify } from './site-dialogs.mjs';

// No conteúdo remoto é passado a innerHTML. Permissões e lotação são da RPC.
const discordInvite = /^https:\/\/(discord\.gg\/|discord\.com\/invite\/)[A-Za-z0-9_-]+\/?$/;
const el = (tag, text, className) => {
  const node = document.createElement(tag);
  if (text != null) node.textContent = String(text);
  if (className) node.className = className;
  return node;
};
const date = value => new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
const option = (value, label) => { const node = el('option', label); node.value = value; return node; };
const note = text => el('p', text, 'eg-muted');
const guides = {
  artifacts: 'Artefatos: a referência consultada não associa força do Tatari à chance de vitória. Combine horários para aproveitar o apoio dos colegas online.',
  fishing: 'Pesca: não há uma espécie superior confirmada nas fontes consultadas. Combine o uso de iscas e as metas de moedas prateadas e douradas.',
  zobo: 'Tiro aos Zobos: prefira o Tatari elegível de melhor qualidade/cor. A referência aponta vantagem de chance para a qualidade Rainbow.',
  farm: 'Fazenda: procure o maior bônus da família exigida pela plantação. Informe no recado os apoios que o grupo oferece: Frugling, Pandaroo, Zaplet, Droppit, Maskfry e Hootlet.',
  race: 'Marathon Party: a escolha do corredor é visual segundo a fonte. Em Raft Race, combine os recursos e a meta de distância do elenco.',
  treasure: 'Caça ao Tesouro: cada elenco é uma parceria de duas pessoas. Você pode confirmar até quatro parcerias diferentes nesta edição. Combine metas de fases e chaves.',
  horde: 'Horda: registre a dificuldade, a temporada, os horários e as funções de cada lado. A escolha envolve a formação completa da dupla.',
  goldrush: 'Corrida do Ouro: este elenco representa um time dentro da liga. Informe a liga, os horários e as necessidades da formação no recado.'
};

async function initGroups() {
  const root = document.querySelector('[data-event-groups]');
  if (!root || root.dataset.initialized) return;
  root.dataset.initialized = 'true';
  const db = getSupabase();
  const find = name => root.querySelector(`[data-eg-${name}]`);
  const state = { user: null, admin: false, selectedTeam: '', edition: '', history: false, mine: false, search: '' };
  let data = {}, saving = false, loadVersion = 0;
  const status = (message, kind = 'info') => {
    const target = find('status'); target.textContent = message; target.dataset.kind = kind; target.hidden = !message;
  };
  if (!db) { status('Os times estão temporariamente indisponíveis. Tente novamente mais tarde.'); return; }
  const accountUrl = document.querySelector('[data-groups-account-link]').href;
  const member = id => data.directory.find(row => row.id === id);
  const team = id => data.teams.find(row => row.id === id);
  const owned = group => Boolean(state.user && group && state.user.id === group.owner_id);
  const joined = groupId => data.members.some(row => row.group_id === groupId && row.user_id === state.user?.id && row.status === 'active');
  const editable = edition => !edition.cancelled_at && Date.now() < Date.parse(edition.registration_closes_at);
  const peopleIn = rosterId => data.signups.filter(row => row.roster_id === rosterId && row.status === 'confirmed');

  async function readAll(table, fields, orders) {
    const rows = [];
    for (let offset = 0; ; offset += 200) {
      let query = db.from(table).select(fields);
      for (const key of orders) query = query.order(key);
      const { data: chunk, error } = await query.range(offset, offset + 199);
      if (error) throw error;
      rows.push(...chunk);
      if (chunk.length < 200) return rows;
    }
  }

  async function load() {
    const version = ++loadVersion;
    status('Atualizando times…');
    root.setAttribute('aria-busy', 'true');
    try {
      const user = await currentUser();
      const results = await Promise.all([
        readAll('event_group_events', '*', ['code']),
        readAll('event_group_editions', '*', ['id']),
        readAll('event_groups', '*', ['id']),
        readAll('event_group_members', '*', ['group_id', 'user_id']),
        readAll('event_group_rosters', '*', ['id']),
        readAll('event_group_signups', '*', ['roster_id', 'user_id']),
        readAll('member_directory', 'id,display_name,game_uid,last_seen_at', ['id']),
        db.rpc('is_event_groups_admin')
      ]);
      if (version !== loadVersion) return;
      const [events, editions, teams, members, rosters, signups, directory, admin] = results;
      if (admin.error) throw admin.error;
      data = { events, editions, teams, members, rosters, signups, directory };
      state.user = user; state.admin = Boolean(admin.data);
      find('content').hidden = false;
      render(); status('');
    } catch (error) {
      if (version !== loadVersion) return;
      find('content').hidden = true;
      const preparing = ['PGRST205', 'PGRST202', '42P01', '42883'].includes(error.code);
      status(preparing ? 'Estamos preparando os times de eventos. A função aparecerá aqui assim que estiver disponível.' : 'Não foi possível carregar os times. Use “Tentar novamente” ou volte mais tarde.', 'error');
      const retry = el('button', 'Tentar novamente'); retry.type = 'button'; retry.onclick = load;
      find('status').append(document.createTextNode(' '), retry);
    } finally {
      if (version === loadVersion) root.removeAttribute('aria-busy');
    }
  }

  async function apply(action, payload, message = 'Alteração salva.') {
    if (saving) return;
    saving = true;
    const buttons = [...root.querySelectorAll('button')].map(node => [node, node.disabled]);
    buttons.forEach(([node]) => { node.disabled = true; });
    try {
      const { data: result, error } = await db.rpc('event_groups_apply', { p_action: action, p_data: payload });
      if (error) throw error;
      if (action === 'team_create') state.selectedTeam = result;
      if (action === 'edition_create') state.edition = result;
      notify(message); await load();
    } catch (error) {
      const messages = {
        '23514': 'Confira os limites dos campos, a capacidade e a ordem das datas.',
        '23502': 'Preencha todos os campos obrigatórios.',
        '23505': 'Esse registro já existe. Atualize a lista para conferir.',
        '23503': 'Um dos registros mudou. Atualize a lista e tente novamente.',
        '22P02': 'Confira os valores preenchidos.',
        '22007': 'Confira os horários preenchidos.'
      };
      await alertDialog(error.code === 'P0001' ? error.message : messages[error.code] || 'Não foi possível salvar agora. Atualize a lista e tente novamente.', { title: 'Times de eventos' });
    } finally {
      saving = false;
      buttons.forEach(([node, disabled]) => { if (node.isConnected) node.disabled = disabled; });
    }
  }

  function button(label, handler, disabled = false) {
    const node = el('button', label); node.type = 'button'; node.disabled = disabled;
    node.addEventListener('click', () => { if (!saving) handler(); }); return node;
  }
  function actions(...nodes) { const container = el('div', null, 'eg-actions'); container.append(...nodes); return container; }
  function fold(title, content) { const node = el('details', null, 'eg-panel'); node.append(el('summary', title), content); return node; }
  function field(form, label, name, type = 'text', value = '', extra = {}) {
    const wrap = el('label', label), input = document.createElement(type === 'textarea' ? 'textarea' : type === 'select' ? 'select' : 'input');
    if (input.tagName === 'INPUT') input.type = type;
    input.name = name; Object.assign(input, extra); input.value = value; wrap.append(input); form.append(wrap); return input;
  }
  function submitForm(form, label, handler) {
    const submit = el('button', label); submit.type = 'submit'; form.append(actions(submit));
    form.addEventListener('submit', event => { event.preventDefault(); if (!saving && form.reportValidity()) handler(new FormData(form)); });
  }
  function memberRow(id, controls = [], uidOverride = null) {
    const info = member(id), row = el('li'), identity = el('span', null, 'eg-person');
    const uid = uidOverride || info?.game_uid;
    identity.append(el('strong', info?.display_name || 'Membro não listado'));
    if (info) {
      identity.append(el('small', `UID ${uid}`));
      if (Date.now() - Date.parse(info.last_seen_at) >= 15 * 86400000) identity.append(el('small', 'Sem visita autenticada à wiki nos últimos 15 dias'));
    }
    row.append(identity);
    if (info) controls.unshift(button('Copiar UID', async () => {
      try { await navigator.clipboard.writeText(uid); notify('UID copiado.'); }
      catch { await alertDialog(`UID: ${uid}`, { title: 'UID do jogo' }); }
    }));
    if (controls.length) row.append(actions(...controls));
    return row;
  }

  function teamForm(group = null) {
    const form = el('form', null, 'eg-form');
    field(form, 'Nome do time', 'name', 'text', group?.name || '', { required: true, minLength: 3, maxLength: 80 });
    field(form, 'Horários e fuso em que costumam jogar', 'play_window', 'text', group?.play_window || '', { maxLength: 200, placeholder: 'Ex.: noites, horário de Brasília' });
    field(form, 'Link público do Discord (opcional)', 'discord_url', 'url', group?.discord_url || '', { maxLength: 250, placeholder: 'https://discord.gg/convite' });
    field(form, 'Recado do time', 'description', 'textarea', group?.description || '', { maxLength: 1000 });
    form.append(note('Nome, recado, horários e Discord ficam públicos. Entradas são aprovadas pelo líder.'));
    submitForm(form, group ? 'Salvar time' : 'Criar time', async values => {
      const payload = Object.fromEntries(values); payload.discord_url = payload.discord_url.trim();
      if (payload.discord_url && !discordInvite.test(payload.discord_url)) {
        await alertDialog('Use um convite https://discord.gg/código ou https://discord.com/invite/código, sem parâmetros extras.'); return;
      }
      if (group) payload.group_id = group.id;
      await apply(group ? 'team_edit' : 'team_create', payload, group ? 'Time atualizado.' : 'Time criado. Você é o líder.');
    });
    return form;
  }

  function renderTeamDetail() {
    const panel = find('team-detail'), group = team(state.selectedTeam);
    panel.replaceChildren(); panel.hidden = !group;
    if (!group) return;
    panel.append(el('h3', group.name), el('p', group.description || 'O líder ainda não publicou um recado.'));
    if (group.play_window) panel.append(note(`Horários: ${group.play_window}`));
    if (group.discord_url && discordInvite.test(group.discord_url)) {
      const link = el('a', 'Abrir Discord do time'); link.href = group.discord_url; link.target = '_blank'; link.rel = 'noopener noreferrer'; panel.append(link);
    }
    panel.append(el('h4', 'Integrantes confirmados'));
    const members = data.members.filter(row => row.group_id === group.id), active = members.filter(row => row.status === 'active');
    const list = el('ul', null, 'eg-people');
    for (const membership of active) {
      const controls = [];
      if (owned(group) && membership.user_id !== group.owner_id && !group.archived_at) controls.push(button('Remover', async () => {
        if (await confirmDialog('Remover este integrante do time? As inscrições ainda abertas também serão removidas.', { title: 'Remover integrante', danger: true })) await apply('team_remove', { group_id: group.id, user_id: membership.user_id });
      }));
      const row = memberRow(membership.user_id, controls);
      if (membership.user_id === group.owner_id) row.querySelector('.eg-person').append(el('small', 'Líder'));
      list.append(row);
    }
    panel.append(list);
    const ownMembership = members.find(row => row.user_id === state.user?.id);
    if (state.user) {
      if (!ownMembership && !group.archived_at) panel.append(button('Solicitar entrada no time', async () => {
        if (await confirmDialog('O líder receberá seu pedido. Ao ser aprovado, seu Nick e UID aparecerão publicamente neste time.', { title: 'Entrar no time', action: 'Solicitar' })) await apply('team_request', { group_id: group.id }, 'Pedido enviado ao líder.');
      }));
      else if (ownMembership && !owned(group)) panel.append(button(ownMembership.status === 'pending' ? 'Cancelar pedido' : 'Sair do time', async () => {
        if (await confirmDialog('Sair deste time? Suas inscrições ainda abertas nele também serão removidas.', { title: 'Sair do time' })) await apply('team_leave', { group_id: group.id });
      }));
    }
    if (owned(group) && group.archived_at) panel.append(actions(button('Reativar time', () => apply('team_restore', { group_id: group.id }, 'Time reativado.'))));
    if (owned(group) && !group.archived_at) {
      panel.append(el('h4', 'Pedidos para entrar no time'));
      const pending = el('ul', null, 'eg-people');
      members.filter(row => row.status === 'pending').forEach(row => pending.append(memberRow(row.user_id, [
        button('Aprovar', () => apply('member_approve', { group_id: group.id, user_id: row.user_id })),
        button('Recusar', () => apply('member_reject', { group_id: group.id, user_id: row.user_id }))
      ])));
      panel.append(pending.children.length ? pending : note('Nenhum pedido pendente.'));
      panel.append(fold('Editar time', teamForm(group)));
      const transfer = el('form', null, 'eg-form'), select = field(transfer, 'Novo líder', 'user_id', 'select', '', { required: true });
      select.append(option('', 'Escolha um integrante'));
      active.filter(row => row.user_id !== group.owner_id).forEach(row => select.append(option(row.user_id, member(row.user_id)?.display_name || 'Membro não listado')));
      submitForm(transfer, 'Transferir liderança', async values => {
        if (await confirmDialog('O novo líder passará a administrar este time e seus elencos. Confirmar?', { title: 'Transferir liderança' })) await apply('team_transfer', { group_id: group.id, user_id: values.get('user_id') });
      });
      panel.append(fold('Transferir liderança', transfer), actions(button('Arquivar time', async () => {
        if (await confirmDialog('Arquivar o time? Ele sairá da lista principal. As edições anteriores continuarão no histórico.', { title: 'Arquivar time' })) await apply('team_archive', { group_id: group.id });
      })));
    }
  }

  function renderTeams() {
    const target = find('teams'); target.replaceChildren();
    const search = state.search.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const groups = data.teams.filter(group => (state.history || !group.archived_at) && (!state.mine || joined(group.id) || owned(group)) &&
      `${group.name} ${member(group.owner_id)?.display_name || ''}`.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes(search));
    groups.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    groups.forEach(group => {
      const card = el('article', null, 'eg-card'), count = data.members.filter(row => row.group_id === group.id && row.status === 'active').length;
      card.append(el('h3', group.name), note(`Líder: ${member(group.owner_id)?.display_name || 'não listado'} · ${count} integrantes`));
      if (group.play_window) card.append(el('p', group.play_window));
      if (group.archived_at) card.append(el('span', 'Arquivado', 'eg-badge'));
      else if (owned(group)) card.append(el('span', 'Você lidera este time', 'eg-badge'));
      else if (joined(group.id)) card.append(el('span', 'Você participa', 'eg-badge'));
      const pending = data.members.some(row => row.group_id === group.id && row.user_id === state.user?.id && row.status === 'pending');
      if (pending) card.append(el('span', 'Aguardando aprovação', 'eg-badge'));
      card.append(actions(button('Ver time e integrantes', () => {
        state.selectedTeam = group.id; renderTeamDetail(); find('team-detail').scrollIntoView({ behavior: 'smooth', block: 'start' });
      })));
      target.append(card);
    });
    if (!groups.length) target.append(el('p', 'Nenhum time encontrado. Você pode criar um ou ajustar a busca.', 'eg-empty'));
    find('create-team').replaceChildren();
    if (state.user && member(state.user.id)) find('create-team').append(fold('Criar um time fixo', teamForm()));
    renderTeamDetail();
  }

  function renderRosters() {
    const select = find('edition'), now = Date.now();
    const editions = data.editions.filter(e => state.history || (!e.cancelled_at && Date.parse(e.ends_at) > now))
      .sort((a, b) => Date.parse(a.starts_at) - Date.parse(b.starts_at));
    select.replaceChildren(option('', editions.length ? 'Selecione uma edição' : 'Nenhuma edição publicada por enquanto'));
    editions.forEach(e => select.append(option(e.id, `${data.events.find(v => v.code === e.event_code)?.name} · ${e.name} · ${e.server_label}${e.cancelled_at ? ' · cancelada' : ''}`)));
    if (!editions.some(e => e.id === state.edition)) state.edition = '';
    select.value = state.edition;
    const edition = editions.find(e => e.id === state.edition), info = find('edition-info'), target = find('rosters'), create = find('create-roster');
    info.replaceChildren(); target.replaceChildren(); create.replaceChildren();
    if (!edition) { info.append(note('Selecione a edição do seu servidor para ver as vagas e as recomendações.')); return; }
    info.append(el('p', `${date(edition.starts_at)} até ${date(edition.ends_at)} · ${edition.server_label}`), note(`Elenco de ${edition.capacity} jogadores. Inscrições até ${date(edition.registration_closes_at)}.`));
    if (edition.cancelled_at) info.append(el('p', `Edição cancelada: ${edition.cancellation_reason}`));
    else if (!editable(edition)) info.append(note('Inscrições fechadas. Os elencos abaixo ficam disponíveis para consulta.'));
    info.append(el('p', guides[edition.event_code] || '', 'eg-guide'));
    const rosters = data.rosters.filter(r => r.edition_id === edition.id && (state.history || !r.cancelled_at) && (!state.mine || joined(r.group_id) || owned(team(r.group_id))));
    rosters.forEach(roster => {
      const group = team(roster.group_id), confirmed = peopleIn(roster.id), open = editable(edition) && !roster.cancelled_at && !group?.archived_at;
      const card = el('article', null, 'eg-card');
      card.append(el('h3', roster.name), note(`Time: ${group?.name || 'indisponível'}`), el('span', `${confirmed.length}/${edition.capacity} vagas confirmadas`, 'eg-badge'));
      if (roster.cancelled_at) card.append(el('span', 'Inscrição cancelada', 'eg-badge'));
      if (roster.note) card.append(el('p', roster.note));
      const list = el('ul', null, 'eg-people');
      confirmed.forEach(row => {
        const controls = group && owned(group) && open ? [button('Retirar vaga', async () => {
          if (await confirmDialog('Retirar esta vaga do elenco? O jogador continuará no time fixo.', { title: 'Retirar participante' })) await apply('signup_remove', { roster_id: roster.id, user_id: row.user_id });
        })] : [];
        list.append(memberRow(row.user_id, controls, row.game_uid));
      });
      card.append(list);
      const self = data.signups.find(row => row.roster_id === roster.id && row.user_id === state.user?.id);
      if (self) card.append(note(self.status === 'confirmed' ? 'Sua vaga está confirmada.' : 'Seu pedido aguarda aprovação do líder.'));
      if (state.user && open) {
        if (!self && joined(roster.group_id)) card.append(button(owned(group) ? 'Confirmar minha vaga' : 'Solicitar vaga nesta edição', async () => {
          if (await confirmDialog('Seu Nick e UID aparecerão neste elenco após a confirmação. Os convites dentro do jogo devem ser combinados com o time.', { title: 'Participar da edição', action: 'Continuar' })) await apply('signup_request', { roster_id: roster.id }, owned(group) ? 'Sua vaga foi confirmada.' : 'Pedido de vaga enviado ao líder.');
        }, confirmed.length >= edition.capacity));
        else if (!self) card.append(note('Peça entrada no time fixo antes de solicitar uma vaga nesta edição.'));
        if (self) card.append(button('Cancelar minha inscrição', async () => {
          if (await confirmDialog('Cancelar seu pedido ou liberar sua vaga neste elenco?', { title: 'Cancelar inscrição' })) await apply('signup_cancel', { roster_id: roster.id });
        }));
      }
      if (group && owned(group) && open) {
        const edit = el('form', null, 'eg-form');
        field(edit, 'Nome do elenco', 'name', 'text', roster.name, { required: true, minLength: 2, maxLength: 80 });
        field(edit, 'Meta, horários e recado da edição', 'note', 'textarea', roster.note, { maxLength: 1000 });
        submitForm(edit, 'Salvar elenco', values => apply('roster_edit', { ...Object.fromEntries(values), roster_id: roster.id }));
        card.append(fold('Editar recado e nome do elenco', edit));
        card.append(el('h4', 'Pedidos de vaga'));
        const pending = el('ul', null, 'eg-people');
        data.signups.filter(row => row.roster_id === roster.id && row.status === 'pending').forEach(row => pending.append(memberRow(row.user_id, [
          button('Confirmar vaga', () => apply('signup_approve', { roster_id: roster.id, user_id: row.user_id })),
          button('Recusar', () => apply('signup_reject', { roster_id: roster.id, user_id: row.user_id }))
        ])));
        card.append(pending.children.length ? pending : note('Nenhum pedido pendente.'), actions(button('Cancelar este elenco', async () => {
          if (await confirmDialog('Cancelar a inscrição deste elenco? As vagas serão liberadas para esta edição.', { title: 'Cancelar elenco' })) await apply('roster_cancel', { roster_id: roster.id });
        })));
      }
      target.append(card);
    });
    if (!rosters.length) target.append(el('p', 'Ainda não há elencos nesta edição.', 'eg-empty'));
    const ownerTeams = data.teams.filter(g => owned(g) && !g.archived_at);
    if (state.user && member(state.user.id) && editable(edition) && ownerTeams.length) {
      const form = el('form', null, 'eg-form'), groups = field(form, 'Time fixo', 'group_id', 'select', '', { required: true });
      ownerTeams.forEach(g => groups.append(option(g.id, g.name)));
      field(form, edition.event_code === 'treasure' ? 'Nome da parceria' : 'Nome do elenco', 'name', 'text', '', { required: true, minLength: 2, maxLength: 80 });
      field(form, 'Meta, horários e recado para esta edição', 'note', 'textarea', '', { maxLength: 1000, placeholder: 'Ex.: buscar marcos; jogar às 20h de Brasília; na Fazenda, informar apoios disponíveis.' });
      submitForm(form, 'Abrir vagas para esta edição', values => apply('roster_create', { ...Object.fromEntries(values), edition_id: edition.id }, 'Elenco criado. Os membros do time já podem solicitar vagas.'));
      create.append(fold('Inscrever um elenco do meu time', form));
    }
    if (state.admin && !edition.cancelled_at) {
      const cancel = el('form', null, 'eg-form'); field(cancel, 'Motivo público do cancelamento', 'reason', 'text', '', { required: true, minLength: 3, maxLength: 300 });
      submitForm(cancel, 'Cancelar edição', async values => {
        if (await confirmDialog('Cancelar a edição inteira para todos os times? O histórico será preservado.', { title: 'Cancelar edição', danger: true })) await apply('edition_cancel', { edition_id: edition.id, reason: values.get('reason') });
      });
      create.append(fold('Administração: cancelar edição', cancel));
    }
  }

  function renderAdmin() {
    find('admin').hidden = !state.admin;
    const target = find('edition-form'); target.replaceChildren();
    if (!state.admin) return;
    const form = el('form', null, 'eg-form'), events = field(form, 'Evento', 'event_code', 'select', '', { required: true });
    data.events.forEach(e => events.append(option(e.code, e.name)));
    field(form, 'Nome da edição', 'name', 'text', '', { required: true, minLength: 3, maxLength: 100, placeholder: 'Ex.: Artefatos · rodada de novembro' });
    field(form, 'Servidor / grupo de eventos', 'server_label', 'text', '', { required: true, minLength: 2, maxLength: 80, placeholder: 'Informe o servidor correspondente à edição' });
    const capacity = field(form, 'Vagas por elenco (conferir nas regras do jogo)', 'capacity', 'number', '', { required: true, min: 2, max: 20 });
    const adjust = () => { const type = data.events.find(e => e.code === events.value); capacity.value = type?.capacity || 4; capacity.readOnly = type?.code === 'treasure'; };
    events.addEventListener('change', adjust); adjust();
    field(form, 'Início do evento', 'starts_at', 'datetime-local', '', { required: true });
    field(form, 'Fim do evento', 'ends_at', 'datetime-local', '', { required: true });
    field(form, 'Fechamento das inscrições', 'registration_closes_at', 'datetime-local', '', { required: true });
    form.append(note('Confira servidor, horários e capacidade antes de publicar. Para corrigir uma edição publicada, cancele-a com um motivo e cadastre a substituta.'));
    submitForm(form, 'Publicar edição', values => {
      const payload = Object.fromEntries(values);
      for (const key of ['starts_at', 'ends_at', 'registration_closes_at']) payload[key] = new Date(payload[key]).toISOString();
      apply('edition_create', payload, 'Edição publicada. Os líderes já podem inscrever seus elencos.');
    });
    target.append(form);
  }

  function render() {
    const session = find('session'); session.replaceChildren();
    if (!state.user) {
      session.append(el('p', 'Explore os times e as vagas. Para participar, entre com sua conta.'), Object.assign(el('a', 'Entrar em Minha conta'), { href: accountUrl }));
    } else if (!member(state.user.id)) {
      session.append(el('p', 'Para participar, publique seu Nick e UID na lista de membros em Minha conta.'), Object.assign(el('a', 'Completar meu cadastro'), { href: accountUrl }));
    } else session.append(el('p', `Olá, ${member(state.user.id).display_name}. Seus pedidos e confirmações aparecem nos times e nas edições abaixo.`));
    find('mine').disabled = !state.user;
    if (!state.user) { state.mine = false; find('mine').checked = false; }
    renderTeams(); renderRosters(); renderAdmin();
  }

  find('refresh').addEventListener('click', () => { if (!saving) load(); });
  find('search').addEventListener('input', event => { state.search = event.target.value; renderTeams(); });
  find('mine').addEventListener('change', event => { state.mine = event.target.checked; renderTeams(); renderRosters(); });
  find('history').addEventListener('change', event => { state.history = event.target.checked; renderTeams(); renderRosters(); });
  find('edition').addEventListener('change', event => { state.edition = event.target.value; renderRosters(); });
  db.auth.onAuthStateChange(event => {
    if (['SIGNED_IN', 'SIGNED_OUT', 'USER_UPDATED'].includes(event)) setTimeout(() => { if (!saving) load(); }, 0);
  });
  await load();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initGroups);
else initGroups();
