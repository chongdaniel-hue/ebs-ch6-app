# Build progress

Read this with `CLAUDE.md` and `docs/storyboard.md` when starting a fresh session. The untouched V45 app is in `../V45` for reference when porting code.

## Slices

| Slice | What | Status |
|---|---|---|
| 1 | Clean-up and shell: removals, blue theme, header, footer, `config.js`, image map with placeholder boxes, viewport fix | Done (commit "Slice 1") |
| 2 | Back end and login: `apps-script/Code.gs`, local stand-in `server/server.js`, setup guides, Teacher Mode sign-in and Classes tab, landing, Before you start, home, 4 key terms, Switch student, saving and loading, offline | Built, awaiting review (commit "Slice 2") |
| 3 | Levels 1 and 2 (Service Recovery Path), locks, tabs, Continue and Next, Badges 1 and 2 | Not started |
| 4 | Levels 3, 4 and 5, hint, retry and reveal feedback, exit ticket | Not started |
| 5 | Learning report and the rest of Teacher Mode | Not started |
| 6 | Full check, GitHub Pages workflow, summary | Not started |

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

## How slice 2 works (for the next session)

- **Record shape** (one per student, `ch6_rec_<class>#<reg>` on the device, Record column in the Sheet): `v, cls, reg, updatedAt, baseClearedAt, agreed, done{level:time}, submitted{key:time}, reached{key:number}, first{item:{a,ok,t}}, second{item:{a,ok,t}}, answers{key:{v,t}}, ui{key:{v,t}}`.
- **Key names** (Code.gs depends on these for the readable columns): first attempts `s3q2.P` to `s3q2.S`, `s5q3.i` to `s5q3.iv`, `s5q4`; confidence answers `s5.q8.1` to `s5.q8.4` (value 0 to 3: Not yet, A little, Confident, Very confident). Other keys start with `s<level>` (used for "In progress").
- **Merge** (`mergeRecords`, identical in `app.js` and `Code.gs`, checked by a test): the newest value of each answer box wins (a refinement of "newer copy wins", so a device coming back online never wipes newer answers made elsewhere); `agreed`, `done`, `submitted` keep the earliest time and are never removed; `reached` keeps the highest; `first` and `second` are never overwritten once recorded.
- **Saving**: `setAnswer(key, value, mode)` and `queueSave(mode)` with mode `"now"` (Submit, Finish), `"soon"` (Continue, Next, tab change) or `"typing"`. The queue (`ch6_queue`) holds one entry per student and always sends that student's latest device copy.
- **Local server** runs `apps-script/Code.gs` itself through `server/apps-script-mock.js`, so local and live behaviour cannot drift apart. If Code.gs starts using another Google service method, add it to the mock.
- **Tests**: `npx playwright test`. The test teacher code is generated at random for each run; test data lives in the system temp folder.
- Wording I had to add because the storyboard has none (teacher-facing or transient, please check): Teacher Mode "Too many wrong codes. Wait 10 minutes and try again.", "The teacher code has not been set up yet. See the setup guide.", Classes tab "Key in a class name.", "Class names can be at most 20 characters.", "{name} is already in your classes.", "No classes yet."; the Start and Enter buttons read "Checking..." while waiting (as in V45); the Switch student pop-up title "🔄 Switch student" and the Remove class pop-up title "Remove class".
- `docs/github-setup.md` is written in slice 6 with the Pages workflow it describes.

## Open questions

- None.
