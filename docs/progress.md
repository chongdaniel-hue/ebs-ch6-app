# Build progress

Read this with `CLAUDE.md` and `docs/storyboard.md` when starting a fresh session. The untouched V45 app is in `../V45` for reference when porting code.

## Slices

| Slice | What | Status |
|---|---|---|
| 1 | Clean-up and shell: removals, blue theme, header, footer, `config.js`, image map with placeholder boxes, viewport fix | Built, awaiting review |
| 2 | Back end and login: `apps-script/Code.gs`, local stand-in `server/server.js`, setup guides, Teacher Mode sign-in and Classes tab, landing, Before you start, home, 4 key terms, Switch student, saving and loading, offline | Not started |
| 3 | Stations 1 and 2 (Service Recovery Path), locks, tabs, Continue and Next, Badges 1 and 2 | Not started |
| 4 | Stations 3, 4 and 5, hint, retry and reveal feedback, exit ticket | Not started |
| 5 | Learning report and the rest of Teacher Mode | Not started |
| 6 | Full check, GitHub Pages workflow, summary | Not started |

## Decisions agreed with the user (19 October 2026)

These fill gaps in the storyboard. Student-facing wording here is approved and must be used exactly.

### Back end
- Design as proposed: GET `?action=classes`, GET `?action=load&class=&reg=`; POST (`text/plain` JSON) `save`, `teacherCheck`, `addClass`, `removeClass`, `results`, `clearStudent`. Teacher results go by POST so the code never appears in a URL.
- Every reply is HTTP 200 JSON; failures are `{ok:false, error:"..."}` (`bad_code`, `no_class`, `bad_reg`, `too_big`, `busy`, `cleared`, `locked_out`, ...). The local server copies this exactly.
- Sheet tabs: Classes (Class, Order, Added at) and Students (Key, Class, Register No., Stations finished, Q2 first try, Q3 and Q4 first try, Confidence 1 to 4, Last saved, Cleared at, Record JSON). No other tabs.
- Save rules: reject unknown class, register number not a whole number 1 to 50, record over 40,000 characters (each answer box limited to 1,500 characters). Newer `updatedAt` wins, with the device time capped at server time. First attempts merged item by item, never replaced. Each first attempt carries its own right or wrong flag, so the script needs no answer key. A record based on an older cleared-at time is refused with `cleared` and the device discards its copy. `LockService` `tryLock(10000)`; on failure reply `busy`.
- Teacher code lock-out: after 10 wrong codes in 10 minutes, refuse for 10 minutes.
- Timings: local save always immediate. Server save immediately on Submit and Finish; Continue, Next and tab change coalesce into one save within about 10 seconds; typing at most every 30 seconds and only if changed; one save on page hide. Random 0 to 3 s delay before routine saves; one request in flight per device. Retries after 5, 10, 20, 40 s, then at most every 5 minutes, with jitter. Class list cached by the script for 60 s.
- `docs/apps-script-setup.md` must include a check step: after deploying, open the web app link in an Incognito window; if "Anyone" is not offered or it asks to sign in, use a group Gmail account instead.

### Layout
- Content widens to about 900px on laptops (V45 was a 520px column).
- V45 practice round ("Go through the questions again") removed.

### Flow and feedback
1. Every station: the 💡 Remember this card appears at the bottom of the last tab once its work is done, above [Finish Station n]. Finish opens the badge pop-up. Station 2 works the same way.
2. Finish Station 3 and "Next: Exit ticket →" are held back until every wrong item has had its Check again. Label: "Next: Exit ticket →".
3. Only Station 1 gets [Submit anyway]. Required questions (Station 3 Q1 and Q2, Station 4 Reflect, Station 5 Q3 to Q5, exit ticket) must be filled in: the pop-up shows only [Go back]. The two Station 2 "Think about it" boxes never block anything.
4. The "Not finished yet" pop-up lists the missing items by name (e.g. "Box 2", "Q3 ii") as well as marking them in red.
5. Badges 2 to 4 pop-up: "You earned the {badge name} badge!" [Back to my route]. Badge 5 uses the Station 5 pop-up in the storyboard.
6. A finished station: all tabs open, answers and feedback read-only. Open Alex and Open Suzzie still work.
7. Station 2 Tab 3: "Handled well, a service breakdown..." and C04 appear only once all 8 path stops are shown, together with Continue ↓.
8. Revealed answers (still wrong after Check again): "The answer is {stage}: {reason}" for Q2, "The answer is False: ..." / "The answer is True: ..." for Q3, "The answer is B: B acknowledges..." for Q4. ✓ or ✗ before each item's feedback.
9. "Look at these again" lines:
   - P: "Performing service recovery (Station 2, Breakdown and Recovery)"
   - Q: "Presenting product information (Station 2, The Four Stages)"
   - R: "Closing the customer experience positively (Station 2, The Four Stages)"
   - S: "Approaching customers (Station 2, The Four Stages)"
   - Q3 i: "What customer service is (Station 2, Quality Customer Service)"
   - Q3 ii: "Good product knowledge (Station 2, Quality Customer Service)"
   - Q3 iii and Q4: "The 8 steps of service recovery (Station 2, Breakdown and Recovery)", shown once
   - Q3 iv: "Service breakdown (Station 2, Breakdown and Recovery)"
   - Nothing wrong: "Nothing to look at again. You got everything right on the first try! 🎉"
10. Offline bar: V45 wording with "phone" changed to "device", e.g. "📡 No internet. Your work is saved on this device and will be sent when the connection is back."
11. "Welcome back! Your work has been loaded." is a short notice at the top of the home page. The locked-card message is a line under the tapped card.

### Teacher Mode and data
12. A removed class stays choosable in Results, marked "(removed)".
13. Switch student deletes the device copy once it has reached the server; unsent work stays queued until it goes.
14. The user is testing whether their MOE Google account offers "Who has access: Anyone". Build as planned.

### Tooling
15. Dev-only `package.json` with Playwright and a `tests/` folder. `node_modules/` in `.gitignore`. The Pages workflow publishes only `index.html`, `app.js`, `styles.css`, `config.js` and `assets/`.
16. Station 4 opening line ("Try: Hi, welcome to Stylez!...") kept for now.

## Open questions

- Should the decisions above be added to `docs/storyboard.md` (and the .docx) so the storyboard stays the single source of truth?
