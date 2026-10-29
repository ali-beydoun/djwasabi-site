"""Render the shared contact surface into static pages; --check detects drift."""
from pathlib import Path
import argparse
import re

ROOT = Path(__file__).resolve().parent.parent
PAGES = {
    'index': '', 'contact': '', 'weddings': 'wedding', 'birthdays': 'birthday',
    'corporate': 'corporate', 'other-events': 'other', 'my-story': '', 'gallery': '',
}
MARKER = re.compile(r'    <!-- CONTACT_SURFACE:START -->.*?    <!-- CONTACT_SURFACE:END -->', re.S)

def render(name, event):
    surface = (ROOT / 'partials/contact-surface.html').read_text().rstrip()
    for key, value in {'heading': 'h1' if name == 'contact' else 'h2', 'event': event, 'source': name}.items():
        surface = surface.replace('{{' + key + '}}', value)
    if event:
        surface = surface.replace('value="" disabled selected', 'value="" disabled')
        surface = surface.replace(f'value="{event}">', f'value="{event}" selected>')
        surface = surface.replace('id="eventContext" value=""', f'id="eventContext" value="{event}"')
    assert '{{' not in surface
    return '    <!-- CONTACT_SURFACE:START -->\n' + surface + '\n    <!-- CONTACT_SURFACE:END -->'

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    stale = []
    for name, event in PAGES.items():
        path = ROOT / (name + '.html')
        source = path.read_text()
        updated, count = MARKER.subn(lambda _: render(name, event), source)
        assert count == 1, f'{name}: expected one contact mount'
        if args.check and source != updated:
            stale.append(name)
        elif not args.check:
            path.write_text(updated)
    if stale:
        raise SystemExit('Contact surfaces need rendering: ' + ', '.join(stale))
    print(f'{len(PAGES)} shared contact surfaces ' + ('verified' if args.check else 'rendered'))

if __name__ == '__main__':
    main()
