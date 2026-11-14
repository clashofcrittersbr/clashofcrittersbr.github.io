# Ativação dos times de eventos · migração 004

Esta documentação é para a administração da wiki. A interface pública fica em `/comunidade/times/`. A PR mantém a contribuição do Alberto no guia de Evoluções e acrescenta o organizador de times.

## Ordem de ativação

1. Conferir que as migrações 001 e 002 já foram aplicadas.
2. No Supabase, abrir **SQL Editor**, selecionar a fonte **Database** e executar o arquivo completo `004_event_groups.sql`. Não usar a fonte Logs. O script é transacional; não cria nem altera dados de `profiles` ou `user_settings`.
3. Em **Authentication → Users**, copiar o UUID da conta que vai administrar o calendário. Conceder o papel com o SQL abaixo, substituindo o exemplo pelo UUID correto. O cadastro no diretório público não concede esse papel.
4. Mesclar a PR e aguardar a implantação do GitHub Pages.
5. Entrar com a conta autorizada em **Comunidade → Times de eventos**. A seção **Gerenciar calendário** só aparece para contas cadastradas na tabela administrativa.
6. Publicar uma edição com evento, nome, servidor/grupo de eventos, capacidade e datas conferidos no jogo. Não são criadas edições fictícias nem feita sincronização automática com sites externos.

```sql
insert into public.event_group_admins(user_id)
values ('SUBSTITUA-PELO-UUID-DA-SUA-CONTA'::uuid)
on conflict (user_id) do nothing;
```

Para revogar o papel, executar no SQL Editor:

```sql
delete from public.event_group_admins
where user_id = 'SUBSTITUA-PELO-UUID-DA-CONTA'::uuid;
```

Nunca colocar a chave `service_role` no JavaScript. O módulo usa a configuração pública já existente de Supabase; não há nova configuração OAuth ou domínio de callback.

## Regras implementadas

- Times fixos podem ter vários integrantes e abrir vários elencos para uma edição. O líder aprova a entrada no time e depois as solicitações de vagas.
- O líder pode confirmar a própria vaga. Criar um elenco não ocupa automaticamente uma vaga.
- Apenas a administração publica e cancela edições. Para corrigir uma edição, cancelar com motivo público e cadastrar a substituta; o histórico anterior permanece identificável.
- Inscrições e mudanças no elenco fecham em `registration_closes_at`. Os horários são armazenados como `timestamptz`; a interface recebe e exibe os horários no fuso do navegador.
- Limite de uma inscrição confirmada por edição para os eventos comuns. Na Caça ao Tesouro, até quatro duplas por jogador e sem repetir a mesma parceria na edição. Cada dupla tem duas pessoas.
- As confirmações usam bloqueio transacional da edição, protegendo a capacidade e a exclusividade contra pedidos simultâneos de times diferentes.
- A limitação considera tanto a conta autenticada quanto o UID confirmado. Isso impede duas vagas para o mesmo UID usando Google e Discord. Não verifica propriedade de UID no jogo; o líder precisa conferir os convites.
- O UID fica congelado na confirmação; a conta não pode contornar seu limite simplesmente alterando o UID do diretório. Uma correção de UID exige cancelar a vaga e pedir novamente enquanto o período estiver aberto.
- Pedidos pendentes não reservam vagas. São visíveis apenas ao solicitante e ao líder; visitantes veem participantes confirmados.
- Estar inativo na wiki não remove pessoas de equipes. Sair de um time remove suas vagas ainda abertas nesse time, mas preserva elencos já fechados.
- Sair do diretório de membros remove participações e inscrições por chave estrangeira. Os registros da equipe criada permanecem sem identificar o líder publicamente; a conta ainda pode transferir liderança ou arquivar, conforme as regras. A interface explica essa condição.
- Não há chat, mensagens automáticas, envio de convites ao jogo ou ligação com a conta do jogo. Discord e recados do líder são públicos; convites são combinados pelos UIDs.
- Os dados públicos do módulo não contêm e-mail. O histórico respeita remoções do diretório; não é uma cópia permanente de dados pessoais.

## Dados e permissões

`event_group_events` guarda os tipos e limites por participante; `event_group_editions` guarda datas e capacidade; `event_groups` guarda equipes e líder; `event_group_members` guarda pedidos/integrantes; `event_group_rosters` guarda elencos; `event_group_signups` guarda vagas/pedidos de cada edição. `event_group_admins` é privada.

RLS está habilitada em todas as tabelas. O navegador tem apenas SELECT nas tabelas de consulta; todas as escritas passam por `event_groups_apply`, que verifica login, adesão ao diretório, liderança ou administração em cada ação. A função usa `SECURITY DEFINER` com `search_path` vazio e nomes de tabela qualificados. `is_event_groups_admin` revela somente se a conta atual tem o papel.

As regras de capacidade inicial vêm das referências listadas em `docs/eventos/escolha-tatari.md`. Conferir cada edição antes de publicar. Não confundir um time de quatro da Corrida do Ouro com a liga inteira, nem as quatro parcerias da Caça ao Tesouro com um único grupo de cinco jogadores.

## Estado antes de ativar

Se a migração ainda não estiver instalada, a página mostra que os times estão em preparação e permite tentar novamente. O restante da wiki continua acessível. Depois do SQL e do papel administrativo, a função passa a usar as tabelas criadas sem trocar chaves no site.

Não houve execução da migração em produção, build, testes ou inspeção renderizada nesta implementação, respeitando a preferência de validação somente mediante solicitação explícita.
