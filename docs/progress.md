# Build progress

Read this with `CLAUDE.md`, `docs/storyboard.md` and `docs/HANDOVER.md` when starting a fresh session. The untouched V45 app is in `../V45` for reference when porting code.

## Slices

| Slice | What | Status |
|---|---|---|
| 1 | Clean-up and shell: removals, blue theme, header, footer, `config.js`, image map with placeholder boxes, viewport fix | Done (commit "Slice 1") |
| 2 | Back end and login: `apps-script/Code.gs`, local stand-in `server/server.js`, setup guides, Teacher Mode sign-in and Classes tab, landing, Before you start, home, 4 key terms, Switch student, saving and loading, offline | Done (commits "Slice 2", "Slice 2 fixes") |
| 3 | Levels 1 and 2 (Service Recovery Path), locks, tabs, Continue and Next, Badges 1 and 2 | Done (commits "Slice 3" to "Slice 3 final tweaks") |
| 4 | Levels 3, 4 and 5, hint, retry and reveal feedback, exit ticket | Done (commits "Slice 4", "Slice 4 fixes") |
| 5 | Learning report and the rest of Teacher Mode | Done (commits "Slice 5", "Slice 5 fixes") |
| 6 | Full check, publishing set-up, summary | Done (commits "Slice 6", "Connect to live Apps Script", "Publish through Vercel") |
| Next | Live set-up and test: the group follows `docs/apps-script-setup.md` and `docs/github-setup.md`, then we test the live version together | Not started |

## Decisions agreed with the user (19 October 2026)

These fill gaps in the storyboard. Student-facing wording here is approved and must be used exactly.

### Back end
- Design as proposed: GET `?action=classes`, GET `?action=load&class=&reg=`; POST (`text/plain` JSON) `save`, `teacherCheck`, `addClass`, `removeClass`, `results`, `clearStudent`. Teacher results go by POST so the code never appears in a URL.
- Every reply is HTTP 200 JSON; failures are `{ok:false, error:"..."}` (`bad_code`, `no_class`, `bad_reg`, `too_big`, `busy`, `cleared`, `locked_out`, ...). The local server copies this exactly.
- Sheet tabs: Classes (Class, Order, Added at) and Students (Key, Class, Register No., Levels finished, Q2 first try, Q3 and Q4 first try, Confidence 1 to 4, Last saved, Cleared at, Record JSON). No other tabs.
- Save rules: reject unknown class, register number not a whole number 1 to 50, record over 40,000 characters (each answer box limited to 1,500 characters). Newer `updatedAt` wins, with the device time capped at server time. First attempts merged item by item, never replaced. Each first attempt carries its own right or wrong flag, so the script needs no answer key. A record based on an older cleared-at time is refused with `cleared` and the device discards its copy. `LockService` `tryLock(10000)`; on failure reply `busy`.
- Teacher code lock-out: after 10 wrong codes in 10 minutes, refuse for 10 minutes.
- Timings: local save always immediate. Server save immediately on Submit and Finish; Continue, Next and tab change coalesce into one save within about 10 seconds; typing at most every 30 seconds and only if changed; one save on page hide. Random 0 to 3 s delay before routine saves; one request in flight per device. Retries after 5, 10, 20, 40 s, then at most every 5 minutes, with jitter. Class list cached by the script for 60 s.
- `docs/apps-script-setup.md` must include a check step: after deploying, open the web app link in an Incognito window; if "Anyone" is not offered or it asks to sign in, use a group Gmail account instead.

### Layout
- Content widens to about 900px on laptops (V45 was a 520px column).
- V45 practice round ("Go through the questions again") removed.

