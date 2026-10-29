"""Notify IndexNow of specific, already published canonical pages. No credentials needed."""
import argparse,json,urllib.request,xml.etree.ElementTree as ET
from pathlib import Path
root=Path(__file__).resolve().parent.parent
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('pages',nargs='+',help='Changed public HTML files, for example index.html contact.html')
parser.add_argument('--submit',action='store_true',help='Send only after the changes are live; otherwise print a preview')
args=parser.parse_args()
base='https://djwasabi.com.au'
known={node.text for node in ET.parse(root/'sitemap.xml').findall('{*}url/{*}loc')}
urls=list(dict.fromkeys(base+('/' if name=='index.html' else '/'+name) for name in args.pages))
if not set(urls)<=known: parser.error('Only canonical public pages listed in sitemap.xml can be submitted.')
key=(root/'indexnow-key.txt').read_text().strip()
payload={'host':'djwasabi.com.au','key':key,'keyLocation':base+'/indexnow-key.txt','urlList':urls}
if not args.submit:
 print(json.dumps({'dryRun':True,'urls':urls},indent=2))
else:
 with urllib.request.urlopen(payload['keyLocation'],timeout=30) as response:
  if response.read().decode().strip()!=key: raise RuntimeError('The published verification file does not match. Deploy first.')
 request=urllib.request.Request('https://api.indexnow.org/indexnow',data=json.dumps(payload).encode(),headers={'Content-Type':'application/json; charset=utf-8'})
 with urllib.request.urlopen(request,timeout=30) as response:
  print(json.dumps({'status':response.status,'submitted':urls,'note':'Accepted for processing, not a guarantee of indexing or ranking.'},indent=2))
