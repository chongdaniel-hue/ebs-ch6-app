# Setting up the Google Sheet and Apps Script

This guide is for teachers. You do not need any coding background: you will copy and paste one file and click through some Google screens. Allow about 20 minutes the first time.

The app saves every student's work in a Google Sheet that only you can open. Students never see the Sheet. The app reads and writes it through a small Google Apps Script "web app", which is the code in `apps-script/Code.gs`.

## Before you start: which Google account?

Everything below is owned by one Google account, and the Sheet holds student work (class and register number only, no names), so choose the account carefully.

- A school or group account is better than a personal one.
- Some school accounts (including some MOE accounts) are not allowed to publish a web app to "Anyone". Step 6 checks this. If your account fails that check, start again with a group Gmail account made for this module.

## Step 1: Create the Sheet

1. Sign in to the Google account you chose, then open <https://sheets.new> to make a new, empty Google Sheet.
2. Click the title "Untitled spreadsheet" at the top left and rename it, for example **EBS Chapter 6 student work**.
3. Do not share this Sheet with anyone, and do not publish it. Only teachers who need to read the results should ever have access, and they can read them in the app's Teacher Mode instead.

You do not need to add any tabs or headings. The script creates the **Classes** and **Students** tabs for you in Step 4.

## Step 2: Paste the code

1. In the Sheet, open the menu **Extensions** and choose **Apps Script**. A new browser tab opens with a code editor.
2. At the top left, click **Untitled project** and rename it, for example **EBS Chapter 6 app**.
3. On the left you will see a file called **Code.gs** with a few lines in it. Click inside the code area, select everything (Ctrl+A, or Cmd+A on a Mac) and delete it.
4. Open `apps-script/Code.gs` from this project (on GitHub, open the file and click the **Copy raw file** button, which looks like two overlapping squares). Paste it into the empty code area.
5. Click the **Save** icon (the floppy disk), or press Ctrl+S (Cmd+S on a Mac).

## Step 3: Set the teacher code

The teacher code lets teachers into Teacher Mode. It is kept in the script's settings, never in the code, so it is not visible to anyone who reads the code on GitHub.

1. In the Apps Script editor, click the **gear icon** on the far left (**Project Settings**).
2. Scroll down to **Script Properties** and click **Add script property**.
3. In **Property**, type exactly: `TEACHER_CODE`
4. In **Value**, type the teacher code your group agreed on. Do not write the code in any file in this project, because the project is public on GitHub. Capital letters and spaces before or after the code do not matter when it is typed in the app.
5. Click **Save script properties**.

To change the code later, come back here and edit the value. The change works at once; you do not need to deploy again.

## Step 4: Run the setup once

This creates the two tabs in your Sheet and asks Google for permission for the script to use the Sheet.

1. Click the **< >** icon on the far left (**Editor**) to go back to the code.
2. In the toolbar above the code, there is a drop-down list of function names. Choose **setup**.
3. Click **Run**.
4. A box says "Authorization required". Click **Review permissions** and choose your Google account.
5. You may see "Google hasn't verified this app". This is normal for a script you wrote yourself. Click **Advanced**, then **Go to EBS Chapter 6 app (unsafe)**, then **Allow**.
6. At the bottom, the **Execution log** should say "Setup done. The teacher code is set." If it says "Now add TEACHER_CODE", go back to Step 3.
7. Go back to the Sheet's browser tab. You should now see two tabs at the bottom: **Classes** and **Students**.

## Step 5: Deploy the web app

1. In the Apps Script editor, click the blue **Deploy** button (top right) and choose **New deployment**.
2. Next to "Select type", click the **gear icon** and choose **Web app**.
3. Fill in:
   - **Description:** `Version 1`
   - **Execute as:** **Me** (your account)
   - **Who has access:** **Anyone**
4. Click **Deploy**. If Google asks for permission again, allow it as in Step 4.
5. Google shows a **Web app URL** that starts with `https://script.google.com/macros/s/` and ends with `/exec`. Click **Copy** and paste it somewhere safe (for example a note to yourself). You need it in Step 7.

"Execute as: Me" means the script uses your permission to open the Sheet, so students never need access to the Sheet itself. "Anyone" means students can use the app without signing in to Google.

## Step 6: Check that students can reach it

Do this check every time you set up with a new account.

