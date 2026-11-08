# Colabore

Os editores trabalham nos artigos em Markdown dentro da pasta `docs/` do repositório. Dá para editar pelo navegador do GitHub e abrir um pull request com a proposta. Outra pessoa da equipe revisa a alteração antes da publicação.

Ao documentar um teste, informe o que observou e em quais condições. Para uma dica vinda de outra comunidade, indique o link e o autor quando disponível. Para uma formação própria, use o modelo abaixo.

## Modelo de formação

| Campo | O que registrar |
| --- | --- |
| Fase | Capítulo e número da fase |
| Nível | Nível exibido na conta durante o teste |
| Composição | Tatari, Tier e posição de cada unidade, com a orientação da grade |
| Substituições | O que você trocou e o resultado de cada troca testada |
| Resultado | Vitória ou derrota e observações da tentativa |
| Evidência | Print ou vídeo, se disponível |
| Data e versão | Dia do teste e versão do jogo, se conhecida |

## Antes de enviar

Confira se as posições batem com o print e se qualquer sugestão ainda sem teste está identificada. Use os nomes dos Tataris como aparecem no jogo para facilitar a busca.

## Modelo de formação do Dojo

Use este modelo para registrar uma vitória. Nas posições, descreva a grade do seu lado da tela e conte as fileiras a partir da frente, a mais próxima do adversário. Na captura, deixe visíveis a fase e o resultado e oculte seu UID se ele aparecer.

```text
Elemento e fase:
Nível mostrado no combate:
1. Tatari / grau / fileira e coluna:
2. Tatari / grau / fileira e coluna:
3. Tatari / grau / fileira e coluna:
4. Tatari / grau / fileira e coluna:
5. Tatari / grau / fileira e coluna:
Atributos ou alimentação relevantes:
Substituições testadas e resultado:
Data e versão do jogo, se conhecida:
Captura ou vídeo da vitória:
Crédito ou link, se adaptou uma formação:
```

[Propor uma formação no GitHub](https://github.com/clashofcrittersbr/clashofcrittersbr.github.io/edit/main/docs/formacoes/dojo.md){ .md-button }

## Modelo de partida da Horda

Registre a formação de cada jogador separadamente. Indique quem cobriu cada lado e destaque as mudanças de posição ou de nível que fizeram diferença. Na captura do resultado, oculte os UIDs caso apareçam.

```text
Temporada e dificuldade:
Data da partida e versão exibida no jogo:
Jogador A — lado, Tataris, graus e posições:
Jogador B — lado, Tataris, graus e posições:
Chips de cada lado, na ordem se conhecida:
Níveis importantes atingidos durante a partida:
Onda, chefe e ajuste decisivo:
Resultado — última onda e eliminações:
Captura do relatório ou vídeo:
Créditos e link, se adaptou uma formação:
```

[Propor um registro da Horda no GitHub](https://github.com/clashofcrittersbr/clashofcrittersbr.github.io/edit/main/docs/formacoes/horda.md){ .md-button }

## Modelo de ficha de evolução

Organize a ficha por linhagem, a partir da primeira forma. Use a [ficha do Pyropup](guias/pyropup.md) como exemplo e registre somente os graus que existem na versão consultada.

| Campo | O que registrar |
| --- | --- |
| Linhagem | Nome, elemento, função e retrato creditado. Para cada forma, informe seu grau e sua raridade, quando confirmada. |
| Mudanças em combate | Nome e efeito da habilidade em cada forma. Destaque o que muda na área, no efeito de estado ou na aura. Separe as habilidades exclusivas de modos como a Horda. |
| Acesso a cada forma | Estrelas para abrir a prova e tarefas feitas na forma anterior. Indique quais requisitos são cumulativos e quais são alternativas. |
| Versão e fontes | Data, versão ou build e fonte de cada grupo de dados. Registre o que a tela do jogo mostra quando houver captura da versão indicada. |
| Divergências | Mostre os valores conflitantes e informe qual referência tem versão identificada. Oriente o leitor a conferir a tarefa no jogo antes de gastar recursos. |

## Fontes, créditos e atualização

- Vincule a página específica usada e registre data, versão e autor quando disponíveis. Separe anúncio oficial, descrição da base histórica, relato de jogador e teste da comunidade BR.
- Nos textos derivados da wiki.gg, preserve a atribuição aos colaboradores e a licença [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/), identificando tradução, reorganização e correções feitas aqui. Isso não estende a licença às artes e marcas do jogo. [Política da fonte](https://clashofcritters.wiki.gg/wiki/Meta:Copyrights).
- As ferramentas incorporadas continuam nos sites dos seus autores. Preserve os créditos e avisos de licença de cada ferramenta; a licença de uma não se aplica automaticamente às demais.
- Para patches enviados manualmente, siga a [política de atualização](patches-tataris.md#politica-de-atualizacao-manual). Não complete nomes, números ou requisitos que o anúncio não informa.
- Documente a mudança no changelog e inclua uma prévia na PR. Uma correção editorial não equivale a validar todo o guia na versão atual do jogo.
