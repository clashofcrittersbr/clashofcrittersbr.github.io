"""Build the public catalog, profile and tier-list cards from one reviewed dataset."""
import json
import posixpath
from html import escape
from pathlib import Path
from mkdocs.utils import get_relative_url


def on_page_markdown(markdown, *, page, config, files, **kwargs):
    data = json.loads((Path(config.docs_dir) / 'assets/data/tataris.json').read_text())
    records = {r['id']: r for r in data['records']}

    def url(path):
        if path.startswith('https://'):
            return path
        path, sep, anchor = path.partition('#')
        target = files.get_file_from_path(path).url if path.endswith('.md') else path
        return get_relative_url(target, page.url) + (sep + anchor if sep else '')

    def image(path, name, size=72):
        if not path:
            return '<span class="tc-muted">Retrato pendente</span>'
        return f'<img src="{escape(url(path))}" alt="{escape(name)}" width="{size}" height="{size}" loading="lazy">'

    for key, r in records.items():
        token = f'<!-- tatari-card:{key} -->'
        if token not in markdown:
            continue
        name = r["name"]
        card = f'- ![{r["name"]}, forma {r["tier"]}]({posixpath.relpath(r["portrait"], posixpath.dirname(page.file.src_uri))}){{ .wiki-tatari-portrait loading="lazy" width="72" height="72" }} **{name}** <span class="wiki-tatari-grade">{r["tier"]}</span><br>\n  {r["note"]}'
        markdown = markdown.replace(token, card)

    if '<!-- tatari-catalog -->' in markdown:
        def options(values):
            return ''.join(f'<option value="{escape(v)}">{escape(v)}</option>' for v in values)
        controls = f'''<div class="tc-filters" hidden>
<label>Buscar Tatari<input id="tc-search" type="search" placeholder="Nome da forma ou linhagem" autocomplete="off"></label>
<label>Elemento<select id="tc-element"><option value="">Todos os elementos</option>{options(['Água','Fogo','Planta','Pedra','Elétrico'])}</select></label>
<label>Grau<select id="tc-tier"><option value="">Todos os graus</option>{options(sorted(set(r['tier'] for r in records.values())))}</select></label>
<label>Papel na equipe<select id="tc-use"><option value="">Todos os usos</option>{options(['Frente','Dano','Cura','Suporte'])}</select></label>
<button type="button" id="tc-clear">Limpar filtros</button></div>'''
        cards = []
        for r in records.values():
            full = bool(r['detail'])
            target = url(r['detail'] or r['reference'])
            search = r['name'] + ' ' + r.get('family', '')
            cards.append(f'''<article class="tc-card" data-name="{escape(search)}" data-element="{escape(r['element'])}" data-tier="{r['tier']}" data-use="{r['use']}">
<div class="tc-card-top"><span>{r['element']}</span><span>{r['tier']}</span></div>
{image(r['portrait'],r['name']+' · '+r['tier'],112)}
<h2><a href="{escape(target)}">{r['name']}</a></h2><span class="tc-use">{r['use']}</span>
<p>{escape(r['note'])}</p><p class="tc-card-footer">{'Consultar família →' if full else 'Ver na tier list →'}</p></article>''')
        html = f'''<div class="tc-catalog"><div class="tc-coverage"><strong>{len(records)} formas para consultar</strong><span>67 famílias · base histórica com correções documentadas</span></div>{controls}<p id="tc-count" role="status" aria-live="polite">{len(records)} formas disponíveis</p><div class="tc-grid">{''.join(cards)}</div><div id="tc-empty" hidden><h2>Nenhuma forma encontrada</h2><p>Tente outro nome ou remova um filtro. O catálogo contém apenas as formas já cadastradas.</p></div></div>'''
        markdown = markdown.replace('<!-- tatari-catalog -->',html)

    if '<!-- tatari-profile:pyropup -->' in markdown:
        p = data['pyropup']
        tabs, panels = [], []
        for f in p['forms']:
            key = f['tier'].lower()
            tabs.append(f'<button id="tab-{key}" type="button" data-form="{key}" aria-controls="forma-{key}">{image(f["portrait"],"",56)}<span><strong>{f["tier"]}</strong>{f["name"]}</span></button>')
            tasks = ''.join(f'<li>{escape(t)}</li>' for t in f['tasks'])
            warning = f'<aside class="tc-warning"><strong>Divergência entre fontes</strong><p>{escape(f["warning"])}</p></aside>' if f.get('warning') else ''
            panels.append(f'''<section class="tc-form" id="forma-{key}" aria-labelledby="name-{key}">
<div class="tc-profile-hero"><div class="tc-art tc-art--{key}">{image(f['portrait'],f['name']+' · '+f['tier'],240)}</div><div><p class="tc-eyebrow">FOGO · GUARDIÃO</p><h2 id="name-{key}">{f['name']}</h2><p><span class="tc-use">{f['tier']}</span> Cor de evolução: {f['rarity']}</p><p>{escape(f['change'])}</p></div></div>
<div class="tc-profile-columns"><div class="tc-box"><h3>Habilidade · {f['skill']}</h3><p>{escape(f['effect'])}</p><p class="tc-muted">Habilidade normal de combate. As habilidades exclusivas da Horda estão na ficha da família, vinculada acima.</p></div>
<div class="tc-box"><h3>{'Como chegar ao '+f['tier'] if f['stars'] else 'Primeiro passo'}</h3>{f'<p class="tc-star">★ {f["stars"]} estrelas para abrir a prova</p>' if f['stars'] else ''}<ul>{tasks}</ul>{warning}</div></div></section>''')
        heading = f'''<div class="tc-profile"><a class="tc-back" href="{url('tataris.md')}">← Catálogo de Tataris</a><p class="tc-muted">Selecione uma forma para ver o que ela ganha e como desbloqueá-la.</p><div class="tc-form-tabs" aria-label="Formas da linhagem">{''.join(tabs)}</div>{''.join(panels)}<aside class="tc-version"><strong>Referência das provas: {p['gameVersion']} · build {p['build']}</strong><p>{escape(p['notes'])}</p></aside></div>'''
        comparison = '\n\n## Comparação das quatro formas\n\n| Grau | Forma | Habilidade | Ganho principal |\n| --- | --- | --- | --- |\n'
        comparison += '\n'.join(f'| {f["tier"]} | {f["name"]} | {f["skill"]} | {f["change"]} |' for f in p['forms'])
        # Keep pre-existing deep links from PR #10 functional.
        trials = '\n\n## Provas de evolução\n\nAs estrelas abrem a prova. Cumpra as tarefas na forma anterior; **OU** marca uma alternativa.\n'
        for prev,f in zip(p['forms'],p['forms'][1:]):
            trials += f'\n### {prev["tier"]} → {f["tier"]} · {prev["name"]} para {f["name"]}\n\n**{f["stars"]} estrelas.**\n\n' + '\n'.join('- '+t for t in f['tasks'])+'\n'
        trials += '\nAs alternativas de nível 16 vêm do TataDex. Para T3, a wiki comunitária e o ClashOfCritters.Info listam 20.000 bolinhas, enquanto o TataDex identifica 15.000 para a build acima. Confira a prova exibida no jogo.\n'
        rest = '\n\n## Aparências\n\n'+p['appearance']+'\n\n[Entenda estrelas e alimentação](tataris.md).\n\n## Fontes e créditos\n\n'+p['sourcesMarkdown']
        markdown = markdown.replace('<!-- tatari-profile:pyropup -->',heading+comparison+trials+rest)
    return markdown
