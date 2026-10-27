# CLAUDE.md: EBS Chapter 6 Customer Service app

House rules for every Claude Code session in this repo. Read this file and `docs/storyboard.md` before changing anything.

## What this app is

A self-study revision app for Secondary 3 and 4 students (G1 and G2, mixed ability) taking Elements of Business Skills (EBS, syllabus 7078), Chapter 6: Customer Service. Students open it from a link in SLS (not embedded). It is used by any school, so nothing in it names a particular school.

It is a fork of the group's EBS Learning Journey app (V45): the same vanilla JavaScript single-page app (`index.html`, `app.js`, `styles.css`), hash router, station structure, autosave and offline queue. Keep that front-end architecture. Do not add a framework, a build step or new dependencies unless the user agrees.

Hosting and back end (different from V45, which ran its own back end on Vercel):
- **Code:** a **private** GitHub repository, `chongdaniel-hue/ebs-ch6-app`, branch `main`.
- **Front end:** **Vercel** publishes the static app files only, with no build step: `.vercelignore` ignores everything and lets back in only `index.html`, `app.js`, `styles.css`, `config.js`, `assets/` and `vercel.json`, so docs, tests, the server and the Apps Script code are never uploaded. `vercel.json` turns off framework detection, install and build. Every push to `main` redeploys. Keep `.vercelignore` a whitelist: anything new that must be served has to be added there on purpose. Steps in `docs/github-setup.md`.
- **Back end:** a **Google Apps Script web app** attached to a **Google Sheet**. The script's source lives in this repo at `apps-script/Code.gs` (pasted into the Apps Script editor; setup and redeploy steps in `docs/apps-script-setup.md`). The web app URL goes in `config.js` with `SERVER: "live"`.
- **Local testing:** `server/server.js` serves the same files Vercel publishes and runs `apps-script/Code.gs` itself with stand-ins for the Google services (same actions, same request and response shapes), storing data in `server/data/`, so everything can be tested with Playwright without Google. When it serves `config.js` it switches `SERVER` to `"local"`, so local testing never touches the real Sheet.
- Vercel serves static files only: no serverless functions, no `api/` folder, no `@vercel/blob`.

## Source of truth

- **Out of date since 27 October 2026.** `docs/storyboard.md` has not caught up with the group's recent changes. The current app and `docs/progress.md` are the reference until this storyboard is refreshed. Do not revert app changes to match the storyboard; record every change in `docs/progress.md`.
- `docs/storyboard.md` is the single source of truth for every screen, every word students see, every hint and every piece of feedback. `docs/storyboard.docx` is the same document for the teachers; if the two ever differ, ask.
- Copy student-facing wording exactly from the storyboard. Do not reword, shorten, "improve" or add to it. Textbook definitions, the 8 service recovery steps, the returns lines and the "If a business provides quality customer service" list are word for word from the textbook and must stay exactly as written.
- Rows marked "Teacher only" in the storyboard are notes for you. Never show them on student screens.
- Text marked ⚑ in the storyboard is a placeholder or still open. Build it as a clearly marked placeholder (for example the About Stylez card) and do not invent content for it.
- If the build and the storyboard disagree, the storyboard wins. If the user asks for something different from the storyboard, check whether they want the storyboard updated too, then make the change.

## Writing rules for anything students see

- Never use the ampersand symbol. Write "and". This includes button labels, alt text and code comments that end up on screen.
- No teacher-only text, lesson-plan phase labels or "Your mission" labels on student screens.
- Every interaction has a one-line instruction. At most about 60 words of instruction before an interaction.
- Nothing is pre-selected: dropdowns, True/False buttons, MCQ options and confidence faces start empty. Only restore the student's own saved answers, never defaults or correct answers.
- Wrong-answer hints are the ones in the storyboard, specific to each question. Never replace them with a generic message.

## Look and layout

- Light, minimal, high-contrast theme on an off-white background. System sans-serif font stack (as in V45). No monospace or quirky number fonts.
- Colours (CSS variables in `styles.css`), a wine-red theme: `--brand #8B1E3F` (header, primary buttons, current tab; white text on it is 8.9:1), `--brand-dark #5C1229` (headings, hover), `--brand-light #F9ECEF` (small accents only: chips, selected states, current tab tint), page background `#FAF7F5` (warm off-white), cards white `#FFFFFF` with a thin `#E8DADF` border, text `#1F2937`, right `#15803D` on `#EAFBEF`, wrong `#B91C1C` on `#FDECEC`.
- Because the brand colour and the wrong-answer red are close, never rely on colour to show right or wrong: every feedback box has a ✓ or ✗ and a 4px coloured left border, and cards and notes never use the wrong-answer pink as a background. Stage colours (blue `#2563EB`, orange `#EA580C`, green `#16A34A`, purple `#7C3AED`) appear only in the notes (stage table, Service Recovery Path), never in questions where they would give answers away.
- Sticky top bar and sticky step tabs. Locked stations and tabs show 🔒, look clearly locked and cannot be opened.
- Guided progression: stations unlock in order; tabs inside a station unlock in order once the current tab has been read to the end (every Continue opened). Teacher Mode can unlock everything on a device.
- "Continue ↓" reveals the next part below on the same page. "Next →" moves to the next tab. Never label the two the same.
- One filled primary button per group; others outlined; at least 12px apart. Tap targets at least 44px. About 40 to 48px between separate blocks, 12 to 16px inside a block.
- Must work at 360px phone width, on Chromebooks and on laptops. Nothing sticks out sideways. Hints and tips open on tap or click, never on hover only.

