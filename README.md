# Clash of Critters BR

Wiki independente de fãs em português, feita com MkDocs e publicada no GitHub Pages.

[Abrir a wiki](https://clashofcrittersbr.github.io/)

## Onde editar

| Caminho | O que contém |
| --- | --- |
| `docs/` | Artigos em Markdown, incluindo formações, guias e eventos |
| `docs/assets/` | Identidade visual, ilustrações e estilos da interface |
| `mkdocs.yml` | Menu, tema e busca |
| `.github/workflows/wiki.yml` | Validação de PRs e publicação do site |
| [`CHANGELOG.md`](CHANGELOG.md) | Histórico das mudanças que afetam os leitores |

## Prévia local

Em um clone do repositório, na pasta que contém `mkdocs.yml`, use Python 3.12.

```sh
python -m pip install -r requirements.txt
python -m mkdocs serve
```

Abra `http://127.0.0.1:8000/`. Antes de enviar a mudança, execute `python -m mkdocs build --strict` para validar a compilação e detectar referências internas com problemas.

## Como registrar uma mudança

1. Crie uma branch a partir de `main`. Se estiver editando pelo navegador do GitHub, use a opção de salvar a alteração em uma nova branch.
2. Faça commits pequenos. No título, diga o que mudou, como `Adiciona referência do capítulo 1`. Use o corpo do commit para explicar a motivação, a origem dos dados ou a decisão técnica quando isso ajudar na manutenção.
3. No pull request, descreva **o que mudou**, **por quê** e **como foi validado**. Para alterações visuais, inclua uma prévia quando possível. Use comentários no código para explicar restrições e comportamentos que não ficam claros pela leitura.
4. Registre mudanças visíveis para o leitor em **Ainda não publicado** no changelog. Ao publicar, mova as entradas para uma seção com a data da publicação.
5. Confira a validação do GitHub Actions e peça revisão antes de integrar o pull request à `main`.

## Como a wiki vai ao ar

A origem do GitHub Pages é **GitHub Actions**. O workflow **Wiki** compila cada pull request. Após a integração à `main`, ele executa **Validar wiki** e **Publicar wiki**.

Em **Actions → Wiki**, confira a execução do commit publicado e abra no site as páginas afetadas. Para executar o workflow novamente, use **Run workflow** na branch `main`.

[Documentação de publicação do GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)

## Catálogo e fichas de Tataris

O cadastro está em `docs/assets/data/tataris.json`. Ele alimenta o catálogo, os cartões da tier list e a ficha do Pyropup durante o build, por `hooks/tataris.py`. A interface é própria da wiki e usa a paleta existente.

- `records`: formas já documentadas, grau, elemento, **uso editorial** e retrato. `detail` aponta para uma ficha completa; sem esse campo, o cartão abre a referência existente.
- `pyropup.forms`: habilidades, provas e divergências de cada evolução. Os números mantêm a versão das fontes; revisar a interface não equivale a testar as regras na versão atual do jogo.
- `pyropup.sourcesMarkdown`: fontes exibidas ao leitor. `artSources` registra os três retratos adicionais do Creator Kit da Farlight, redimensionados para WebP.
- A tier list usa marcadores `<!-- tatari-card:identificador -->`; os cartões são montados com o mesmo cadastro. O catálogo e a ficha não fazem consultas a serviços externos.

Para adicionar outra linhagem completa, estenda o modelo de ficha e o renderizador com dados revisados; não preencha habilidades ou requisitos por inferência. As tags do catálogo não pretendem substituir a classe oficial do Tatari.

Validação: execute `python -m mkdocs build --strict` e `python scripts/check_catalog.py`. A segunda checagem verifica imagens, referências locais, âncoras e integridade do cadastro. Na prévia, teste busca com acentos, filtros combinados, ausência de resultados, troca T1–T4 com teclado, link direto por forma, celular e leitura sem JavaScript.

## Catálogo completo e patches manuais (PR12)

`docs/assets/data/tataris-wiki.json` preserva a origem, revisão do espelho e coleta de 248 formas / 67 famílias. As fichas em `docs/tataris/` são locais e pesquisáveis. Descrições originais em inglês sob CC BY-SA 4.0; rótulos e notas em português. Imagens adicionais são remotas, fixadas em commit, com lazy loading e créditos. Não há promessa de atualização automática.

Atualizar `docs/patches-tataris.md` e as fichas afetadas ao receber transcrição oficial. Não inferir valores que o anúncio remete à interface do jogo. Bonobean e Wattail permanecem pendências explícitas fora da contagem histórica. Conferir divergência de versões com a ficha anterior de Pyropup antes de alterar suas provas. Executar build estrito e `python scripts/check_catalog.py`.
