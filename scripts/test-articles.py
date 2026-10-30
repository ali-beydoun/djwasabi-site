"""Check general advice, collection filtering and static article discovery."""
import copy
import importlib.util
import json
import re
import unittest

spec = importlib.util.spec_from_file_location('articles', __file__.replace('test-articles.py', 'render-articles.py'))
renderer = importlib.util.module_from_spec(spec)
spec.loader.exec_module(renderer)


class ArticlePublishing(unittest.TestCase):
    def test_general_article_has_blog_parent_and_unselected_contact(self):
        catalogue = copy.deepcopy(renderer.read_catalogue())
        article = catalogue['articles'][0]
        article['slug'] = 'general-article-fixture'
        for optional in ['service', 'faq', 'contents', 'category']:
            article.pop(optional, None)
        catalogue['articles'] = [article]
        pages = renderer.render_pages(catalogue)
        html = pages['general-article-fixture.html']
        graph = json.loads(re.search(r'<script type="application/ld\+json">(.*?)</script>', html, re.S)[1])['@graph']
        trail = next(n for n in graph if n['@type'] == 'BreadcrumbList')['itemListElement']
        self.assertEqual(trail[1]['item'], renderer.BASE + '/blog.html')
        self.assertIn('href="/contact.html#contact"', html)
        self.assertNotIn('?event=', html)
        self.assertNotIn('class="guide-contents"', html)
        self.assertNotIn('Wedding questions', html)
        self.assertNotIn('{{', html)
        self.assertIn('/general-article-fixture.html', pages['blog.html'])
        self.assertNotIn('class="blog-filters"', pages['blog.html'])
        self.assertIn('data-category="general"', pages['blog.html'])

    def test_filters_only_offer_topics_with_articles(self):
        catalogue = copy.deepcopy(renderer.read_catalogue())
        wedding = next(a for a in catalogue['articles'] if a['category'] == 'weddings')
        general = copy.deepcopy(wedding)
        general['slug'] = 'general-advice-fixture'
        general.pop('category')
        catalogue['articles'] = [wedding, general]
        listing = renderer.render_pages(catalogue)['blog.html']
        self.assertIn('data-topic="all"', listing)
        self.assertIn('data-topic="weddings"', listing)
        self.assertIn('data-topic="general"', listing)
        self.assertNotIn('data-topic="work-events"', listing)
        self.assertNotIn('data-topic="parties"', listing)
        self.assertIn('aria-label="Filter articles by topic" hidden', listing)

    def test_all_catalogue_articles_are_discoverable_without_javascript(self):
        catalogue = renderer.read_catalogue()
        pages = renderer.render_pages(catalogue)
        listing = pages['blog.html']
        graph = json.loads(re.search(r'<script type="application/ld\+json">(.*?)</script>', listing, re.S)[1])['@graph']
        items = next(n for n in graph if n['@type'] == 'ItemList')['itemListElement']
        self.assertEqual(len(items), len(catalogue['articles']))
        for article in catalogue['articles']:
            path = '/' + article['slug'] + '.html'
            self.assertIn('href="' + path + '"', listing)
            self.assertIn(renderer.BASE + path, [item['url'] for item in items])
            html = pages[path[1:]]
            self.assertIn(article['service']['url'], html)
            self.assertIn('?event=' + article['service']['event'] + '#contact', html)


if __name__ == '__main__':
    unittest.main()
