# CLAUDE.md — DJ Wasabi Site

## Project
Static HTML/CSS website for DJ Wasabi (Sydney-based DJ/MC service). No build tools or frameworks — plain HTML, CSS, and vanilla JS.

## Structure
- HTML pages in root: `index.html`, `contact.html`, `weddings.html`, `birthdays.html`, `corporate.html`, `other-events.html`, `my-story.html`, `gallery.html`, `privacy-policy.html`
- Stylesheets: `css/style.css` (main + tokens), `css/services.css`, `css/gallery.css`
- Design tokens defined in `:root` in `css/style.css` — spacing, radius, color, typography

## Do Not Touch
- `instagram-story-redesign-v1.html`, `instagram-story-redesign-v1-alt.html`, `instagram-post-v1-alt.html` — self-contained templates that load their own Poppins font

## Design Tokens
All new styles should use existing tokens:
- **Spacing**: `--space-2` (8px) through `--space-10` (80px)
- **Radius**: `--radius-sm` / `--radius-md` / `--radius-lg` / `--radius-full`
- **Colors**: `--color-surface`, `--color-accent`, `--color-text-primary`, `--color-text-secondary`, etc.
- **Font sizes**: `--font-size-display` down to `--font-size-caption2` (Apple HIG scale)
- **Font weights**: `--font-weight-regular` (400) through `--font-weight-heavy` (800)
- **Line heights**: `--line-height-tight` through `--line-height-loose`
- **Tracking**: `--tracking-tight` through `--tracking-caps`

## Local Preview (Codespaces)
- Run `npx http-server . -p 8080` **from the VS Code terminal** (not Claude Code)
- Claude Code's processes are external — VS Code won't detect their ports
- Python `http.server` causes download prompts; use `npx http-server` instead
- Port 8080 will appear in VS Code's Ports tab; click the globe icon to open
