# Build progress

Read this with `CLAUDE.md`, `docs/storyboard.md` (including Section H, "Changes agreed during the build") and `docs/HANDOVER.md` when starting a fresh session, with any AI tool. `AGENTS.md` (read first by ChatGPT Codex and other agents) points to `CLAUDE.md` and repeats the key rules. The untouched V45 app is in `../V45` for reference when porting code.

## Slices

| Slice | What | Status |
|---|---|---|
| 1 | Clean-up and shell: removals, blue theme, header, footer, `config.js`, image map with placeholder boxes, viewport fix | Done (commit "Slice 1") |
| 2 | Back end and login: `apps-script/Code.gs`, local stand-in `server/server.js`, setup guides, Teacher Mode sign-in and Classes tab, landing, Before you start, home, 4 key terms, Switch student, saving and loading, offline | Done (commits "Slice 2", "Slice 2 fixes") |
| 3 | Levels 1 and 2 (Service Recovery Path), locks, tabs, Continue and Next, Badges 1 and 2 | Done (commits "Slice 3" to "Slice 3 final tweaks") |
| 4 | Levels 3, 4 and 5, hint, retry and reveal feedback, exit ticket | Done (commits "Slice 4", "Slice 4 fixes") |
| 5 | Learning report and the rest of Teacher Mode | Done (commits "Slice 5", "Slice 5 fixes") |
| 6 | Full check, publishing set-up, summary | Done (commits "Slice 6", "Connect to live Apps Script", "Publish through Vercel") |
| After 6 | Level 2 card text tidy; storyboard "as built" with Section H; handover for groupmates (`docs/HANDOVER.md`, `AGENTS.md` for Codex) | Done (commits up to "Handover for Codex") |
| Next | Live test: import into Vercel if not yet done (`docs/github-setup.md`), add the classes in Teacher Mode, then test the live version on a phone and a laptop | Not started |

## Decisions agreed with the user (19 October 2026)

These fill gaps in the storyboard. Student-facing wording here is approved and must be used exactly.

### Contextual graphic icons (21 October 2026, version 0.6.4)
- The user accepted the four coloured key-term cards, then requested relevant graphic replacements for every remaining book icon, at 2.5 times the original symbol's size.
- The four contextual term graphics now replace book symbols in the Level 2 definition boxes. Generated glossary and learning graphics replace book symbols in home links, route cards, page headings, badge pop-up labels and learning reports. The Service Scholar badge replaces its central book with a learning symbol; its ribbon wording and badge display size remain unchanged.
- Replacement sizes follow the previous icon in each location: 60px in definitions (24px x 2.5), 72px in the home glossary link (28.8px x 2.5), and 2.5em for heading and label icons. Existing non-book icons and accepted key-term graphics keep their sizes.
- The user requires a local preview after every change and approval before publishing. Acceptance of a design is not permission to publish the next edit.

### Four key terms (21 October 2026, version 0.6.3)
- The user requested a different colour for each of the four key-term definition boxes and generated graphic icons in place of the repeated book emoji, at 2.5 times its size.
- Key-term cards use pale blue, mint, amber and lavender with matching borders, keeping all approved wording unchanged. Other textbook definition boxes retain their existing treatment.
- Four generated transparent icons represent customer service (headset and speech), quality (star and check), breakdown (cracked phone and warning), and recovery (repair arrow, wrench and check). Their 3.75rem square display size is exactly 2.5 times the original 1.5rem book icon.
- New files are in assets/img/term-*.png and registered in the existing image map. The existing assets/ publishing allowance covers them; no publishing configuration changes are needed.
- Validation: 82 Playwright checks passed at 1280px and 360px, with two duplicate phone checks intentionally skipped. The existing glossary check now verifies four distinct card colours, all four loaded icons and a 2.5 size ratio. Reviewed all 164 generated screenshots through contact sheets, plus full-size key-term views on laptop and phone: readable text, consistent alignment and spacing, transparent icons shown in full, and no sideways overflow.

