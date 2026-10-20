# AGENTS.md: instructions for any AI coding tool

This file is for ChatGPT Codex, Claude Code or any other AI agent working on this repository. Read it first.

**The house rules are in `CLAUDE.md`. Every AI tool must follow them, not only Claude.** Read `CLAUDE.md` in full before changing anything, then `docs/storyboard.md` (including Section H) and `docs/progress.md`. The key rules are copied below so they are not missed, but `CLAUDE.md` is the full version; if the two ever differ, follow `CLAUDE.md` and tell the person you are working with.

## What this is

A self-study revision app for Secondary 3 and 4 students (G1 and G2) on EBS Chapter 6: Customer Service. Plain HTML, CSS and JavaScript (`index.html`, `app.js`, `styles.css`, `config.js`): no framework, no build step, no new dependencies unless the group agrees. The back end is a Google Apps Script web app on a private Google Sheet (`apps-script/Code.gs`). For the full picture of where everything lives, read `docs/HANDOVER.md`.

## Key rules

1. **The storyboard is the single source of truth.** `docs/storyboard.md` (and its Section H, "Changes agreed during the build") decides every screen, every word students see, every hint and every piece of feedback. The decisions in `docs/progress.md` count as part of it. Do not edit the storyboard unless the person you are working with asks you to; ask when something is unclear instead of guessing.
2. **Wording word for word.** Copy student-facing text exactly. Never reword, shorten or "improve" it. Textbook definitions, the 8 service recovery steps, the returns lines and the "If a business provides quality customer service" list stay exactly as written. Visual treatment may change how text looks (icons, cards, bold, capital letters agreed in Section H), never what it says.
3. **No ampersand symbol** anywhere students see or hear it: page text, buttons, alt text, labels. Write "and".
4. **Nothing pre-selected:** dropdowns, True/False buttons, answer options and confidence faces start empty. Every wrong answer gets its own hint from the storyboard, never a generic message.
5. **Visual and Mayer checks after every change.** Test at 1280px and 360px wide, then open every new screenshot and check: alignment and equal card heights in rows, the same element looks the same everywhere, spacing (about 40 to 48px between blocks, 12 to 16px inside), images never cut off or stretched, contrast at least 4.5:1, tap targets at least 44px, nothing sticking out sideways, and a page that looks inviting to a 15-year-old. Apply Mayer's principles for G1 students: icons and pictures beside the words they explain, definition boxes, icon cards for lists, short segments before each Continue ↓, feedback right under its question. Report what you checked, not only test results.
6. **Never commit secrets.** Never write the teacher code, any password, token, API key or student data into any file, commit message, test, log or chat. The teacher code lives only in the Apps Script's Script Properties. For local testing use a made-up code in the `TEACHER_CODE` environment variable. Never commit `.env*` files or `server/data/`. Commit under a GitHub no-reply email, never a personal one.
7. **Only the app is published.** Vercel publishes only `index.html`, `app.js`, `styles.css`, `config.js`, `vercel.json` and `assets/` (see `.vercelignore`, which is a whitelist). Everything else (docs, tests, server, Apps Script code, these instruction files) must never be served. If something new must be published, add it to `.vercelignore` on purpose and say so.
8. **Do not add features** the storyboard does not ask for (timers, sounds, extra inputs, animations, badges). Suggest them instead.

## Working on the repository

- **Pull the latest version before you start**, and **push small changes often**. Do not rewrite history (no force-push, no `git reset --hard` or `git checkout --` on files you did not just change); other people's work may be in them.
- One change at a time: make it, test it, commit it with a clear message, push it. Every push to `main` is published by Vercel within a minute or two.
- If you change `apps-script/Code.gs`, keep it plain JavaScript that Apps Script accepts (no `?.` or `??`), and if it uses a Google service method it has not used before, add a stand-in for it in `server/apps-script-mock.js`. The live script must then be redeployed by hand ("Manage deployments", "New version"; steps in `docs/apps-script-setup.md`), which keeps the same URL.
- Keep `APP_VERSION` in `app.js` up to date (it shows in the footer), and record any new decision in the decisions section of `docs/progress.md`.

## Running and testing

```bash
npm install
npx playwright install chromium
npx playwright test
```

The tests (about 80 checks at laptop and phone width) start their own local server with a throwaway teacher code; they never touch the real Google Sheet. In a fresh cloud or Linux environment, `npx playwright install --with-deps chromium` installs the browser's system libraries too.

To try the app by hand, start the local server with any made-up teacher code and open <http://localhost:8787>:

```bash
TEACHER_CODE=my-local-code npm start
```

(On Windows PowerShell: `$env:TEACHER_CODE = 'my-local-code'; node server/server.js`.) The local server always uses its own stand-in Sheet in `server/data/`, even though `config.js` says `SERVER: "live"`.
