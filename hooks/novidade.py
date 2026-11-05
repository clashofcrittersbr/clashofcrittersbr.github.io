import re
from pathlib import Path

from mkdocs.exceptions import PluginError


def on_page_markdown(markdown, *, page, config, **kwargs):
    if page.file.src_uri != "index.md":
        return markdown

    changelog = Path(config.config_file_path).with_name("CHANGELOG.md")
    source = changelog.read_text(encoding="utf-8")
    _, start, published = source.partition("<!-- --8<-- [start:publicado] -->")
    published, end, _ = published.partition("<!-- --8<-- [end:publicado] -->")
    release = re.search(
        r"^## Publicado em (\d{2}/\d{2}/\d{4})[ \t]*\n(.*?)(?=^## |\Z)",
        published,
        re.MULTILINE | re.DOTALL,
    )
    entry = re.search(r"^- (\S[^\n]*(?:\n[ \t]+\S[^\n]*)*)", release[2], re.MULTILINE) if release else None
    if not (start and end and release and entry):
        raise PluginError("O CHANGELOG.md precisa de uma publicação datada com pelo menos um item.")

    summary = " ".join(line.strip() for line in entry[1].splitlines())
    preview = (
        f'<p class="wiki-latest-meta"><strong>Última novidade</strong> · {release[1]}</p>'
        f"\n\n{summary}"
    )
    return markdown.replace("<!-- ultima-novidade -->", preview, 1)
