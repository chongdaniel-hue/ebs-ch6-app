# Handover: EBS Chapter 6 Customer Service app

For the group members carrying on with this project, with ChatGPT (Codex), Claude Code or another AI coding tool. Read this first, then `CLAUDE.md` (the house rules) and `docs/progress.md` (what was built, every decision agreed, what is still open).

AI tools read an instruction file in the repository before they start: Codex and most other agents read `AGENTS.md`, and Claude Code reads `CLAUDE.md`. `AGENTS.md` tells every tool to follow `CLAUDE.md` and repeats the key rules, so whichever tool you use works to the same rules.

## What the app is

A self-study revision app for Secondary 3 and 4 students (G1 and G2) on EBS Chapter 6: Customer Service. Students open it from a link in SLS, log in with their class and register number (no names), and work through five levels:

1. Your Customer Service Stories
2. Learn: Customer Service (notes, the four stages, the Service Recovery Path)
3. Chat with Alex (an AI customer service officer, a Gemini Gem)
4. Serve Suzzie at Stylez (the student serves an AI customer)
5. Check and Exit Ticket

Each level earns a badge. Marked questions give a hint and one more try. At the end there is a learning report. Teachers use **Teacher Mode** (link at the bottom of every page) to add classes, read results by class, download a CSV, clear a student's work, and unlock or reset a device. Work saves on the device and to a Google Sheet, so students can carry on from any device.

It is a plain HTML, CSS and JavaScript app: no framework, no build step.

## Where everything lives

| What | Where | Who can open it |
|---|---|---|
| Code, documents, tests | Private GitHub repository `chongdaniel-hue/ebs-ch6-app`, branch `main` | Collaborators Dan invites |
| Live website | Vercel project imported from that repository (address such as `https://ebs-ch6-app.vercel.app`); every push to `main` publishes it | Anyone with the link; the Vercel dashboard only Dan |
| Student work | A private Google Sheet owned by Dan's account, with **Classes** and **Students** tabs | Dan, plus whoever maintains the Apps Script (Editor) |
| Back end | The Google Apps Script attached to that Sheet (Extensions, then Apps Script), deployed as a web app. Its source is `apps-script/Code.gs` in the repository | Same as the Sheet |
| Teacher code | Only in the Apps Script's **Project Settings, Script Properties** (`TEACHER_CODE`) | Told privately; never written anywhere in the repository |
| Settings | `config.js`: which server (live or local), the web app URL, the two Gem links, and the image map (every picture, its alt text and its placeholder emoji) | In the repository |

What Vercel publishes is only `index.html`, `app.js`, `styles.css`, `config.js` and `assets/` (see `.vercelignore`). The documents, tests, server and Apps Script code are never on the live site.

Key files in the repository:

- `index.html`, `app.js`, `styles.css`, `config.js`, `assets/img/`: the app.
- `apps-script/Code.gs`: the back end (paste into the Apps Script editor).
- `server/server.js`, `server/apps-script-mock.js`: the local test server. It runs the same `Code.gs` with stand-ins for Google, so local behaviour matches live.
- `tests/`: Playwright tests (about 80 checks at laptop and phone width).
- `docs/storyboard.md` (and `.docx`): the single source of truth for every screen and every word students see.
- `docs/progress.md`: decisions that fill gaps in the storyboard (these count as part of the storyboard), how each part works, and the open items.
- `docs/apps-script-setup.md`, `docs/github-setup.md`: setting up the Sheet and Apps Script, and publishing through Vercel.
- `CLAUDE.md`: the house rules for any AI tool (Claude Code reads it automatically).
- `AGENTS.md`: the instruction file Codex and other agents read first; it points to `CLAUDE.md` and repeats the key rules.

## Getting it running on your computer

