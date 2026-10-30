"""Render the Blog and article pages from their catalogue and shared template.

Run after editing content/articles.json, partials/articles/ or the homepage shell.
Generated HTML is committed, so discovery and reading do not require JavaScript.
"""
import argparse
import json
import re
from datetime import date
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BASE = 'https://djwasabi.com.au'
CATALOGUE = ROOT / 'content/articles.json'


def fill(template, values):
    return re.sub(r'\{\{(\w+)\}\}', lambda m: values[m[1]], template)


def readable_date(value):
    d = date.fromisoformat(value)
    return f'{d.day} {d.strftime("%B %Y")}'


def image_markup(image, priority=False, thumbnail=False):
    src = image['src']
    stem, extension = src.rsplit('.', 1)
    variants = [(w, src if w == image['width'] else f'{stem}-{w}.{extension}')
                for w in image.get('widths', [image['width']])]
    for _, path in variants:
        assert (ROOT / path).is_file(), f'Missing image: {path}'
    srcset = ', '.join(f'{path} {w}w' for w, path in variants)
    loading = 'fetchpriority="high"' if priority else 'loading="lazy"'
    framing = ' class="guide-portrait"' if image.get('portrait') else ''
    sizes = '96px' if thumbnail else '(max-width: 768px) calc(100vw - 32px), 560px'
    return (f'<img src="/{escape(src)}" srcset="{escape(srcset)}" '
            f'sizes="{sizes}" '
            f'width="{image["width"]}" height="{image["height"]}" '
            f'alt="{escape(image["alt"])}"{framing} {loading} decoding="async">')


def breadcrumb(items, url):
    markup = '<span aria-hidden="true">/</span>'.join(
        f'<a href="{escape(path)}">{escape(label)}</a>' if i < len(items) - 1
        else f'<span aria-current="page">{escape(label)}</span>'
        for i, (label, path) in enumerate(items))
    schema = {'@type': 'BreadcrumbList', '@id': url + '#breadcrumb',
              'itemListElement': [{'@type': 'ListItem', 'position': i + 1,
                                   'name': label, 'item': BASE + path}
                                  for i, (label, path) in enumerate(items)]}
    return f'<nav class="guide-breadcrumb" aria-label="Breadcrumb">{markup}</nav>', schema


def read_catalogue():
    catalogue = json.loads(CATALOGUE.read_text())
    articles = catalogue['articles']
    categories = catalogue['blog'].get('categories', {})
    assert articles, 'Publish at least one article before the Blog'
    assert len({a['slug'] for a in articles}) == len(articles), 'Duplicate article URL'
    for article in articles:
        assert re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', article['slug'])
        assert date.fromisoformat(article['published']) <= date.fromisoformat(article['modified'])
        assert (ROOT / article['body']).is_file()
        assert article.get('category', 'general') in categories, 'Unknown article category'
        service = article.get('service')
        if service:
            assert (ROOT / service['url'].lstrip('/')).is_file()
            assert service.get('event', '') in ['', 'wedding', 'birthday', 'corporate', 'other']
        for item in article.get('contents', []):
            assert f'id="{item["id"]}"' in (ROOT / article['body']).read_text()
    catalogue['articles'] = sorted(articles, key=lambda a: a['title'].casefold())
    return catalogue


