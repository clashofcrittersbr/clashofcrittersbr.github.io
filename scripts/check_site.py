"""Validate every rendered page and local reference, including raw HTML and iframes.

Run after mkdocs build --strict. External availability is reviewed separately:
network failures and anti-bot responses must not break reproducible builds.
"""
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

site = Path(__file__).resolve().parents[1] / 'site'

class Page(HTMLParser):
    def __init__(self, path):
        super().__init__()
        self.ids, self.refs, self.errors = [], [], []
        self.feed(path.read_text(encoding='utf-8'))

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if attrs.get('id'):
            self.ids.append(attrs['id'])
        if tag in {'a', 'link', 'img', 'script', 'iframe', 'source'}:
            ref = attrs.get('href') if tag in {'a', 'link'} else attrs.get('src')
            if ref:
                self.refs.append(ref)
        if tag == 'img' and 'alt' not in attrs:
            self.errors.append('Imagem sem alt: ' + attrs.get('src', ''))
        if tag == 'iframe' and not attrs.get('title'):
            self.errors.append('Iframe sem título')

    def handle_comment(self, text):
        if text.strip().startswith(('tatari-', 'ultima-novidade')):
            self.errors.append('Marcador de conteúdo não renderizado: ' + text)

pages = {path.resolve(): Page(path) for path in site.rglob('*.html')}
assert pages, 'Compile a wiki antes de validar'
errors = []
refs = 0
for path, page in pages.items():
    label = str(path.relative_to(site))
    errors.extend(f'{label}: {message}' for message in page.errors)
    errors.extend(f'{label}: ID duplicado {key}' for key, count in Counter(page.ids).items() if count > 1)
    for ref in page.refs:
        url = urlsplit(ref)
        if 'utm_' in url.query:
            errors.append(f'{label}: link com rastreamento {ref}')
        if url.scheme or url.netloc:
            continue
        refs += 1
        # Root-relative URLs resolve inside the build, not the filesystem root.
        target = (site / unquote(url.path).lstrip('/')) if url.path.startswith('/') else (path.parent / unquote(url.path) if url.path else path)
        target = target.resolve()
        if not target.is_relative_to(site):
            errors.append(f'{label}: destino fora do site: {ref}')
            continue
        if target.is_dir():
            target /= 'index.html'
        if not target.is_file():
            errors.append(f'{label}: destino ausente: {ref}')
        elif url.fragment and target in pages and unquote(url.fragment) not in pages[target].ids:
            errors.append(f'{label}: âncora ausente: {ref}')
assert not errors, '\n'.join(errors)
print(f'{len(pages)} páginas; {refs} referências locais, âncoras, IDs, alt e títulos de iframe conferidos.')