## Accessibility and Mayer's multimedia principles

- Allow zoom: the viewport meta must not contain `maximum-scale` or `user-scalable=no`.
- Every image has the alt text given in the storyboard (comic alt text includes the speech bubbles).
- Text contrast at least 4.5:1. Respect `prefers-reduced-motion` (turn off slide-ins).
- Pictures sit directly under the text they explain; feedback sits directly under its question. No decorative images, guide characters or extra content beyond the storyboard.
- Text that students must read (such as the 8 service recovery steps) is real text in the page, not baked into an image.

## Images

- All images live in `assets/img/` and are listed in one image map in `config.js` (id, file, alt text, placeholder emoji).
- Keep images small so pages load quickly: badges about 256px wide, icons about 160px, example and single-panel comic pictures about 900px; multi-panel comic strips may be up to 1600px wide, compressed under about 300 KB, so the speech bubbles stay readable when enlarged. Compress everything, and keep transparency only where the file has some (otherwise use JPEG). Never draw an image wider than its file. Delete image files nothing references (check `config.js`, `app.js`, `styles.css` and `index.html` first).
- If an image file is missing or fails to load, show a placeholder box instead: a rounded light wine-tinted box (`#F9ECEF`) with a dashed `#C9A0AE` border, the emoji large in the middle and the short description underneath. The teachers add real files later just by dropping them into `assets/img/` with the file names in the storyboard, with no code change.

## Data and privacy

- Students log in with their class, register number and name (agreed by the group). No emails.
- Student work is stored only in the Google Sheet, which stays private to its owner (never shared or published). The browser reads and writes it only through the Apps Script web app.
- The teacher code lives only in the Apps Script project's Script Properties (`TEACHER_CODE`) and is checked inside the script. Never write a code, secret or student data into the repo, `config.js`, `app.js`, `Code.gs` or logs.
- The GitHub repo is private, but still never commit a code, secret or student data: collaborators can read everything, and history is hard to clean. `server/data/` is in `.gitignore`. Commit under a GitHub no-reply email, never a personal one.
- Never print, copy or commit `.env.local` or any `.env*` file.

## How to work

- Ask questions before coding when something in the storyboard is unclear. Do not guess.
- Build in small slices and stop for review after each one (see the build prompt for the order).
- Do not add features the storyboard does not ask for (timers, extra inputs, sounds, animations, extra badges). Suggest them to the user instead.
- After each slice, test at 1280px and 360px wide (Playwright is available) and check: wording matches the storyboard, nothing pre-selected, locks work, saving and reloading restores work, no ampersand on any student screen, no console errors.
- Every check is also a **visual check**. Open every new screenshot and look at it as a designer would, then fix anything that fails before reporting:
  - Alignment: items side by side line up (same top edge for inputs, same heights for cards in a row, labels and boxes on a shared baseline). Nothing looks ragged or randomly sized.
  - Consistency: the same kind of element looks the same everywhere (cards, tips, definition boxes, buttons, images, captions).
  - Spacing: the 40 to 48px and 12 to 16px rhythm is kept; nothing touches, nothing floats too far away.
  - Images: never clipped or cut off, never stretched, sensible size, and images placed side by side are the same height.
  - Visual appeal: the page looks inviting to a 15-year-old, not like a form or a wall of text.
  Report what you checked and fixed visually, not only the test results.

## Designing for G1 students (Mayer's multimedia principles)

The app is for G1 students, many with lower literacy, who rely on visual and multimedia support. Apply Mayer's principles on every screen:
- **Multimedia:** words and pictures together. Every section of notes gets a visual anchor: a comic, a diagram, or an icon beside each key point. A list of more than three items becomes icon cards or icon chips, not a plain bullet list.
- **Signaling:** textbook definitions sit in a clearly styled "definition" box; key words are bold; headings carry an icon; numbered steps look like steps.
- **Spatial contiguity:** each picture, icon or example sits right next to the words it explains; feedback sits right under its question.
- **Coherence:** icons and pictures must explain something (no decoration for its own sake), and wording stays exactly as in the storyboard. Visual treatment changes how text looks, never what it says.
- **Segmenting:** no more than about one screen of reading before the next Continue ↓.
- **Pre-training, personalization and image principles:** as in the storyboard (key terms first; a friendly "you" tone; no talking-head guide characters).
- Use emoji as icons (they need no image files and work on every device), at a consistent size, with hidden text for screen readers where the emoji carries meaning.
- Keep `APP_VERSION` in `app.js` up to date and shown in the footer.
- When this session's context runs low, update `docs/progress.md` (what is built, what is next, open questions) so a fresh session can carry on.
