# Publishing the app on GitHub Pages

This guide is for teachers. It puts the app online at a web address you can share in SLS, for example `https://your-username.github.io/ebs-ch6-customer-service/`. Allow about 15 minutes the first time. Do the Google Sheet setup first (`docs/apps-script-setup.md`), because the app needs the web app URL from it.

## What gets published

The project folder holds the app, the documents, the tests and the Apps Script code. A small workflow file (`.github/workflows/pages.yml`) publishes **only the app**: `index.html`, `app.js`, `styles.css`, `config.js` and the `assets` folder. Nothing else is served on the website.

GitHub Pages on a free account needs a **public** repository, so anyone can read everything in the project on GitHub, including the documents. That is fine, because the project holds no secrets: the teacher code lives only in the Apps Script settings, and student work lives only in your private Google Sheet. Never add a file with a code, a password or student data to the project.

## Step 1: Point the app at your Google Sheet

1. Open `config.js` in the project folder.
2. Set `SERVER: "live"` and paste your web app URL into `LIVE_URL`, as in Step 7 of `docs/apps-script-setup.md`.
3. Save the file.

If you skip this step, the published app tries to reach the local test server, cannot load the class list, and tells students to connect to the internet.

## Step 2: Create the repository on GitHub

1. Sign in at <https://github.com>. If you do not have an account, create one (a group account is better than a personal one).
2. Click the **+** at the top right and choose **New repository**.
3. **Repository name:** for example `ebs-ch6-customer-service`. This name becomes part of the web address.
4. Choose **Public**.
5. Leave "Add a README", ".gitignore" and "license" **unticked** (the project already has what it needs).
6. Click **Create repository**. Leave the page open: it shows the repository address, for example `https://github.com/your-username/ebs-ch6-customer-service.git`.

## Step 3: Upload the project

The project folder is already a git repository with all the work saved in it. Choose **one** of these two ways.

**A. GitHub Desktop (no typing of commands)**

1. Install GitHub Desktop from <https://desktop.github.com> and sign in with your GitHub account.
2. Choose **File** then **Add local repository**, and pick the project folder (`ebs-ch6-app`).
3. Click **Publish repository**. If it offers to create a new repository instead, you can delete the empty one from Step 2 first, or choose the existing one under **Repository** then **Repository settings** then **Remote**, and paste the address from Step 2.
4. Make sure **Keep this code private** is **not** ticked.

**B. Command line**

Open a terminal in the project folder and run these two commands, using your own address from Step 2:

```bash
git remote add origin https://github.com/your-username/ebs-ch6-customer-service.git
```

```bash
git push -u origin main
```

Git may ask you to sign in to GitHub in a browser window. Allow it.

**About the author name on the saved versions.** The project's history so far is saved under the neutral name "EBS Ch6 team", so no one's personal email address becomes public. To save your own future changes under your GitHub account without showing your email, open GitHub **Settings** then **Emails**, tick **Keep my email addresses private**, copy the `...@users.noreply.github.com` address it shows, and run `git config user.email "that-address"` in the project folder.

## Step 4: Turn on GitHub Pages

1. On your repository page on GitHub, click **Settings** (the gear tab).
2. In the menu on the left, click **Pages**.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.
4. Click the **Actions** tab at the top of the repository. You should see **Publish to GitHub Pages** running (a yellow dot). If nothing is running, click **Publish to GitHub Pages** on the left, then **Run workflow**.
5. Wait for a green tick (usually one or two minutes). Click the run, then the **deploy** box: it shows the web address of the app.

The address is `https://your-username.github.io/your-repository-name/`. Always keep the slash at the end.

## Step 5: Check it

1. Open the web address in an Incognito window (Ctrl+Shift+N in Chrome).
2. The class drop-down should list the classes you added in Teacher Mode. If it says "Your teacher hasn't added your class yet", add a class in Teacher Mode (the link at the bottom of the page).
3. Log in as a test student (for example a class you made for testing, register number 1), tap through Level 1 and check the work appears in the **Students** tab of your Google Sheet.
4. Open it on a phone as well.

When it all works, share the web address in SLS as a link (not embedded).

## Updating the app later

Change the files, save a new version (in GitHub Desktop: write a short summary, click **Commit to main**, then **Push origin**; on the command line: `git add -A`, `git commit -m "What changed"`, `git push`). The workflow publishes the new version automatically within a couple of minutes. If a phone still shows the old version, refresh the page.

Adding pictures needs no code change: put the files into `assets/img/` with the names in the storyboard (for example `N01-landing-banner.jpg` or `badge-story-sharer.png`), save a new version and push.

## If something goes wrong

- **The Actions run has a red cross.** Click it to read the error. The most common cause is that Pages was not switched to "GitHub Actions" (Step 4, point 3). Fix it, then click **Re-run all jobs**.
- **The page shows "404 There isn't a GitHub Pages site here".** The first publish can take a few minutes. Check the address ends with your repository name and a slash.
- **The page loads but the class list does not.** Check `config.js` (Step 1), then the check in Step 6 of `docs/apps-script-setup.md`.
