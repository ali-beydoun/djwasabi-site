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

## Search metadata and enquiries
- Keep the shared JSON-LD business ID `https://djwasabi.com.au/#business`, Sydney service area, +61414441773 and djwasabi1@outlook.com consistent. Do not invent a street address, opening hours, prices, ratings or awards.
- Each public page has unique metadata, a canonical HTTPS URL and a static JSON-LD graph. Service pages preserve their event selection on quote links. Keep the main navigation homepage links at `/`.
- Update the page's `dateModified` and sitemap `lastmod` only for meaningful content, structured data or link changes. Sitemap images must exist and belong to their page.
- Social cards in `images/social/` are opaque 1200x630 JPEGs, composed from the approved original DJ portrait on the brand's black background. Keep hero transparency on the website; do not expose transparent artwork as a share card.
- Before release run `python3 scripts/check-seo.py`, check the form's event selection and delivery recovery, and compare public-page layout at phone and desktop widths.
- After publication, notify participating search engines of the changed pages with `python3 scripts/notify-search.py index.html contact.html --submit` (replace the filenames with the actual changed pages). Without `--submit` this only previews the URLs. Google discovery continues through the sitemap and Search Console.
- Analytics intent events contain only event type, page path, contact method and step numbers. Never add visitor names, email addresses, phone numbers or enquiry text. `generate_lead` fires only after the delivery provider confirms success.

## Shared visual hierarchy
- Keep the approved homepage hero dominant. Header and mobile footer logos use a 174px maximum width; the desktop footer logo is capped at 190px with its original aspect ratio.
- Use existing type tokens by role. Mobile service titles scale from 28px to 32px at default text size, section headings are generally 24px, and nested headings remain smaller. Preserve rem-based text enlargement and 16px form inputs.
- The container owns horizontal page insets. Adjacent sections with the same background need a subtle boundary; section labels stay close to their heading. The footer uses the same structure on all nine public pages.
- Keep static content stationary. Reserve motion and visual feedback for interactions, preserve focus visibility on light and dark surfaces, and respect reduced motion.

## Service-page hierarchy
- The four service pages use `page-service` for shared refinements. Heroes introduce the specific offer with three factual highlights, a quote action and a direct detail link. Keep optional MC, ceremony and party extras distinct from standard inclusions.
- Weddings, birthdays and corporate pages put inclusions before the longer benefit or event-type lists. Their `#experience` anchor targets the inclusions heading. Preserve event-aware quote URLs.
- Experience sections pair introductory copy and a supporting photo with inclusions on desktop. Container queries stack the content at narrow widths or enlarged text sizes. Check image framing, 200% text and direct anchor arrival when changing the layout.

## Shared contact surface
- Edit `partials/contact-surface.html`, then run `python3 scripts/render-contact.py`. It renders the same static contact surface into the homepage, contact page, four service pages, My Story and Gallery. Do not edit the generated regions directly. Run `python3 scripts/render-contact.py --check` before publishing to catch drift.
- Call and WhatsApp are prominent paired actions with visible labels and the phone number. Email remains visible alongside the heading. The form starts immediately below. Avoid adding another contact-choice section, repeated contact cards or a marketing hero above the contact page.
- Marketing-page enquiry links target their local `#contact` surface. Service forms carry a static event default; a valid `?event=` parameter overrides it. Existing `/contact.html?event=...#contact` links remain supported. The `#quote` section anchor is retained for older links.
- Preserve 16px inputs and comfortable touch targets. At default text size, verify the contact actions, first form step and Next button within 320x568, 390x520 and 466x500 CSS viewports. Short, wider phone windows place email and phone fields together. Enlarged text, validation messages, later steps and the keyboard may need scrolling; never clip them or shrink text to force a fit.
- Every page hosting the form must allow both configured delivery providers in its content security policy. Verify service context, analytics without personal data, validation and mocked primary/backup recovery on all eight mounts. Do not send live test enquiries unless requested.

## My Story editorial layout
- Introduce Wassim with direct eye contact and a visible microphone, then show his personal approach and a real dance-floor moment. Keep concise first-person copy and existing factual claims.
- Use existing photographs without retouching. The hero uses a 4:3 browser crop at 35% vertical position to retain his face, microphone and hand. Supporting photographs retain their full landscape frames.
- Keep the two editorial sections aligned in rows on desktop and stacked at narrow widths or enlarged text. The complete music range remains in a native disclosure. Preserve the generated shared contact surface.
- The My Story hero prioritises reading and exploring services. Keep Wassim's original conversational voice, a visible sample of his music range, and four service links before the shared contact surface. Service links form two balanced desktop columns and one column on narrow screens.
