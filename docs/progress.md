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

### Student-specific Unlock (23 October 2026, version 0.6.15 preview)
- User requested an Unlock control beside Reset progress with the agreed shared passcode, ignoring case, and a student-profile selector for selected levels or all levels. This explicitly authorises the new access feature. Uses existing TEACHER_CODE property; no password is embedded or committed.
- The footer control is available before student login. Passcode authentication precedes class/profile selection. Classes, students and level checkboxes start blank. Select all levels fills the checkboxes; one explicit Unlock selected levels action saves the grants. No active student identity switch.
- Grants are stored with the selected student's server record under unlockedLevels. The authenticated backend action changes only grants, preserves existing answers/attempts/completion, and validates every requested level. Ordinary save merging takes grants exclusively from stored server data, preventing forged grants and preserving grants when stale/offline saves arrive. Reset clears grants with the record. Other students are unaffected.
- Granted levels open all their tabs and reading sections, including the eight recovery steps, without completing prerequisite questions. Activities and completion rules remain intact, so no automatic badges or completed levels. Access follows the student on login/refresh across devices.
- No dependencies or storyboard edits. Apps Script must be updated and its existing deployment redeployed by Dan; setup instructions added. Local preview only pending user review.

Validation for 0.6.15: full suite passed 106 checks with 2 intentional skips. After a class-loading race fix and matching footer styling, final feature/shell checks passed 15 with 1 intentional skip; all six unlock checks pass, covering password case, wrong code, input validation, forged/stale saves, selected and all grants, second-device access, unchanged answers/completion, reset clearing, missing backend and failed network. Shared accessibility audits found no problems in password, selector and all-selected states at 1280px and 360px. Visually inspected desktop and phone dialog states: clear labels, 44px rows/buttons, readable wrapping, matching footer links, no sideways overflow; long forms scroll within the dialog. Local preview authenticated with the agreed runtime passcode and left on a sample profile with nothing selected. No production records changed and no push/deployment performed.

### Named registered student profiles (23 October 2026, version 0.6.16 preview)
- User explicitly requested collecting student names and tying them to progress and Unlock/Reset selection. This supersedes the previous class/register-only naming restriction for this feature. Class plus register number remains the stable record key; entering a name does not create a second identity or replace progress.
- Added an empty Your name field at the top of registration, required before Start. The home page has a saved editable name field so existing students can add their names. Registration immediately queues the named profile for saving. Names merge with timestamps, sync with progress, and appear in the header, learning report, teacher student list/full report and CSV. All user text is escaped.
- Unlock and Reset use actual saved registered profiles, displaying name plus register number within the selected class. No invented register-number options. Legacy profiles display a name-not-added label until updated. Duplicate names remain distinct by register number. New protected profileClasses/profileList actions return only class lists and minimal profile identity/access information, not answers. They use TEACHER_CODE for Unlock and RESET_CODE for Reset, with existing case-insensitive checks.
- Reset is now available before login: authenticate, select a registered student, then confirm the named target. Clears only that student's progress/grants/answers, keeps their registered name, and leaves other profiles and the current login unchanged. Reset epochs still reject delayed pre-reset saves. Server responses and other-device reloads preserve the surviving name.
- Local preview only. The existing Apps Script deployment needs the updated Code.gs; no new properties or schema columns are needed. No live student data was changed.

Validation for 0.6.16: complete 114-case run passed 104 with 2 intentional skips; the 8 failures were old name/header/CSV expectations and a save waiter that caught the new registration save before the briefing agreement. Updated those expectations and the save predicate: all 12 affected registration/report/profile checks passed. Final 18 profile/reset/unlock checks passed at 1280px and 360px after visual refinements. Together these cover all 112 runnable cases. Shared accessibility audits found no issues in registration, named home, Unlock and Reset at either width. Reviewed the eight new preview states, name report and reset confirmation screens: empty initial fields, readable names, wrapping full identity, consistent controls and no sideways overflow. Fixed an author-style override of the hidden Select all button in Reset mode. The local preview is left at the home-page name field. Local demo registration only; no live names or student work touched, and nothing published.

### Lock saved names (23 October 2026, version 0.6.17 preview)
- User requested that students cannot edit a name after saving. Named home profiles now show a read-only name and no Save name control. Existing nameless profiles can save once; the control immediately locks even while waiting to sync.
- Client and server profile merging keep the first stored name. Ordinary saves cannot rename it, even with a newer timestamp. Login with a different name does not change the record; students must enter the saved name to continue. Names remain locked after progress reset. Existing named profiles are also locked. No name-change admin feature was added.
- Validation: 27 relevant checks passed with 1 intentional skip; final 8 profile/merge checks passed on laptop and phone, including direct rename attempts, later-login attempts, legacy first save, reload and reset. Accessibility audits found no issues at either width. Inspected locked-name screenshots: full name visible, clear saved/locked message, no edit button and no overflow. Local preview refreshed for review. No push or deployment. Apps Script must receive the updated Code.gs for live server enforcement.

### Class before name (23 October 2026, version 0.6.18 preview)
- User requested choosing class before entering name. Grouped registration into one card at the top: class, name, register number, Start. Class stays unselected initially; saved-name locking and progress identity are unchanged. Local preview only.

Validation: 15 shell/profile checks passed with 1 intentional skip at phone and laptop widths. Confirmed field order class, name, register number; no accessibility audit issues at either width. Reviewed both screenshots for spacing, readable labels and no overflow. Opened a separate local registration preview without changing the existing student session. Unpublished.

### Teacher-managed class visibility (23 October 2026, version 0.6.19 preview)
- User requested teachers choose which classes students can select. Added persisted Show to students checkboxes in Teacher Mode Classes. Existing/new classes are visible by default; unchecked classes disappear from the public class-list endpoint and fresh login choices.
- Added teacher-authenticated setClassVisibility, strict boolean/class validation and server-lock/cache invalidation. The script manages HIDDEN_CLASSES in Script Properties without schema changes. Extended the local PropertiesService mock with persistent get/set and test reset support; no credentials are written by this feature.
- Hidden classes remain in all teacher class/result/profile selectors. Backend student identity validation accepts hidden existing classes, preserving ongoing load/save and answers. Hiding does not clear or remove any profile. Re-added classes start visible. Fresh registration reloads update a cached dropdown even on the #home route.
- Local preview only, pending review. Dan must deploy the updated Code.gs to activate live visibility controls. No live class settings or student records changed.

Validation: 17 relevant shell/unlock/visibility checks passed with 1 intentional skip, then all 8 class-management and full-screen accessibility checks passed at laptop/phone widths. Final 4 visibility/empty-list checks passed after aligning row controls and clarifying the no-visible-classes message. Verified wrong codes/invalid flags, hide/show, no visible classes, reload persistence, existing hidden-class load/save, protected profile selectors and unchanged progress. Reviewed both class-list layouts: aligned controls, 44px targets, wrapping rows on phone, no clipping or sideways overflow. Local Teacher Mode preview opened for review; no publication.

### Welcome, wording and layout refinements (23 October 2026, version 0.6.20 preview)
- User requested six refinements in succession; all are included in one unpublished preview. Level 3 Q2 line R now confirms the purchase, summarises the product/collection, thanks the customer and wishes them a good day, making positive closure clear. Question labels, answer key and feedback are unchanged.
- Added 20px spacing between the shared Reset/Unlock passcode input and Continue button, including space for its focus outline.
- Generated a vibrant 3:1 welcome banner matching the Nexora illustration style. It appears above registration and above the home-page name field, without cropping or stretching. Registered in the shared image map with accessible alt text. The original source artwork is preserved.
- Moved the completed-module message and My learning report button together below the badges on the home page. Report eligibility and navigation are unchanged.
- At the user's explicit wording request, the four key-term definitions now start Refers, Means, Occurs and A process, avoiding repeating their adjacent headings. The rest of each definition and the full Level 2 textbook notes remain unchanged. This supersedes the earlier verbatim term-card wording restriction for these four cards; no storyboard edits.
- Edited only the supplied breakdown/recovery comic to give both characters warmer tanned skin, preserving its dialogue and teaching content. Saved a sibling asset and updated C04. Other character artwork is unchanged. Both artworks use built-in image generation. No dependencies or backend changes. User preview required; no publication.

- Final banner wording requested by the user: “Welcome to your journey on Customer Service!” Edited the generated banner and its alt text to match.
Validation for 0.6.20: 23 relevant shell/profile/reset checks passed with 1 intentional skip, then 16 wording/Level 3/Level 5/report/full-screen accessibility checks passed at laptop and phone widths. Final 4 shell/image checks passed after the final banner wording and C04 asset update; all 30 image-map assets load and accessible fallback works. Measured 20px between passcode input and Continue in both dialogs at both widths. Verified completed report begins below badges. Audits found no issues in registration, completed home, both dialogs and terms. Reviewed both full-size generated artworks and all sixteen changed section screenshots: exact banner lettering, readable shortened terms, clear closing wording, tanned skin with preserved comic text, uncropped banner and no overflow. Local preview opened; no publication. Artwork prompts and saved paths are in the chat workspace oct23-artwork-notes.md.

### Register dropdown publication (24 October 2026, version 0.6.21)
- User authorised publishing all completed previews. Register number now uses an initially blank dropdown with exactly 1–40. The class selector remains until the user supplies the fixed class name requested; no student records are migrated or reassigned. Backend support for older register numbers is retained for existing teacher records. Includes unpublished 0.6.20 refinements.


