"""Check public-page discovery, identity, share metadata and enquiry links offline."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
import json,re,xml.etree.ElementTree as ET
ROOT=Path(__file__).resolve().parent.parent
BASE='https://djwasabi.com.au'
NAMES=['index','weddings','birthdays','corporate','other-events','my-story','gallery','contact','privacy-policy','choosing-your-first-dance-song']
class Page(HTMLParser):
 def __init__(self,source):
  super().__init__();self.meta={};self.links=[];self.assets=[];self.ids=set();self.canonical=[];self.lang=None;self.h1=0;self.feed(source)
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=='html':self.lang=a.get('lang')
  if tag=='meta':self.meta[a.get('name',a.get('property'))]=a.get('content')
  if tag=='h1':self.h1+=1
  if a.get('id'):self.ids.add(a['id'])
  if tag=='a':self.links.append(a.get('href',''))
  if tag=='link' and a.get('rel')=='canonical':self.canonical.append(a['href'])
  if tag in ['img','script'] and a.get('src'):self.assets.append(a['src'])
  if tag=='link' and a.get('rel') in ['stylesheet','icon','apple-touch-icon']:self.assets.append(a['href'])
def local_path(url):
 u=urlsplit(url)
 if u.netloc and u.netloc!='djwasabi.com.au':return None
 if u.scheme not in ['', 'http','https']:return None
 return ROOT/unquote(u.path).lstrip('/') if u.path not in ['', '/'] else ROOT/'index.html'
parsed={};titles=[];descriptions=[];modified={}
for name in NAMES:
 source=(ROOT/(name+'.html')).read_text();p=Page(source);parsed[name]=p
 title=re.search(r'<title>(.*?)</title>',source).group(1);titles.append(title);descriptions.append(p.meta['description'])
 canonical=BASE+('/' if name=='index' else '/'+name+'.html')
 assert p.canonical==[canonical],(name,'canonical')
 assert p.lang=='en-AU' and p.h1==1,(name,'language or heading')
 assert p.meta['robots']=='index, follow, max-image-preview:large'
 assert p.meta['og:url']==canonical and p.meta['og:locale']=='en_AU'
 assert p.meta['og:image']==p.meta['twitter:image']
 assert p.meta['og:image:width']=='1200' and p.meta['og:image:height']=='630'
 assert p.meta['og:image:type']=='image/jpeg' and p.meta['og:image:alt']
 assert local_path(p.meta['og:image']).is_file()
 schemas=re.findall(r'<script type="application/ld\+json">(.*?)</script>',source,re.S)
 assert len(schemas)==1,(name,'duplicate schema')
 graph=json.loads(schemas[0])['@graph'];entities={n['@id']:n for n in graph}
 modified[canonical]=entities[canonical+'#webpage']['dateModified']
 business=entities[BASE+'/#business'];contact=entities[BASE+'/#enquiries']
 assert business['telephone']==contact['telephone']=='+61414441773'
 assert business['email']==contact['email']=='djwasabi1@outlook.com'
 assert business['areaServed']['name']=='Sydney'
 assert contact['url']==BASE+'/contact.html#contact'
 def inspect(v):
  if isinstance(v,dict):
   if set(v)=={'@id'}:assert v['@id'] in entities,(name,'unresolved entity',v)
   for child in v.values():inspect(child)
  elif isinstance(v,list):
   for child in v:inspect(child)
 inspect(graph)
 for asset in p.assets:
  file=local_path(asset)
  if file:assert file.is_file(),(name,'missing asset',asset)
 assert not any('/index.html' in x for x in p.links),(name,'duplicate homepage link')
for name,p in parsed.items():
 for href in p.links:
  file=local_path(href)
  if not file:continue
  # A fragment-only URL points to the current page.
  if not urlsplit(href).path:file=ROOT/(name+'.html')
  assert file.is_file(),(name,'broken link',href)
  anchor=urlsplit(href).fragment
  if anchor and file.suffix=='.html':assert anchor in parsed[file.stem].ids,(name,'missing anchor',href)
assert len(set(titles))==len(NAMES) and len(set(descriptions))==len(NAMES)
root=ET.parse(ROOT/'sitemap.xml').getroot();urls=root.findall('{*}url')
assert {u.find('{*}loc').text for u in urls}=={BASE+('/' if n=='index' else '/'+n+'.html') for n in NAMES}
images=0
for url in urls:
 assert url.find('{*}lastmod').text==modified[url.find('{*}loc').text]
 for image in url.findall('{http://www.google.com/schemas/sitemap-image/1.1}image'):
  assert local_path(image.find('{*}loc').text).is_file();images+=1
for name,event in [('weddings','wedding'),('birthdays','birthday'),('corporate','corporate'),('other-events','other')]:
 assert all(('?event='+event+'#contact') in href for href in parsed[name].links if '/contact.html' in href)
 source=(ROOT/(name+'.html')).read_text()
 assert 'data-event="'+event+'"' in source and 'value="'+event+'" selected' in source,(name,'service form context')
article_source=(ROOT/'choosing-your-first-dance-song.html').read_text()
article_graph=json.loads(re.search(r'<script type="application/ld\+json">(.*?)</script>',article_source,re.S)[1])['@graph']
article=next(n for n in article_graph if n['@type']=='Article')
assert article['headline']==re.search(r'<h1[^>]*>(.*?)</h1>',article_source).group(1)
assert article['author']['@id']==BASE+'/#wassim'
assert article['datePublished']=='2026-10-30' and 'datetime="2026-10-30"' in article_source
assert local_path(article['image']).is_file()
assert '/choosing-your-first-dance-song.html' in parsed['weddings'].links
assert '/choosing-your-first-dance-song.html' in parsed['my-story'].links
assert '/contact.html?event=wedding#contact' in parsed['choosing-your-first-dance-song'].links
print(json.dumps({'publicPages':len(NAMES),'sitemapImages':images,'checks':'metadata, entities, canonical URLs, contact consistency, assets, internal links and event-aware quote links','result':'passed'}))
