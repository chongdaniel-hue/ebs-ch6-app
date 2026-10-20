# Publishing the app: private GitHub repository and Vercel

This guide is for teachers. The project lives in a **private** GitHub repository, and **Vercel** publishes the app at a web address you can share in SLS, for example `https://ebs-ch6-app.vercel.app`. The back end stays the Google Apps Script and Google Sheet (`docs/apps-script-setup.md`): Vercel only serves the app's files. Allow about 15 minutes the first time.

## What gets published

The project folder holds the app, the documents, the tests and the Apps Script code. Vercel uploads **only the app**: `index.html`, `app.js`, `styles.css`, `config.js` and the `assets` folder. Two small files make sure of that:

- `.vercelignore` tells Vercel to ignore everything except those app files (and `vercel.json`), so the docs, storyboard, tests, server and Apps Script code are never uploaded and can never be reached on the live site.
- `vercel.json` tells Vercel there is nothing to install or build: it serves the files as they are.

The repository is private, so only people you invite can read the project on GitHub. Even so, never add a file with a code, a password or student data to it: the teacher code lives only in the Apps Script settings, and student work lives only in your private Google Sheet.

## Step 1: Check config.js

`config.js` must say `SERVER: "live"` with your web app URL in `LIVE_URL` (Step 7 of `docs/apps-script-setup.md`). This is already done.

## Step 2: The private repository on GitHub

1. Sign in at <https://github.com>.
2. Click the **+** at the top right and choose **New repository**.
3. **Repository name:** `ebs-ch6-app`. Choose **Private**. Leave "Add a README", ".gitignore" and "license" unticked.
4. Click **Create repository**.

The project is then uploaded ("pushed") to it. In a terminal in the project folder:

```bash
git remote add origin https://github.com/chongdaniel-hue/ebs-ch6-app.git
```

```bash
git push -u origin main
```

If a GitHub sign-in window appears, sign in and allow access. Later changes are pushed with `git push`.

## Step 3: Import the repository into Vercel

1. Go to <https://vercel.com> and sign in with **Continue with GitHub** (use the same GitHub account).
2. Click **Add New…** then **Project**.
3. Under **Import Git Repository**, find `ebs-ch6-app`. If it is not listed, click **Adjust GitHub App Permissions** (or **Configure GitHub App**), choose your account, allow Vercel to see `ebs-ch6-app` (or all repositories), save, and come back.
4. Click **Import** next to `ebs-ch6-app`.
5. On the **Configure Project** page:
   - **Project Name:** `ebs-ch6-app` (this becomes the web address `ebs-ch6-app.vercel.app`, if the name is free).
   - **Framework Preset:** **Other**.
   - **Root Directory:** leave as `./`.
   - Open **Build and Output Settings**: leave **Build Command**, **Output Directory** and **Install Command** empty (do not switch on the overrides). The project's `vercel.json` already says there is nothing to build or install.
   - **Environment Variables:** none. Do **not** add the teacher code here; it belongs only in the Apps Script settings.
6. Click **Deploy** and wait for "Congratulations" (usually under a minute).
7. Click **Continue to Dashboard**. Under **Domains** you will see the web address, for example `https://ebs-ch6-app.vercel.app`.

From now on, every `git push` to `main` publishes a new version automatically.

## Step 4: Check only the app is published

Open these addresses (use your own web address in place of `https://ebs-ch6-app.vercel.app`). The first should open the app; the others should all show a **404: NOT_FOUND** page.

| Address | Expected |
|---|---|
| `https://ebs-ch6-app.vercel.app/` | the app |
| `https://ebs-ch6-app.vercel.app/docs/storyboard.md` | 404 |
| `https://ebs-ch6-app.vercel.app/CLAUDE.md` | 404 |
| `https://ebs-ch6-app.vercel.app/BUILD-PROMPT.md` | 404 |
| `https://ebs-ch6-app.vercel.app/docs/progress.md` | 404 |
| `https://ebs-ch6-app.vercel.app/apps-script/Code.gs` | 404 |
| `https://ebs-ch6-app.vercel.app/server/server.js` | 404 |
| `https://ebs-ch6-app.vercel.app/package.json` | 404 |

You can also check in Vercel: open the deployment, click **Source** (or the **Output** / files view), and confirm the list shows only `index.html`, `app.js`, `styles.css`, `config.js`, `vercel.json` and the `assets` folder.

Or, from a terminal (any computer with curl), this prints the status for each address. Every line except the first should end in 404:

```bash
for p in "" docs/storyboard.md CLAUDE.md BUILD-PROMPT.md docs/progress.md apps-script/Code.gs server/server.js package.json; do echo "$(curl -s -o /dev/null -w '%{http_code}' https://ebs-ch6-app.vercel.app/$p)  /$p"; done
```

## Step 5: Check the app works

1. Open the web address in an Incognito window (Ctrl+Shift+N in Chrome).
2. Scroll to the bottom, open **Teacher Mode**, key in the teacher code and add your classes. These are saved in your Google Sheet.
3. Go back to the start page: the class drop-down should list your classes. Log in as a test student, tap through Level 1, and check the work appears in the **Students** tab of your Google Sheet.
4. Open it on a phone as well.

When it all works, share the web address in SLS as a link (not embedded).

## Updating the app later

Change the files, save a new version and push (`git add -A`, `git commit -m "What changed"`, `git push`; or **Commit to main** then **Push origin** in GitHub Desktop). Vercel publishes it within a minute. If a phone still shows the old version, refresh the page.

Adding pictures needs no code change: put the files into `assets/img/` with the names in the storyboard (for example `N01-landing-banner.jpg` or `badge-story-sharer.png`), save a new version and push.

## If something goes wrong

- **The deployment failed.** Open it in Vercel and read the build log. Check that Framework Preset is **Other** and that no Build, Output or Install command override is switched on.
- **The page loads but the class list does not.** Check `config.js` (Step 1), then the check in Step 6 of `docs/apps-script-setup.md`.
- **Vercel cannot see the repository.** Give the Vercel GitHub app access to it (Step 3, point 3).