### Image sizes, Read aloud, report second try, approach titles, Stylez line (23 October 2026, version 0.6.20)
- **Images resized and compressed** with the same file names and transparency: badges 256px wide; term and level icons 160px; Alex and Suzzie portraits (N04, N05; drawn at 84 to 112px) 256px; example and comic pictures (C01 to C04, N01 to N03, `product-suitability-camera.png`, the five `product-knowledge-*-speech.png`) 900px. R01 to R03 were already under 900px and small, so they are unchanged. PNGs with transparency stay transparent (palette-compressed); JPGs re-encoded at quality 82. `assets/img/` went from 40.1 MB (41 files) to 2.6 MB (29 files); the largest file is `product-knowledge-care-speech.png` at 295 KB, loaded only when its pop-up opens. Every image is still drawn no wider than its file (widest: 868px for the 900px pictures, 716px for the product-knowledge pop-up, 160px for the 256px badges, 72px for the 160px icons).
- **Deleted 12 unused images**, each checked against `config.js`, `app.js`, `styles.css`, `index.html` and the tests (no image path is built in code): `product-knowledge-{care,price,selling-point,warranty,features}.png`, `badge-service-scholar-v2.png`, `badge-chapter-6-champion-vibrant.png`, `badge-chapter-6-champion.png`, and the old non-vibrant `badge-{story-sharer,service-star,service-scholar,service-spotter}.png`.
- **Read-aloud button** is labelled "🔊 Read aloud", and "⏹ Stop" while reading (it was "Listen", the same word as path Step 1). The path step label "Listen" is unchanged.
- **Learning report, second try:** "Not needed: right on the first try" when the first try was right and there is no second try; "Not attempted yet" when the first try was wrong (or not made) and there is no second try yet. A second try still shows "{answer} (right)" or "{answer} (wrong)".
- **Approach card titles** have no colon: "1. Greeting Approach", "2. Service Approach", "3. Product Approach" (`docs/storyboard.md` updated to match).
- **Stylez promotions line** reads "Promotions cannot be combined." (was "For this practice tool, promotions cannot be combined."; not in the storyboard).

Validation: all 116 Playwright checks passed at 1280px and 360px (2 skipped by design), including the full accessibility, contrast, ampersand and sideways-scroll check of every screen. Visual check: home page badges and icons, 4 key terms icons, every Level 2 tab, the product-knowledge pop-up, Levels 3 and 4 portraits and the learning report at both widths; close-ups at actual size of a comic and a pop-up picture. No image is blurry, stretched or cut off.

### Release verification — 24 October 2026
Merged Dan’s image compression, badge transparency, Read aloud and report refinements with the reviewed welcome artwork, lesson wording, home layout and register-number dropdown changes. Full Playwright suite: 116 passed, 2 intentional skips across laptop and phone. Updated old wording expectations and test register numbers to the approved 1–40 range. Class selector remains until the user specifies the fixed class name.

### Home profile register number (24 October 2026, version 0.6.22 preview)
- Added a 1–40 register-number dropdown directly below the home name field, showing the active profile number. It uses the same class/register identity as Reset progress and Unlock. Both saved name and register number are locked. Legacy numbers above 40 remain visible for their existing profiles.
- An occupied class/register number rejects a different name with “This register number has already been registered to a student profile.” Returning students may use their saved name. No records or answers are moved, and no backend changes are required.
- Validation: 59 related checks passed (one intentional skip); after the locking refinement, all eight profile checks passed at laptop and phone widths. Student-screen accessibility and layout audits passed at both widths. Reviewed both final form screenshots: labels aligned, clear spacing, readable text, 44px controls and no sideways overflow. Local preview opened for review; not published.

### Teacher-selected registration class (24 October 2026, version 0.6.23 preview)
- User requested grey locked name fields and one teacher-selected registration class. Teacher class controls now select one class at a time; the student sign-in header displays it, without a student class selector. Register options 1–40 belong to each class separately. Registration rechecks the current class before proceeding; existing saved profiles retain their class and progress. The backend class visibility action now selects one class atomically. Dan must redeploy Code.gs before live use.

### Class field and Stylez chatbot (24 October 2026, version 0.6.24 preview)
- Added a grey, readonly “Your class” field above the name at registration and on the saved profile. New registrations show the teacher-selected class; saved profiles retain their original class. Updated the Stylez/Suzzie chatbot URL to the user-supplied Gemini sharing link.
- Final verification: complete suite passed 120 checks at 1280px and 360px, with two intentional skips. Includes independent registration under two classes at the same register number, locked-field styling, occupied-register rejection, correct chatbot href, all student and teacher accessibility/contrast/layout checks, profile lists, reset and unlock. Reviewed final registration and profile screenshots at both widths: clear spacing, grey readonly fields, no clipped controls or sideways overflow. Local preview opened; not published.

### Header class label (24 October 2026, version 0.6.25 preview)
- Removed the added “Class” prefix from the student header chips; show the saved class name exactly as entered.

### Reset releases student identity (24 October 2026, version 0.6.26 preview)
- User requested reset also clear the name and free the register number. Reset now leaves only the server reset marker, removes the profile from Reset and Unlock lists, and returns an affected active device to registration. Students can register again with any available number 1–40 in the teacher-selected class. Stale saves remain blocked, including on another device. Dan must redeploy Code.gs for live use.
- Verification: full suite passed 120 checks (two intentional skips) at laptop and phone widths. Reset clears the registered identity, permits a new name at the same number, leaves other profiles intact, and rejects stale saves. Reviewed the cleared registration form on both widths. Backend responses now report version 0.6.26 for deployment verification.

### Nexora chatbot link (26 October 2026, version 0.6.27 preview)
- Updated Alex/Nexora chatbot to the Gemini sharing URL supplied by the user. Local preview only; no backend changes required.
- Replaced the preview Nexora link with the user’s newer Gemini share link ending in 11oY7mUjz7cw16a6GfL5zeeKiwxcCLbz8.

### Shared Teacher Mode reset (26 October 2026, version 0.6.28 preview)
- “Reset this device” now opens the exact same reset-passcode, class/profile selection and confirmation flow as footer “Reset progress”. Removed the old device-only reset logic. Both entry points clear the selected server profile, name, answers, badges and progress, freeing its register number. Requires the existing 0.6.26 Apps Script backend; no additional backend change.

### Nexora welcome video (26 October 2026, version 0.6.29 preview)
- User approved adding the supplied 45-second video after “Why does quality customer service matter?” and before employee skills in Level 2. Added the heading “Watch: A better welcome at Nexora”, the approved viewing prompt and optional discussion questions. Native player supports play, pause and replay with no autoplay; original video retained, poster and video mapped in config. Existing lesson progression and questions unchanged. Video assets are covered by the existing assets publication whitelist. Local preview only.

### Required saved reflections (26 October 2026, version 0.6.30 preview)
- All three Think about it sections now have text boxes and Save buttons; removed “optional”. Continue, forward tabs, Next and Finish Level 2 require nonblank saved reflections. Editing after Save requires saving again. A modal asks students to complete all questions and save before moving on. Video response is included in learning reports, teacher reports and CSV. Teacher preview remains view-only and opens all sections.
- Release verification: 122 regression checks passed; the two older unlock-flow expectations were updated for compulsory reflections and both then passed in a 17-check focused rerun (one intentional skip). Video playback, required saved text, unsaved edits, forward navigation, finish, persistence, reports/CSV, contrast and student/teacher layouts checked at 1280px and 360px. Original video and responsive player reviewed. No additional Apps Script changes required for video/reflections.

### Privacy and lesson corrections (26 October 2026, version 0.6.31 preview)
- Student load and save require the registered name on the server; mismatches and missing names return no record. Browser calls send the name using POST, including queued saves and unload saves. Existing unnamed server profiles fail closed and remain available to authenticated teachers for verified recovery; rollout guidance is in apps-script-setup.md. Apps Script must be redeployed before this protection is live.
- Level 1 requires 20 trimmed characters in all three boxes, removes Submit anyway, and reopens previously submitted incomplete answers without discarding the existing text. Level 2 uses the same minimum with specific too-short guidance and Save enforcement.
- Level 5 numbers its six questions Q1–Q6 in lessons, reports and CSV while preserving existing saved-answer keys. Generic popups close with Escape and restore focus. MCQ accessible names contain the option letter once.
- Added default English WebVTT captions and an expandable transcript for the Nexora video; viewing prompt now explicitly describes one video showing poor and good service. Transcript summary meets the 44px touch-target rule.
- Clarified the learner/customer roles at Stylez. Prepared clean Suzzie setup instructions for the user to apply and re-share; replacement share URL is pending, so the old link remains unchanged.
- Verification: 128 checks passed across 1280px and 360px, with two intentional skips. Six additional focused checks passed for denied reads/writes, actual caption loading/playback, minimum-length errors, option names and recovery of previously locked blank Level 1 responses. Updated local teacher preview opened and visually reviewed. Not published; pending fresh Suzzie link and Apps Script deployment.

- Follow-up: English captions are off by default at the user’s request; students may enable them in the player. The expandable transcript is retained. Confirmed the preview player starts with caption mode disabled. Automated rerun could not launch because the temporary test browser is no longer installed; the earlier caption-playback checks passed before this default-setting change.

- Follow-up: replaced Suzzie’s chatbot URL with the user’s fresh share ending in 1D1h2fvX3L6KnSJHjCGQSm1ZkVWUnu8E3. Renamed chatbot buttons to “Open chat with Alex (new tab)” and “Open chat with Suzzie (new tab)”. Local preview only. The external bot’s conversation behaviour has not been re-tested.

- Production preflight: Google still reports version 1 and returns unknown_action for POST load. Added a GET fallback only for unknown_action, carrying the name in both requests. Updated backends still enforce name checks; identity-denial responses never fall back. This allows the approved frontend release without interrupting legacy logins, but the live privacy fix remains pending Google deployment.
- Release checks: final 14 focused tests passed at laptop and phone widths after restoring the temporary browser, including captions off by default and enabled playback, fresh Suzzie URL and button labels, required answers, old-submission recovery and legacy-backend compatibility. Earlier complete suite passed 128 checks with two intentional skips. Approved for publication by the user.