### Flow and feedback
1. Every level: the 💡 Remember this card appears at the bottom of the last tab once its work is done, above [Finish Level n]. Finish opens the badge pop-up. Level 2 works the same way.
2. Finish Level 3 and "Next: Exit ticket →" are held back until every wrong item has had its Check again. Label: "Next: Exit ticket →".
3. Only Level 1 gets [Submit anyway]. Required questions (Level 3 Q1 and Q2, Level 4 Reflect, Level 5 Q3 to Q5, exit ticket) must be filled in: the pop-up shows only [Go back]. The two Level 2 "Think about it" boxes never block anything.
4. The "Not finished yet" pop-up lists the missing items by name (e.g. "Box 2", "Q3 ii") as well as marking them in red.
5. Badges 2 to 4 pop-up: "You earned the {badge name} badge!" [Back to my route]. Badge 5 uses the Level 5 pop-up in the storyboard.
6. A finished level: all tabs open, answers and feedback read-only. Open Alex and Open Suzzie still work.
7. Level 2 Tab 3: "Handled well, a service breakdown..." and C04 appear only once all 8 path stops are shown, together with Continue ↓.
8. Revealed answers (still wrong after Check again): "The answer is {stage}: {reason}" for Q2, "The answer is False: ..." / "The answer is True: ..." for Q3, "The answer is B: B acknowledges..." for Q4. ✓ or ✗ before each item's feedback.
9. "Look at these again" lines:
   - P: "Performing service recovery (Level 2, Breakdown and Recovery)"
   - Q: "Presenting product information (Level 2, The Four Stages)"
   - R: "Closing the customer experience positively (Level 2, The Four Stages)"
   - S: "Approaching customers (Level 2, The Four Stages)"
   - Q3 i: "What customer service is (Level 2, Quality Customer Service)"
   - Q3 ii: "Good product knowledge (Level 2, Quality Customer Service)"
   - Q3 iii and Q4: "The 8 steps of service recovery (Level 2, Breakdown and Recovery)", shown once
   - Q3 iv: "Service breakdown (Level 2, Breakdown and Recovery)"
   - Nothing wrong: "Nothing to look at again. You got everything right on the first try! 🎉"
10. Offline bar: V45 wording with "phone" changed to "device", e.g. "📡 No internet. Your work is saved on this device and will be sent when the connection is back."
11. "Welcome back! Your work has been loaded." is a short notice at the top of the home page. The locked-card message is a line under the tapped card.

### Teacher Mode and data
12. A removed class stays choosable in Results, marked "(removed)".
13. Switch student deletes the device copy once it has reached the server; unsent work stays queued until it goes.
14. The user is testing whether their MOE Google account offers "Who has access: Anyone". Build as planned.

### Tooling
15. Dev-only `package.json` with Playwright and a `tests/` folder. `node_modules/` in `.gitignore`. The Pages workflow publishes only `index.html`, `app.js`, `styles.css`, `config.js` and `assets/`.
16. Level 4 opening line ("Try: Hi, welcome to Stylez!...") kept for now.

### Working rules (added 19 October 2026, after slice 1)
- The decisions in this section count as part of the storyboard: they fill its gaps and must be followed exactly. `docs/storyboard.md` is not edited for them. If this file and the storyboard ever conflict, ask the user.
- Theme is wine red (see `CLAUDE.md`). Every feedback box has ✓ or ✗ in its text and a 4px coloured left border (`.feedback.right` / `.feedback.wrong` in `styles.css`). Cards and notes never use the wrong-answer pink as a background.
- Blocks up to about 900px wide on laptops; paragraph and list text limited to about 680px (`--text-max`).
- Where V45 already has working logic (submit guard and "Not finished yet" pop-up, recap card, badge pop-up, offline bar and queue, CSV export, form labels), port it from `../V45/app.js` rather than rewriting it.
- Git is local only (no remote, no push). Commit after each slice, before reporting back. Local commit identity is the neutral "EBS Ch6 team" so no personal email ends up in the public history; the user may change it before the first push.

