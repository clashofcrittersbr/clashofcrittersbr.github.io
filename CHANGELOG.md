# Histórico de mudanças

Este arquivo reúne as mudanças que afetam quem consulta a wiki. Os detalhes de implementação ficam nos commits e pull requests vinculados.

## Ainda não publicado

- Formulário manual de gerenciamento do calendário removido da página de times após a automatização das edições regulares.

- Edições dos seis eventos regulares geradas automaticamente pela rotação de três dias, com planejamento antecipado, virada às 00:00 UTC e seleção automática do evento atual. Horda e Corrida do Ouro seguem calendários próprios. Migração 006 necessária.

- Cadastro público dos times ampliado com nível atual da conta (obrigatório em novas participações), disponibilidade e objetivo opcionais; os dados aparecem no diretório, nos pedidos e nos elencos. Migração 005 necessária para ativar os campos.

- Prévia **0.53** adicionada com o anúncio oficial de Sharpup para 02/12, distinção entre o lançamento global e os dados comunitários do Pioneer, além de atualização editorial sobre os novos recursos do TataDex.

- Formações reunidas em Guias, com acesso por modo preservado na página inicial. As provas do Pyropup ficam junto da família em Tataris, sem entrada isolada no menu geral. Endereços existentes preservados.

- Corrigido o cadastro do guia “Qual Tatari escolher?” no menu de Eventos, que bloqueava a publicação dos times de eventos e das demais mudanças da PR #38.

- Times fixos de eventos com pedidos aprovados pelo líder, elencos por edição, calendário administrado pela wiki, recados e Discord opcional. Nick e UID aproveitados do diretório voluntário; Caça ao Tesouro organizada em parcerias. Migração 004 necessária para ativar a função.
- Guia de escolhas de Tataris por evento, com fontes e diferenças entre apoio da Fazenda, qualidade no Tiro aos Zobos e eventos sem vantagem de espécie confirmada.

- Guia de Evoluções com o roteiro de prioridades T2 → T3 do Alberto (UID 30230499), organizado por elemento, objetivos e alternativas.

- Navegação organizada por assunto, com patches agrupados por versão e atalhos para subpáginas na home.

- Ferramenta Critters: Dojo Formations incorporada em Formações, com créditos e acesso direto ao site original.

- Planejador de evoluções abre vazio e mantém visíveis apenas as famílias adicionadas; instruções no topo e remoção individual.

<!-- Mantenha as datas e entradas mais recentes primeiro para exibi-las na página inicial e em Novidades. -->
<!-- --8<-- [start:publicado] -->
## Publicado em 23/11/2026