### Guided journey redesign (26 October 2026, version 0.6.32 preview)
- User authorised a five-stage model: Approach (blue), Present (orange), Close (green), Support (teal), Recovery (purple). Added warranty, repairs and multi-channel support, consistent table/dropdown/checklist colours and a generated five-panel comic. Kept historical quiz option values: recovery remains value 3, support is new value 4, with display order 0,1,2,4,3. Existing answers retain their meaning.
- Replaced the growing student Level 2 page with 21 single-card screens, Back/Next and progress, including a separate card for each recovery step. Teacher preview still opens every section. Next automatically saves filled reflections; manual Save is removed from these sections. Existing 20-character minimum remains for Level 1 and Level 2. No empty-answer submission bypass exists. Sticky clearances and route-return focus now account for the header.
- Both chatbot activities require a valid HTTPS Gemini share URL, opening it for review and an explicit student confirmation before enabling the finished-chat checkbox. Changing the URL clears both confirmation and finished state. User chose this over server-side URL fetching; the application cannot independently guarantee the conversation is publicly accessible. Links and the new Suzzie stage checklist are included in reports/CSV.
- Added Q1 “Which stages did you do?” before Suzzie reflections (now Q2/Q3), including Support to match the revised model; choices start empty and at least one is required. Added realistic basic T-shirt colours: black, white, navy blue, grey. These new colours must also be added to the external Suzzie Gemini setup by its owner if the bot is to use them.
- Level 5 open-text explanation stays editable before retry, empty explanations block retry/Next, marked answers can be revised before Check again, and first attempts remain preserved. Recovery expressions progress red to green, with an open-mouth smile at Step 8; confidence choices have four distinct drawn expressions. Stage/recovery icons are distinct within their sequences.
- Read aloud wraps/highlights individual words using browser speech-boundary events, with estimated word timing on voices that do not emit boundaries. Stop/navigation clears highlights. Completion Champion shows brief confetti, disabled when reduced motion is requested.
- Generated comic with built-in image tool, using existing C02 as reference: five equal colour-coded Nexora panels (Approach, Present, Close, Support, Recovery), preserving characters/style and adding warranty, repair and multi-channel support. Follow-up edit prompt: change only the Support bubble to “Please keep your receipt. We offer warranty, repairs and support in store, by phone and online.” Saved final asset as assets/img/C02-five-stages.png; original image retained. Config map and accessible description updated. Added a separate full-size comic link for phones.
- Verification: new journey interactions passed on laptop and phone; every one of the 21 lesson cards checked for overflow and visible-text ampersands. Product-example tests were moved to their new card position and passed. Profile/reset/class/shell checks passed apart from the intentionally skipped duplicate phone check. Reviewed desktop and phone stage/comic/confidence screenshots; fixed narrow heading wrapping, mobile stage borders and muted face colours. Existing historical navigation/Save-specific tests describe the replaced UI and need corresponding maintenance before treating the old full-suite total as a release check.
- Local review uses an isolated preview database on port 8790, fictional Preview Student in PREVIEW, register 1. No live student records modified. Not published; user review pending.
- Final combined targeted run: 49 checks passed and one duplicate phone check intentionally skipped, covering new journey flows plus registration, classes, reset, profile locking, publication whitelist and product examples. Final generated comic with “Please keep your receipt” inspected and inserted. Local browser preview opened at card 5 of 21 and saved as a review screenshot.

### Compact Level 2 and Home destination (version 0.6.32 follow-up preview)
- User clarified a maximum of ten Level 2 cards. Regrouped all content into ten cards: customer service; why it matters/video; skills and product knowledge; five stages; approaching customers; presenting/support; breakdown/recovery; eight-step recovery practice; poor recovery reflection; returns/exchanges. Recovery steps remain together within one card using Previous step/Next step; reading all eight is required before advancing. Existing answers and old 21-card reading positions migrate to the corresponding compact card.
- Home icon now focuses and scrolls directly to route progress, just below the actual sticky header, as shown in the user’s screenshot. Back to my route still returns to the student’s last stage card. Fixed differing header heights on phones.
- Targeted checks passed on desktop and phone for all ten cards, reflection gates, chat confirmation, retries, evidence, speech, confetti and examples; Home positioning was verified again on both widths after the final offset fix. Preview only; not published.

- Follow-up: removed the separate “Open five-stage comic (new tab)” button at the user’s request. The inline comic remains. Preview only.

- Follow-up: restored all eight service recovery steps together on card 8, with the red-to-green expressions and closing comic. Removed the internal step pager and its progression gate. Level 2 remains ten cards; existing answers and reading position are retained. Preview only.

- Updated the shared Alex/Suzzie link instruction to the user’s exact wording: “Use Share in Gemini and copy the conversation link then paste it below.” Existing link validation and confirmation behaviour remain. Preview only.

### Server conversation-link verification (version 0.6.32 follow-up)
- User replaced the manual link-opening/confirmation workflow with backend checks. Removed “Open link to check” and “I opened this link…” from both bots. Pasting triggers a debounced server check; selecting the finished-chat checkbox checks again. Invalid input produces an “Invalid conversation link” popup and Next stays disabled. Changing the link clears verification and completion. Unavailable/old backends and Google access failures fail closed with a distinct explanation.
- Added Apps Script validateConversationLink, Gemini-only URL allowlist/canonicalisation, name verification, redirect refusal, HTTP/missing-page checks, brief cache and per-profile request limit. Added UrlFetchApp stand-in with injectable responses for tests. Backend version now 0.6.32. Real Google access checks require redeployment and any new external-request authorisation by the owner. No live backend changed.
- Browser preview uses deterministic mock fetch responses; it cannot prove real Google conversation availability/ownership. Generic Google HTML is not conclusive; deployment instructions record this limitation. Preview opened to Suzzie’s simplified link field. Not published.
- Final release follow-up: added 24px spacing between a reflection card and the following Remember this recap, as requested in the Returns and exchanges card.


