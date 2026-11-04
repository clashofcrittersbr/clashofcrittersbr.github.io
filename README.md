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