1. Open a private window in your browser: in Chrome, the menu **⋮** then **New Incognito window** (Ctrl+Shift+N). Do not sign in to anything in it.
2. Paste your web app URL into the address bar, add `?action=classes` to the very end, and press Enter. For example:
   `https://script.google.com/macros/s/AKfy...xyz/exec?action=classes`
3. You should see a short line of text like `{"ok":true,"classes":[],"version":"1"}`. That means it works.

If **"Anyone" was not offered** in Step 5, or this private window **asks you to sign in** or says **"You need access"**, your account is not allowed to publish to everyone. Close the private window, and repeat Steps 1 to 6 with a group Gmail account instead. (You can delete the Sheet and script you made with the first account.)

## Step 7: Put the web app URL into the app

1. Open the file `config.js` in this project.
2. Find these lines near the top:

   ```js
   SERVER: "local",
   LIVE_URL: "PASTE_YOUR_WEB_APP_URL_HERE",
   ```

3. Change them to (keeping the quotation marks and the commas):

   ```js
   SERVER: "live",
   LIVE_URL: "https://script.google.com/macros/s/AKfy...xyz/exec",
   ```

   using your own URL from Step 5.
4. Save the file, then publish it to GitHub (see `docs/github-setup.md`). The app now saves to your Sheet.

The web app URL is not a secret: students' browsers use it, and it only does what `Code.gs` allows. The teacher code is the secret, and it never leaves Script Properties.

## Step 8: Add your classes

1. Open the app, scroll to the bottom and click **Teacher Mode**.
2. Key in the teacher code from Step 3.
3. On the **Classes** tab, add each class name (for example `3E1`), in the order you want them in the students' drop-down list.

## After a code change: deploy again, keeping the same URL

If `Code.gs` is updated later, paste the new version over the old one (Step 2, points 3 to 5), then:

1. Click **Deploy** and choose **Manage deployments** (not "New deployment", which would give you a new URL).
2. Select your web app deployment on the left, then click the **pencil icon** (Edit).
3. Under **Version**, choose **New version**. You can type a description such as `Version 2`.
4. Click **Deploy**. The web app URL stays the same, so you do not need to change `config.js`.

## Looking at the Sheet

You can read results in the app's Teacher Mode, which is easier. If you open the Sheet itself:

- **Classes**: one row per class, with the order it appears in the app and when it was added.
- **Students**: one row per student (class plus register number). The columns from **Levels finished** to **Cleared at** are there for you to read. The last column, **Record**, holds the student's full work in a computer format. Please do not edit it.
- Please do not rename the tabs, change the headings, or change the cell formatting (the script stores everything as plain text so that a class such as 3E1 is not turned into a number).
- Sorting or filtering the Students tab to look at it is fine.

## If something goes wrong

- **Teacher Mode says "Incorrect code."** Check the code in Script Properties (Step 3).
- **Teacher Mode says "Too many wrong codes. Wait 10 minutes and try again."** After 10 wrong codes in 10 minutes, every code is refused for 10 minutes, so that nobody can guess the code by trying many times. Wait, then try again.
- **Teacher Mode says "The teacher code has not been set up yet."** Add `TEACHER_CODE` in Script Properties (Step 3).
- **Teacher Mode says "The server could not load the results."** Check that `config.js` has `SERVER: "live"` and the correct URL, then try the check in Step 6.
- **Students see a yellow bar** saying their work has not been sent yet. Their work is safe on their device, and the app keeps trying. If many students see it at once for a long time, try the check in Step 6.

## How much can it handle?

Google allows a script like this to run about 30 requests at the same moment. The app is built so that a class of 40 working together stays well under that: each device saves at most every 10 seconds while a student moves through the notes, at most every 30 seconds while typing, and right away only when a student submits, taps Check again or finishes a level. A save that fails is kept on the device and tried again a little later.

## For developers: testing on your own computer

`server/server.js` runs this same `Code.gs` on your computer, with a stand-in for the Google Sheet, so the whole app can be tested without Google. Keep `SERVER: "local"` in `config.js`, then run:

```bash
npm install
```

```bash
TEACHER_CODE=choose-a-test-code npm start
```

and open <http://localhost:8787>. On Windows PowerShell, run `$env:TEACHER_CODE = 'choose-a-test-code'; node server/server.js` instead (PowerShell often blocks `npm` scripts, and this starts the same server). Stop the server with Ctrl+C. Test data is stored in `server/data/`, which is never committed. Run the automated checks with `npx playwright test`.
