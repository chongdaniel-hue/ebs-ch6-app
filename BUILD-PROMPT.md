# Build prompt for Claude Code

Paste everything below the line into Claude Code, opened in the new project folder (the copy of V45 with this handoff pack added).

---

We are building a self-study revision app for EBS Chapter 6: Customer Service, for Secondary 3 and 4 students. It is a fork of our EBS Learning Journey app (V45), which is the code in this folder. The plan is finished and approved.

**Read these first, in full, before doing anything else:**
1. `CLAUDE.md`: house rules for this repo. Follow them in every step.
2. `docs/storyboard.md`: the screen-by-screen storyboard. It is the single source of truth for every screen and every word students see. Copy wording exactly.
3. The existing V45 code: `index.html`, `app.js`, `styles.css`, `api/submit.js`, `api/teacher/results.js`, `api/_codes.js`, `server/server.js`, `package.json`, `.gitignore`, `.vercelignore` and `DEPLOY.bat`. Note that V45 used Vercel; this app will not (see "Hosting and back end" below). Learn how it works: the hash router and `render()`, `STATION_CONFIG`, step dots, `findIncomplete` and `installSubmitGuard` (the "Not finished yet" pop-up), `renderReteachStep` (the 💡 recap), badges, autosave to localStorage, the offline queue (`flushQueue` and the yellow offline bar), the student report, Teacher Access and Reset.

**Then, before writing any code, reply with:**
- a short summary of how you will map the storyboard onto the V45 code (what you will keep, change, remove and add);
- your proposed design for the Google Apps Script back end and the Google Sheet (see "Hosting and back end" below);
- every question you have about the storyboard. Wait for my answers.

## What to keep from V45

The app shell and patterns: one-page vanilla JavaScript app, hash routes, station pages with sticky step tabs, the submit guard and "Not finished yet" pop-up, the 💡 recap, badge pop-ups and badge shelf, the learning report, autosave on the device, the offline queue and yellow offline bar, the Teacher Access code gate (renamed Teacher Mode), Reset, the CSV download, and `server/server.js` (reworked as the local stand-in for the Apps Script API).

## What to remove completely

