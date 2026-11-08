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