You need: access to the GitHub repository (see "What you need from Dan"), [Git](https://git-scm.com), [Node.js](https://nodejs.org) (the LTS version) and your AI coding tool. If you only use Codex in the browser, you can skip this section: Codex works on its own copy of the repository (see "Working with ChatGPT (Codex)").

1. Clone the repository:

   ```bash
   git clone https://github.com/chongdaniel-hue/ebs-ch6-app.git
   ```

   Git may open a GitHub sign-in window; sign in with the account Dan invited.

2. Open the folder and install the test tools (once):

   ```bash
   npm install
   ```

   ```bash
   npx playwright install chromium
   ```

3. Set your own commit name and a GitHub no-reply email for this repository (GitHub: Settings, Emails, tick "Keep my email addresses private", copy the `...@users.noreply.github.com` address):

   ```bash
   git config user.name "your-github-username"
   ```

   ```bash
   git config user.email "the-noreply-address"
   ```

4. Start the local server. The **local teacher code** is any word you choose for your own testing; it is not the real code and is only kept for this run.

   On Windows PowerShell:

   ```bash
   $env:TEACHER_CODE = 'my-local-code'; node server/server.js
   ```

   On a Mac or in Git Bash:

   ```bash
   TEACHER_CODE=my-local-code npm start
   ```

   Then open <http://localhost:8787>. Go to Teacher Mode (bottom of the page), key in your local code, add a class, and log in as a student. Stop the server with Ctrl+C.

The local server always uses its own stand-in Sheet (saved in `server/data/`, never committed), even though `config.js` says `SERVER: "live"`. Testing on your computer never touches the real Google Sheet. To start with empty data, stop the server and delete the `server/data` folder.

5. Run all the automated checks (about 4 minutes):

   ```bash
   npx playwright test
   ```

   Screenshots of every screen at 1280px and 360px land in `tests/screenshots/` (not committed). On Windows the Playwright test process very occasionally crashes ("worker process exited unexpectedly"); run it again.

## Working with ChatGPT (Codex)

Codex connects to the GitHub repository and reads `AGENTS.md` before it starts.

- **Pull the latest version before you start, and push small changes often.** On your own computer, run `git pull` before starting each piece of work. In Codex, start each task from the latest `main`. Small, frequent changes avoid two people overwriting each other's work in `app.js`, and they are easier to check and to undo.
- **Give Codex one small change at a time**, and point it to the source, for example: "Read AGENTS.md, CLAUDE.md, docs/storyboard.md section 3.2 and docs/progress.md, then change ... Keep the wording word for word. Run the tests and show me screenshots at 1280px and 360px."
- **Run the tests** before anything is merged or pushed:

  ```bash
  npm install
  ```

  ```bash
  npx playwright test
  ```

  If the Playwright browser is missing (for example in a fresh Codex environment), install it first with `npx playwright install --with-deps chromium`. The tests start their own local server with a made-up teacher code and never touch the real Google Sheet.
- **Pull requests:** Codex often makes its changes on a branch and opens a pull request. Read the changes on GitHub (**Files changed**), check the tests passed and the screenshots look right, then merge into `main`. Vercel publishes `main`.
- **Never give Codex the teacher code** or any password, and never paste student data into it. It does not need them: tests use a made-up code.

## Making a change

1. **Storyboard first.** Agree the change with the group and write it into `docs/storyboard.md` (and the `.docx`), or, for small gaps, into the decisions section of `docs/progress.md`. Student wording is copied exactly from there, so the words must be settled before any code changes.
2. **Get up to date** before you start, so you do not overwrite someone else's work:

   ```bash
   git pull
   ```

   Agree who is working on what; two people changing `app.js` at the same time causes conflicts.
3. **Ask your AI tool.** Open Codex or Claude Code on the project. It reads `AGENTS.md` or `CLAUDE.md` by itself. Tell it what changed and point it to the storyboard section or decision, for example: "Read docs/storyboard.md section 3.2 and docs/progress.md, then change ... Test at both widths and show me the screenshots." Work in small steps and look at each one.
4. **Test.** Run `npx playwright test`, and try it yourself at <http://localhost:8787> on a laptop and at phone width. Your AI tool should do the visual check described in `CLAUDE.md` and report what it checked.
5. **Commit** with a short description of what changed:

   ```bash
   git add -A
   ```

   ```bash
   git commit -m "What changed and why"
   ```

6. **Push.** Vercel publishes the new version within a minute or two:

   ```bash
   git push
   ```

7. **Check the live site**, refreshing the page. If the new version does not appear, see "If a Vercel deployment shows Blocked" below.

## If a Vercel deployment shows "Blocked"

The Vercel project is on Dan's free Hobby account, and the repository is private. Vercel may then refuse to build a commit made by someone other than Dan, and the deployment shows as **Blocked** (your push is safe on GitHub; it just is not on the live site yet).

1. Message Dan with the commit message or a link to the commit.
2. **Dan redeploys it:** in Vercel, open the project, then **Deployments**, find the blocked deployment (or the latest one), click the **⋯** menu and choose **Redeploy**. The live site then shows your change.
3. Do not try to work around it (for example by changing `vercel.json` or the Vercel settings). If it happens every time, the group can decide whether to move the project to a Vercel team.

Adding a picture needs no code change: save it into `assets/img/` with the file name from the storyboard (for example `N04-alex.jpg` or `badge-service-star.png`), commit and push. Until a file is there, the app shows a placeholder box.

## Updating Code.gs on the live script

Change and test `apps-script/Code.gs` locally first: the local server runs that same file, so `npx playwright test` checks it. If you use a Google service or method `Code.gs` has not used before, add it to `server/apps-script-mock.js` too. Then, to put it live **without changing the web app URL**:

1. Open the Google Sheet, then **Extensions**, then **Apps Script**.
2. Select everything in `Code.gs`, delete it, paste the new version from the repository, and save.
3. Click **Deploy**, then **Manage deployments** (not "New deployment", which would create a new URL).
4. Select the web app deployment, click the **pencil icon** (Edit), set **Version** to **New version**, and click **Deploy**.
5. Check: open the web app URL with `?action=classes` on the end in an Incognito window. You should see a line such as `{"ok":true,"classes":[...],"version":"1"}`. Then log in on the live site as a test student.

The URL stays the same, so `config.js` does not change. Ideally Dan, who first deployed the script, does the redeploy; if someone else does it, run the Incognito check afterwards to be sure students can still reach it. Full details: `docs/apps-script-setup.md`.

## House rules

Everything is in `CLAUDE.md`. The ones that matter most:

- The storyboard is the single source of truth. Copy student wording exactly; never "improve" it. Textbook definitions and the 8 service recovery steps stay word for word.
- Never use the ampersand symbol on anything students see. Nothing is pre-selected. Every wrong answer gets its own hint from the storyboard.
- Look and layout: the wine-red theme, works at 360px phone width, tap targets at least 44px, contrast at least 4.5:1, and the Mayer principles for G1 students (icons, cards, definition boxes, short segments). Visual treatment changes how text looks, never what it says.
- Test at 1280px and 360px after every change, and look at every screenshot.
- Never write the teacher code, any password, or student data in the repository, in `config.js`, in a commit or in a chat with Claude.
- Do not add features the storyboard does not ask for; suggest them to the group instead.

## Open items

From `docs/progress.md` (check there for the latest):

1. **Pictures still to make:** N01 landing banner, N02 product knowledge, N03 returns comic, N04 Alex, N05 Suzzie, and the five badges. Prompts are in the storyboard, Section F.
2. **About Stylez card** still shows the storyboard's ⚑ placeholder. Fill it in from the Stylez document so it matches Suzzie's Gem, and check Suzzie's look before making N05.
3. **Level 4 opening line** ("Try: Hi, welcome to Stylez! How may I assist you?"): delete it if Suzzie's Gem starts the chat itself.
4. **Teacher code:** the current code is easy to guess from the app itself. Consider changing it to something that cannot be guessed (Script Properties; it works at once, no redeploy).
5. **Live test:** the Apps Script is deployed and `config.js` points at it. Still to do: import into Vercel, then test together on a phone and a laptop (log in, saving, a second device, offline and back, Teacher Mode results, Clear this student's work, CSV), including a class of students saving at the same time.
6. **The Uniqlo picture (R03)** contains "Return & Exchange Conditions", an ampersand inside a real screenshot.
7. **Segmenting:** some Level 2 parts are still longer than one phone screen, where splitting would break a list or separate a picture from its words.
8. **Storyboard documents:** the "as built" storyboard (`docs/storyboard.md` and `.docx`) now lists the build decisions in Section H. When something changes, update the storyboard (or ask Dan to) as well as `docs/progress.md`.
9. **Privacy:** confirm with the tutor that storing class and register number in a Google Sheet is acceptable.

## What you need from Dan

- **GitHub:** an invitation as a collaborator on `chongdaniel-hue/ebs-ch6-app` (Dan: repository **Settings**, **Collaborators**, **Add people**). Accept the email invitation, then clone.
- **Google Sheet:** most of you need **no access**: read results in Teacher Mode instead. Only the one person who maintains the Apps Script gets **Editor** access to the Sheet (Dan: **Share**, add their Google account as **Editor**), which also lets them open and redeploy the script. Never make the Sheet public or share it with "Anyone with the link".
- **The teacher code:** Dan tells you privately (in person or a direct message). Do not write it in the repository, a document, a commit message or a Claude Code chat. For local testing, use your own made-up code.
- **Vercel:** you do not need Vercel access: pushing to `main` deploys automatically. The project is on Dan's Vercel account, and on the free Hobby plan only that account can use the dashboard. If a deployment shows **Blocked**, Dan redeploys it (see "If a Vercel deployment shows Blocked").
- **ChatGPT (Codex):** connect Codex to GitHub with your own account once Dan has added you as a collaborator; Codex can then see `chongdaniel-hue/ebs-ch6-app`.
