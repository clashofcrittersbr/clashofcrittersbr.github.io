"""Check catalog integrity and every local URL in the rendered feature pages.

Run after mkdocs build --strict. No network access is required.
"""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import json

root = Path(__file__).resolve().parents[1]
site = root / 'site'
data = json.loads((root / 'docs/assets/data/tataris.json').read_text())
records = data['records']
assert data['schemaVersion'] == 1
assert len({r['id'] for r in records}) == len(records)
assert {f['tier'] for f in data['pyropup']['forms']} == {'T1', 'T2', 'T3', 'T4'}
assert {r['tier'] for r in records} == {'T1', 'T2', 'T3', 'T4'}
for r in records:
    assert r['element'] in {'Água', 'Fogo', 'Planta', 'Pedra', 'Elétrico'}
    assert r['use'] in {'Frente', 'Dano', 'Cura', 'Suporte'}
    assert (root / 'docs' / r['portrait']).is_file(), r['id']

class References(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.refs, self.ids = [], set()
        self.feed(text)
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if attrs.get('id'):
            self.ids.add(attrs['id'])
        if tag in ('a', 'img', 'script', 'link'):
            ref = attrs.get('src') if tag in ('img', 'script') else attrs.get('href')
            if ref: self.refs.append(ref)

for page in ['tataris/index.html', 'guias/pyropup/index.html', 'guias/tier-list/index.html']:
    path = site / page
    text = path.read_text()
    assert '<!-- tatari-' not in text, page
    parsed = References(text)
    for ref in parsed.refs:
        url = urlsplit(ref)
        if url.scheme or url.netloc:
            continue
        dest = (path.parent / unquote(url.path)).resolve() if url.path else path
        if dest.is_dir(): dest /= 'index.html'
        assert dest.is_file(), (page, ref)
        if url.fragment:
            assert unquote(url.fragment) in References(dest.read_text()).ids, (page, ref)
profile = (site / 'guias/pyropup/index.html').read_text()
assert all(f'id="forma-t{i}"' in profile for i in range(1,5))
assert '20.000 bolinhas' in profile and '15.000' in profile
assert '171352' in profile
print(f'{len(records)} registros íntegros; imagens, links, âncoras e divergência das provas conferidos.')