### Illustration assets (20 October 2026, version 0.6.2)
- The user asked for a more fun, image-rich platform and approved generating the storyboard's missing illustrations and badges using the existing Nexora comics as the style reference.
- Added N01 (landing banner), N02 (product knowledge), N03 (returns comic), N04 (Alex), N05 (Suzzie), and the five named badge PNGs under `assets/img/`. Original comics are retained. The existing image map displays the new artwork without changing student wording or learning flow.
- No separate Stylez reference was available; the user approved following the comic style for Suzzie's portrait. The About Stylez content remains a placeholder pending the actual store information.
- The landing banner preserves its natural proportions so the illustration is shown in full. Updated image checks require all mapped artwork to load and explicitly test the accessible fallback for an unavailable image.
- The user confirmed Vercel deployment and live testing have already happened; the earlier "not started" live-test notes below are historical. This image update still needs its own deployment before it appears live.
- Validation: 82 Playwright checks passed at 1280px and 360px, with two duplicate phone checks intentionally skipped. Used the cloud environment's installed Chromium through its external Playwright configuration. Reviewed screenshots for alignment, spacing, consistent image treatment, full illustrations, and unclipped badge ribbons; existing automated contrast, tap-target, scrolling, saving, and progression checks passed. Artwork labels match the approved prompts. About Stylez remains the existing open content item.

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
11. *(Superseded: there is no separate notice any more; "Your work has been loaded." is part of the welcome card, right after logging in only. See the visual and Mayer pass below.)* "Welcome back! Your work has been loaded." is a short notice at the top of the home page. The locked-card message is a line under the tapped card.

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