### Handover to a fresh chat (27 October 2026)
- Since version 0.6.20 (commit 2e4a0f3: images resized, Read aloud button, report second-try wording, approach titles without colons, Stylez promotions line), the groupmate pushed further work up to commit 743ee97 (lesson journey, shared chatbot conversations, Nexora welcome video, student reset and access checks). That work is recorded in the sections above by its author.
- Synced on 27 October: storyboard Section H now says "🔊 Read aloud" (not "Listen") and adds the approach titles without colons, the image size targets and the report's second-try wording; `CLAUDE.md` Images section now states the image size targets.
- **Open:**
  - `docs/storyboard.docx` has not been updated for the Read aloud name, the approach titles without colons, the second-try wording or the image sizes (only the .md was edited). Dan keeps the .docx.
  - **Untracked source files at the repository root**, not used by the app and not committed (about 29 MB): `Nexora Mobile Customer Service #1.docx`, `Nexora_Business_Profile.docx`, `Nexora_Shop_Ep1_Welcome_to_Nexora.mp4`, `service-recovery-8-steps v3.mp4`, and the folder `Nexora Website Ready Images/`. Dan to decide: move them out of the repository folder, add them to `.gitignore`, or commit them. They are not published either way, because `.vercelignore` is a whitelist.
  - The 900px comics fill an 868px column; on high-resolution laptop screens they may look slightly soft. 1200px would fix it, at about a third more file size. Not changed; Dan to decide.
  - Earlier open items (teacher code that is easy to guess, About Stylez wording, live test with a class of 40, Vercel "Blocked" deployments for groupmates' commits) still apply where the sections above have not closed them.

### YouTube videos in Level 2 (27 October 2026, version 0.6.33)
- User requested both Level 2 videos be embedded from YouTube only, with no video files in the repository, so they use none of the Vercel bandwidth. Storyboard 2.2, 2.3 and Section H updated; `docs/storyboard.docx` not edited (Dan updates it separately).
- **Video A, "Watch: A better welcome at Nexora"** (https://youtu.be/_Esvxks4ZjQ): moved from Tab 1 to its own part in Tab 2, directly after the three approaches, the two purposes and C03, with the same heading, instruction and required Think about it box (key `s2.video`, same question, so saved answers, the learning report, Teacher Mode results and the CSV are unchanged). In the student ten-card journey it is now at the end of card 5 "Approaching customers", and that card's Next requires the answer (it was card 2 "Why good service matters"). In the tab structure (used by the teacher preview and the checks) `s2.video` is needed before going on to Tab 3 and before Finish Level 2, instead of before leaving Tab 1. Removed the MP4 player, its transcript box, `assets/video/` (MP4, poster and .vtt captions) and `CONFIG.VIDEOS.nexoraWelcome`.
- **Video B, "Watch: The 8 steps in action"** (https://youtu.be/IWZ4xwI2fF8): directly below the Service Recovery Path and above "Handled well...", part of the block that appears once all 8 stops are shown. The student card shows all 8 steps at once, so there it shows at once; in the step-by-step path it is hidden until Step 8. No reflection box; not required.
- Both are built by one helper (`youtubeVideoHtml` in `app.js`) from `CONFIG.VIDEOS.betterWelcome` and `CONFIG.VIDEOS.serviceRecovery` (`youtubeId` only): a privacy-enhanced `youtube-nocookie.com/embed/<id>?rel=0` iframe with no autoplay, `loading="lazy"`, `allow="encrypted-media; picture-in-picture; fullscreen"`, `allowfullscreen` and `referrerpolicy="strict-origin-when-cross-origin"`, in a 16:9 box with the thin card border and rounded corners, and a small "Video not loading? Watch it on YouTube" link (new tab) underneath. No transcript box. Read aloud skips the iframes and the link.
- Validation: the four video and reflection test files passed all 36 checks at 1280px and 360px (both iframes on youtube-nocookie.com with no autoplay or mute, every agreed attribute, 16:9 box with the card border and no sideways scroll, Video B hidden until Step 8 and shown at once on return, `s2.video` required on card 5, before Tab 3 and before Finish but not when leaving Tab 1, Read aloud skipping the videos, no video files in `assets/`). Full suite: 131 passed, 2 skipped, 29 failed; the failing checks are old tests still written for the Level 2 tabs and earlier wording (four stages, key-term text), which were already failing before this change and are left for later. `slice6-full-check` stops at the old Level 2 tabs, so its contrast and tap-target audit does not reach the new video blocks yet. Visual check in the browser at 1280px and 360px: frame and box correct, YouTube thumbnail and play button load with nothing playing, 40px above each video block, 16px from the link to the Think about it box, no console errors.

### Corrected service recovery video (27 October 2026, version 0.6.34)
- Video B swapped to the corrected upload (https://youtu.be/IWZ4xwI2fF8). Heading, instruction, placement and player settings unchanged.

## Big update from Dan's brief (27 October 2026, version 0.7.0)

`docs/storyboard.md` is out of date since 27 October 2026 (groupmates' changes). For this update the current app is the reference wherever the two differ, and every change is recorded here instead. Student-facing lines that are new in this update are marked ⚑ for Dan to review. The EBS reset and unlock code and the class and name list it shows are unchanged on purpose. No change to `apps-script/Code.gs` (no redeploy needed).

### Part 1: bugs and quick fixes (done)
- **Chat link gate (Levels 3 and 4):** no server check any more (the app never calls `validateConversationLink`; the action stays in `Code.gs` and its own back-end test). Any pasted text containing "gemini" (any case) is accepted. Next unlocks when the box contains "gemini" and the "I have finished…" box is ticked. The tick box saves straight away, whatever is in the link box. If the box has text without "gemini" (or the tick box is ticked with no such text), the line under the box reads "Please paste the link to your Gemini chat. It should contain the word Gemini." The pasted text is still saved as `s3.link` / `s4.link`. `s3.linkVerified` / `s4.linkVerified` are no longer used.
- **Learning report, Look at these again:** "Nothing to look at again. You got everything right on the first try! 🎉" shows only when Level 3 Q2 and Level 5 Q1 and Q2 have all been tried and none was wrong on the first try. While any of them is still untried, "Finish Levels 3 and 5 to see what to look at again." shows (below any lines for items already wrong, which still show).
- **Register numbers 1 to 50:** login dropdown, "Choose a register number from 1 to 50.", the home profile card and the Teacher Mode note ("Each class has register numbers 1 to 50.").
- **Images:** `welcome-customer-service-banner` and `C04-breakdown-to-recovery-tanned` resized to 900px and saved as JPEG (neither had transparency): 2.0 MB and 1.9 MB down to 69 KB and 84 KB. Deleted the unused `C04-breakdown-to-recovery.jpg` and the two old PNGs. The CLAUDE.md Images rule now allows multi-panel comic strips up to 1600px wide, under about 300 KB.
- **CLAUDE.md:** Data and privacy now reads "Students log in with their class, register number and name (agreed by the group). No emails." Source of truth carries the out-of-date note; `docs/storyboard.md` has the note at the top.
- **Level 1:** the subtitle "Think about your own experiences as a customer." now shows once (in the header); the body line is "There are no right or wrong answers."

### Part 2: navigation (done)
- **Home:** once the name is saved, the "Your class / Your name / Register number" card is not shown, so "Your route" sits near the top. Name, class and register number stay in the header chip; "Sharing this device? Switch student" stays. Saving the name redraws the home page without the card.
- **Level 2 Back and Next:** the button row is a bar stuck to the bottom of the screen (`position: sticky`, page background, thin top border and shadow, 44px buttons, safe-area padding), so Next is always in reach. `scroll-padding-bottom` keeps scrolled-to content clear of it.
- **Tap to enlarge** (`zoomImgHtml`, `openZoom`): every Level 2 comic and example picture (C01 to C04, suitability, product knowledge, Foodpanda, returns comic, Uniqlo) is a button that opens the picture full screen with the same alt text, a "✕ Close" button (focused on opening), Esc, or a tap outside to close; focus returns to the picture. On phones a picture wider than the screen opens at up to 2.2 times the screen width (never wider than its file) and scrolls sideways, so speech bubbles are readable. On laptops (768px and wider) pictures are limited to 45% of the screen height, centred, never stretched. If a picture is missing, the placeholder box shows and nothing opens.
  - ⚑ New student-facing text: the small chip on each picture "🔍 Tap to enlarge" (screen readers hear "(tap to enlarge)"), the close button "✕ Close", and the dialog name "Enlarged picture" (screen readers only).
- **Level 4 Stylez store facts:** a fold-out panel "Stylez store facts" (closed at first) directly under "Open chat with Suzzie", holding every fact group that was on the separate page. The separate `#stylez` page and its "View all Stylez information" / "Back to Level 4" buttons are gone (an old `#stylez` link goes to the home page). The short "About Stylez" card stays above.
  - ⚑ New heading: "Stylez store facts".

### Part 3: Level 2 content, back to the syllabus's four stages (done)
- **Four stages everywhere:** Approaching customers / Presenting product information / Closing the customer experience positively / Performing service recovery. "Provide support services" is no longer a stage; its content is card 11 (after-sales support, part of Stage 3). Changed: the Level 2 table, headings, recaps, the Level 3 Q2 dropdowns (options are now values 0 to 3; recovery keeps its old value 3, so old saved answers keep their meaning, and an old "Provide support services" answer, value 4, simply shows as unanswered), the Level 4 stage box and tick boxes (Approach, Present, Close, Recovery), the Level 5 "I can describe the four stages…" line, the home route card ("Short notes on quality customer service, the four stages and service recovery."), the Level 3 and Level 4 recaps, the "Look at these again" lines, the teacher preview and the card labels. Stage colours are now four (blue, orange, green, purple); the teal Support colour is gone.
- **Stage 3 table row:** "Summarise what the customer decided and any next steps, thank the customer, and give good after-sales support (e.g. warranty, repairs, exchanges and refunds)."
- **Four-stage comic:** panel 5 of `C02-five-stages.png` is captioned "5. RECOVERY", so (as instructed) the artwork was not edited and `C02-four-stages.png` was **not** made. A draft join of panels 1, 2, 3 and 5 (same gaps, 1600px) was sent to Dan for review; it still reads "5. RECOVERY". Until Dan decides, card 6 shows the older `C02-four-stages.jpg` that was already in the repository (four panels captioned 1. APPROACHING, 2. PRESENTING, 3. CLOSING, 4. SERVICE RECOVERY), with new alt text describing its panels and speech bubbles. `C02-five-stages.png` is deleted (it is in git history if the join is wanted).
- **Level 3 Q2 line P:** "I'm really sorry your new phone stopped working. Could you tell me when it happened, so I can help you fix it?" Hint: "The officer apologises because something has gone wrong for this customer. Which stage deals with a problem or complaint?" Right: "Correct: apologising and asking about a problem are part of service recovery."
- **Level 4:** "Try to use the four stages from Level 2: approach Suzzie, present product information, close positively (including after-sales support), and if there's a problem, perform service recovery."
- **Level 2 is 15 cards** (`L2_CARDS` in `app.js`; `renderLessonCard` shows one at a time with the sticky Back and Next bar; the teacher preview shows each card as one section). Card labels in the progress line: 1 "4 key terms", 2 "What is customer service?", 3 "Why quality customer service matters", 4 "Skills and qualities", 5 "Good product knowledge", 6 "The four stages", 7 "Stage 1: Approaching customers", 8 "Watch: A better welcome at Nexora", 9 "Quick check", 10 "Stage 2: Presenting product information", 11 "Stage 3: Closing the customer experience positively", 12 "Stage 4: Service breakdown and service recovery", 13 "The 8 service recovery steps", 14 "Real-life example: poor service recovery", 15 "Handling returns". ⚑ The short card labels are new wording (taken from the brief where it gave one).
  - Cards 7, 10, 11 and 12 carry a small coloured "Stage 1" to "Stage 4" label (with the stage icon) above the heading. ⚑ New label text.
  - Card 6 ends with the 📌 "The four stages are approaching customers, presenting product information, closing the customer experience positively and performing service recovery."
  - Card 11 heading "After-sales support", intro "Closing the customer experience positively includes giving good after-sales support, so customers choose your business over competitors.", cards Warranty, Repairs, Multi-channel support (existing text) and the new "Exchanges and refunds: Explain the store's rules for exchanges and refunds.", shown two by two.
  - Card 12: the two definitions, then C04 (moved here from the 8-steps card), then "Handled well, a service breakdown…" (moved here), then "A complaint is a second chance…".
  - Card 13: heading "The 8 service recovery steps" ⚑ (the old heading "The Service Recovery Path" stays as the list's accessible name). Intro "To perform service recovery, follow these 8 steps:" then "Follow Nexora's staff member as he handles a customer whose new phone screen cracked on its own, even though she was using it carefully." The path shows Step 1, then "Show Step N ↓" reveals each step (as originally built); coming back to the card later shows all 8. The 8-steps video appears only after Step 8. Next stays greyed until Step 8 is shown, with the note under the card "Tap Show Step to see all 8 steps." ⚑ New line.
  - Card 14: a small strip of the 8 step labels (1 Listen … 8 Thank) above the question, which now reads "Was this good service recovery? Which of the 8 service recovery steps were missing?" (key `s2.think1`).
  - Card 15: returns content, Uniqlo, `s2.think2`, then 📌 "If a customer is unhappy with a product, you can offer a replacement, an exchange or a refund. Always check the store's return rules first.", then Finish Level 2 (Next on the last card reads "Finish Level 2", same badge).
  - Required reflections stay required on their new cards: `s2.video` on card 8, `s2.think1` on card 14, `s2.think2` on card 15 (and all three before Finish).
  - Saved card positions move over: the 10-card layout (`s2.cardLayout` "compact10") and the older 21-card layout map to the matching card of the new layout ("cards15").
- **4 key terms** (card 1 and the home "Start here: 4 key terms" page, one shared `keyTermsHtml`): each term in plain English with "Example:", then "📝 Exam wording" and the exact textbook definition as a full sentence (the same sentences as the Level 2 definition boxes, e.g. "Customer service refers to what businesses do for their customers so that they are happy and satisfied."). ⚑ "Example:" and "📝 Exam wording" labels.
- **Good product knowledge (card 5):** the five aspects word for word, each in a small card with its icon, its picture and the staff member's line as page text in a speech box (Read aloud reads it). Lines as in the brief (Nexora facts only). Added after the list: "Customers trust staff who know their products, so they buy with confidence and come back again." The tap-a-card pop-up is gone. New picture files `product-knowledge-<aspect>.jpg` (900 × 570): the speech bubble cropped off the top and the leftover bubble tail painted out; alt text updated to describe the pictures. The old `-speech.png` files are deleted.
  - ⚑ The N02 overview picture (labelled callouts) is no longer shown, since the five pictures replace it; the file is deleted (in git history).
  - ⚑ The selling-point picture shows two phones compared by battery life, while the new line is about 24/7 chat support and the trade-in rebate; the features picture shows a large screen and battery, while the line mentions the Spark's battery and dual camera. Dan may want new pictures that match the lines.
- **Quick check (card 9):** "Quick check: which approach is this?" / "Tap one for each." Three lines, each with Greeting / Service / Product buttons, nothing pre-selected. Instant ✓ or ✗: wrong first try shows the hint (the wrong pick is marked ✗ and greyed) and allows one more try; still wrong shows "✗ The answer is {X}: {reason}" with the right option outlined. Not scored, not in the report or Teacher Mode; saved as `s2.qc.<a|b|c>.1` and `.2`. Next shows "Not finished yet" (items named "a)", "b)", "c)") until each item is settled. No Read aloud on this card (it is a question).
  - ⚑ New right-answer reasons (also used in the reveal): a) "Correct: the staff member welcomes a regular customer by name. That is the greeting approach." b) "Correct: the staff member asks a polite question to show they are ready to help. That is the service approach." c) "Correct: the staff member talks about the phone the customer is looking at. That is the product approach."
- **Foodpanda screenshots:** R01 cropped to the complaint and the "oh" and "so sad" replies (the cut-off second message removed); R02 cropped to the food and the "$3.3000000000000003 to say we're sorry." voucher (the foodpanda logo banner removed). Both alt texts still match.
- **Look at these again lines** (report and Level 3 and 5 summaries): P "Performing service recovery (Level 2, Stage 4: Service breakdown and service recovery)"; Q, R and S "… (Level 2, The four stages)"; Q3 i "What customer service is (Level 2, What is customer service?)"; ii "Good product knowledge (Level 2, Good product knowledge)"; iii and Q4 "The 8 steps of service recovery (Level 2, The 8 service recovery steps)"; iv "Service breakdown (Level 2, Stage 4: Service breakdown and service recovery)". ⚑ Updated card names in these lines.
- Segmenting: card 5 (five pictures) and card 7 (three approaches, the purpose and C03) are still longer than one phone screen, because splitting them would break a list.

### Checks and what is next (version 0.7.0)
- **Tests:** the old tests that still expected the Level 2 tabs, five stages, the separate Stylez page, the server link check, register numbers to 40 and the visible home profile card were rewritten for the 15 cards, the four stages and the other changes. New checks: the Gemini link gate (no server call), the report's "Finish Levels 3 and 5…" rule, the hidden profile card, the sticky Back and Next bar (position, 44px buttons), tap to enlarge (alt text kept, Esc and Close, focus back, 45% height on laptops), the quick check (nothing pre-selected, hint, one more try, reveal, required before Next, not scored), product-knowledge lines as page text and the step-by-step path with Next held until Step 8. `slice6-full-check` now walks all 15 Level 2 cards (contrast, tap targets, alt text, ampersands, sideways scroll, console errors). Full suite: 164 passed, 2 intentional skips at 1280px and 360px.
- **Visual check** (1280px and 360px, every Level 2 card, the 4 key terms page, home, Levels 3 and 4, report): fixed the key-term icon squeezing the text on phones (icon now above the words), ragged widths of the exam-wording boxes, the enlarge chip covering the comic captions (now a line under the picture), pictures touching the cards above them, the step strip touching the Think about it box, the stage label colour, the quick check's tags at 360px and a 2px fieldset margin on the Level 4 stage checklist. Images are never stretched (checked by test) and the sticky bar sits after the card when scrolled to the end.
- **Open questions for Dan:**
  1. The four-stage comic: approve the draft join of panels 1, 2, 3 and 5 (still captioned "5. RECOVERY"), have the caption redrawn, or keep the older `C02-four-stages.jpg` now shown.
  2. Product-knowledge pictures for "features" and "unique selling points" no longer match their new lines (see Part 3).
  3. N02 (overview picture with callouts) is no longer used; confirm it can stay out.
  4. The R03 Uniqlo picture still shows "Return & Exchange Conditions" (an ampersand inside a real screenshot).
  5. `docs/storyboard.md` and `.docx` need refreshing from this file; every new student-facing line above is marked ⚑.

### Dan's decisions on the open questions (27 October 2026, version 0.7.1)
- **Four-stage comic:** Dan supplied `assets/img/C02-four-stages-v2.jpg` (1600 × 660, 246 KB; panels 1. APPROACH, 2. PRESENT, 3. CLOSE, 4. RECOVERY in the new style). C02 in the image map points at it, with Dan's alt text: "Four-panel comic at a Nexora store. 1, APPROACH: the staff member says, "Welcome to Nexora! How may I help?" 2, PRESENT: holding a camera, he says, "This camera suits your interest in photos." 3, CLOSE: handing over a Nexora shopping bag, he says, "Thank you for shopping with us!" 4, RECOVERY: the customer holds a phone with a cracked screen and he says, "I am sorry. Let me help solve this."" The old `C02-four-stages.jpg` and the draft join are deleted. (Open question 1 closed.)
- **Product-knowledge lines now match their pictures** (open question 2 closed):
  - Features and specifications: "The Nexora Spark has a large screen for reading and an all-day battery."
  - Unique selling points: "Compared with many phones at this price, the Nexora Spark's all-day battery lasts longer, so it suits you if you use your phone often."
- **N02** stays removed (open question 3 closed).
- **R03 ampersand accepted:** "Return & Exchange Conditions" is inside a real Uniqlo screenshot, not text the app writes (open question 4 closed).
- Still open: refresh `docs/storyboard.md` and `.docx` from this file (⚑ lines).

## Dan's brief of 27 October 2026 (version 0.8.0)

### 1. 4 key terms (Level 2 card 1 and the home "Start here: 4 key terms" page)
- The plain-English meaning and the "📝 Exam wording" box are removed. Each term keeps its coloured card and icon and now shows the term in bold on its own line, the definition (exam wording) on the next line, then "**Example:**" and the example:
  - **Customer service** / What businesses do for their customers so that they are happy and satisfied. / Example: Staff help you find the size of clothing you were looking for.
  - **Quality customer service** / Doing more for customers to exceed their expectations. / Example: You buy a birthday present, and the staff offer to gift-wrap it for free and add a handwritten birthday card, even though you did not ask for it.
  - **Service breakdown** / When customers make a complaint about a product or service. / Example: You complain to the shop staff because the earbuds you bought yesterday do not work.
  - **Service recovery** / A process whereby a business takes action in response to service breakdown or failure. / Example: The staff apologise, test your earbuds and give you a new pair straight away.
- Card 2 ("What is customer service?") keeps its full textbook definitions unchanged.

### 2. Capital letters and grammar (every line changed)
Textbook wording (definitions, the 8 steps, the returns lines, the "If a business provides quality customer service" list) is unchanged.
- Level 1 tip: "Tip: don't name real people." → "Tip: Don't name real people."
- Not finished yet list: "Box N: write at least 20 characters" → "Box N: Write at least 20 characters"; Level 4: "Q1: choose the stages you used" → "Q1: Choose the stages you used".
- Card 12: "Common causes: unfriendly or unhelpful staff, …" → "Common causes: Unfriendly or unhelpful staff, …".
- Card 14 label and heading: "Real-life example: poor service recovery" → "Real-life example: Poor service recovery".
- Quick check reasons (shown after "✓ Correct:" and "✗ The answer is …:"): "the staff member welcomes …", "the staff member asks …", "the staff member talks …" now start "The staff member …".
- Level 3 Q2 right answers: "Correct: Apologising and asking …", "Correct: Matching a feature …", "Correct: Summing up the decision …", "Correct: A greeting with an offer …" (the same reasons follow "✗ The answer is …:" after a second wrong try).
- Level 5 Q1 right answers: "Correct: Customer service continues …", "Correct: Knowing the product …", "Correct: Apologising is only Step 3; …", "Correct: That is the textbook definition …".
- Check notes: "Check your reason: Does it say …" (Level 3 Q1); "Check your answer: Did you name one reason …" (Level 5 Q3).
- Report: "Level 3, Q2: First try …", "Level 5, Q1 and Q2: First try …", "Not needed: Right on the first try".
- Alt text and placeholder labels: C01 "GOOD SERVICE": A smiling … / "POOR SERVICE": A staff member …; C02 APPROACH: The staff member … / PRESENT: Holding … / CLOSE: Handing … / RECOVERY: The customer …; C04 "SERVICE BREAKDOWN": The customer … / "SERVICE RECOVERY": The staff member …; R03 "… conditions: Returns within 30 days …"; N01 placeholder label "Landing banner: The Nexora phone store …"; the five product-knowledge alt texts start "Comic: A Nexora staff member …" (Dan's brief had "Comic: a"; capitalised under rule 2).
- Left as they are: colons inside a sentence ("even on a different device: just log in …", "offers a solution: making sure the charger is fixed today", "Your purchase is confirmed: the Nexora Core …" in a quote), and the Teacher Mode reset and unlock messages (kept exactly, as instructed).
- Bug fixed on the way: alt text containing double quotes (C01 to C04 and the new comics) was cut short at the first quote mark inside the `alt` attribute. `escapeHtml` now escapes quotes too.

### 3. Good product knowledge (card 5)
- The five examples use Dan's re-lettered comics `product-knowledge-<aspect>-v2.jpg` (900 × 900) with the Nexora line inside the speech bubble, drawn square and never cropped. The visible "The staff member says:" lines are removed.
- Alt text: "Comic: A Nexora staff member talks to a customer in the shop. He says, "<line>"" with each line from the brief.
- Read aloud reads each aspect heading followed by its line (a copy of the line is in the page, hidden from sight and from screen readers). If a comic fails to load, its placeholder shows and the line appears as visible text under it.
- The old cropped `product-knowledge-<aspect>.jpg` files are deleted.

### 4. Tap to enlarge
- C01, C03, C04 and N03 point at Dan's 1600px files (`-v2.jpg`), alt text unchanged apart from the capitals above. The old 900px files and `C04-breakdown-to-recovery-tanned.jpg` are deleted.
- The enlarged view now sizes every picture to fill the screen (never wider than its file). On a 1280px laptop the wide strips open at the full screen width (C03: about 1050px inline, 1256px enlarged); on phones wide pictures still open larger than the screen and scroll sideways.
- New test `tests/zoom-larger.spec.js`: every zoomable picture in Level 2 (C01, the five product-knowledge comics, C02, C03, the camera picture, C04, R01, R02, N03, R03) opens at least 15% wider than inline, fills the screen on laptops and is never drawn wider than its file, at 1280px and 360px.

### 5. The 8 service recovery steps: textbook wording only
- Card 13 (the path): each stop shows its number circle and icon, the full textbook sentence in bold as the heading, then the staff member's line and the mood face. The short labels ("Listen", "Be patient", "Refer", "Thank" …) and the hidden "Step N:" prefix are removed; the one-step-at-a-time reveal is unchanged.
- Card 14: the label strip is replaced by a box titled "The 8 service recovery steps" with the eight textbook sentences, numbered, 1 to 4 on the left and 5 to 8 on the right on wide screens, one column on phones.
- No other screen (teacher preview, report, hints) showed the short labels; they are removed from the code.

### Checks (version 0.8.0)
- Full suite: 167 passed, 2 intentional skips, at 1280px and 360px (one phone run had a browser worker crash, which passed on rerun). New test `zoom-larger.spec.js`; product-knowledge, key-term, path, steps-box and capital-letter tests updated.
- Visual check (screenshots at 1280px and 360px of the key terms page, cards 1, 5, 7, 12, 13 and 14, and the enlarged C03 and warranty comics): key terms read term, definition, example in their coloured cards; the five comics are square, side-by-side comics line up, and the bubbles are readable on laptops (and when enlarged on phones); enlarged C03 fills the laptop screen and is sharp. Fixed on the way: the hidden Read aloud line made card 5 558px too wide on laptops; on phones the long step headings were squeezed beside the mood face, so the face now sits under the staff member's line; square comics open at 1.6 times the phone width (wide strips 2.2 times) so the bubble needs less panning.

## Alex's new link and heading capitals (27 October 2026, version 0.8.1)
- **Alex's chatbot link** (`CONFIG.GEMS.alex` in `config.js`) is now `https://gemini.google.com/share/d/1QRxLwDMbt93_M7IEil2jxrtNOEu74pwi?usp=sharing`. Suzzie's link is unchanged.
- **Both chatbots are now Gemini Skills shared as chat links**, because Gems are being phased out. Each link must be tested with a student account that does not own the Skill, to check that a student can open it and chat.
- **Capital letters after the colon** (student-facing):
  - Card 7: "When to approach: as soon as…" → "When to approach: As soon as…".
  - Card 9 heading: "Quick check: which approach is this?" → "Quick check: Which approach is this?".
  - Card 10 heading: "Presenting product information: suitability" → "Presenting product information: Suitability".
  - These now match "Real-life example: Poor service recovery". Every other student-facing heading with a colon already had a capital or a number after it ("Approaching customers: 3 approaches").
  - The Teacher Mode headings ("Level 1: stories", "Level 4: reflections", "Q5: one question I still have") are not student-facing and were left as they are.

## Textbook and syllabus check (28 October 2026, version 0.9.0)
Dan compared every student-facing line with Chapter 6 of the EBS textbook (pp. 118 to 143) and the 2026 syllabus learning outcomes 3.2.1 and 3.2.2. **`docs/storyboard.md` (and `.docx`) still need all of the changes below.**

### Part A: corrections to existing Level 2 cards
- **Handling returns (p. 139):** Replacement now reads "Replace it with a similar product." (was "the same product").
- **Good product knowledge:** a 📖 definition box at the top: "Product knowledge refers to knowledge a service staff has of a product's features and benefits." The first item is now "Product features and benefits (e.g. a large screen that makes reading easier)" (was "Product features and specifications (e.g. screen size, battery life)"). Its picture and the other four items are unchanged.
- **After-sales support (p. 138):** a definition box under the heading: "After-sales service refers to the help given to customers after they have bought a product." "Multi-channel support" is now "Hotline and online chat" with "Answer customers' enquiries and complaints in-store, by phone or through online chat."
- **Skills and qualities (p. 123):** lead-in "To deliver quality customer service, service staff need these skills and qualities:"; the six cards in textbook order (Approachable, Customer-focused, Knowledgeable, Clear communication skills, Problem-solving skills, Able to close the customer experience positively); Clear communication skills now "Explaining things clearly and simply, and listening carefully".
- **Stage 4 (pp. 140 and 141):** the two paragraphs after C04 are replaced with "A customer's complaint provides an opportunity for a business to build customer loyalty. This is because if the complaint is handled well, the customer's bad experience can be turned into a good one." and "A business will lose its customers to competitors if it does not try to win a customer back." The "A complaint is a second chance…" paragraph and its `.second-chance` CSS are removed.
- **Four stages table, row 1:** "Greet the customer and show you're happy to help."

### Part B: syllabus gaps in Stages 2 and 3 (Level 2 now has 18 cards)
- Stage 2 is now three cards, each with the "Stage 2" label, the heading "Presenting product information" and a numbered part heading:
  - **Card 10, Part 1: Finding out customers' needs and wants (p. 129).** "Once you have greeted the customer, find out what they need by asking the correct questions and listening carefully. Then it is easier to show them the correct product." Then a Scenario | What the salesperson can do table (three rows, word for word, each scenario with an icon: 🎯 👀 🤔). The third row's three sentences sit on separate lines; on phones each row stacks as a card with small "Scenario" and "What the salesperson can do" labels.
  - **Card 11, Part 2: Presenting the product (p. 130).** "Techniques for effective product presentation:" with six icon chips word for word, then the existing suitability picture and paragraph.
  - **Card 12, Part 3: Handling customers' questions and objections (p. 135).** The intro line, then four numbered technique cards (bold title and explanation word for word), each with "Example:" and our Nexora lines as speech bubbles ("Customer:" / "Staff:").
- Stage 3 is now two cards:
  - **Card 13, Closing the customer experience positively (p. 136):** "The final goal of every salesperson…", "Signs that the customer had a positive experience:" with three chips, then "Show appreciation to customers when closing, even if they do not buy:" with "After a sale:" and "If the customer does not buy:" each above its speech quote.
  - **Card 14, After-sales support:** the definition, the four after-sales cards, then (p. 139) "When handling customers' enquiries, salespeople should:" with three chips.
- Progress labels for the new cards: "Stage 2: Finding out customers' needs and wants", "Stage 2: Presenting the product", "Stage 2: Handling questions and objections", "Stage 3: Closing the customer experience positively", "Stage 3: After-sales support".
- **Saved positions:** a student part-way through the 15-card layout lands on the matching card (Stage 2 → Part 1, Stage 3 → the closing card, later cards move up by three). Answers, required reflections (cards 8, 17 and 18) and the quick check gate (card 9) are unchanged.

### Checks (version 0.9.0, local server only)
- Tests: Level 2 tests moved to 18 cards (counter, card positions, the 15-card layout move, teacher preview count). New `tests/textbook-cards.spec.js` checks every new and corrected line word for word, with no sideways scroll and no ampersand, at 1280px and 360px. Full suite after the fixes: all passing apart from 2 intentional skips. The shared console-error check now ignores messages logged by YouTube's own embedded player (an intermittent "permissions policy" line), which had made one run fail.
- Visual check (1280px and 360px, cards 4, 5, 6, 10 to 15 and 18): fixed the definition box touching the card heading; replaced emoji that are not in the app's icon set (gift, open hands, phone with arrow, telephone), which showed in colour while every other icon is a line icon; stopped the technique cards' examples being pushed to the bottom (a gap in card 3); let chips on phones take their own height instead of all matching the tallest.
- After review: on card 11 the suitability paragraph ("Don't just list every good feature…") now sits above the camera picture, so the picture is directly under the text it explains. Full suite end to end: 174 passed, 2 intentional skips.

## Level 2 made easier to read (28 October 2026, version 0.10.0)
Level 2 matched the textbook but felt wordy for G1 students. The textbook wording stays; these changes are in Level 2 only. **`docs/storyboard.md` (and `.docx`) still need all of them.**

### Part 1: key words in bold
- Every phrase on Dan's list is wrapped in `<strong>` (bold, `--brand-dark`, no highlight), matched exactly, on these cards: 4 key terms (also on the home "Start here: 4 key terms" page, which uses the same cards), What is customer service?, Why quality customer service matters, Good product knowledge, Stage 1, Stage 2 parts 1 to 3 (technique explanations only), Stage 3 closing, Stage 3 after-sales support, Stage 4, and the 8 steps (path card and the fold-out on the real-life example card). All the phrases were found exactly as listed.
- Nothing is bold in headings, card titles, speech lines, quotes, buttons or the Think about it questions. Levels 3 to 5 are unchanged (checked by test against their bold words before 0.10.0).
- On the path card each step sentence is the heading of its stop and was all bold (0.8.0); it is now normal weight so that the listed key words show in bold. The product-knowledge reason line (`.pk-why`) is also normal weight now.
- Read aloud reads the sentences as before. A full stop or semicolon straight after a bold word is now joined on without a space in the spoken text.
- Cards with bold in almost every line: Stage 1 (every paragraph and both purpose cards), Stage 2 part 2 (all six chips), Stage 3 closing (every line), and the 8 steps (every step).

### Part 2: our own lines cut or replaced
- Good product knowledge: "Product knowledge includes:" (was "Staff need good product knowledge to answer questions accurately, not guess. This includes:"); the last line is now the textbook's reason (p. 127): "Service staff with good product knowledge will be able to meet the needs and wants of customers and increase customer satisfaction so that they will want to come back again."
- The four stages: the Remember this box under the comic is removed. Row 2: "Find out the customer's needs, present a suitable product and handle questions or objections." Row 3: "Thank the customer, sum up what they decided and give after-sales support."
- After-sales support: "Providing good after-sales service is one way businesses can be better than their competitors." (p. 138) replaces our sentence.
- The 8 service recovery steps: one lead-in line, "Follow Nexora's staff member as he uses the 8 steps with a customer whose new phone screen cracked on its own."
- Real-life example: Poor service recovery: the 8-step list is in a fold-out labelled "Show the 8 steps", closed by default, opened by tap or click (a `<details>`, styled like the Stylez store facts fold-out). It does not hold back Next, and Read aloud skips it while closed.
- Handling returns: the Remember this box at the end is removed. (`recapHtml` and `.recap-card` stay: Levels 1, 3 and 5 still use them.)

### Part 3: a second quick check (Level 2 now has 19 cards)
- Card 13, progress label "Stage 2: Quick check", straight after Stage 2, part 3. Heading "Quick check: Which technique is this?", instruction "Tap one for each.", four items (a to d) with Dan's customer and staff lines, hints and reasons. Options in technique-card order: "Negative into selling point", "Yes, but", "Share concerns", "Correct misconception"; 2 by 2 on phones (each at least 44px, wrapping onto two lines), four in a row on laptops.
- Same behaviour as the first quick check (card 9): ✓ or ✗ under each item, one more try with the hint, then the right answer with its reason; every item must be finished before Next; not scored and not in the report or Teacher Mode. Saved as `s2.qc2.<a|b|c|d>.1` and `.2`; the first quick check's answers are untouched.
- Saved positions: an 18-card position moves to the matching 19-card position (cards after Stage 2, part 3 move one along); 15-card, 10-card and older positions still move correctly.
- After review: the example speech lines (`.say`, everywhere they appear) are normal weight instead of 600, so the bold key words stand out on busy cards such as Stage 1 and Closing. "Customer:" and "Staff:" stay bold, and the bubble backgrounds are unchanged.

## Seven levels (28 October 2026, version 0.11.0)
Dan rewrote `docs/storyboard.md` and `docs/storyboard.docx` from the live site, with everything below (7 levels). The storyboard is again the single source of truth, and the "Out of date since 27 October 2026" bullet is removed from CLAUDE.md.

### Level numbers: what students see and what is stored
Stored level numbers and answer keys never change meaning; a new or split level gets a new stored number and new keys, and only the order and the shown number change.

| Students see | Level | Stored as (`done`, unlock grants, `s<n>.` keys) |
|---|---|---|
| Level 1 | Your Customer Service Stories | 1 |
| Level 2 | Learn: Customer Service (Part 1) | 2 (`s2.*`) |
| Level 3 | Learn: Customer Service (Part 2) | 7 (position `s7.card`; reflections keep `s2.think1`, `s2.think2`) |
| Level 4 | Chat with Alex | 3 (`s3.*`, `s3q2.*`) |
| Level 5 | Serve Suzzie at Stylez | 4 (`s4.*`) |
| Level 6 | Win Suzzie Back | 6 (`s6.*`) |
| Level 7 | Check and Exit Ticket | 5 (`s5.*`, `s5q3.*`, `s5q4`) |

Dan agreed this instead of renumbering the stored levels: renumbering would have mixed the two numberings whenever a 0.10.0 copy and a 0.11.0 copy of a record were merged (finished flags are added together), which nothing could undo later.

### Part 1: three new comics
- C05 (customer service timeline), C06 (handling objections) and C07 (closing positively) are in the image map with the alt text from storyboard section F, shown with Tap to enlarge like C02 to C04: C05 on Level 2 card 2 straight under "It takes place the moment a customer enters…" and before "What is quality customer service?"; C06 on Level 2 card 12 straight under the four technique cards; C07 on Level 3 card 1 straight under the two appreciation lines. Each file is 1600px wide (186 to 232 KB).

### Part 2: the notes split into Levels 2 and 3
- Level 2, "Learn: Customer Service (Part 1)": the old cards 1 to 13, ending on "Stage 2: Quick check" (13 of 13) with Finish Level 2 and the Service Scholar badge. Card description as in the storyboard.
- Level 3, "Learn: Customer Service (Part 2)": 7 cards (storyboard 3.1 to 3.7) on the same card engine (progress "{n} of 7 · {label}", sticky Back and Next, Read aloud, Tap to enlarge, Finish Level 3). Same icon as Level 2. Its two Think about it boxes (still `s2.think1`, `s2.think2`) hold back Next and Finish.
- Level 3 badge: "Service Saver" (placeholder name), image-map id `BADGE_L3`, file `assets/img/badge-level-3.png` (not added yet), emoji 🛡️. The shelf, pop-up and report show the standard placeholder box until the file is dropped in.
- Card 4, The 8 service recovery steps: all 8 stops at once. The Show Step button, the slide-in, the "Tap Show Step to see all 8 steps." note and the rule that held back Next are gone (and `reached["s2.path"]` is no longer used). Icons, bold key words, staff lines and mood faces are unchanged.
- Card 5, Watch: The 8 steps in action: the video block moved to its own card, with the purple Stage 4 label above the heading. Nothing holds back Next.

### Part 3: Level 6, Win Suzzie Back
- `CONFIG.GEMS.suzzieRecovery` added (alex and suzzie unchanged). Route card 🛠️ with the storyboard description; badge Service Superstar (`BADGE6`, `badge-service-superstar.png`, 🌟).
- Tab 1, Roleplay: N05 with the intro, three icon cards, the start box with its speech line, "🛍️ Open chat with Suzzie (new tab) ↗" (opens `GEMS.suzzieRecovery`), two closed fold-outs ("Show the 8 steps", the same box as Level 3 card 6, and "🏬 Stylez store facts"), the Gemini share-link card, the tick box "I have finished helping Suzzie." and "Next: Reflect →", locked by the same tick plus "gemini" rule and messages as Levels 4 and 5.
- Tab 2, Reflect: Q1 the 8-step checklist (Listen to Thank, each with its step icon, nothing ticked, one neutral border for every step, so no stage colours), Q2 and Q3 answer boxes with the storyboard hints, Submit ("Not finished yet" names what is missing), the Remember this line, Finish Level 6, the Service Superstar pop-up; Level 7 unlocks.
- Saved as `s6.link`, `s6.tick`, `s6.steps`, `s6.q1`, `s6.q2` and `submitted.s6`.

### Part 4: seven levels everywhere
- Before you start point 3, the welcome lines, "{n} of 7 levels done", seven level cards and seven badge slots in level order; Serve Suzzie "from Levels 2 and 3"; the Check Q1 iv hint "in Level 3"; the report ("Level 4, Q2", "Level 7, Q1 and Q2", "Finish Levels 4 and 7…", a Level 3 and a Level 6 section in every answer); the "Look at these again" lines for s3q2.P, s5q3.iii, s5q3.iv and s5q4 now point to Level 3.
- Teacher Mode: preview buttons Level 1 to 7, the class summary, students table and full report for seven levels, CSV columns for Level 6 (link, steps used, two reflections) and the renamed Level 3 to 5 columns. Footer Unlock: "all seven levels" and Level 1 to 7 tick boxes (each sends the stored number).
- Completion Champion and the confetti stay on the last level (Level 7).
- Routes use the number students see (`#level1` to `#level7`, `#teacher-preview-1` to `-7`).

### Saved work from 0.10.0 (`migrateRecord`, the same in `app.js` and `Code.gs`)
Runs on every record when it loads (device copy, server copy, Teacher Mode results) and before every merge, once per record (`reached.levels7` marks it; new records start with it):
- Finished the old notes: Level 3 is finished too, with the same date (both badges).
- An old unlock grant for the notes also opens Level 3. Grants for Alex, Serve Suzzie and the Check keep their stored numbers, so they now show as Levels 4, 5 and 7.
- Part-way through the notes before card 14: stays in Level 2 on the same card. On card 14 or later (any of the 19-, 18-, 15- and 10-card layouts): Level 2 counts as finished (badge included) and Level 3 opens on the matching card. Only the app moves positions; `Code.gs` has `MIGRATE_POSITIONS = false`, so a student still on the 0.10.0 page during the switch is not sent back a card.
- Level 6 opens for anyone who has finished Serve Suzzie. A Check started or finished before Level 6 existed stays open (`reached["open.5"]`, set once by the migration), and any finished level stays open. Levels opened only by Teacher Mode's "Unlock all levels on this device" still lock again when it is turned off.
- `Code.gs` (SCRIPT_VERSION 0.11.0): Unlock accepts the seven stored numbers (1 to 7), stored records are migrated before new grants are added (so a new Level 2 grant does not also open Level 3), "Levels finished" counts the seven levels, and the footer profile list returns migrated grants.
- **Order for going live: redeploy Apps Script first, then push to Vercel** (steps in `docs/apps-script-setup.md`, "Seven levels"). The new script is safe with the live 0.10.0 app.
- Test-only: the local server has `/__test/oldRecord`, which stores a record exactly as the 0.10.0 script left it, so the migration can be tested.

### After Dan's test: 0.10.0 pages saving after the server update
Dan ran the new `Code.gs` with students still on the 0.10.0 page and found a gap: the server's first merge of any record set the `levels7` marker, so a student who then finished the old Level 2 on the 0.10.0 page (students 31 and 33) never got Level 3, and a student who then started the old Check never got `open.5`.
- The 0.11.0 app now sends `app` (its version) with every save. A save without it comes from a 0.10.0 page, and `oldAppSave` in `Code.gs` converts what that save adds to the stored record, whatever marker it carries: a newly finished Level 2 also finishes Level 3 (same date), and new Check work (or a newly finished Check) adds `open.5` unless Level 6 is finished.
- Only what the old page adds is converted, so a student who finished only the new Part 1 in 0.11.0 never gets Part 2, even if a stale 0.10.0 page saves that record again. Saves from the 0.11.0 app are never converted.
- Tests in `tests/seven-levels.spec.js` ("the 0.10.0 app saving after the server update"): finishing the old Level 2 (students 31 and 33), starting the old Check, Part 1 alone never gaining Part 2, and the app sending its version. The first two fail without the fix.
- The order stays: redeploy Apps Script first, then push to Vercel.


## Service Saver artwork (28 October 2026, version 0.11.1)
- Added the user-requested Service Saver badge in place of the Level 3 placeholder. BADGE_L3 now uses assets/img/badge-service-saver.png (256px PNG with transparency). The shared image map supplies the shelf, award popup and learning report.
- Generated with the built-in image-generation tool, using Service Scholar and Service Star as style references. Prompt: glossy cartoon circular gold medallion with a teal/turquoise rim, emerald shield, gold check, helping hand and sparkles; bold white ribbon text SERVICE / SAVER; transparent background. Full-resolution original: /Users/juf/.codex/generated_images/01a159f7-f388-7363-8e2b-b4783338e943/exec-65507778-5bfe-4436-869f-5636fac9c046.png.
- Updated existing placeholder expectations to require the generated badge image. No progress or backend changes.
- Validation: 13 targeted checks passed, 1 duplicate phone check skipped. Inspected the shelf and award popup at 1280px and 360px: transparent edges, matching proportions, readable ribbon, no overflow.

## Key-term definition emphasis (28 October 2026, version 0.11.2)
- Changed the bold phrase happy and satisfied to accessible dark orange (#B45309), following the user’s revised colour choice in the Customer service key-term definition. Shared key-term rendering applies this on the terms page and Level 2 card 1. No wording, layout or progress changes. Preview requested before publication.

## Consistent orange keywords (28 October 2026, preview 0.11.3)
- User requested the same orange for all coloured, bold keywords. Marked the existing lesson keyword phrases and the shared boldHtml output with keyword-emphasis, styled #B45309. Covers both notes levels, the home key-term page, recovery path and recovery guides. Headings, term names, labels and other UI retain their colours. Text and progress rules are unchanged.

- Preview: moved the product knowledge benefits sentence before “Product knowledge includes”, into the same definition-box component as the product knowledge definition. Wording unchanged.

- Preview: replaced the Stage 1 label with the approved colourful Nexora approaching-customers banner; retained the text heading and lesson content.

- Teacher preview now follows the student layout: one note card per screen with Back/Next and progress; other activities use their student step tabs and Continue segments. All preview tabs remain unlocked and view-only, with positions isolated from student records.

- Release 0.11.4: added matching orange, green and purple banners for Stages 2, 3 and 4; updated the approach quick-check instruction to “Select the most appropriate approach for each question.” Includes the pending product knowledge box and student-style teacher preview layout.

- Preview: removed the redundant uncertainty speech bubble from panel 1 of the objections comic; retained that dialogue in panel 3 and updated image alt text.

- Preview: objection quick-check questions a–d use light purple customer boxes and pale blue staff boxes, retaining explicit speaker labels and all wording.

- Preview: removed the repeated “Closing the customer experience positively” heading beneath the Stage 3 banner.

- Preview: clarified the uppercase Y in BUY in the final panel caption of the closing comic.

- Preview: added a 16px gap between consecutive definition boxes, including service breakdown and service recovery.

- Release 0.11.7 includes underlining ONE in the Uniqlo reflection, the Stage 3 duplicate-heading removal, clearer BUY caption and definition-box spacing.

- Preview: Levels 2 and 3 now use the same icon, title and description header format as Level 1, for students and teachers.

- Preview: removed Level 6’s fresh-chat greeting instruction and example, retaining the role statement.

- Preview: added glossy illustrated icons for Levels 1, 4, 5, 6 and 7 matching the learning icon; updated Level 6 button to “Open chat with angry Suzzie (new tab)”.

- Preview: Home from teacher preview returns to the signed-in Teacher Mode landing page.

- Release 0.11.8 publishes matching illustrated route/header icons, consistent Levels 2/3 headers, Teacher Home navigation and Level 6 roleplay wording updates.

- Release 0.11.9: restored the original fresh-chat greeting instruction and example to Level 5 only, removed it from Level 6, and darkened the shared keyword orange to #A84B08 to improve contrast on purple cards while retaining consistent keyword colour.

## Five fixes from three student simulations (29 October 2026, version 0.12.0)
Dan's storyboard 0.12.0 matches the live 0.11.9 site and marks every new line "🆕 0.12.0" (section H lists the five fixes). Nothing stored changed: no answer, attempt or level keys, and `Code.gs` is unchanged (it holds none of these lines), so no Apps Script redeploy is needed.

### 1. How to get your chat link (Levels 4, 5 and 6)
- "Use Share in Gemini and copy the conversation link then paste it below." is replaced by "How to get your chat link:" and three numbered steps (📤 Share, 🔗 Create public link then Copy link, 📋 paste below). One shared component (`shareLinkStepsHtml`), identical in all three levels: a numbered wine circle, a line icon and the text, each row at least 44px tall.
- Two line icons added to `assets/icons/ui.svg` (`share`, `link`) and mapped from 📤 and 🔗 in `config.js`, so the steps use line icons like the rest of the app.
- Unchanged: the link box, the tick box, the "gemini" rule and its messages.

### 2. One rule for typed answers
Every box where students write a sentence needs at least 20 characters, shown as "at least one full sentence" (`MIN_RESPONSE_CHARS`, `FULL_SENTENCE`). The list Dan approved:
- Already 20: Level 1 Q1 to Q3, the Level 2 video reflection, the Level 3 Think about it boxes.
- New: Level 4 Q1 reason (`s3.q1b`), Level 5 Q2 and Q3 (`s4.q1`, `s4.q2`), Level 6 Q2 and Q3 (`s6.q1`, `s6.q2`), Level 7 Q3 (`s5.q5`, at Check answer and Check again), Q4 and Q5 (`s5.q6`, `s5.q7`).
- Exempt: Level 4 "Skill or quality" (`s3.q1a`, must not be empty) and the three chat-link boxes.
- Wording: the Level 1 instruction ("Type at least one full sentence in each box, then tap Submit."), the reflection hint ("Write at least one full sentence..."), "Answer too short" and "Complete all questions" ("… Write at least one full sentence in each box."), and the Level 1 items ("✗ Q{n}: Write at least one full sentence").
- Agreed with Dan: work submitted before 0.12.0 is not checked again; the rule applies the next time a student submits. So "Next: Exit ticket" still only checks that Q3 is not empty.

### 3. Self-check prompts
- Level 4 Q1 and Level 7 Q3 now start "Self-check:" (were "Check your reason:" and "Check your answer:"), the rest word for word.
- New neutral style for `.check-note`: very light grey background (#F8F9FB), thin grey border all round (#D6D9DE), rounded corners, the 🔎 icon, no ✓ or ✗, no coloured left border, no red or pink.

### 4. Look at these again
- R: "Closing the customer experience positively (Level 3, Stage 3: Closing the customer experience positively)".
- After Dan's check of the other lines: Q "Presenting product information (Level 2, Stage 2: Presenting product information)" and S "Approaching customers (Level 2, Stage 1: Approaching customers)". The other six lines already pointed to where their topic is taught. Shown in the summary card and the learning report.

### 5. Not finished yet pop-ups
- Every pop-up lists everything missing at once, labelled as on screen. Level 1 and the Level 5 and 6 Reflect tabs now label their questions "Q1.", "Q2." and "Q3." (were "1.", "2." and "3."); "Box 2" and similar are gone.
- Level 4 lists "Q1: Skill or quality" and "Q1: This is important to customers because"; Levels 5 and 6 list "Q1: Choose the stages (steps) you used", "Q2" and "Q3" together (before, Q1 was shown on its own first).
- The learning report and Teacher Mode's full report use the same Q labels.

### Checks (local server only)
- New `tests/v012-fixes.spec.js`, run at 1366x768 (Chromebook), 810x1080 (iPad), 1280px and 360px (two new Playwright projects, `chromebook` and `ipad`, run this file only): share-link steps identical in Levels 4 to 6 with the link rule unchanged; every sentence box rejects a short answer and the exempt boxes accept one; both self-check prompts beside right and wrong feedback; the line R pointer in the summary card and the report; empty submits in Levels 1, 4, 5, 6 and 7 and the exit ticket; answers saved before 0.12.0 (short ones included) still show and submitted levels stay submitted; reload restores.
- Older tests brought up to date with the group's 0.11.1 to 0.11.9 changes (stage banners instead of stage labels, the approach quick-check instruction, the product-knowledge benefits definition box, "Open chat with angry Suzzie", the one-card teacher preview, the new image ids) and with the 0.12.0 wording.

- Preview (29 October): updated only Level 6 angry Suzzie’s chatbot link to the new shared chat ending 1JLzD6DxE312XorvYwQ-Oj3WwyR6s4-Kk.

- Release 0.12.2 (30 October): updated the normal Suzzie chatbot link for Level 5 to the shared chat ending 1dYSavt5Xo5k0_EzCtCI-bRjHjoXCQtEh. Alex and angry Suzzie links are unchanged.

- Release 0.12.3: Home within Teacher Mode now opens a teacher-only main route page with the welcome banner and all seven levels available, preserving teacher authentication and student data. Direct teacher-home access still requires sign-in.

- Preview 0.12.4: added Back to student mode beside Home throughout signed-in Teacher Mode. It clears the teacher session and returns to student home or registration, preserving student progress. Header actions wrap on phones.

- Release 0.12.4: published Back to student mode with Home on its right in the teacher header.

- Release 0.12.5: server-confirmed no_class responses on active profile load or save now release the cached identity, record, pending queue and device unlock. Registration refreshes to the teacher-selected class. Network failures retain offline work.