- Página inicial e área de colaboração reorganizadas para facilitar a criação de perfil, a busca por times de eventos e o envio de formações, correções e fontes pela comunidade. [PR #44](https://github.com/clashofcrittersbr/clashofcrittersbr.github.io/pull/44)

- Identificação do lançamento global como **0.52.1 (build Android 4564)**, com fontes das lojas e separação explícita entre o conteúdo confirmado e os dados provisórios do Pioneer. O rótulo editorial 0.52 permanece associado ao vídeo e à prévia detalhada. [PR #43](https://github.com/clashofcrittersbr/clashofcrittersbr.github.io/pull/43)

## Publicado em 18/11/2026

- Atualização **0.52** publicada com Roost, Horda S4, novos chips, Diários, melhorias da Horda, ajustes do acampamento, Radish Run, Alimentador automático, Álbum de Cartas e Canais de chat. As notas oficiais e os dados do Pioneer estão separados por fonte. [PR #42](https://github.com/clashofcrittersbr/clashofcrittersbr.github.io/pull/42)
- Dojo repaginado com catálogo visual incorporado de Critters: Dojo Formations; o guia do Desafio de Chefe também recebeu consulta por oponente e dificuldade, tela cheia, endereço atualizado e créditos ao projeto e aos autores. [PR #41](https://github.com/clashofcrittersbr/clashofcrittersbr.github.io/pull/41)
- A área de Atualizações passou a destacar a versão mais recente e oferece atalhos diretos para as notas, fontes e novidades da wiki.

## Publicado em 11/11/2026

- Planejador de evoluções com 67 famílias/248 formas da base histórica, metas T1–T4, filtros, JSON e cópia privada opcional na conta. [PR #31](https://github.com/clashofcrittersbr/clashofcrittersbr.github.io/pull/31)
- Busca por Nick ou UID no diretório de membros, com contagens filtradas e atalho para gerenciar a inscrição. [PR #30](https://github.com/clashofcrittersbr/clashofcrittersbr.github.io/pull/30)
- Diretório voluntário de membros com Nick, UID e listas de ativos/inativos conforme visitas autenticadas nos últimos 15 dias. Migração SQL 002 aplicada. [PR #29](https://github.com/clashofcrittersbr/clashofcrittersbr.github.io/pull/29)

## Publicado em 10/11/2026

- Novos guias de Evoluções e Corrida do Ouro, com exemplos reais, imagens e fontes. [PR #15](https://github.com/clashofcrittersbr/clashofcrittersbr.github.io/pull/15)
- Guia independente de Evoluções com capturas das contas 409 e 790, créditos ao DEODATO e limites de comparação.
- Corrida do Ouro com fontes por afirmação, regras dos patches, variante CN e captura da adaptação utilizada pelo mantenedor.
- Galerias leves, links entre guias e documentação das informações ainda pendentes.

## Publicado em 08/11/2026

- Revisão geral da wiki: patches corrigidos nos guias, navegação ajustada e famílias em ordem alfabética. [PR #13](https://github.com/clashofcrittersbr/clashofcrittersbr.github.io/pull/13)
- Horda, tier list, campanha e aparências do Pyropup agora usam as referências das transcrições oficiais. As divergências nas provas de evolução continuam sinalizadas.
- Raridade e cor de evolução explicadas separadamente; ficha de provas do Pyropup conectada às habilidades da Horda.
- Guias atualizados com Aventura dos Artefatos, ajustes do Goldrush e do Spa, cartas Foil e mudanças no agrupamento do Desafio de Chefe.
- Corrigidos links sobrepostos nos guias rápidos da página inicial e substituída uma referência indisponível do Álbum de Cartas.
- Validação ampliada para todas as páginas, links internos e fichas traduzidas. Limites da revisão e pendências documentados.
- Notas desta revisão adicionadas ao histórico e à prévia de novidades da página inicial.

- Catálogo com 248 formas em 67 famílias, 448 descrições traduzidas, habilidades normais e da Horda, fontes, créditos e correções dos patches fornecidos pelo mantenedor. [PR #12](https://github.com/clashofcrittersbr/clashofcrittersbr.github.io/pull/12)
- Bonobean e Wattail registrados como adições pendentes. Datas da base, limites de validação e divergências entre fontes explicitados.

## Publicado em 07/11/2026

- Catálogo visual, filtros e ficha interativa do Pyropup T1–T4. [PR #11](https://github.com/clashofcrittersbr/clashofcrittersbr.github.io/pull/11)

## Publicado em 06/11/2026

- Guias do Concurso de Pesca e do Tiro aos Zobos com regras, estratégias e referências. [PR #10](https://github.com/clashofcrittersbr/clashofcrittersbr.github.io/pull/10)
- Ficha do Pyropup com retrato, comparação das habilidades e raridades por forma, provas T1 a T4 na versão 0.51.1 e divergências entre fontes. Modelo de contribuição para novas fichas.

## Publicado em 04/11/2026

- Tier list de Tataris para a campanha inicial e para a Horda da Temporada 3, com retratos, selos de evolução, fontes e escopo de versão. [PR #9](https://github.com/clashofcrittersbr/clashofcrittersbr.github.io/pull/9)
- Diagramas do tabuleiro da campanha, do ciclo de vantagens elementais e da divisão de funções na Horda.

- Prévia da última novidade na página inicial, com link para o histórico completo. [PR #8](https://github.com/clashofcrittersbr/clashofcrittersbr.github.io/pull/8)

- Guia da Invasão da Horda revisto para a Temporada 3 com base nas notas até a versão 0.51.1. Referências recentes e relatos históricos separados, com modelo de partida que registra a versão. [PR #7](https://github.com/clashofcrittersbr/clashofcrittersbr.github.io/pull/7)
- Aviso nos capítulos 24 a 28 do Modo História sobre as mudanças nos inimigos da versão 0.50.1.
- Página Novidades no menu da wiki, com histórico publicado por data e links para as PRs.

- Dojo com índice de formações relatadas por jogadores, créditos, requisitos de entrada e modelo para registrar vitórias da comunidade BR. [PR #6](https://github.com/clashofcrittersbr/clashofcrittersbr.github.io/pull/6)

- Guias em PT-BR sobre combate, vantagens elementais, evolução de Tataris, recursos, Desafio de Chefe e Álbum de Cartas. [PR #5](https://github.com/clashofcrittersbr/clashofcrittersbr.github.io/pull/5)
- Guia inicial corrigido para distinguir o tabuleiro dos três primeiros capítulos e o do restante da campanha.
- Regras do Dojo e da Invasão da Horda, com instruções para enviar formações testadas.
- Índice de eventos com orientações sobre Concurso de Pesca, Marathon Party, Corrida do Ouro e Cozy Farm.

- Capítulos do Critter Formations incorporados ao Modo História, com seletor por capítulo e créditos à fonte. [PR #4](https://github.com/clashofcrittersbr/clashofcrittersbr.github.io/pull/4)
- Simulador da Caça ao Tesouro incorporado ao guia do evento, com créditos e licença do autor. [PR #3](https://github.com/clashofcrittersbr/clashofcrittersbr.github.io/pull/3)
- Página inicial com atalhos para Modo História, Dojo, Horda e guias.
- Menu lateral nos artigos, busca no cabeçalho e temas claro, escuro e do dispositivo. [PR #2](https://github.com/clashofcrittersbr/clashofcrittersbr.github.io/pull/2)
- Primeira publicação da wiki, com guia de iniciante, formações, Caça ao Tesouro e orientações de contribuição. [Publicação inicial](https://github.com/clashofcrittersbr/clashofcrittersbr.github.io/actions/runs/41914772834)
- Formações separadas em Modo História, Dojo e Horda. A campanha começa no capítulo 1, com link para o capítulo correspondente no Critter Formations. [PR #1](https://github.com/clashofcrittersbr/clashofcrittersbr.github.io/pull/1)
<!-- --8<-- [end:publicado] -->