def render_pages(catalogue):
    template = (ROOT / 'partials/editorial-page.html').read_text()
    home = (ROOT / 'index.html').read_text()
    home_graph = json.loads(re.search(r'<script type="application/ld\+json">(.*?)</script>', home, re.S)[1])['@graph']
    common_graph = [n for n in home_graph if n['@type'] in ['LocalBusiness', 'ContactPoint', 'WebSite']]
    common_graph.append(catalogue['author'])
    navigation = re.search(r'<nav class="navbar".*?</nav>', home, re.S)[0]
    navigation = navigation.replace(' class="active"', '').replace(' aria-current="page"', '')
    footer = re.search(r'<footer class="footer".*?</footer>', home, re.S)[0]
    blog = catalogue['blog']

    def page(path, title, description, image, social_alt, modified, main, crumbs, extra,
             contact='/contact.html#contact', article=False):
        url = BASE + '/' + path
        node = {'@type': 'WebPage' if article else 'CollectionPage', '@id': url + '#webpage',
                'url': url, 'name': title, 'description': description, 'inLanguage': 'en-AU',
                'dateModified': modified, 'isPartOf': {'@id': BASE + '/#website'},
                'publisher': {'@id': BASE + '/#business'},
                'breadcrumb': {'@id': url + '#breadcrumb'},
                'primaryImageOfPage': {'@type': 'ImageObject', 'url': extra[0]['image'] if article else BASE + '/' + blog['socialImage']},
                'mainEntity': {'@id': extra[0]['@id']}, 'significantLink': BASE + contact}
        nav = navigation.replace('href="/blog.html"', 'href="/blog.html" class="active"' + ('' if article else ' aria-current="page"'))
        nav = nav.replace('href="#contact"', f'href="{contact}"')
        foot = footer.replace('href="#contact"', f'href="{contact}"')
        foot = foot.replace('href="/contact.html#contact"', f'href="{contact}"')
        graph = {'@context': 'https://schema.org', '@graph': common_graph + [node, crumbs] + extra}
        values = {k: escape(v, quote=True) for k, v in {
            'title': title, 'description': description, 'url': url,
            'social_image': BASE + '/' + image, 'social_alt': social_alt,
            'og_type': 'article' if article else 'website',
            'body_class': 'page-guide' if article else 'page-blog'}.items()}
        values.update(schema=json.dumps(graph, indent=2, ensure_ascii=False).replace('<', '\\u003c'),
                      navigation=nav, footer=foot, main=main,
                      page_scripts='' if article else '    <script src="js/blog.js?v=20261030-browse" defer></script>')
        return fill(template, values)

    outputs = {}
    cards = []
    list_items = []
    for index, a in enumerate(catalogue['articles']):
        path = '/' + a['slug'] + '.html'
        url = BASE + path
        service = a.get('service')
        parent = (service['label'], service['url']) if service else ('Blog', '/blog.html')
        trail, crumbs = breadcrumb([('Home', '/'), parent, (a['breadcrumbLabel'], path)], url)
        event = service.get('event') if service else None
        contact = '/contact.html' + ('?event=' + event if event else '') + '#contact'
        contents = ''.join(f'<a href="#{escape(item["id"])}">{escape(item["label"])}</a>' for item in a.get('contents', []))
        contents = f'<nav class="guide-contents" aria-label="In this guide"><p>In this guide</p>{contents}</nav>' if contents else ''
        caption = escape(a['image'].get('caption', ''))
        if a['image'].get('captionLink'):
            link = a['image']['captionLink']
            caption += f' <a href="{escape(link["url"])}">{escape(link["label"])}</a>.'
        service_link = f'<a class="btn btn-primary" href="{escape(service["url"])}">{escape(service["cta"])}</a>' if service else ''
        faq = a.get('faq')
        faq_link = f'<a class="guide-back-link" href="{escape(faq["url"])}">{escape(faq["label"])}</a>' if faq else ''
        main = f'''        <article class="wedding-guide" aria-labelledby="guide-title">
            <header class="guide-header"><div class="container">
                <div class="guide-wayfinding">{trail}<a class="guide-all-link" href="/blog.html"><span aria-hidden="true">←</span> All articles</a></div>
                <div class="guide-intro-grid"><div>
                    <p class="eyebrow">{escape(a['topic'])}</p>
                    <h1 id="guide-title">{escape(a['title'])}</h1>
                    <p class="guide-deck">{escape(a['summary'])}</p>
                    <p class="guide-byline">By <a href="/my-story.html">Wassim, DJ Wasabi</a><br><time datetime="{a['published']}">{readable_date(a['published'])}</time></p>
                </div><figure class="guide-photo">{image_markup(a['image'], True)}<figcaption>{caption}</figcaption></figure></div>
            </div></header>
            <div class="guide-reading"><div class="container guide-reading-grid{' guide-reading-simple' if not contents else ''}">
                {contents}
                <div class="guide-copy">
{(ROOT / a['body']).read_text().strip()}
                    <div class="guide-next">
                        <h2>{escape(a['next']['title'])}</h2><p>{escape(a['next']['text'])}</p>
                        <div class="guide-actions">{service_link}<a class="guide-contact-link" href="{contact}">{escape(a['next']['contactLabel'])}</a></div>
                        <div class="guide-return-links"><a class="guide-back-link" href="/blog.html">All articles</a>{faq_link}</div>
                    </div>
                </div>
            </div></div>
        </article>'''
        article_node = {'@type': 'Article', '@id': url + '#article', 'headline': a['title'],
                        'description': a['description'], 'image': BASE + '/' + a['image']['src'],
                        'datePublished': a['published'], 'dateModified': a['modified'],
                        'author': {'@id': BASE + '/#wassim'}, 'publisher': {'@id': BASE + '/#business'},
                        'mainEntityOfPage': {'@id': url + '#webpage'}, 'inLanguage': 'en-AU', 'articleSection': a['topic']}
        outputs[path.lstrip('/')] = page(path.lstrip('/'), a['title'] + ' | DJ Wasabi', a['description'],
                                        a['socialImage'], a['socialAlt'], a['modified'], main, crumbs,
                                        [article_node], contact, article=True)
        cards.append(f'''<li data-category="{escape(a.get('category', 'general'))}"><article class="blog-entry"><a class="blog-card" href="{path}" aria-labelledby="article-{a['slug']}">
            <div class="blog-card-copy"><p class="eyebrow">{escape(a['topic'])}</p>
                <h2 id="article-{a['slug']}">{escape(a['title'])}</h2>
            </div><div class="blog-card-photo">{image_markup(a['image'], index < 4, thumbnail=True)}</div>
            </a></article></li>''')
        list_items.append({'@type': 'ListItem', 'position': index + 1, 'url': url, 'name': a['title']})

    blog_url = BASE + '/blog.html'
    trail, crumbs = breadcrumb([('Home', '/'), ('Blog', '/blog.html')], blog_url)
    present = {a.get('category', 'general') for a in catalogue['articles']}
    filters = ''
    if len(present) > 1:
        options = {'all': 'All', **{k: v for k, v in blog.get('categories', {}).items() if k in present}}
        buttons = ''.join(f'<button type="button" data-topic="{escape(key)}" aria-pressed="{str(key == "all").lower()}" aria-controls="blog-articles">{escape(label)}</button>' for key, label in options.items())
        filters = f'<div class="blog-filters" role="group" aria-label="Filter articles by topic" hidden>{buttons}</div><p class="blog-status sr-only" role="status" aria-live="polite" aria-atomic="true"></p>'
    main = f'''        <header class="blog-header"><div class="container">
            {trail}<h1>{escape(blog['heading'])}</h1>
            <p class="blog-intro">{escape(blog['intro'])}</p>
        </div></header>
        <section class="blog-library" aria-label="Articles"><div class="container">
            {filters}<ul class="blog-grid" id="blog-articles">{''.join(cards)}</ul>
        </div></section>
        <section class="blog-services" aria-labelledby="planning-title"><div class="container">
            <div><h2 id="planning-title">What are you planning?</h2><p>Find out how I can help with the music on your day.</p></div>
            <nav aria-label="Explore DJ services"><a href="/weddings.html">Weddings <span aria-hidden="true">→</span></a><a href="/birthdays.html">Birthdays <span aria-hidden="true">→</span></a><a href="/corporate.html">Corporate events <span aria-hidden="true">→</span></a><a href="/other-events.html">Other celebrations <span aria-hidden="true">→</span></a></nav>
        </div></section>'''
    listing = {'@type': 'ItemList', '@id': blog_url + '#articles', 'name': 'Articles by Wassim',
               'numberOfItems': len(list_items), 'itemListElement': list_items}
    outputs['blog.html'] = page('blog.html', blog['title'], blog['description'], blog['socialImage'],
                                blog['socialAlt'], max(blog['modified'], *(a['modified'] for a in catalogue['articles'])), main, crumbs, [listing])
    return outputs


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    catalogue = read_catalogue()
    outputs = render_pages(catalogue)
    # Maintain only the editorial URLs in the existing sitemap, preserving other pages.
    sitemap = (ROOT / 'sitemap.xml').read_text()
    for name in outputs:
        if name == 'blog.html':
            modified = max(catalogue['blog']['modified'], *(a['modified'] for a in catalogue['articles']))
            images = [a['image']['src'] for a in catalogue['articles']]
        else:
            article = next(a for a in catalogue['articles'] if a['slug'] + '.html' == name)
            modified, images = article['modified'], [article['image']['src']]
        url = BASE + '/' + name
        block = f'  <url>\n    <loc>{url}</loc>\n    <lastmod>{modified}</lastmod>\n'
        for image in dict.fromkeys(images):
            block += f'    <image:image>\n      <image:loc>{BASE}/{escape(image)}</image:loc>\n    </image:image>\n'
        block += '  </url>'
        pattern = r'  <url>\s*<loc>' + re.escape(url) + r'</loc>.*?</url>'
        if re.search(pattern, sitemap, re.S):
            sitemap = re.sub(pattern, lambda _: block, sitemap, flags=re.S)
        else:
            sitemap = sitemap.replace('</urlset>', block + '\n</urlset>')
    outputs['sitemap.xml'] = sitemap
    stale = []
    for name, content in outputs.items():
        path = ROOT / name
        if args.check:
            if not path.exists() or path.read_text() != content:
                stale.append(name)
        else:
            path.write_text(content)
    if stale:
        raise SystemExit('Run python3 scripts/render-articles.py: ' + ', '.join(stale))
    print(f'{len(catalogue["articles"])} articles, Blog and sitemap ' + ('verified' if args.check else 'rendered'))


if __name__ == '__main__':
    main()
