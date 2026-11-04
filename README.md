# Clash of Critters BR

Wiki independente de fãs em português, feita com MkDocs para publicação no GitHub Pages. Os artigos ficam em `docs/` e o menu em `mkdocs.yml`.

## Prévia local

Com Python 3.12:

```sh
python -m pip install -r requirements.txt
python -m mkdocs serve
```

Abra `http://127.0.0.1:8000/`. Para validar o site antes de enviar alterações, use `python -m mkdocs build --strict`.

## Publicação no GitHub Pages

1. Use o [repositório público da wiki](https://github.com/clashofcrittersbr/clashofcrittersbr.github.io). Extraia o ZIP e use a pasta que contém `mkdocs.yml` como raiz do repositório. Inclua `.github/` e `.gitignore` no primeiro envio.
2. No GitHub, abra **Settings → Pages**. Em **Build and deployment → Source**, selecione **GitHub Actions**. Se o primeiro envio tiver disparado o workflow antes dessa configuração, abra **Actions → Wiki → Run workflow** na branch `main`.
3. Confira o resultado do job **Publicar wiki**. A aba **Settings → Pages** mostra a URL publicada, em [clashofcrittersbr.github.io](https://clashofcrittersbr.github.io/).

Para enviar os arquivos pelo Git na primeira publicação:

```sh
git init -b main
git add .
git commit -m "Inicia a wiki Clash of Critters BR"
git remote add origin https://github.com/clashofcrittersbr/clashofcrittersbr.github.io.git
git push -u origin main
```

## Edição em equipe

Convide apenas os editores escolhidos em **Settings → Collaborators**. Em uma organização, conceda acesso **Write** aos editores e reserve **Admin** para quem administra o projeto.

Após o primeiro build, proteja a branch `main` em **Settings → Branches**. Exija pull request, uma aprovação e a verificação **Validar wiki**. A proteção também pode ser aplicada aos administradores. No ambiente **github-pages**, permita deployments apenas de `main`.

Para editar pelo navegador, abra um artigo em `docs/`, clique no lápis e salve a alteração numa nova branch. Abra um pull request para revisão. O workflow valida a compilação em cada pull request e publica quando a mudança entra em `main`.

[Documentação de publicação do GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