1. **Pictures added in 0.6.2:** N01 landing banner, N02 product knowledge, N03 returns comic, N04 Alex, N05 Suzzie, and all five achievement badges. See the illustration-assets decision above.
2. **About Stylez card** still shows the storyboard's ⚑ placeholder text. Fill it in from the Stylez document so it matches Suzzie's Gem, and check Suzzie's look before making N05.
3. **Level 4 opening line** ("Try: Hi, welcome to Stylez! How may I assist you?") is kept; delete it if Suzzie's Gem starts the chat itself.
4. **Teacher code**: the group's code is the subject's name, which appears all over the app, so it is the first thing anyone would try. The lock-out (10 wrong codes in 10 minutes) slows guessing but does not stop a lucky first guess. Consider a code that cannot be guessed from the app. It only needs changing in Script Properties.
5. **Live test still to do**: the Apps Script is deployed, `config.js` points at it and the repository is pushed. Still to do: import into Vercel (`docs/github-setup.md`), then test together on a phone and a laptop: log in, save, second device, offline and back, Teacher Mode results, Clear this student's work, CSV. Things only the live set-up can confirm: Google's redirect on every request, the "save on closing the page" beacon reaching Apps Script, and how quickly a class of 40 saving together is handled.
6. **The R03 picture** shows "Return & Exchange Conditions": an ampersand inside a real Uniqlo screenshot, not text the app writes.
7. **Segmenting**: some Level 2 parts are still longer than one phone screen because splitting them would break a list or separate a picture or question from its words (listed above under the segmenting decision).
8. **Storyboard documents**: done. The "as built" `docs/storyboard.md` and `.docx` list the build decisions in Section H (Dan's commits "Storyboard: as built"). When something changes, update both the storyboard (Dan keeps the .docx) and the decisions above.
9. **Privacy**: the storyboard asks the group to confirm with their tutor that storing class and register number in a Google Sheet is acceptable.
10. **Vercel and groupmates' pushes**: the Vercel project is on Dan's free Hobby account and the repository is private, so a deployment of a commit by someone else may show as **Blocked**. Agreed rule: the groupmate tells Dan, and Dan redeploys it from the Vercel dashboard (Deployments, ⋯, Redeploy). Steps in `docs/HANDOVER.md`.
11. **Groupmates and AI tools**: a groupmate will continue with ChatGPT (Codex) connected to the GitHub repository. `AGENTS.md` makes Codex follow `CLAUDE.md`; `docs/HANDOVER.md` covers running the tests, pulling before starting and pushing small changes often.

Validation for 0.6.4: full Playwright suite passed on laptop and phone (82 passed, 2 intentional skips, no failures). Reviewed all 164 screenshots and confirmed the refreshed local preview on Level 2. No deployment or push performed; awaiting user preview review.


### All UI emoji replaced with graphic icons (21 October 2026, version 0.6.5)
- The user accepted 0.6.4, requested replacing every remaining emoji with a relevant graphic icon, and requested a complete placeholder inventory. This visual instruction supersedes the earlier emoji styling rule; no lesson wording changes or new features were requested.
- Added a shared set of 71 hand-drawn SVG graphics with 75 symbol mappings under assets/icons/, registered in config.js. Navigation, route and note icons, confidence and recovery faces, tips, status banners, image failure fallbacks, modal buttons, Listen/Stop and the browser favicon now use graphical assets. The accepted generated term and learning artwork retains its 2.5x sizing. New control icons retain compact footprints to keep phone buttons readable.
- A shared HTML renderer replaces UI symbols in text nodes before inserting each screen; it excludes textarea values and marked student report answers. Teacher confidence summaries have explicit accessible labels. No dependencies or publishing whitelist changes are needed.
- Placeholder audit: one unfinished About Stylez content card; all 23 mapped artwork files exist; 11 nonempty input/textarea hints are intentional; the Level 4 opening instruction remains provisional until Suzzie's Gem's opening behavior is confirmed. The local preview class is demo data. Exact inventory supplied in the chat workspace's application-placeholders.md.
- No push or deployment: the user must see the local preview after this change.

Validation for 0.6.5: full suite 82 passed and 2 intentional skips; final focused run 17 passed and 1 intentional skip, covering the complete UI emoji audit, Listen/Stop, layouts, all teacher screens and the new student-answer preservation check at both widths. All 71 SVG symbols rendered with nonempty bounds. Reviewed all 164 app screenshots and the complete graphic library: consistent shapes and spacing, visible confidence states, unclipped artwork, no horizontal overflow; existing contrast, control-label and tap-target checks passed. Local Level 4 preview refreshed for user review.


### Vibrant badges and Suzzie confirmation (21 October 2026, version 0.6.6)
- The user requested more colourful badges while keeping the existing graphic style and symbols. Regenerated five transparent PNGs as sibling assets with distinct vibrant palettes, preserving their exact names, circular medallions, ribbons and central symbols. Service Scholar keeps its cap and bell, with no book. Badge display sizes and earned/locked behaviour are unchanged.
- The supplied Suzzie link is https://gemini.google.com/gem/52ae797badcf?usp=sharing. Its visible introduction identifies Suzzie as the customer in a fictional clothes shop and explicitly invites the student to start by welcoming her. Confirmed that the current Level 4 opening instruction fits this introduction, and updated the app's link to the supplied Gem. No message was sent to the Gem and its instructions were not edited.
- Extracted the 11 form hints for the user. Drafted simple Singapore classroom store details in docs/stylez-proposed-store-profile.md. These are proposed fictional facts, not confirmed Gem knowledge; they are not inserted into the About Stylez card or the Gem pending content agreement. The explicit placeholder remains accurate.
- Badge changes require local preview review before publishing. No push or deployment is authorised for this new edit by the earlier publishing request.

Validation for 0.6.6: 84 Playwright checks passed at 1280px and 360px, with 2 intentional skips and no failures. All five regenerated PNGs have genuine alpha transparency and visible badge content inside the canvas. Reviewed all 164 app screenshots, the five full-size assets and the side-by-side gallery: exact badge lettering, consistent display sizes, full ribbons, readable labels and no layout overflow. Existing contrast, tap-target, progression, saving and offline checks passed. Local home preview opened on the badge shelf; version 0.6.6 remains unpublished.

### Completion Champion badge (21 October 2026, version 0.6.7)
- User requested removing the number 6 from the final trophy and renaming its ribbon to Completion Champion. Edited the vibrant badge with built-in image generation, preserving the style and colours, and saved a sibling asset. Updated the shelf, completion popup, report name and accessible image label. Other chapter wording remains unchanged. Local preview only; no publication.

Validation for 0.6.7: 32 relevant Playwright checks passed at desktop and phone widths, with 2 intentional skips. Reviewed the updated badge and five-badge gallery plus all 164 screenshot views through contact sheets: no number on the trophy, exact Completion Champion lettering and labels, full ribbon, unchanged sizing and no overflow. Local preview opened at the badge shelf; not published.


### Stylez source document reference (21 October 2026, version 0.6.8)
- User supplied Stylez_Customer_Service_Roleplay_Practice_Tool.docx and requested a 2–3 sentence About Stylez introduction plus one button to view the remaining store information.
- Replaced the explicit placeholder with a two-sentence summary and View all Stylez information. The linked #stylez page contains all 17 business-information rows from Section 2 of the supplied document, grouped into overview, prices, promotions, exchanges, and payment/delivery/support. Values are copied exactly. Back to Level 4 returns to the roleplay without changing the completion tick or progression.
- The supplied document supersedes the earlier fictional proposal. Its actual facts include sizes XS to XL, Basic T-shirts $18, jeans $39, hoodies $35, two Basic T-shirts for $30, membership and first-online-order discounts, and free delivery from $60. No earlier invented facts are used. Teacher-facing design notes and sample roleplay answers are not store-reference content.
- The Word document is read-only; it is not modified or uploaded. No storyboard edits, dependencies or backend changes. This update remains a local preview pending user review.

Validation for 0.6.8: 22 relevant checks passed with 2 intentional skips; final complete-screen accessibility audit passed 5 checks with 1 intentional skip, including the new reference route at both widths and direct reload. Final flow/layout check passed twice after improving return-button spacing. Tests assert all 17 exact source values, button navigation, return to Level 4 and unchanged tick/progression. Visually inspected the new reference page and About Stylez card at desktop and 360px: readable wrapped facts, consistent card spacing, no clipping or sideways scroll, and one clearly labelled button. Local preview opened and the information/return flow verified. No publication.


### Password-protected progress reset (21 October 2026, version 0.6.9)
- User requested a footer Reset progress button beside Teacher Mode, protected by a case-insensitive password supplied privately, and authorised pushing as soon as ready. The button is disabled before a student logs in.
- Reset targets only the current class/register student and clears all answers, attempts, read positions, completed levels, badges and the device's teacher unlock. Other student records and classes remain intact. A password dialog identifies the target, explains permanence and allows cancellation.
- The password is checked on the Apps Script server using the new RESET_CODE Script Property; it is never embedded in frontend code or committed. Teacher Mode authentication and reset authentication have separate wrong-attempt lockouts.
- Successful reset removes this student's queued saves and typing timer, records a strictly newer cleared marker and rejects delayed pre-reset saves/loads. Failure preserves browser progress and displays an actionable message. Reset requires an online server confirmation.
- Backend publication requires pasting Code.gs into the existing Apps Script project, setting RESET_CODE privately and deploying a new version at the same URL. A Vercel push alone cannot activate the backend action.

Validation for 0.6.9: the full suite passed 88 checks with 2 intentional skips and 2 failures caused solely by the old footer version assertion. Updated that assertion and reran all shell, reset and complete-screen accessibility tests: 22 passed, 2 intentional skips, no failures. This covers all 94 current checks across the runs, including 8 reset checks. Verified wrong passwords, both letter cases, cancellation, keyboard focus, server clearing, reload, resuming and saving again, stale save rejection, rapid successive resets, independent lockouts, offline preservation, missing backend setup and other students remaining unchanged. Reviewed the reset dialog at full desktop/360px size, all 170 stored screenshot views through contact sheets, and the local report footer/dialog: aligned controls, readable spacing and contrast, 44px controls, no clipped graphics or sideways overflow. The user confirmed Dan must update Apps Script; the website can publish now but live reset remains pending that separate backend activation. No production student records were reset during testing.


### Matching footer controls and passcodes (21 October 2026, version 0.6.10)
- User requested the same case-insensitive passcode for every protected action, Reset progress styled like Teacher Mode, and immediate push after checking.
- Reset progress is now an underlined text control with the same shared typography, padding, minimum 44px height and colour as Teacher Mode. It remains a button for the action and stays disabled when no student is signed in.
- Both server authentication paths already ignore case and surrounding spaces. The local preview uses the newly agreed shared value only through runtime environment variables; no passcode is stored in source. Dan still needs to set both TEACHER_CODE and RESET_CODE in the live Apps Script properties and deploy the reset action if not done. Instructions added to docs/apps-script-setup.md.

Validation for 0.6.10: 24 relevant checks passed with 2 intentional skips at 1280px and 360px, covering the complete student/teacher accessibility audit, footer shell, password-protected resets and case-insensitive Teacher Mode. Runtime checks accepted lower, upper and mixed case for both requested local passcodes without resetting any preview progress. Inspected all 88 updated screenshot footer regions, plus the visible local report: matching text links, aligned baseline, consistent padding, 44px minimum controls, readable contrast and no overflow. Local preview opened at the report footer. Live passcode changes remain for Dan in Script Properties; source contains no passcode values.


### Product knowledge picture examples (21 October 2026, version 0.6.11)
- User requested all five Good product knowledge cards open one AI-generated illustration each, featuring the existing Nexora staff member explaining the selected topic. This explicitly authorises the new optional examples; original lesson labels and progression stay unchanged.
- Each complete card is a keyboard-accessible button opening a dialog with a relevant picture and a short fictional spoken example in real selectable text. Close and Escape return focus to the card. Illustrations are labelled as AI-generated fictional examples; no real phone specifications, prices or warranty promises are invented.
- Five generated sibling assets use the existing Nexora shop/characters as the reference and are registered in the shared config image map. The accepted N02 overview remains. No dependencies, backend changes or storyboard edits. Preview required after this change; no new publication request has been made for this feature.

Validation for 0.6.11: 40 relevant checks passed with 2 intentional skips across Level 1/2 progression, saved work, speech controls, shell/image loading, all-screen accessibility and new popup checks. Initial image-map assertions needed the five new image IDs; the corrected inventory and all popup tests passed on rerun (13 passed, 1 intentional skip). Confirmed all 28 mapped assets load. Tests open every correct image on desktop and phone, verify one image per dialog, real explanatory text, Enter/Tab/Escape/Close behaviour, returned focus, unchanged complete record, no overflow, no ampersands and accessible failed-image fallback. Inspected all five generated artworks, all ten popup viewports and the two complete card layouts: consistent characters, relevant teaching actions, unclipped images, readable captions and accessible controls. Local Level 2 preview is open for review. No push or deployment. Prompt set and saved asset paths are recorded in the chat workspace's product-knowledge-artwork.md.


### Suitability illustration (22 October 2026, version 0.6.12)
- User requested a generated illustration directly below the Presenting product information: suitability header. Added one new Nexora scene linking the customer's photo-taking interest to the phone's camera, registered in the shared image map with descriptive alt text. Original explanatory text stays intact below the image. Uses the existing illustration style and responsive image treatment, without new dependencies or backend changes. Local preview only; not published.

- While reviewing this update, the user requested the returns introduction read: “Many businesses also set clear rules for returns, such as a time limit and needing the receipt. For example, Uniqlo, as shown below.” Updated that sentence and its existing wording assertion. The supplied screenshot and reflection question stay unchanged.


### Teacher lesson preview and complete learning answers (22 October 2026, version 0.6.13)
- User requested teacher access to all stages without completing activities and every saved answer in the learning report. Added five direct teacher lesson links after authenticated sign-in. Each lesson shows all its steps and parts together, including all eight service-recovery steps, without progression gates.
- Teacher lesson rendering uses a temporary empty record synchronously and restores the real student record in a finally block. Activity controls are disabled and are not wired; listening, image examples, external resources and navigation remain available. No student identity, answers, completion or save queue is changed by preview. Authentication is held in memory; direct preview URLs require teacher sign-in.
- The learning report retains its summary and adds all five levels' written answers, both optional reflections, chatbot completion ticks, all selected answers, first/second attempts and confidence responses. Unanswered items are labelled. Draft selections are included; legacy attempt-only records fall back to their latest saved attempt. Student text is escaped and graphics conversion is excluded from answer content. No backend changes or dependencies.
- Includes the pending suitability image and requested Uniqlo introduction. Local preview only, pending review.

Validation for 0.6.13 and pending content edits: full suite 102 passed, 2 intentional skips, no failures at laptop and phone widths. Additional shared accessibility audit passed all five new teacher preview routes and the expanded learning report at 1280px and 360px (contrast, names, duplicate IDs, tap targets and overflow). Six new regression cases verify teacher authentication, every lesson part being visible, all eight recovery steps, disabled activities, zero student saves or changes, unchanged student locks, all 27 saved response fields including drafts and retry fallback, escaped text and preserved student-written emoji. Visually reviewed all 12 new teacher/report screenshot views and full-size answer-card crops, plus the suitability illustration and both revised sections at both widths: consistent cards, readable wrapping/spacing, no image stretching or sideways scrolling. Confirmed the suitability image sits between its heading and original paragraph; Uniqlo wording matches the user's request. Local authenticated teacher preview opened for review. No push or deployment.


### Published baseline and unpublished speech bubbles (22 October 2026, version 0.6.14 preview)
- User explicitly authorised publishing all work through 0.6.13, then requested the five View example illustrations include the staff dialogue inside the graphics, removing the repeated bottom captions. User explicitly prohibited publishing this new revision until review.
- Published commits 515b67c and 9d9bf09; Vercel reported successful deployment of 9d9bf09 and production app.js/config.js/styles.css matched that reviewed baseline exactly before further edits.
- Edited five sibling speech-bubble assets with built-in image generation, preserving their individual Nexora demonstrations. The visible modal now contains the graphic and Close button only. A screen-reader transcript remains, and becomes visible if the image cannot load. No new lesson wording, dependencies, backend changes or publishing whitelist changes. This revision remains local only.

Validation: 18 checks passed, with 2 intentional skips, covering phone and laptop layouts, all five popups, image fallback, keyboard closing, progress preservation and whole-app accessibility checks. Reviewed all five generated graphics and ten popup screenshots. Local teacher preview opened for review. This revision remains unpublished.

- Care-image refinement: user requested a smaller speech bubble and exact wording “you may use a protective case and wipe the screen with a soft, dry cloth to maintain its condition.”. Updated the care graphic and its accessible/fallback transcript together. Remains unpublished for review.

- Further bubble refinement: user requested smaller bubbles for price, unique selling points, features and warranty, matching the care example. Warranty wording updated verbatim to “Please keep your receipt as proof of purchase for warranty and exchanges. Let me explain what the warranty covers and how to get help after you purchase.”, including the accessible transcript. The four illustrations are edited with built-in image generation; publication remains on hold for user review.

Validation of smaller-bubble refinements: all 4 product-example tests passed at phone and laptop widths, including failed-image transcript and unchanged progress. Inspected all four full-size images and popup screenshots, with exact warranty wording, unclipped teaching scenes and smaller speech bubbles. Local warranty popup opened for user review; no publication.

- Care bubble correction: user requested capital Y in “You may use…”. Updated the image and accessible/fallback transcript; local review only, unpublished.

Publication authorised by user after capital-Y correction. Final release checks: 18 passed, 2 intentional skips at phone and laptop widths. All five speech-bubble assets and accessible transcripts are included in version 0.6.14.