### Visual and Mayer pass (agreed 19 October 2026, after slice 3)
G1 students need strong visual support. Visual treatment may change how text looks, never what it says: storyboard wording stays word for word. Every slice's checks include a visual check of every screenshot at 1280px and 360px (alignment, equal card heights in rows, consistent styles, spacing, no clipped images, appeal for a 15-year-old). These rules are now also in `CLAUDE.md` (Visual check; Designing for G1 students).
- **Home welcome card** (replaces the storyboard's welcome lines, shown in a card at the top of the home page):
  - 0 levels done: "👋 Welcome to Chapter 6: Customer Service! In 5 short levels, you'll find out what great customer service looks like, chat with an AI customer service officer, and even serve a customer yourself. Take your time, and do your best. Start with Level 1 below. You've got this!"
  - 1 to 4 done: "👋 Welcome back! Your work has been loaded. You've finished {n} of 5 levels. Great progress! Carry on with Level {n+1} below." "Your work has been loaded. " appears only on the first home page right after logging in; on later visits to the home page in the same session the line reads "👋 Welcome back! You've finished {n} of 5 levels. Great progress! Carry on with Level {n+1} below." (There is no separate notice.)
  - All 5 done: "🎉 Amazing work! You've finished all 5 levels. Have a look at your learning report to see how you did."
- **💡 means Tip.** Every tip starts with 💡 in a light tip box. The recap card heading is "📌 Remember this" everywhere (the storyboard's "💡 Remember this" is replaced).
- **One style per meaning, the same everywhere:** 📖 definition box (neutral cool tint, wine left bar) for textbook definitions; icon cards for lists of points; speech bubbles for examples of what staff say; 📌 amber recap card; 💡 tip box. Headings in the notes carry an icon.
- **Level 1:** three equal-height question cards in a row (😊 GOOD, 😞 BAD, 🤔 what makes it good or bad), text boxes aligned at the bottom and the same size; stacked on phones.
- **Level 2:** icons on every heading; "If a business provides quality customer service" as three icon cards (🔁 🗣️ 🤝); skills and qualities as six icon cards; good product knowledge as five icon chips; three approach cards with examples as speech bubbles (the "combine" line sits in the Service Approach card, keeping the order); purpose of approaching as two icon cards; stage icons 👋 📱 ✅ 🛠️ beside the stage colours; returns as three icon cards (🔁 🔄 💵); larger path icons with the step number in a badge.
- **Images:** always shown in full, never cropped; the Foodpanda pair is the same height side by side (each image's share of the row is set from its own shape when it loads).
- **🔊 Listen** on each block of notes in Level 2 and on the 4 key terms page (notes only, never questions or answers): browser speech, en-GB or en-SG voice if available (an on-device voice first, so it works offline), rate 0.9; tapping again stops it ("⏹ Stop"); not shown where the browser has no speech; leaving the page stops it.
- **Before you start:** an icon beside each numbered point (🗺️ 💾 🤖 🔁 👀).
- **Segmenting (approved):** an extra Continue ↓ wherever a Level 2 part ran longer than about one phone screen (360px wide; about 550px visible under the sticky bars), at a natural break between sections, with no change to wording or order:
  1. Tab 1, before "Why does quality customer service matter?" (part of 1,170px became 517 + 650)
  2. Tab 2, before "Whether salespeople use the greeting, service or product approach, the purpose is to:" (1,671px became 1,276 + 436)
  3. Tab 3, before "To perform service recovery, follow these 8 steps:" (the definitions, 476px, now come before the path)
  4. Tab 3, before "Many businesses also set clear rules for returns, such as a time limit and needing the receipt." (1,467px became 549 + 959)
  Parts that stay longer than a screen, because splitting would break one list or separate a picture or question from its words: the six skills cards (889px), good product knowledge with N02 (833), the stage table with C02 (809), the three approach cards (1,276), Foodpanda with its Think about it box (1,214). The Service Recovery Path part is already segmented by "Show Step N ↓". Level 2 now has 4 + 4 + 5 parts. A part that starts with a line of text instead of a heading has 🔊 Listen in that line's row.
- **R03 (Uniqlo):** at most about 520px wide on laptops, centred.
- **Approved after review:** "You can also combine..." inside the Service Approach card; the ⏰ box; the 🤔 headings; "⏹ Stop".
- **Layout rules (visual fixes before slice 4):** each 🔊 Listen sits in its heading's row (heading left, button right); everything below a heading uses the full column width, so every block in a page has the same left and right edges (running text keeps the readable width; buttons keep their own size). Images and placeholders are centred, as wide as the card rows but never larger than the file. On phones, grid icon cards become compact horizontal cards (icon left, text right), equal height within a group. Each speech bubble sits on its own line under the sentence it belongs to. Path circles: white with a 3px purple ring, emoji inside, purple number badge. A test checks the edges of every block on every page at both widths.

### Slice 4 fixes (agreed 20 October 2026)
- **One "Check again" per tab**, at the bottom of the tab, checking every item still waiting (Level 3 Think back; Level 5 Check covers Q3 and Q4 together).
- **Revealed answers shown on the options:** the right option is outlined in green with a "✓ Correct answer" tag (MCQ card, True/False button); for a dropdown, "✓ Correct answer: {stage}" sits beside the student's answer. The student's wrong pick is marked ✗ (screen readers hear "your answer, not correct"). The reveal text stays.
- **Changed wrong answer before Check again:** its old hint fades (screen readers hear "Earlier hint") and "👆 Tap Check again to see if you're right." shows in its place.
- **Under a greyed-out Next** (Levels 3 and 4): "Tick the box above when you've finished."
- **Summary card** (ported from V45's missedHtml) above the 📌 card in Level 3 once Q2 is settled, and at the bottom of Level 5 Check once Q3 and Q4 are settled: all right first time "🎉 Great work!" / "You got everything right on the first try."; otherwise "💪 Let's learn from these" / "Good effort! Here {is one thing / are N things} to look at again:" with the approved "Look at these again" lines for the items wrong on the first try (Q3 iii and Q4 share one line).
- **Level header:** the level's card description shows under the title as a subtitle.
- **Tabs:** ✓ replaces the number on finished tabs (moved on with Next, or level finished).
- **Locked dropdown answers** show as a read-only box that wraps, so a long stage name is never cut off on a phone.

### Level 2 card text tidy (agreed 20 October 2026)
Display only: the words and punctuation stay exactly as in the storyboard.
- **Capital first letters** on icon cards that started lowercase, with the same words, punctuation and bold: "Customers will have a positive experience and they will choose to **return repeatedly**;", "Customers will **recommend** the business to their relatives and friends; and", "**Customer loyalty** is created, ensuring the **continuity of the business**.", "Make customers feel comfortable or welcome in the store so that they are likely to buy from the business; and", "Ensure customers return to the business again in the future." (No other card or chip started lowercase.)
- **Name on its own line**: cards in the "Name: description" format show the name in bold on its own line with no colon, and the description below with a capital first letter: the six skills and qualities (e.g. **Approachable** / Friendly and easy to talk to, so customers feel comfortable asking for help) and the three returns cards (**Replacement** / Replace it with the same product., **Exchange** / Offer to exchange it with a different product., **Refund** / Give a refund.). 🔊 Listen reads the same words, the name then the description. Card heights stay equal in each row at both widths.

## How slice 2 works (for the next session)

- **Record shape** (one per student, `ch6_rec_<class>#<reg>` on the device, Record column in the Sheet): `v, cls, reg, updatedAt, baseClearedAt, agreed, done{level:time}, submitted{key:time}, reached{key:number}, first{item:{a,ok,t}}, second{item:{a,ok,t}}, answers{key:{v,t}}, ui{key:{v,t}}`.
- **Key names** (Code.gs depends on these for the readable columns): first attempts `s3q2.P` to `s3q2.S`, `s5q3.i` to `s5q3.iv`, `s5q4`; confidence answers `s5.q8.1` to `s5.q8.4` (value 0 to 3: Not yet, A little, Confident, Very confident). Other keys start with `s<level>` (used for "In progress").
- **Merge** (`mergeRecords`, identical in `app.js` and `Code.gs`, checked by a test): the newest value of each answer box wins (a refinement of "newer copy wins", so a device coming back online never wipes newer answers made elsewhere); `agreed`, `done`, `submitted` keep the earliest time and are never removed; `reached` keeps the highest; `first` and `second` are never overwritten once recorded.
- **Saving**: `setAnswer(key, value, mode)` and `queueSave(mode)` with mode `"now"` (Submit, Finish), `"soon"` (Continue, Next, tab change) or `"typing"`. The queue (`ch6_queue`) holds one entry per student and always sends that student's latest device copy.
- **Local server** runs `apps-script/Code.gs` itself through `server/apps-script-mock.js`, so local and live behaviour cannot drift apart. If Code.gs starts using another Google service method, add it to the mock.
- **Tests**: `npx playwright test`. The test teacher code is generated at random for each run; test data lives in the system temp folder.
- Wording I had to add because the storyboard has none (teacher-facing or transient, please check): Teacher Mode "Too many wrong codes. Wait 10 minutes and try again.", "The teacher code has not been set up yet. See the setup guide.", Classes tab "Key in a class name.", "Class names can be at most 20 characters.", "{name} is already in your classes.", "No classes yet."; the Start and Enter buttons read "Checking..." while waiting (as in V45); the Switch student pop-up title "🔄 Switch student" and the Remove class pop-up title "Remove class".
- `docs/github-setup.md` is written in slice 6 with the Pages workflow it describes.

## How slice 3 works (for the next session)

- **Level engine** (`renderLevel`, `drawTab` in `app.js`): `LEVEL_CONTENT[n].tabs[i]` = `{label, next, parts: [{html(ctx), wire(el, ctx), continueWhen(ctx)}]}`. Parts are revealed with Continue ↓ (`reached["s<n>.t<i>"]`); Next → raises `reached["s<n>.tabs"]` and moves on; the current tab is `ui["s<n>.tab"]`. A level with one tab shows no tab bar. Locked tabs show 🔒, are `aria-disabled` and do nothing when tapped.
- **Saving**: Continue, Next, tab change, Show Step: `"soon"`; Submit and Finish: `"now"`; answer boxes: `"typing"`. Answer boxes are limited to 1,500 characters.
- **Shared pieces**: `answerBoxHtml` / `wireAnswerBoxes`, `recapHtml` (💡 card, amber), `finishButtonHtml` / `finishLevel` / `showBadgePopup` (Badges 1 to 4), `showNotFinished(missing, onSubmitAnyway)` (V45 submit guard: red outline with "✗ Not done yet", items listed by name; pass `onSubmitAnyway` only for Level 1).
- **Service Recovery Path**: `RECOVERY_STEPS`; `reached["s2.path"]` counts stops shown. The first visit to Tab 3 shows Step 1 only; any later arrival at the tab (coming back, reload) shows all 8. Continue ↓, the "Handled well" line and C04 appear only once all 8 are shown.
- Choices made where the storyboard is silent (please check): a level counts as "In progress" once opened (after "I'm ready"); after Level 1 Submit, the instruction line "Type at least one sentence in each box, then tap Submit." is replaced by the recap card; hidden screen-reader text for the mood faces reads "Customer feels angry / upset / calmer / reassured / happy"; the badge pop-up title is the badge emoji and name (e.g. "📝 Story Sharer").

## How slice 4 works (for the next session)

- **Marked questions** (`itemState`, `itemFeedbackHtml`, `itemControlHtml`, `wireItems`, `recordAttempts` in `app.js`): an item is `{id, type: "select" | "tf" | "mcq", answerKey, attemptKey, correct, answerLabel, right, hint | hints}`. States: open, then after Submit right / retry; after Check again right / revealed. Submit records `first`, Check again records `second` (both never overwritten; each carries `ok`). Right answers lock; wrong ones stay editable once. Revealed text is "The answer is {answerLabel}: {reason}", the reason being the "Correct: ..." message without "Correct: ".
- **Level 3**: Chat tab (Next greyed until "I have finished chatting with Alex." is ticked, `answers["s3.tick"]`), Think back tab (Q1 two boxes, Q2 P to S dropdowns; Check again under Q2; recap and Finish only once every item is resolved).
- **Level 4**: Roleplay tab (About Stylez placeholder card with the storyboard's ⚑ text, Next greyed until ticked), Reflect tab (two required boxes; recap and Finish after Submit).
- **Level 5**: Check tab (Q3 True/False, Q4 A to D, Q5 box; Check again under Q3 and under Q4 separately; "Next: Exit ticket →" held back until every item is resolved), Exit ticket tab (Q6, Q7, Q8 four rows of faces; "Submit my exit ticket" finishes the level and opens the "🎉 You've finished Chapter 6!" pop-up with Badge 5). There is no recap card in Level 5 (the storyboard has none).
- **Badge pop-ups** use each badge's own emoji from the image map (🔍 Service Spotter, ⭐ Service Star), not the level's.
- **Tabs**: `tab.nextState(ctx)` returns "show", "disabled" (greyed) or "hidden" (held back).
- Choices made where the storyboard is silent (please check): "Not finished yet" names the missing items "Q1 (skill or quality)", "Q1 (why it is important)", "Q2 P", "Q3 i", "Q4", "Q5", "Q6", "Q7", "Q8 (row 1)" and so on; the Q1 and Q5 self-check notes after Submit are shown in a neutral 🔎 note box (they are not marked); the "Not sure what to ask?" tip is a 💡 box that opens on tap, its three examples shown as speech bubbles; Alex's three "try to" points are icon cards (📱 🤔 🛠️); the "four stages" line in Level 4 sits in a 🗺️ box; Level 4 Reflect uses two equal cards (👍 🔄) like Level 1; picked answers are shown in wine (never green or red, which mean right or wrong).

## How slice 5 works (for the next session)

- **Learning report** (`renderReport`, route `#report`): one card per level (badge, ✅ and the date finished, badge name), the two first-try scores as written in the storyboard, "🔁 Look at these again" (the approved lines, or the agreed "Nothing to look at again..." line), "💭 How confident you felt" (each exit-ticket row with the face and its label), "Back to my route". Reading helpers that work on any record: `recAnswer`, `recDone`, `recFirstTry`, `recLookAgain`, `attemptText`.
- **Teacher Mode** has three tabs: Classes, Results, This device (`teacher.tab`).
- **Results**: "Choose a class" (current classes, then removed classes with saved work marked "(removed)"); the records come from the `results` action and everything else is worked out in the browser. Class summary (levels finished, most missed on the first try, confidence spread table, all Q7 answers), students table (tap a row for the full report), "⬇️ Download CSV" (one row per student: levels and dates, first-try scores, every answer, first and second tries as "{answer} (right/wrong)", confidence labels, last saved, cleared at). Full report: every answer by level, Q2 and Q3/Q4 first and second tries in tables, "Clear this student's work" with the storyboard pop-up and message.
- **This device**: "Unlock all levels on this device" (the storyboard message, then a "Turn off" button); "Reset this device" asks for the teacher code again, then clears every student's copy on the device and logs out; work not yet sent is kept until it reaches the server.
- Teacher-facing wording I added (please check): Results "Choose a class", "Loading…", "Class summary: {class}", "{n} students with saved work.", "Levels finished", "Most missed on the first try" (only items someone got wrong; "Nothing missed on the first try yet." otherwise), "Confidence", "Q7: one question I still have", "Students", "Tap a row to open the student's full report.", item labels such as "Q2 R (answer: Closing the customer experience positively): wrong for 2 of 2", "No. 12 (cleared)", "← Back to the class", "(blank)" for empty answers; This device "🔓 Unlock all levels" and "🧹 Reset this device" headings with the storyboard descriptions, "Turn off", the reset pop-up "Key in the teacher code." and "Reset" / "Cancel", "Device reset. It is ready for the next student." (or, when work is still unsent, "Device reset. Work for {n} students has not been sent yet. It has been kept on this device and will be sent when the device is online."). Student-facing: the report shows "Not finished yet" for a level not finished (only possible with Unlock all levels).

## How slice 6 works (for the next session)

- **Full check** (`tests/slice6-full-check.spec.js`): walks every student and Teacher Mode screen at 1280px and 360px and fails on text contrast below 4.5:1 (3:1 for large text, worked out from the colours actually shown, including opacity), placeholder hints below 4.5:1, images without alt text, controls or buttons without a name, tap targets under 44px, more or fewer than one h1, duplicate ids, a missing page language, ampersands, sideways scrolling and console errors. Screenshots of every screen go to `tests/screenshots/final-*.png`; the text of every screen to `test-results/screen-text-*.txt` for the wording check.
- **Publishing (changed 20 October 2026)**: the project is in a **private** GitHub repository (`chongdaniel-hue/ebs-ch6-app`) and **Vercel** publishes it; the GitHub Pages workflow was removed. `.vercelignore` ignores everything and lets back in only `index.html`, `app.js`, `styles.css`, `config.js`, `assets/` and `vercel.json`, so docs, tests, the server and the Apps Script code are never uploaded. `vercel.json` turns off framework detection, install and build. All paths are relative, so the app works from the root of a vercel.app address (and from a sub-folder). Steps in `docs/github-setup.md`. Commits from 20 October use the repo-only identity `chongdaniel-hue` with a GitHub no-reply email; earlier commits stay under "EBS Ch6 team".
- **Code.gs** adds 100 rows when a tab is full before writing (a new Google Sheet tab has 1,000 rows and writing past the last row fails). The local stand-in now enforces the row limit, and a test saves 12 students into a 5-row tab.
- Run everything with `npx playwright test` (about 3 to 4 minutes). On this Windows machine the Playwright test process very occasionally crashes ("worker process exited unexpectedly"); a rerun passes.

## Open questions and things still to do

1. **Pictures not yet added** (placeholders show until the files are dropped into `assets/img/`): N01 landing banner, N02 product knowledge, N03 returns comic, N04 Alex, N05 Suzzie, and the five badges (`badge-story-sharer.png`, `badge-service-scholar.png`, `badge-service-spotter.png`, `badge-service-star.png`, `badge-chapter-6-champion.png`).
2. **About Stylez card** still shows the storyboard's ⚑ placeholder text. Fill it in from the Stylez document so it matches Suzzie's Gem, and check Suzzie's look before making N05.
3. **Level 4 opening line** ("Try: Hi, welcome to Stylez! How may I assist you?") is kept; delete it if Suzzie's Gem starts the chat itself.
4. **Teacher code**: the group's code is the subject's name, which appears all over the app, so it is the first thing anyone would try. The lock-out (10 wrong codes in 10 minutes) slows guessing but does not stop a lucky first guess. Consider a code that cannot be guessed from the app. It only needs changing in Script Properties.
5. **Live test still to do**: the Apps Script is deployed, `config.js` points at it and the repository is pushed. Still to do: import into Vercel (`docs/github-setup.md`), then test together on a phone and a laptop: log in, save, second device, offline and back, Teacher Mode results, Clear this student's work, CSV. Things only the live set-up can confirm: Google's redirect on every request, the "save on closing the page" beacon reaching Apps Script, and how quickly a class of 40 saving together is handled.
6. **The R03 picture** shows "Return & Exchange Conditions": an ampersand inside a real Uniqlo screenshot, not text the app writes.
7. **Segmenting**: some Level 2 parts are still longer than one phone screen because splitting them would break a list or separate a picture or question from its words (listed above under the segmenting decision).
8. **Storyboard documents**: `docs/storyboard.md` and `.docx` do not include the decisions in this file (welcome lines, 📌 Remember this, summary card wording, and so on) or the move from GitHub Pages to Vercel. Dan is updating them; do not edit them for him.
9. **Privacy**: the storyboard asks the group to confirm with their tutor that storing class and register number in a Google Sheet is acceptable.
10. **Vercel and groupmates' pushes**: on Vercel's free Hobby plan, deployments of a private repository may be blocked when the commit author is not the Vercel account owner. Check with the first groupmate push; if blocked, Dan redeploys from the dashboard or the group moves to a Vercel team. (`CLAUDE.md` and `BUILD-PROMPT.md` now describe the private repository plus Vercel; `docs/HANDOVER.md` is the guide for groupmates.)
