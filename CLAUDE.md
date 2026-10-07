# CLAUDE.md: DJ Wasabi Site

## Project
Static HTML/CSS website for DJ Wasabi (Sydney-based DJ/MC service). No build tools or frameworks: plain HTML, CSS, and vanilla JS.

## Structure
- HTML pages in root: `index.html`, `contact.html`, `weddings.html`, `birthdays.html`, `corporate.html`, `other-events.html`, `my-story.html`, `gallery.html`, `privacy-policy.html`
- Stylesheets: `css/style.css` (main + tokens), `css/services.css`, `css/gallery.css`, `css/refinements.css` (shared public-page refinements, loaded last)
- Design tokens defined in `:root` in `css/style.css`: spacing, radius, color, typography

## Do Not Touch
- `instagram-story-redesign-v1.html`, `instagram-story-redesign-v1-alt.html`, `instagram-post-v1-alt.html`: self-contained templates that load their own Poppins font

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
- Claude Code's processes are external: VS Code won't detect their ports
- Python `http.server` causes download prompts; use `npx http-server` instead
- Port 8080 will appear in VS Code's Ports tab; click the globe icon to open

## Public-Page Design and Gallery
- Preserve the original transparent WebP used for the homepage portrait with its signature green graphic. Keep its transparency intact. Professional photos can support the homepage story section and suitable heroes on other pages.
- Keep the established black, white and lime identity, existing system font stack and design tokens. Use shared content widths, aligned text, restrained decoration and proportionate images.
- `css/refinements.css` is the shared final layer for the nine public pages. The Instagram templates do not load it.
- The homepage gallery preview shows six photographs on desktop and four on mobile, linking to the complete gallery.
- `gallery.html` contains ordinary full-image links enhanced by `js/gallery.js`: category filters, native modal viewing, previous/next controls, arrow keys, swipe and focus restoration. Photos remain accessible as links without JavaScript.
- Gallery thumbnails use responsive WebP variants at 320, 640 and 960 pixels wide, capped at the source width. Full photographs preserve their framing and are capped at 1800 pixels on the long edge. Keep width/height, srcset, factual alt text, captions and ImageGallery metadata in sync.
- Thumbnail ratios in `css/gallery.css` reserve the correct space and keep gallery rows aligned. Cropped thumbnails must retain the subject; the full-image link should show the complete photograph.
- FAQs, service options and complete reviews use native details/summary elements to keep pages easy to scan while retaining their content in HTML.
- When changing shared navigation behaviour or gallery styles, update their versioned asset URLs across the public pages so cached files do not conflict with new markup.
- Before publishing, check all public pages at narrow phone, phone, tablet and desktop sizes. Verify navigation, gallery filtering and viewing, keyboard focus, disclosure controls and enquiry steps. Use local preview data and stop before submitting an enquiry.