Remove these from the code, the assets and the docs, so none of it ships:
- Everything specific to the Learning Journey: VivoCity, the venue briefing, Orchid Park Secondary School (`SCHOOL_NAME`), the school crest (IMG22), the anime-style team picture (IMG32), guide characters (IMG28, IMG29), all station images, all files in `assets/logos/` and the LJ images in `assets/img/` (keep only the new Chapter 6 files listed in the storyboard).
- Photo tasks, the foot-traffic timer, VivoCity unit links, the Help button (`WHATSAPP_NUMBER`, `HELP_DEFAULT_PHONE`), the "Email our teachers" page (`TEACHER_EMAILS`), the post-survey (`SURVEY_FORM_URL`), team login, team access codes, team IDs and team badges.
- All student and team data in `api/_codes.js` (names, team lists, codes). Delete the hard-coded `TEACHER_CODE`; it becomes an environment variable.
- `AUDIT-REPORT.md`, `AUDIT-REPORT (V33).md`, `IMAGE-LIST.md`, `GEMINI-PROMPTS.md` and `GEMINI-PROMPTS.docx`.
- Everything Vercel: the `.vercel/` folder (it links to the LJ's Vercel project), `.vercelignore`, `DEPLOY.bat`, the `api/` folder and the `@vercel/blob` dependency (remove `package.json` if nothing else needs it). Do not open, print or copy `.env.local`; delete it.
- `assets/js/qrcode.js` if nothing in the new app uses it.
- `maximum-scale=1.0` in the viewport meta (zoom must be allowed).

Then search the whole repo for "VivoCity", "Orchid", "OPSS", "NIE26", "Sean", "WhatsApp", "survey", "team", "photo", "vercel" and "blob", and show me what is left.

## What to build (all detail is in the storyboard)

- **Landing and login (0.1 to 0.4):** no crest; class dropdown (classes come from the server) plus a typed register number (1 to 50); the "Before you start" pop-up; the home page with the route of five station cards (unlocking in order), progress bar, badge shelf, "🔄 Sharing this device? Switch student" link and learning report button; the "4 key terms" page.
- **Stations 1 to 5** with their step tabs, Continue ↓ parts and Next → buttons exactly as in the storyboard, including the **Service Recovery Path** in Station 2, Tab 3: an interactive vertical path of 8 stops built in HTML and CSS (not an image), with numbered icon circles, the textbook wording, the staff member's speech bubble, the customer mood face, and a "Show Step N ↓" button that reveals one stop at a time.
- **Feedback for marked questions (Station 3 Q2, Station 5 Q3 and Q4):** Submit records the first attempt (never overwritten). Each wrong answer then shows its own hint from the storyboard and can be changed once, with "Check again". If it is still wrong, show the right answer with its reason. Correct answers show their own message. Open-text questions are required but not marked, and show the recap text from the storyboard after Submit.
- **Badges:** five station badges, shown as an emoji in a placeholder box until the PNG files are added (`assets/img/badge-*.png`, names in the storyboard).
- **Learning report (6.1)** including first-try scores and "Look at these again".
- **Teacher Mode (T.1 to T.4):** code gate; Classes tab (add and remove class names); Results tab by class (summary, students table, each student's full report, CSV download, "Clear this student's work"); This device tab (unlock all stations, reset this device).
- **Images:** one image map in a new `config.js`. Existing files C01 to C04 and R01 to R03 are in `assets/img/`. N01 to N05 and the badges do not exist yet, so they show the placeholder box described in `CLAUDE.md`, and appear automatically once the files are added.
- **Links in `config.js`:** Alex's Gem `https://gemini.google.com/gem/03f888f88087`; Suzzie's Gem `https://gemini.google.com/gem/1lfkE4kuic0cBsFwXlTNjKbOaGi6r0tK_?usp=sharing`. Both open in a new tab.
- **About Stylez card (Station 4):** build it with the placeholder text from the storyboard, visibly marked as a placeholder. We will fill it in later.
- **Credits footer:** "A team effort by Anthony, Daniel, Joshua and Jufinnie (NIE 2026)" and the version number. No picture.
- **Colours and layout:** as in `CLAUDE.md` (wine red in place of V45's teal).

## Hosting and back end

The app is hosted on **GitHub Pages**, and the server is a **Google Apps Script web app attached to a Google Sheet**. No Vercel. Propose the exact design before coding; it must meet these requirements.

**Google Sheet and Apps Script**
- Write the script in `apps-script/Code.gs`, plus `apps-script/appsscript.json` if needed. Write `docs/apps-script-setup.md`: plain step-by-step instructions for a teacher with no coding background, covering:
  - creating the Sheet and opening Extensions → Apps Script;
  - pasting the code and setting the teacher code in Script Properties;
  - deploying as a web app ("Execute as: Me", "Who has access: Anyone");
  - copying the web app URL into `config.js`;
  - redeploying after a code change, keeping the same URL.
- **Sheet tabs:**
  - **Classes:** class name and order.
  - **Students:** one row per student. Readable columns (class, register number, stations finished, first-try scores, confidence ratings, last saved, cleared at) plus one column holding the full progress record as JSON.
  - Add more tabs only if you explain why.
- **One web app URL handles every request.** Reads use GET with an `action` parameter. Writes use POST with a `text/plain` body containing JSON, so the browser does not send a CORS preflight. Responses are JSON.
- **Actions:**
  - list classes (anyone);
  - add a class and remove a class (teacher code, validation as in storyboard T.2);
  - load progress and save progress (class plus register number);
  - teacher results for one class (teacher code);
  - clear one student's work (teacher code).
- **Rules the script enforces:**
  - Reject a class not in the Classes tab, a register number outside 1 to 50 and records over a size limit (stay well under Google Sheets' 50,000-character cell limit).
  - The newer copy wins, except that first attempts can never be overwritten once recorded.
  - Clearing a student's work records a cleared-at time, so an older copy on a device is discarded when it next connects.
  - Use `LockService` around writes so two saves at once cannot clash.
- **Teacher code:** read from Script Properties (`TEACHER_CODE`) and compared inside the script. Never put it in the repo or send it back to the browser.
- **Quotas:** Apps Script limits how many requests run at once. A class of 40 working together must not overload it.
  - The app saves on every Continue, Next, Submit and tab change, and while typing at most every 30 seconds, and only if something changed.
  - A failed save goes into the existing offline queue and is retried with increasing waits.
  - Tell me if you think the timings should change.

**GitHub Pages**
- Add a GitHub Actions workflow (`.github/workflows/pages.yml`) that publishes only the app files (`index.html`, `app.js`, `styles.css`, `config.js`, `assets/`) to GitHub Pages on every push to `main`. Use relative paths throughout so the app works under `https://<username>.github.io/<repo-name>/`.
- Update `.gitignore` for `server/data/`, `.env*` and `node_modules/`.
- Write `docs/github-setup.md`: plain steps for creating the repo, pushing, and turning on Pages with "GitHub Actions" as the source.

**Local testing**
- Rework `server/server.js` so it serves the app and imitates every Apps Script action with the same request and response shapes, storing data in `server/data/` and reading the teacher code from a local environment variable. Playwright tests run against this.
- `config.js` has one clearly labelled setting to switch between the local server and the live web app URL. Leave the live URL as a placeholder until we deploy.

## Build order: stop after each slice for my review

1. **Clean-up and shell:** removals above, wine-red theme, header, footer, `config.js`, image map with placeholder boxes, viewport fix. Show me the search results for leftover LJ items.
2. **Back end and login:** `Code.gs`, the local stand-in in `server/server.js`, the setup guides, Teacher Mode sign-in and Classes tab, landing page, "Before you start", home page, "4 key terms", "Switch student", saving and loading progress, offline behaviour.
3. **Station 1 and Station 2** (including the Service Recovery Path), with locks, tabs, Continue and Next, and the Station 1 and 2 badges.
4. **Stations 3, 4 and 5**, including the hint, retry and reveal feedback, and the exit ticket.
5. **Learning report and the rest of Teacher Mode:** Results tab, student report, CSV, Clear this student's work, This device tab.
6. **Full check** (below), the GitHub Pages workflow, then a short list of what you changed and anything still open.

## Checks for every slice

- Test with Playwright at 1280px and 360px wide, with screenshots of each new screen.
- Compare every student-facing line with the storyboard; list any differences.
- Confirm nothing is pre-selected, locked items cannot be opened, Continue and Next behave as described, and reloading the page (and logging in on a second browser profile) restores the student's work.
- Search all student-facing text for the ampersand symbol; there must be none.
- No console errors. No secrets or student data in the repo.

Do not create the GitHub repo, push or deploy the Apps Script. Once everything has been reviewed, I will set up the Google Sheet, the Apps Script and the GitHub repo by following your setup guides, and you can then help me test the live version.
