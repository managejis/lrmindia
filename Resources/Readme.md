# LRM India — Resources (agent map)

This folder holds downloadable / viewable **resources** for the LRM India website
(`D:\AI_OpenCode\lrmindia`). Each resource type gets its own sub-folder. This file
is the source of truth for **how resources are structured** so future agents extend
them consistently.

Current tree:

```
Resources/
├─ Readme.md                      <- you are here
└─ Children_Songs/
   └─ Kannada/                    <- built (30 per-song pages + drawer)
      ├─ song-01.html … song-30.html
      │                            each song = its own HTML page
      │                            with a common slide-out index drawer
      └─ assets/
         ├─ songbook.css          <- shared styles (extends ../../../assets/css/main.css)
         ├─ songbook.js           <- shared behaviour (drawer, search, toggle, share, copy)
         └─ songs.js              <- index metadata  (n, slug, titleEn, titleKn) - NOT lyrics

Site entry (kept updated):
  Christian-Sunday-School-Kids-Children-Songs-Kannada.html  <- kept in sync as Song 1,
                                                              data-song-base="Resources/Children_Songs/Kannada/"
```

## 1. Purpose

Render the **Kannada Children / Sunday-School song book** as browsable web pages.
Every song lives on its own page (own URL → own SEO meta + shareable link; `#song-N`
is not used as a single-page fragment) with:

- a **common slide-out index drawer** (side arrow, hover liveness) present on every
  song page — contains the search box + the full 30-song list, links to sibling
  `song-NN.html` pages. The drawer is re-rendered on every page from `assets/songs.js`.
- a language toggle (`English` | `Kannada`) on the song card, `?lang=` persisted.
- hashtag chips + `<meta name="keywords">`, and Share / Copy buttons.

The drawer is the "40% index" reimagined as a fixed slide-out panel so the lyrics
stay readable while the index remains searchable within the same viewport.

## 2. Source data (IMPORTANT — where the lyrics come from)

The lyrics were **not authored here**; they were extracted from the source Word
documents outside the site:

| File | Shape | Language |
|---|---|---|
| `D:\AI_OpenCode\Kannada\Kannada-Songs-Eng-Lyrics.docx` | 30 songs | Kannada written in **Latin/English letters** (transliteration) |
| `D:\AI_OpenCode\Kannada\Kannada-Songs-Kan-Lyrics.docx` | 30 songs | **Kannada script** (Unicode) |

Extraction recipe (DOCX = zip; read `word/document.xml`):

```powershell
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead($docxPath)
$entry = $zip.Entries | ? { $_.FullName -eq 'word/document.xml' }
$sr = New-Object System.IO.StreamReader($entry.Open()); $xml = $sr.ReadToEnd(); $sr.Close()
# paragraphs -> newlines, then strip tags
$txt = ($xml -replace '</w:p>', "`n") -replace '<[^>]+>',''
```

Generator (one call emits songs.js + song-01..song-30.html):
`C:\Users\ManageJi\AppData\Local\Temp\opencode\gen_pages.ps1` — uses the same recipe,
then merges the English DOCX's tail (English blocks 29+30 = Song 29).

## 3. Explicit decisions (info was missing → decision made here)

- **D1 — Index titles (no Kannada index was given).**
  There is no existing Kannada table-of-contents, so the **first line of each song
  from the English (transliteration) book is used as the song title / index entry**.
  The Kannada first line is shown as a secondary line in the index.
  → Applied in `assets/songs.js` (`titleEn`, `titleKn`).
- **D2 — Language toggle shows exactly two options:** `English` and `Kannada`
  (no "choose" label, no dropdown). Default language = **Kannada** (`?lang=kn`).
- **D3 — Per-song static pages** (not a single query-param / hash viewer) so every
  song has its own crawlable URL, unique `<meta>` and a clean share link.
  The current song is marked via `body[data-current-song="N"]` (used to highlight
  the drawer entry) — not via `#song-N` navigation.
- **D4 — Song numbering follows the Kannada source book (1..30).** The English DOCX
  mislabels the tail (two entries tagged "Song - 30"); the Kannada book is canonical.
  English blocks 29+30 are merged as Song 29.
- **D5 — Styles reuse the existing theme.** Pages link `../../../assets/css/main.css`
  directly and only add `assets/songbook.css` on top. Accent `#dc3545`, body copy
  `#4e5d6b`, headings `Ubuntu`, body/nav `Roboto`/`Poppins`.
- **D6 — Domain unknown → no absolute canonical/OG URL is emitted yet.** Only
  title/description/keywords + relative-safe OG/Twitter fields are set. See TODOs.
- **D7 — The site entry at  `Christian-...-Songs-Kannada.html`  is kept in sync as
  Song 1** (same content, `data-song-base="Resources/Children_Songs/Kannada/"`).
  Drawer links there point to `song-NN.html`; on the other song pages (in the
  Resources folder) links are siblings (`song-NN.html`).

## 4. Conventions (must follow when extending)

- **Paths:** every page in `Resources/Children_Songs/Kannada/` lives 3 levels deep,
  so site assets are `../../../assets/...` and site pages are `../../../<Page>.html`.
  Local song assets are `assets/...`.
- **Shared assets:** never fork `songbook.css` / `songbook.js` / `songs.js` per song.
  Any change to drawer/search/language/share/copy/tags goes into those three files.
- **Hashtags** (used both as visible chips AND `<meta name="keywords">`):
  `#christiankannadasong, #kidskannadachristiansong, #vbskannadasong,
  #sundayschoolkannadasong, #kannadasundayschoolsongs, #jesuskannadasongs,
  #kannadaworshipsongs, #kannadapraisesongs, #childrenschristiansongs,
  #kannadabiblesongs`
  (chip markup = `.song-tag`; theme chip recipe in `.doctors .badge`).
- **Header / footer** are copied verbatim from the existing site pages (the site has
  no include system) — keep them identical except for correcting the `../../../` prefix.
- **`main.js` hooks** the shared theme (`#header`, `#navmenu`, `.mobile-nav-toggle`,
  `#preloader`, `#scroll-top`, AOS). Keep those IDs/classes intact.
- **Drawer markup contract** (required on every song page):
  `button#indexToggle`, `.index-backdrop`, `aside#indexDrawer`,
  `input[data-index-search]`, `ol[data-song-index]` — `songbook.js` expects these.
  Body must expose `data-current-song` and `data-song-base`.

## 5. TODOs for the next agent (pending work)

1. **Set a production domain.** Replace the placeholder comment in each song page
   head with real `canonical` + `og:url` + `og:image` absolute URLs, and add a
   `sitemap.xml` + `robots.txt` at the site root.
2. **SEO hardening.** The index list is currently rendered client-side by
   `songbook.js` (Google/Bing do execute JS, but a static list is safer). When
   re-generating, optionally also emit the `<li>` list statically into each song
   page so it is crawlable without JS.
3. **Repeat for the other languages** (English, Tamil, Telugu, Hindi) — reuse the
   exact same `songbook.css` / `songbook.js`; only `songs.js` data + folder differ.
4. **Verify Kannada glyphs** render (Noto Sans Kannada is now loaded; confirm on
   Android / iOS devices).

## 6. Content

All **30 songs** are fully wired as per-song pages with the common index drawer.
Lyrics are embedded statically inside each page for crawlability; `songs.js` carries
only the index metadata (titles/slugs). See `gen_pages.ps1` to regenerate.
