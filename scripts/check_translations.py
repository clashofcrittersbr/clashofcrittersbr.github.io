"""Guard source coverage and explicit quantities; semantic review remains editorial."""
import json
import re
from pathlib import Path
root = Path(__file__).resolve().parents[1]
source = json.loads((root / 'docs/assets/data/tataris-wiki.json').read_text())
translations = json.loads((root / 'docs/assets/data/tataris-pt-br.json').read_text())['translations']
expected = set()
for record in source['records']:
    if record.get('skill'):
        expected.add(record['skill'])
    expected.update(s['text'] for s in (record.get('hordeSkills') or {}).values())
assert set(translations) == expected, 'Traduções ausentes ou sem fonte'
for original, translated in translations.items():
    assert translated.strip() and translated != original, original
    assert re.findall(r'\d+', original) == re.findall(r'\d+', translated), original
# No English descriptions left as visible Markdown outside the original-text details.
for path in (root / 'docs/tataris').glob('*.md'):
    text = path.read_text()
    for line in text.splitlines():
        if line.startswith('<details>'):
            continue
        assert line not in expected, (path, line)
        assert not any(line.endswith('** ' + value) for value in expected), (path, line)
    assert 'tradução ainda pendente' not in text
corrected = (root / 'docs/tataris/dewgrub.md').read_text()
assert corrected.count('as habilidades da Horda não recebem esse efeito (patch de 21/10/2026)') == 2
print(f'{len(translations)} traduções: cobertura, quantidades e correções verificadas.')

# Validate what readers actually see, not just the separate translation dictionary.
from html import unescape
catalog = json.loads((root / 'docs/assets/data/tataris.json').read_text())
records = {record['id']: record for record in catalog['records']}
assert set(records) == {record['slug'] for record in source['records']}
for original in source['records']:
    record = records[original['slug']]
    assert record['name'] == original['name']
    assert record['tier'] == f"T{original['tier']}"
    assert record['family'] == original['family']
    file, anchor = record['detail'].split('#')
    content = (root / 'docs' / file).read_text()
    section = content.split('{#' + anchor + '}', 1)[1].split('\n## ', 1)[0]
    normal = translations[original['skill']].replace('???:', '**Nome da habilidade ainda não confirmado na base:**')
    # The historical translation remains unchanged; only the published text gets the official correction.
    if record['id'] in {'waveflutter', 'morphanessa'}:
        normal = normal.replace('Os ataques dos aliados adjacentes também podem aplicar Lentidão e Sono.', 'As habilidades normais dos aliados adjacentes também podem aplicar Lentidão e Sono; as habilidades da Horda não recebem esse efeito (patch de 21/10/2026).')
    assert normal in section, (file, anchor, 'Habilidade normal diverge da tradução')
    assert original['skill'] in unescape(section), (file, anchor, 'Original ausente')
    for level, skill in (original.get('hordeSkills') or {}).items():
        line = f"- **Nível {level.removeprefix('level')} — {skill['name']}:** {translations[skill['text']]}"
        assert line in section, (file, anchor, level)
print('248 fichas conferidas contra nomes, graus, famílias, originais e traduções, com exceções oficiais explícitas.')
