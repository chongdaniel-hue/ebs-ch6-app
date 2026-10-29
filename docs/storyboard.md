**EBS Chapter 6: Customer Service**

Self-study revision app

Screen-by-screen storyboard (version 0.12.0, 29 October 2026)

# A. How to read this storyboard

This storyboard describes the app **as it will be in version 0.12.0 (29
October 2026)**: the live version 0.11.9 (checked against the live site
on 29 October, including the group's changes after 0.11.0: stage
banners, illustrated level icons, orange key words, the Service Saver
badge and redrawn C06 and C07) plus five fixes from three student
simulations run on 29 October. It replaces the 28 October (0.11.0)
storyboard. From now on it is again the single source of truth: change
it first, then send the change to Claude Code. The build log with every
change and its date is docs/progress.md in the repository.

- Each screen is a table. Rows with a **pale rose** label are what the
  student sees and does, in final wording. Rows marked **Teacher only**
  (grey) are notes for your group and Claude Code, and never appear on
  screen.

- Lines with a bar on the left are the exact words on screen. **Bold**
  inside them is bold on screen too: in Levels 2 and 3, the key words of
  each textbook line are bold and orange (#A84B08) so weaker readers can
  see what matters first.

- Text starting with **🆕 0.12.0** is new or changed in version 0.12.0
  and is not on the live site yet. Section H lists the five fixes.

- Text in **dark red** inside **\[Image …\]** or **\[Video …\]** marks a
  picture or video. Section F lists every image with its file name and
  alt text.

- Definitions, the 8 service recovery steps, the returns lines and every
  textbook list use the **textbook's exact wording** (Chapter 6, pp. 118
  to 143). Checked line by line against the textbook on 28 October 2026.

- Student wording follows the house rules: no ampersand, nothing
  pre-selected, every interaction has a one-line instruction, and at
  most about 60 words of instruction before an interaction.

# B. What carries over from the LJ app, and what changes

| **Part of the LJ app (V45)**                                                                                                          | **In the Chapter 6 app**                                                                                                                                                                                                                                                                                           |
|---------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| App shell: one-page app, hash routes, autosave on the device, offline answer queue, Vercel back end saving to Blob storage            | App shell kept. The code is in a private GitHub repository and Vercel publishes only the app files (no build step). The server is a Google Sheet run by Google Apps Script. Each student's progress is saved there, so they can carry on from any device.                                                          |
| Header with school crest and school name                                                                                              | Removed: the app is for any school. The header shows the app title only.                                                                                                                                                                                                                                           |
| Team login (choose team, key in access code)                                                                                          | Student login: the class is set by the teacher in Teacher Mode and shown read-only; the student keys in their name and chooses their register number (1 to 50). No access code. Once saved, the name and register number are tied together and cannot be changed by the student.                                   |
| "Before you start" pop-up that must be agreed to                                                                                      | Kept, as 5 points on how the module works.                                                                                                                                                                                                                                                                         |
| "Words you'll use today" page                                                                                                         | Kept as "4 key terms" (pre-training before Level 2), each as term, definition and example.                                                                                                                                                                                                                         |
| Route of 5 station cards, any order                                                                                                   | Seven levels. Levels unlock in order. Teacher Mode can unlock all levels on a device, and the footer Unlock opens chosen levels for one student.                                                                                                                                                                   |
| Station page: step dots, reading, warm-up, main task, scenario; Submit, then recap and missed items                                   | Levels 1, 4, 5, 6 and 7 keep step tabs, Submit and recap. Levels 2 and 3 (the notes, 13 and 7 cards) are shown one card at a time with Back and Next. After Submit, each wrong answer shows a hint written for that question, with one more try before the answer is shown. The first attempt is what is recorded. |
| Station badges and team badges                                                                                                        | Seven level badges. Team badges removed.                                                                                                                                                                                                                                                                           |
| Learning report, Email our teachers, post-survey, Help button, photo tasks, foot-traffic timer, VivoCity unit links, guide characters | Learning report kept (now also lists every answer). The rest removed. Guide characters removed (Mayer's image principle).                                                                                                                                                                                          |
| Teacher Access (results, CSV, team report) and Reset                                                                                  | Teacher Mode: lesson preview of every level, Classes, Results and This device. Footer Reset progress and Unlock, each behind a passcode.                                                                                                                                                                           |
| Credits footer with the anime-style team picture                                                                                      | Picture removed. Text: "A team effort by Anthony, Daniel, Joshua and Jufinnie (NIE 2026)" and the version number.                                                                                                                                                                                                  |
| Teal colour scheme                                                                                                                    | Wine red (Section C).                                                                                                                                                                                                                                                                                              |
| The five parts are called stations                                                                                                    | Called levels (Level 1 to Level 7).                                                                                                                                                                                                                                                                                |
| Pinch-to-zoom blocked                                                                                                                 | Zoom allowed, for accessibility. Pictures also open larger with Tap to enlarge.                                                                                                                                                                                                                                    |

# C. Look, layout and Mayer's principles

### Colours

| **Use**                                                                             | **Colour**                                                      | **Note**                                                                                                                                                                                                                                                         |
|-------------------------------------------------------------------------------------|-----------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Brand (header, primary buttons, current tab)                                        | \#8B1E3F                                                        | White text on it is 8.9:1                                                                                                                                                                                                                                        |
| Brand dark (headings, hover)                                                        | \#5C1229                                                        |                                                                                                                                                                                                                                                                  |
| Key words (bold phrases inside textbook lines, key-term definitions, recovery path) | Dark orange \#A84B08                                            | Darkened from \#B45309 in 0.11.9 so it keeps 4.5:1 contrast on the purple recovery cards. Term names, headings and labels keep their own colours.                                                                                                                |
| Brand light (small accents: chips, selected states)                                 | \#F9ECEF                                                        | Cards are white with a thin \#E8DADF border, so they never look like the pink wrong-answer box                                                                                                                                                                   |
| Page background                                                                     | \#FAF7F5 (warm off-white)                                       | Text \#1F2937 on it is 13.8:1                                                                                                                                                                                                                                    |
| Right and wrong feedback                                                            | Green \#15803D on \#EAFBEF; red \#B91C1C on \#FDECEC            | Every feedback box also has ✓ or ✗ and a coloured left border, so meaning never rests on colour                                                                                                                                                                  |
| 🆕 0.12.0: Self-check prompts                                                       | White or very light neutral background, thin border, 🔎 icon    | No ✓ or ✗ and no red or pink, so a self-check never looks like a wrong answer (Level 4 Q1 and Level 7 Q3)                                                                                                                                                        |
| Quick-check speech boxes (objection quick check)                                    | Customer light purple \#F1EAFF; staff pale blue \#EAF2FF        | Each line keeps its Customer or Staff label                                                                                                                                                                                                                      |
| The four stages                                                                     | Blue \#2563EB, orange \#EA580C, green \#16A34A, purple \#7C3AED | Stage table, the Stage 1 to 4 banners at the top of each stage card, four-stages comic and Service Recovery Path. In the Level 4 Q2 dropdown each stage name is shown in its colour; this matches the notes but does not show which line belongs to which stage. |

### Layout rules

- System sans-serif font. Light, high-contrast theme.

- Sticky top bar (title, 🏠 Home). Levels 1, 4, 5, 6 and 7 have sticky
  step tabs; locked tabs show 🔒. Levels 2 and 3 have a sticky Back and
  Next bar at the bottom.

- "Continue ↓" or "Show Step N ↓" reveals more on the same page; "Next
  →" moves on. The two are never labelled the same.

- One filled primary button per group; others outlined; at least 12px
  apart. Tap targets at least 44px.

- About 40 to 48px between separate blocks; 12 to 16px inside a block.

- Nothing is pre-selected: dropdowns, True/False buttons, quick-check
  options, MCQ options and confidence faces start empty. Only the
  student's own saved answers are restored.

- Works on students' PLDs (Chromebooks and iPads), on laptops and at
  phone width (360px). Hints, tips and fold-outs open on tap, never on
  hover only.

- Every level page starts with the same header: the level icon, "Level
  {n}: {title}" and the level description underneath.

- 🆕 0.12.0: One rule for typed answers: every box where students write
  a sentence needs at least 20 characters (from the next submit; work
  already submitted is not re-checked), and the screen and pop-ups say
  "at least one full sentence" rather than "characters". Boxes that
  expect one word or a link are exempt (Level 4 "Skill or quality" and
  the conversation link boxes).

- 🆕 0.12.0: Every "⚠️ Not finished yet" pop-up lists everything missing
  in one go, and labels each item exactly as the question is labelled on
  screen (Q1, Q2, …). "Box 2" and similar labels are never used.

### How the app applies Mayer's principles

| **Principle**      | **Where it shows in the app**                                                                                                                                                                                                                           |
|--------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Multimedia         | Nexora comics, the product-knowledge comics, the suitability picture, two Nexora videos and the real-life Foodpanda and Uniqlo examples sit inside the notes. Lists of more than three points are icon cards or icon chips.                             |
| Spatial contiguity | Each picture sits directly under the text it explains; feedback sits directly under its question; each speech-bubble example sits inside its technique card.                                                                                            |
| Coherence          | No facts beyond the textbook. Our own framing lines were cut or replaced with textbook sentences in version 0.10.0.                                                                                                                                     |
| Signaling          | Headings with icons, definition boxes for textbook definitions, bold orange key words inside textbook lines, numbered stages, parts and steps, a coloured banner at the top of every stage card, and stage colours in the notes.                        |
| Segmenting         | The notes are split into two levels of short cards (13 and 7), one idea each. The 8 steps sit on their own card, and the 8-steps video on the next card, so no card needs long scrolling.                                                               |
| Pre-training       | "4 key terms" on the home page before Level 2, and again as Level 2 card 1.                                                                                                                                                                             |
| Retrieval practice | Two quick checks in Level 2 (approaches; objection techniques), Think about it boxes, Level 4 Think back, the Level 6 step checklist and Level 7 Check. On the real-life example card the 8 steps are folded away so students try to recall them first. |
| Personalization    | Instructions talk to the student ("you") in a friendly tone. Definitions stay word for word.                                                                                                                                                            |
| Image              | No guide characters on learning pages. Alex and Suzzie get one small picture each, to show who the student is chatting with.                                                                                                                            |
| Accessibility      | Zoom allowed; every image has alt text (comics include every speech bubble); contrast at least 4.5:1; 🔊 Read aloud on every notes block; slide-ins switched off for reduced motion.                                                                    |

# D. Student screens

*Suggested times (self-study): Level 1 about 5 min, Level 2 about 18
min, Level 3 about 12 min, Level 4 about 10 min, Level 5 about 10 min,
Level 6 about 10 min, Level 7 about 8 min. Total about 75 min, which can
be spread over several sittings.*

## Landing and login

<table>
<colgroup>
<col style="width: 20%" />
<col style="width: 80%" />
</colgroup>
<thead>
<tr class="header">
<th colspan="2"><strong>0.1 Landing page (not logged in)</strong></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><strong>Trigger</strong></td>
<td>Opening the app link from SLS.</td>
</tr>
<tr class="even">
<td><strong>Student sees</strong></td>
<td><p>Sticky top bar: <strong>EBS Chapter 6</strong> (small label) /
<strong>Customer Service</strong> (title) / A self-study revision module
(subtitle) / a chip with the registration class (e.g. 3E1).</p>
<p><strong>[Image WELCOME] Welcome banner: "Welcome to your journey on
Customer Service!" with the Nexora staff member and
customer</strong></p>
<p>Card <strong>Step 1: Log in</strong></p>
<blockquote>
<p>Your class [read-only box showing the class the teacher has
chosen]</p>
<p>Your name [box]</p>
<p>Use the same name, class and register number each time to find your
progress.</p>
<p>Choose your register number. [dropdown: "Choose your register
number…", 1 to 50]</p>
<p>[Start]</p>
<p>Hi! In this module, you'll revise Chapter 6: Customer Service. You'll
read short notes, chat with an AI customer service officer, serve an AI
customer yourself, and check what you've learnt.</p>
</blockquote>
<p>Footer (every page): Teacher Mode · Reset progress · Unlock / A team
effort by Anthony, Daniel, Joshua and Jufinnie (NIE 2026) / Version
0.12.0.</p></td>
</tr>
<tr class="odd">
<td><strong>Interactions</strong></td>
<td><ul>
<li><p>Start checks the class, register number and name, then loads any
work saved on the server for this class and register number.</p>
<ul>
<li><p>New student: the name is saved to the profile and the Before you
start pop-up (0.2) opens.</p></li>
<li><p>Returning student: the name must match the saved one (capitals
ignored). Opens the home page (0.3) with "Your work has been
loaded."</p></li>
<li><p>Offline: uses the work saved on this device, with the offline bar
until the server can be reached.</p></li>
</ul></li>
</ul></td>
</tr>
<tr class="even">
<td><strong>Messages</strong></td>
<td><ul>
<li><p>No class set: "No registration class is available. Ask your
teacher to select a class."</p></li>
<li><p>Teacher changed the class meanwhile: "Your teacher changed the
registration class. Check the class at the top, then save
again."</p></li>
<li><p>No register number: "Please choose your register
number."</p></li>
<li><p>No name: "Please key in your name at the top of the
page."</p></li>
<li><p>Name does not match the saved name: "This register number has
already been registered to a student profile. Enter the saved name to
open that profile; the name and register number cannot be
changed."</p></li>
<li><p>Register number taken (server check): "This register number has
already been registered to a student profile. Check the class, register
number and saved name."</p></li>
<li><p>Old profile with no name: "Ask your teacher to set up the name
for this existing profile."</p></li>
<li><p>No classes yet: "No classes are available to select yet. Ask your
teacher."</p></li>
<li><p>Class list cannot load on a first visit: "Connect to the internet
to load your class list, then refresh this page."</p></li>
</ul></td>
</tr>
<tr class="odd">
<td><strong>Student thinks or does</strong></td>
<td>"I type my name, pick my register number and start."</td>
</tr>
<tr class="even">
<td><strong>Teacher only</strong></td>
<td><p>Identity is class, register number and name (agreed by the
group). Only one class is open for registration at a time; the teacher
chooses it in Teacher Mode. A name, once saved, cannot be changed by the
student; a teacher reset frees the register number.</p>
<p><strong>Saving progress.</strong> The whole record (levels finished,
current card or tab, badges, every answer including half-typed ones,
first and second attempts) is saved to the Google Sheet on every Next,
Submit and tab change, and while typing. A copy stays on the device and
offline changes are sent when the connection returns. First attempts are
never overwritten.</p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 20%" />
<col style="width: 80%" />
</colgroup>
<thead>
<tr class="header">
<th colspan="2"><strong>0.2 "Before you start" pop-up</strong></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><strong>Trigger</strong></td>
<td>First time after Start. Reopened any time from "📋 How this works"
on the home page. Until the student taps the button, every page shows
this pop-up.</td>
</tr>
<tr class="even">
<td><strong>Student sees</strong></td>
<td><p><strong>📋 Before you start</strong></p>
<blockquote>
<p>🗺️ Go through the levels in order. Each one opens when you finish the
one before.</p>
<p>💾 Your work saves automatically. You can stop and come back any
time, even on a different device: just log in with the same class and
register number.</p>
<p>🤖 Levels 4, 5 and 6 open an AI chatbot in a new tab. Log in with
your school Google account if asked, and don't share personal details in
the chat.</p>
<p>🔁 After you submit, you'll see a hint for anything you got wrong,
and you get one more try.</p>
<p>👀 Your teacher can see your answers, so do your best.</p>
<p>[✅ I'm ready]</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><strong>Interactions</strong></td>
<td><ul>
<li><p>"I'm ready" closes the pop-up and opens the home page. When
reopened later, the button reads "Close".</p></li>
</ul></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 20%" />
<col style="width: 80%" />
</colgroup>
<thead>
<tr class="header">
<th colspan="2"><strong>0.3 Home page (logged in)</strong></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><strong>Trigger</strong></td>
<td>After 0.2, and whenever the student taps 🏠 Home.</td>
</tr>
<tr class="even">
<td><strong>Student sees</strong></td>
<td><p>Top bar chip: <strong>{name} · {class} · Register No.
{n}</strong>.</p>
<p><strong>[Image WELCOME] Welcome banner (as on 0.1)</strong></p>
<p>Only for an older profile with no saved name: a card with Your class
(read-only), Your name [box], Register number (locked) with "Your
register number is tied to this profile and cannot be edited.", [Save
name] and "Check your name before saving. Once saved, it cannot be
edited."</p>
<blockquote>
<p>{Welcome line, see below}</p>
</blockquote>
<p>Links: 📋 How this works · 🔄 Sharing this device? Switch student</p>
<p>Card: <strong>Start here: 4 key terms</strong> / A 1-minute look
before Level 2</p>
<p>Each level card has an illustrated icon (ICON_STORIES, ICON_LEARN,
ICON_ALEX, ICON_SERVE, ICON_RECOVER, ICON_CHECK; Section F) beside its
number and title.</p>
<p><strong>Your route</strong>: "{n} of 7 levels done" with a progress
bar, then seven level cards:</p>
<blockquote>
<p>1 <strong>Your Customer Service Stories</strong>: Think about your
own experiences as a customer.</p>
<p>2 <strong>Learn: Customer Service (Part 1)</strong>: Short notes on
quality customer service, approaching customers and presenting product
information.</p>
<p>3 <strong>Learn: Customer Service (Part 2)</strong>: Short notes on
closing positively, after-sales support and service recovery.</p>
<p>4 <strong>Chat with Alex</strong>: Be the customer. Chat with
Nexora's customer service officer.</p>
<p>5 <strong>Serve Suzzie at Stylez</strong>: Switch roles. Now you're
the customer service officer.</p>
<p>6 <strong>Win Suzzie Back</strong>: Suzzie is upset. Use the 8 steps
to turn her bad experience into a good one.</p>
<p>7 <strong>Check and Exit Ticket</strong>: Check what you've learnt
and tell your teacher how confident you feel.</p>
</blockquote>
<p>Each card shows: Not started / In progress / ✅ {badge name} / 🔒
Locked.</p>
<p><strong>🏅 Your badges</strong>: Story Sharer, Service Scholar,
Service Saver, Service Spotter, Service Star, Service Superstar,
Completion Champion (greyed out until earned).</p>
<p>After all seven levels, the welcome card moves to the bottom with the
🎉 line and <strong>📊 My learning report</strong>.</p></td>
</tr>
<tr class="odd">
<td><strong>Interactions</strong></td>
<td><ul>
<li><p>Tap an open card to go to that level. A locked card shows:
"Finish Level {n − 1} first to open this level."</p></li>
<li><p>Switch student: "Log in as a different student? The work for
Class {class}, Register No. {n} stays saved." [Switch student]
[Cancel].</p></li>
</ul></td>
</tr>
<tr class="even">
<td><strong>Welcome line</strong></td>
<td><ul>
<li><p>0 done: "👋 Welcome to Chapter 6: Customer Service! In 7 short
levels, you'll find out what great customer service looks like, chat
with an AI customer service officer, and even serve a customer yourself.
Take your time, and do your best. Start with Level 1 below. You've got
this!"</p></li>
<li><p>1 to 6 done: "👋 Welcome back! Your work has been loaded. You've
finished {n} of 7 levels. Great progress! Carry on with Level {n+1}
below." ("Your work has been loaded." only on the first home page after
logging in.)</p></li>
<li><p>7 done: "🎉 Amazing work! You've finished all 7 levels. Have a
look at your learning report to see how you did."</p></li>
</ul></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 20%" />
<col style="width: 80%" />
</colgroup>
<thead>
<tr class="header">
<th colspan="2"><strong>0.4 4 key terms</strong></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><strong>Trigger</strong></td>
<td>Tapping "Start here: 4 key terms". Can be opened any time. The same
four cards are Level 2 card 1.</td>
</tr>
<tr class="even">
<td><strong>Student sees</strong></td>
<td><p><strong>4 key terms</strong> [🔊 Read aloud]</p>
<blockquote>
<p>You'll meet these words in Level 2. Read them once now.</p>
</blockquote>
<p>Four coloured term cards, each with an icon, the term, the definition
and an example:</p>
<blockquote>
<p><strong>Customer service</strong> / What businesses do for their
customers so that they are <strong>happy and satisfied</strong>. /
Example: Staff help you find the size of clothing you were looking
for.</p>
<p><strong>Quality customer service</strong> / Doing more for customers
to <strong>exceed their expectations</strong>. / Example: You buy a
birthday present, and the staff offer to gift-wrap it for free and add a
handwritten birthday card, even though you did not ask for it.</p>
<p><strong>Service breakdown</strong> / When customers <strong>make a
complaint</strong> about a product or service. / Example: You complain
to the shop staff because the earbuds you bought yesterday do not
work.</p>
<p><strong>Service recovery</strong> / A process whereby a business
<strong>takes action</strong> in response to <strong>service breakdown
or failure</strong>. / Example: The staff apologise, test your earbuds
and give you a new pair straight away.</p>
<p>[Got it, back to my route]</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><strong>Teacher only</strong></td>
<td>Textbook pp. 120, 123 and 140. Shown as term, definition and example
(agreed 27 October); the definitions keep the textbook's words after the
term. Full-sentence versions appear again in Level 2 card 2 and Level 3
card 3.</td>
</tr>
</tbody>
</table>

## Level 1: Your Customer Service Stories

<table>
<colgroup>
<col style="width: 20%" />
<col style="width: 80%" />
</colgroup>
<thead>
<tr class="header">
<th colspan="2"><strong>1.1 Your stories (one step)</strong></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><strong>Trigger</strong></td>
<td>Tapping Level 1. Open from the start.</td>
</tr>
<tr class="even">
<td><strong>Student sees</strong></td>
<td><p>Level header: [ICON_STORIES] <strong>Level 1: Your Customer
Service Stories</strong> / Think about your own experiences as a
customer.</p>
<blockquote>
<p>There are no right or wrong answers.</p>
<p>💡 Tip: Don't name real people. Your teacher will read your
answers.</p>
</blockquote>
<p>Three cards (stacked on phones, side by side on wider screens):</p>
<blockquote>
<p>😊 <strong>Q1.</strong> Think of a time you got GOOD customer service
(e.g. at a bubble tea shop, a hawker stall, or when ordering on
GrabFood). What did the staff do? [box, hint "The staff member..."]</p>
<p>😞 <strong>Q2.</strong> Think of a time you got BAD customer service.
What happened? [box, hint "What happened was..."]</p>
<p>🤔 <strong>Q3.</strong> Look at your two stories. What do you think
makes customer service good or bad? [box, hint "I think customer service
is good when... and bad when..."]</p>
<p>Type at least one full sentence in each box, then tap Submit.</p>
</blockquote>
<p>🆕 0.12.0: Question numbers shown as Q1, Q2 and Q3 (were 1, 2 and 3),
and the instruction no longer says "characters".</p>
<blockquote>
<p>[Submit]</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><strong>Feedback</strong></td>
<td><ul>
<li><p>🆕 0.12.0: Any box empty or under 20 characters: one "⚠️ Not
finished yet" pop-up listing every such box as "✗ Q{n}: Write at least
one full sentence", marked in red, with [Go back].</p></li>
<li><p>After Submit (not scored): 📌 <strong>Remember this</strong>:
"Keep your stories in mind. In Level 2, see whether your ideas match
what businesses call quality customer service." [Finish Level
1]</p></li>
</ul></td>
</tr>
<tr class="even">
<td><strong>Complete</strong></td>
<td>Badge pop-up: <strong>Story Sharer</strong> "You earned the Story
Sharer badge!" [Back to my route]. Level 2 unlocks.</td>
</tr>
<tr class="odd">
<td><strong>Teacher only</strong></td>
<td>Answers go to Teacher Mode and the learning report.</td>
</tr>
</tbody>
</table>

## Level 2: Learn: Customer Service (Part 1)

*Level card description: "Short notes on quality customer service,
approaching customers and presenting product information." 13 cards, one
idea each, shown one at a time. The level header is the same as in every
level: \[ICON_LEARN\] Level 2: Learn: Customer Service (Part 1) with the
description underneath. Under it, a progress line reads "{n} of 13 ·
{card name}" with a progress bar. Back and Next sit in a sticky bar at
the bottom; the last card's button reads Finish Level 2. Every notes
card has 🔊 Read aloud, and every picture has 🔍 Tap to enlarge. Nothing
in Levels 2 and 3 is scored. Next is held back on card 8 (Think about
it, at least one full sentence) and on the two quick checks (every item
settled).*

| **Card** | **Progress label**                              | **Stage**       |
|----------|-------------------------------------------------|-----------------|
| 1        | 4 key terms                                     |                 |
| 2        | What is customer service?                       |                 |
| 3        | Why quality customer service matters            |                 |
| 4        | Skills and qualities                            |                 |
| 5        | Good product knowledge                          |                 |
| 6        | The four stages                                 |                 |
| 7        | Stage 1: Approaching customers                  | Stage 1         |
| 8        | Watch: A better welcome at Nexora               | Stage 1         |
| 9        | Quick check                                     | Stage 1         |
| 10       | Stage 2: Finding out customers' needs and wants | Stage 2, part 1 |
| 11       | Stage 2: Presenting the product                 | Stage 2, part 2 |
| 12       | Stage 2: Handling questions and objections      | Stage 2, part 3 |
| 13       | Stage 2: Quick check                            | Stage 2         |

| **2.1 Card 1: 4 key terms** |                                                                                                                          |
|-----------------------------|--------------------------------------------------------------------------------------------------------------------------|
| **Student sees**            | **4 key terms** \[🔊 Read aloud\], then the same four term cards as 0.4 (term, definition with bold key words, example). |

<table>
<colgroup>
<col style="width: 20%" />
<col style="width: 80%" />
</colgroup>
<thead>
<tr class="header">
<th colspan="2"><strong>2.2 Card 2: What is customer
service?</strong></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><strong>Student sees</strong></td>
<td><p><strong>🤝 What is customer service?</strong></p>
<blockquote>
<p>📖 <strong>Customer service</strong> refers to what businesses do for
their customers so that they are <strong>happy and
satisfied</strong>.</p>
<p>It takes place <strong>the moment a customer enters</strong> a shop,
a restaurant or an attraction, and <strong>continues even after the
customer has made a purchase</strong> and left the venue.</p>
</blockquote>
<p><strong>[Image C05] Customer service timeline comic: Walks in, Pays,
A week later</strong></p>
<p><strong>⭐ What is quality customer service?</strong></p>
<blockquote>
<p>📖 <strong>Quality customer service</strong> means doing more for
customers to <strong>exceed their expectations</strong>.</p>
</blockquote></td>
</tr>
<tr class="even">
<td><strong>Teacher only</strong></td>
<td>Textbook pp. 120 and 123, word for word. C05 sits directly under the
sentence it illustrates; its third panel (a question in Nexora's online
chat a week later) shows that customer service continues after the
purchase.</td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 20%" />
<col style="width: 80%" />
</colgroup>
<thead>
<tr class="header">
<th colspan="2"><strong>2.3 Card 3: Why quality customer service
matters</strong></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><strong>Student sees</strong></td>
<td><p><strong>❓ Why does quality customer service matter?</strong></p>
<blockquote>
<p>If a business provides quality customer service:</p>
</blockquote>
<p>Three icon cards:</p>
<blockquote>
<p>🔁 Customers will have a <strong>positive experience</strong> and
they will choose to <strong>return repeatedly</strong>;</p>
<p>🗣️ Customers will <strong>recommend the business</strong> to their
relatives and friends; and</p>
<p>🤝 <strong>Customer loyalty</strong> is created, ensuring the
<strong>continuity of the business</strong>.</p>
</blockquote>
<p><strong>[Image C01] Good service vs poor service
comic</strong></p></td>
</tr>
<tr class="even">
<td><strong>Teacher only</strong></td>
<td>Textbook p. 122, word for word (each card starts with a capital
letter).</td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 20%" />
<col style="width: 80%" />
</colgroup>
<thead>
<tr class="header">
<th colspan="2"><strong>2.4 Card 4: Skills and qualities</strong></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><strong>Student sees</strong></td>
<td><p><strong>🧑‍💼 Skills and qualities of a good customer service
employee</strong></p>
<blockquote>
<p>To deliver quality customer service, service staff need these skills
and qualities:</p>
</blockquote>
<p>Six icon cards, name in bold with a short description:</p>
<blockquote>
<p>😊 <strong>Approachable</strong>: Friendly and easy to talk to, so
customers feel comfortable asking for help</p>
<p>🎯 <strong>Customer-focused</strong>: Paying attention to what each
customer needs and putting those needs first</p>
<p>🧠 <strong>Knowledgeable</strong>: Knowing the products well, so you
can answer questions accurately</p>
<p>💬 <strong>Clear communication skills</strong>: Explaining things
clearly and simply, and listening carefully</p>
<p>🛠️ <strong>Problem-solving skills</strong>: Providing solutions, not
just apologising</p>
<p>👋 <strong>Able to close the customer experience positively</strong>:
Ending on a good note, e.g. thanking the customer and inviting them
back</p>
</blockquote></td>
</tr>
<tr class="even">
<td><strong>Teacher only</strong></td>
<td>The six skills and their order are from textbook p. 123. The
descriptions are ours.</td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 20%" />
<col style="width: 80%" />
</colgroup>
<thead>
<tr class="header">
<th colspan="2"><strong>2.5 Card 5: Good product knowledge</strong></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><strong>Student sees</strong></td>
<td><p><strong>📱 Good product knowledge</strong></p>
<blockquote>
<p>📖 <strong>Product knowledge</strong> refers to knowledge a service
staff has of a product's <strong>features and benefits</strong>.</p>
<p>🎯 Service staff with good product knowledge will be able to
<strong>meet the needs and wants of customers</strong> and
<strong>increase customer satisfaction</strong> so that they will want
to come back again. (second definition box, directly under the first,
16px apart)</p>
<p>Product knowledge includes:</p>
</blockquote>
<p>Five headings, each with a Nexora comic whose speech bubble shows the
staff member's line:</p>
<blockquote>
<p>📋 Product features and benefits (e.g. a large screen that makes
reading easier)</p>
</blockquote>
<p><strong>[Image PK_FEATURES] "The Nexora Spark has a large screen for
reading and an all-day battery."</strong></p>
<blockquote>
<p>💲 Price and available options</p>
</blockquote>
<p><strong>[Image PK_PRICE] "The Nexora Core is $799. You can upgrade to
256GB for $80 more, or 512GB for $160 more."</strong></p>
<blockquote>
<p>🧴 How to use or care for the product</p>
</blockquote>
<p><strong>[Image PK_CARE] "You may use a protective case and wipe the
screen with a soft, dry cloth to maintain its condition."</strong></p>
<blockquote>
<p>🛡️ Warranty and after-sales support</p>
</blockquote>
<p><strong>[Image PK_WARRANTY] "Every Nexora phone has a 1-year warranty
for manufacturing defects. Keep your receipt, and bring the phone to our
Nexora Care Bar if anything goes wrong."</strong></p>
<blockquote>
<p>⭐ Unique selling points of the product (why your product is better
than competitors' products)</p>
</blockquote>
<p><strong>[Image PK_SELLING_POINT] "Compared with many phones at this
price, the Nexora Spark's all-day battery lasts longer, so it suits you
if you use your phone often."</strong></p>
<p>On Chromebook and laptop widths the five comics sit two per row, with
the fifth centred; on phones they stack.</p></td>
</tr>
<tr class="even">
<td><strong>Teacher only</strong></td>
<td>Definition and the benefits sentence: textbook p. 127, word for
word. The benefits sentence moved up into its own definition box in
0.11.3, so students read why product knowledge matters before the list.
The five aspects follow the textbook's retail list and the syllabus
outcome "identify aspects of product knowledge". The Nexora facts match
the Nexora business profile. Read aloud reads each heading followed by
its comic line.</td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 20%" />
<col style="width: 80%" />
</colgroup>
<thead>
<tr class="header">
<th colspan="2"><strong>2.6 Card 6: The four stages</strong></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><strong>Student sees</strong></td>
<td><p><strong>🗺️ The four stages of providing customer
service</strong></p>
<p>Table with a coloured bar on the left of each row (blue, orange,
green, purple):</p>
<blockquote>
<p>👋 <strong>1. Approaching customers</strong>: Greet the customer and
show you're happy to help.</p>
<p>📱 <strong>2. Presenting product information</strong>: Find out the
customer's needs, present a suitable product and handle questions or
objections.</p>
<p>✅ <strong>3. Closing the customer experience positively</strong>:
Thank the customer, sum up what they decided and give after-sales
support.</p>
<p>🛠️ <strong>4. Performing service recovery</strong>: Respond well when
something goes wrong.</p>
</blockquote>
<p><strong>[Image C02] Four stages comic</strong></p></td>
</tr>
<tr class="even">
<td><strong>Teacher only</strong></td>
<td>The four stages follow the 2026 syllabus (3.2.2). The textbook's
chapter summary lists after-sales service separately; the group placed
it under Stage 3, closing the customer experience positively (decided 27
October). The row descriptions are ours.</td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 20%" />
<col style="width: 80%" />
</colgroup>
<thead>
<tr class="header">
<th colspan="2"><strong>2.7 Card 7: Stage 1: Approaching
customers</strong></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><strong>Student sees</strong></td>
<td><p><strong>[Image STAGE1_BANNER] Stage 1 banner (blue), then heading
👋 Approaching customers: 3 approaches</strong></p>
<blockquote>
<p>⏰ <strong>When to approach:</strong> As soon as a customer enters
the store. If you are busy serving someone else, still acknowledge the
new customer by <strong>making eye contact, smiling and greeting them
politely</strong>.</p>
</blockquote>
<p>Three approach cards with speech-bubble examples:</p>
<blockquote>
<p>👋 <strong>1. Greeting Approach</strong> / Greet the customer
<strong>in a friendly way</strong> as they enter, e.g. "Good morning!" /
For a regular customer, <strong>use their name</strong>: "Good morning,
Mr Tan!"</p>
<p>🙋 <strong>2. Service Approach</strong> / Ask a <strong>polite
question</strong> to show you're ready to help, e.g. "How may I assist
you?" / If a customer comes up to you to ask for something or to pay,
serve them <strong>as quickly as possible</strong>. / You can also
combine the greeting and service approaches: "Good morning! How may I
assist you?"</p>
<p>📱 <strong>3. Product Approach</strong> / When a customer is
<strong>looking closely at a product</strong>, ask a question about it
to help them go from just being interested to <strong>actually buying
it</strong>, e.g. "This phone has a great camera. Would you like to try
it out?"</p>
<p>Whether salespeople use the greeting, service or product approach,
the purpose is to:</p>
<p>😊 Make customers feel <strong>comfortable or welcome</strong> in the
store so that they are likely to buy from the business; and</p>
<p>🔁 Ensure customers <strong>return to the business again</strong> in
the future.</p>
</blockquote>
<p><strong>[Image C03] Three approaches comic</strong></p></td>
</tr>
<tr class="even">
<td><strong>Teacher only</strong></td>
<td>Textbook pp. 125 and 126. The purpose lines are word for word.
Speech-bubble lines are normal weight, so the bold key words stand
out.</td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 20%" />
<col style="width: 80%" />
</colgroup>
<thead>
<tr class="header">
<th colspan="2"><strong>2.8 Card 8: Watch: A better welcome at
Nexora</strong></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><strong>Student sees</strong></td>
<td><p><strong>Watch: A better welcome at Nexora</strong></p>
<blockquote>
<p>Watch this video showing poor and good service. Notice what Alex does
differently and how June responds.</p>
</blockquote>
<p><strong>[Video A] A better welcome at Nexora (YouTube
https://youtu.be/_Esvxks4ZjQ, embedded; students press
play)</strong></p>
<blockquote>
<p>Video not loading? Watch it on YouTube</p>
</blockquote>
<p>Card <strong>🤔 Think about it</strong> (required):</p>
<blockquote>
<p>What did Alex do to make June feel welcome? Why did she bring her
friend back? [box, hint "Write at least one full sentence..."]</p>
<p>Your progress saves automatically. Next saves your answer.</p>
</blockquote></td>
</tr>
<tr class="even">
<td><strong>Feedback</strong></td>
<td>🆕 0.12.0: Next with an answer under 20 characters: pop-up "Answer
too short" ("Your answer is too short. Write at least one full sentence
in each box.") or, if empty, "Complete all questions" ("Please complete
all questions before moving on. Write at least one full sentence in each
box."), with [Back to questions]. The same pop-ups are used on Level 3
cards 6 and 7.</td>
</tr>
<tr class="odd">
<td><strong>Teacher only</strong></td>
<td>Privacy-enhanced youtube-nocookie.com player, never starts by
itself, no transcript, no hosting bandwidth used. Saved as
s2.video.</td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 20%" />
<col style="width: 80%" />
</colgroup>
<thead>
<tr class="header">
<th colspan="2"><strong>2.9 Card 9: Quick check: Which approach is
this?</strong></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><strong>Student sees</strong></td>
<td><p><strong>🎯 Quick check: Which approach is this?</strong></p>
<blockquote>
<p>Select the most appropriate approach for each question.</p>
<p>a) "Hi Mr Lim, nice to see you again!" [Greeting] [Service]
[Product]</p>
<p>b) "Can I help you find something today?" [Greeting] [Service]
[Product]</p>
<p>c) "That model takes great night photos. Want to try the camera?"
[Greeting] [Service] [Product]</p>
</blockquote></td>
</tr>
<tr class="even">
<td><strong>Feedback</strong></td>
<td><p>Instant, under each item. Right: "✓ Correct: {reason}". Wrong
first time: "✗ {hint}", the wrong pick is marked and the student tries
once more. Wrong again: "✗ The answer is {answer}: {reason}".</p>
<ul>
<li><p>a) Greeting. Hint: "Is the staff member offering help or talking
about a product, or just welcoming the customer?" Reason: "The staff
member welcomes a regular customer by name. That is the greeting
approach."</p></li>
<li><p>b) Service. Hint: "Is this a welcome, or a question showing the
staff member is ready to help?" Reason: "The staff member asks a polite
question to show they are ready to help. That is the service
approach."</p></li>
<li><p>c) Product. Hint: "What is the customer looking at, and what does
the staff member talk about?" Reason: "The staff member talks about the
phone the customer is looking at. That is the product
approach."</p></li>
</ul>
<p>Next before every item is settled: "⚠️ Not finished yet" listing the
items.</p></td>
</tr>
<tr class="odd">
<td><strong>Teacher only</strong></td>
<td>Not scored and not in the learning report.</td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 20%" />
<col style="width: 80%" />
</colgroup>
<thead>
<tr class="header">
<th colspan="2"><strong>2.10 Card 10: Stage 2, part 1: Finding out
customers' needs and wants</strong></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><strong>Student sees</strong></td>
<td><p><strong>[Image STAGE2_BANNER] Stage 2 banner (orange), heading 📱
Presenting product information, part heading 1 🔍 Finding out customers'
needs and wants</strong></p>
<blockquote>
<p>Once you have greeted the customer, find out what they need by
<strong>asking the correct questions and listening carefully</strong>.
Then it is easier to show them the correct product.</p>
</blockquote>
<p>Table: Scenario | What the salesperson can do (each row stacks as a
card on phones):</p>
<blockquote>
<p>🎯 The customers know exactly what they want. | The salesperson can
get the customers to <strong>try the product immediately</strong>.</p>
<p>👀 The customers have nothing specific in mind to buy and are just
browsing. | The salesperson may inform customers of <strong>new arrivals
or special promotions</strong> to arouse their interest.</p>
<p>🤔 The customers only have a general idea of what they want. | Ask
<strong>open-ended questions</strong> to encourage the customer to share
more about their needs. / <strong>Listen carefully</strong> to what the
customer says. / Pay attention to the customer's <strong>body
language</strong> by observing his or her response.</p>
</blockquote></td>
</tr>
<tr class="even">
<td><strong>Teacher only</strong></td>
<td>Textbook p. 129; the table is word for word.</td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 20%" />
<col style="width: 80%" />
</colgroup>
<thead>
<tr class="header">
<th colspan="2"><strong>2.11 Card 11: Stage 2, part 2: Presenting the
product</strong></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><strong>Student sees</strong></td>
<td><p>Stage 2 banner and heading, part heading <strong>2 🛍️ Presenting
the product</strong></p>
<blockquote>
<p>Techniques for effective product presentation:</p>
</blockquote>
<p>Six icon chips:</p>
<blockquote>
<p>📱 Hold the product carefully and <strong>with pride</strong>.</p>
<p>⭐ Tell customers about the <strong>unique features and
benefits</strong> of the product.</p>
<p>👆 <strong>Demonstrate</strong> how to use the product and, if
possible, let the customers hold or use it.</p>
<p>👂 Listen to customers' queries and provide <strong>detailed
answers</strong>.</p>
<p>💬 Use <strong>positive words</strong> such as "comfortable",
"interesting" or "attractive" to describe the features of the
product.</p>
<p>🔁 If necessary, <strong>repeat the product's features and
benefits</strong> several times, especially if they match the needs that
the customers have expressed.</p>
<p>Don't just list every good feature. Point out the features that match
what this customer needs. For example, a customer who takes lots of
photos should hear information about the phone's camera, not how good
the phone looks.</p>
</blockquote>
<p><strong>[Image SUITABILITY] Matching the phone camera to a customer
who enjoys photography</strong></p></td>
</tr>
<tr class="even">
<td><strong>Teacher only</strong></td>
<td>Techniques: textbook p. 130, word for word. The suitability
paragraph is ours and sits directly above the picture it explains.</td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 20%" />
<col style="width: 80%" />
</colgroup>
<thead>
<tr class="header">
<th colspan="2"><strong>2.12 Card 12: Stage 2, part 3: Handling
customers' questions and objections</strong></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><strong>Student sees</strong></td>
<td><p>Stage 2 banner and heading, part heading <strong>3 🙋 Handling
customers' questions and objections</strong></p>
<blockquote>
<p>When customers ask questions or raise objections, it is often a sign
that they are interested in the product. Use this chance to persuade
them to buy.</p>
</blockquote>
<p>Four numbered technique cards, each with an Example in Customer and
Staff speech bubbles:</p>
<blockquote>
<p><strong>1. Turn a negative remark into a selling point.</strong> /
Point out to customers that what they see as a <strong>negative aspect
of the product</strong> may also have <strong>positive
functions</strong>. / Example: Customer: "This phone is a bit heavy."
Staff: "It's heavier because it has a bigger battery, so it lasts the
whole day."</p>
<p><strong>2. Use the "yes, but" response.</strong> / <strong>Agree with
the customers first</strong> and then <strong>point out an
advantage</strong> that can adequately offset their concerns. / Example:
Customer: "The Nexora Prime is expensive." Staff: "Yes, it costs more,
but its fast processor runs your games smoothly."</p>
<p><strong>3. Encourage customers to share their concerns.</strong> /
Ask customers to tell you about their concerns. As the customers
elaborate, they may <strong>provide you with clues</strong> on how to
address their concerns. / Example: Staff: "What worries you most about
switching to a new phone?"</p>
<p><strong>4. Correct misconceptions.</strong> / This method should be
used when customers are <strong>misinformed</strong>. However, be sure
to do this <strong>tactfully</strong> so as not to come across as rude.
/ Example: Customer: "So the warranty covers everything, right?" Staff:
"Good question! The warranty covers manufacturing defects. Accidental
damage, such as dropping the phone, isn't covered."</p>
</blockquote>
<p><strong>[Image C06] Handling objections comic (v2): the four examples
acted out</strong></p></td>
</tr>
<tr class="even">
<td><strong>Teacher only</strong></td>
<td>Titles and explanations: textbook p. 135, word for word; the bold
phrases follow the textbook's own highlights. The intro is shortened
from p. 132. The Nexora examples are ours and match the business
profile. C06 acts out the four examples, directly under the technique
cards.</td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 20%" />
<col style="width: 80%" />
</colgroup>
<thead>
<tr class="header">
<th colspan="2"><strong>2.13 Card 13: Stage 2: Quick check: Which
technique is this?</strong></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><strong>Student sees</strong></td>
<td><p><strong>🎯 Quick check: Which technique is this?</strong></p>
<blockquote>
<p>Tap one for each.</p>
</blockquote>
<p>Each item shows a Customer line (light purple box) and a Staff line
(pale blue box), each with its speaker label, then four options (2 by 2
on phones, in a row on laptops), always in this order: [Negative into
selling point] [Yes, but] [Share concerns] [Correct misconception]</p>
<blockquote>
<p>a) Customer: "The Nexora Spark's camera is quite basic." Staff:
"You're right, the camera is simple. However, the Spark's battery lasts
longer than many phones at this price."</p>
<p>b) Customer: "I can only trade in an old Nexora phone, right?" Staff:
"Good question! You can trade in an old phone of any brand, and we'll
give you store credit off your new Nexora phone."</p>
<p>c) Customer: "The Nexora Core's box looks so plain." Staff: "It's
plain because it's made mostly of recycled cardboard, which is better
for the environment."</p>
<p>d) Customer: "Hmm, I'm not sure about buying a new phone today."
Staff: "That's okay! What's making you unsure? Tell me more and I'll see
how I can help."</p>
</blockquote></td>
</tr>
<tr class="even">
<td><strong>Feedback</strong></td>
<td><p>Same behaviour as card 9.</p>
<ul>
<li><p>a) Yes, but. Hint: "What does the staff member say first about
the camera? What do they talk about after that?" Reason: "The staff
member agrees that the camera is simple, then points out a different
advantage: the long battery life. That is the "yes, but"
response."</p></li>
<li><p>b) Correct misconception. Hint: "Was the customer's information
right? What does the staff member do about it?" Reason: "The customer
thought only Nexora phones could be traded in. The staff member politely
gives the correct information. That is correcting a misconception
tactfully."</p></li>
<li><p>c) Negative into selling point. Hint: "Does the staff member talk
about a different feature, or show that the plain box itself is a good
thing?" Reason: "The customer sees the plain box as a negative. The
staff member shows it is plain because it is made of recycled cardboard,
which is a positive. That is turning a negative remark into a selling
point."</p></li>
<li><p>d) Share concerns. Hint: "Does the staff member give the customer
information, or ask the customer to say more?" Reason: "The staff member
asks the customer to say more about what is worrying them. That is
encouraging customers to share their concerns."</p></li>
</ul></td>
</tr>
<tr class="odd">
<td><strong>Teacher only</strong></td>
<td>Added in version 0.10.0 so the reading has a purpose (retrieval
practice). None of the items repeats a card 12 example, and item a
avoids the words "yes, but", so students must recognise the structure.
Not scored and not in the learning report.</td>
</tr>
<tr class="even">
<td><strong>Complete</strong></td>
<td>This is the last card of Level 2; its button reads Finish Level 2.
Badge pop-up: <strong>Service Scholar</strong> "You earned the Service
Scholar badge!" [Back to my route]. Level 3 unlocks.</td>
</tr>
</tbody>
</table>

## Level 3: Learn: Customer Service (Part 2)

*Level card description: "Short notes on closing positively, after-sales
support and service recovery." 7 cards, shown one at a time in the same
way as Level 2 ("{n} of 7 · {card name}"), under the same header
(\[ICON_LEARN\] Level 3: Learn: Customer Service (Part 2) with the
description); the last card's button reads Finish Level 3. Next is held
back on cards 6 and 7 (Think about it, at least one full sentence).*

| **Card** | **Progress label**                                  | **Stage** |
|----------|-----------------------------------------------------|-----------|
| 1        | Stage 3: Closing the customer experience positively | Stage 3   |
| 2        | Stage 3: After-sales support                        | Stage 3   |
| 3        | Stage 4: Service breakdown and service recovery     | Stage 4   |
| 4        | The 8 service recovery steps                        | Stage 4   |
| 5        | Watch: The 8 steps in action                        | Stage 4   |
| 6        | Real-life example: Poor service recovery            | Stage 4   |
| 7        | Handling returns                                    | Stage 4   |

<table>
<colgroup>
<col style="width: 20%" />
<col style="width: 80%" />
</colgroup>
<thead>
<tr class="header">
<th colspan="2"><strong>3.1 Card 1: Stage 3: Closing the customer
experience positively</strong></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><strong>Student sees</strong></td>
<td><p><strong>[Image STAGE3_BANNER] Stage 3 banner (green). No heading
under it: the banner names the stage (heading removed in 0.11.7 to avoid
repeating it).</strong></p>
<blockquote>
<p>The final goal of every salesperson is to <strong>complete a
sale</strong> and close the customer experience positively.</p>
<p>Signs that the customer had a positive experience:</p>
<p>🗣️ <strong>Makes remarks</strong> such as "This is exactly the item I
am looking for."</p>
<p>😊 <strong>Looks happy</strong> with the product and is not looking
at other products.</p>
<p>🛍️ <strong>Asks for other products</strong> that can complement the
recently purchased product.</p>
<p><strong>Show appreciation</strong> to customers when closing, even if
they do not buy:</p>
<p>🧾 After a sale: "Thank you, I'm sure the product will meet your
needs. It has been a pleasure serving you."</p>
<p>👋 If the customer does not buy: "Certainly, thank you for your
interest. Do come back if you decide to buy it another day."</p>
</blockquote>
<p><strong>[Image C07] Closing comic (v2): Signs of a positive
experience, After a sale, If the customer does not buy</strong></p></td>
</tr>
<tr class="even">
<td><strong>Teacher only</strong></td>
<td>Textbook p. 136; the first line, the three signs and both speech
lines are word for word. C07 shows the signs and both appreciation
lines, directly under them.</td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 20%" />
<col style="width: 80%" />
</colgroup>
<thead>
<tr class="header">
<th colspan="2"><strong>3.2 Card 2: Stage 3: After-sales
support</strong></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><strong>Student sees</strong></td>
<td><p><strong>[Image STAGE3_BANNER] Stage 3 banner, heading 🛡️
After-sales support</strong></p>
<blockquote>
<p>📖 <strong>After-sales service</strong> refers to the <strong>help
given to customers after they have bought a product</strong>.</p>
<p>Providing good after-sales service is one way businesses can be
<strong>better than their competitors</strong>.</p>
</blockquote>
<p>Four icon cards:</p>
<blockquote>
<p>🛡️ <strong>Warranty</strong>: Explain what the warranty covers and
remind customers to keep their receipt.</p>
<p>🛠️ <strong>Repairs</strong>: Explain how to arrange a repair and what
happens next.</p>
<p>💬 <strong>Hotline and online chat</strong>: Answer customers'
enquiries and complaints in-store, by phone or through online chat.</p>
<p>🔄 <strong>Exchanges and refunds</strong>: Explain the store's rules
for exchanges and refunds.</p>
<p>When handling customers' enquiries, salespeople should:</p>
<p>👂 <strong>Listen</strong> to the customers carefully.</p>
<p>❓ <strong>Clarify</strong> with them by asking questions to get a
better understanding.</p>
<p>✅ Provide them with <strong>relevant and accurate
information</strong>.</p>
</blockquote></td>
</tr>
<tr class="even">
<td><strong>Teacher only</strong></td>
<td>Definition: textbook p. 138. "Providing good after-sales service…":
p. 138. The four cards follow the textbook's types of after-sales
service (p. 138); the descriptions are ours. Enquiries: p. 139, word for
word.</td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 20%" />
<col style="width: 80%" />
</colgroup>
<thead>
<tr class="header">
<th colspan="2"><strong>3.3 Card 3: Stage 4: Service breakdown and
service recovery</strong></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><strong>Student sees</strong></td>
<td><p><strong>[Image STAGE4_BANNER] Stage 4 banner (purple), heading ⚠️
Service breakdown and service recovery</strong></p>
<blockquote>
<p>📖 <strong>Service breakdown:</strong> A service breakdown occurs
when customers <strong>make a complaint</strong> about a product or
service. / Common causes: Unfriendly or unhelpful staff, a product that
does not meet expectations, or an advertised product that is not
available in the store.</p>
</blockquote>
<p>(16px gap between the two definition boxes)</p>
<blockquote>
<p>📖 <strong>Service recovery:</strong> Service recovery is a process
whereby a business <strong>takes action</strong> in response to service
breakdown or failure.</p>
</blockquote>
<p><strong>[Image C04] Service breakdown to service recovery
comic</strong></p>
<blockquote>
<p>A customer's complaint provides an opportunity for a business to
<strong>build customer loyalty</strong>. This is because if the
complaint is handled well, the customer's <strong>bad experience can be
turned into a good one</strong>.</p>
<p>A business will <strong>lose its customers to competitors</strong> if
it does not try to win a customer back.</p>
</blockquote></td>
</tr>
<tr class="even">
<td><strong>Teacher only</strong></td>
<td>Textbook pp. 140 and 141, word for word.</td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 20%" />
<col style="width: 80%" />
</colgroup>
<thead>
<tr class="header">
<th colspan="2"><strong>3.4 Card 4: The 8 service recovery
steps</strong></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><strong>Student sees</strong></td>
<td><p><strong>🛤️ The 8 service recovery steps</strong></p>
<blockquote>
<p>Follow Nexora's staff member as he uses the 8 steps with a customer
whose new phone screen cracked on its own.</p>
</blockquote>
<p>The Service Recovery Path (built in the page, not an image): a
vertical path of numbered stops on a purple line. Each stop has an icon,
the textbook step with its key words in bold, the staff member's line,
and a face showing how the customer feels.</p>
<blockquote>
<p>👂 1. <strong>Listen carefully</strong> to the complaint. Give
customers <strong>full attention</strong>. / (Puts his own phone away
and faces the customer.) / angry</p>
<p>⏳ 2. <strong>Be patient</strong>. <strong>Do not interrupt</strong>
customers when they are describing their unhappiness. / (Nods and lets
her finish.) / angry</p>
<p>🙏 3. <strong>Apologise</strong> to the customers for the
inconvenience caused. / "I'm really sorry for the trouble this has
caused you." / upset</p>
<p>💙 4. <strong>Acknowledge their feelings</strong> and <strong>assure
them of help</strong> to solve the problem. / "I understand why you're
upset. I'll help you sort this out." / calmer</p>
<p>❓ 5. <strong>Ask questions</strong> if more information is needed. /
"When did you buy it, and when did you first notice the crack?" /
calmer</p>
<p>🛠️ 6. <strong>Offer solutions</strong>. / "Since it's still under
warranty, I can give you a replacement phone today." / reassured</p>
<p>🧑‍💼 7. <strong>Refer customers to more senior staff</strong> if unable
to provide them with an acceptable solution. / "If you'd prefer
something else, my manager can look at other options for you." /
reassured</p>
<p>😊 8. <strong>Thank customers</strong> for bringing the problem to
our attention. / "Thank you for letting us know about this." / happy</p>
</blockquote></td>
</tr>
<tr class="even">
<td><strong>Interactions</strong></td>
<td>All 8 stops show at once (changed in version 0.11.0, so students no
longer tap Show Step eight times). Next is not held back.</td>
</tr>
<tr class="odd">
<td><strong>Teacher only</strong></td>
<td>Steps: textbook pp. 140 and 141, word for word. The speech lines are
approved examples that follow the cracked-phone story in C04 and Video B
(next card). A screen that cracks on its own during careful use is a
manufacturing defect, so the warranty replacement in Step 6 is
consistent with the Nexora business profile.</td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 20%" />
<col style="width: 80%" />
</colgroup>
<thead>
<tr class="header">
<th colspan="2"><strong>3.5 Card 5: Watch: The 8 steps in
action</strong></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><strong>Student sees</strong></td>
<td><p><strong>[Image STAGE4_BANNER] Stage 4 banner, heading Watch: The
8 steps in action</strong></p>
<blockquote>
<p>Watch Alex use all 8 steps to help June with her cracked phone.</p>
</blockquote>
<p><strong>[Video B] The 8 steps in action (YouTube
https://youtu.be/IWZ4xwI2fF8, embedded; students press play; watching is
not required)</strong></p>
<blockquote>
<p>Video not loading? Watch it on YouTube</p>
</blockquote></td>
</tr>
<tr class="even">
<td><strong>Teacher only</strong></td>
<td>Moved from the bottom of the 8-steps card to its own card in version
0.11.0, so the 8-steps card needs less scrolling. No Think about it box,
as before.</td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 20%" />
<col style="width: 80%" />
</colgroup>
<thead>
<tr class="header">
<th colspan="2"><strong>3.6 Card 6: Real-life example: Poor service
recovery</strong></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><strong>Student sees</strong></td>
<td><p><strong>📉 Real-life example: Poor service recovery</strong></p>
<blockquote>
<p>A customer complained to a food delivery app that their orders from
one restaurant had been cancelled 4 times. The replies? "oh" and "so
sad", followed by a $3.30 voucher "to say we're sorry".</p>
</blockquote>
<p><strong>[Image R01 + R02] Foodpanda chat and voucher screenshots side
by side (stacked on phones)</strong></p>
<p>Fold-out, closed by default: <strong>Show the 8 steps</strong> (opens
the 8 steps in textbook wording, bold key words)</p>
<p>Card <strong>🤔 Think about it</strong> (required):</p>
<blockquote>
<p>Was this good service recovery? Which of the 8 service recovery steps
were missing? [box, hint "Write at least one full sentence..."]</p>
<p>Your progress saves automatically. Next saves your answer.</p>
</blockquote></td>
</tr>
<tr class="even">
<td><strong>Teacher only</strong></td>
<td>The 8 steps are folded away so students try to recall which were
missing before checking (version 0.10.0). The fold-out does not hold
back Next. Saved as s2.think1.</td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 20%" />
<col style="width: 80%" />
</colgroup>
<thead>
<tr class="header">
<th colspan="2"><strong>3.7 Card 7: Handling returns</strong></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><strong>Student sees</strong></td>
<td><p><strong>↩︎️ Handling returns of unsatisfactory
products</strong></p>
<blockquote>
<p>If a customer returns a product they are unhappy with, the business
can offer:</p>
<p>🔁 <strong>Replacement</strong>: Replace it with a similar
product.</p>
<p>🔄 <strong>Exchange</strong>: Offer to exchange it with a different
product.</p>
<p>💵 <strong>Refund</strong>: Give a refund.</p>
</blockquote>
<p><strong>[Image N03] Returns comic: replacement, exchange and refund
at the Nexora store</strong></p>
<blockquote>
<p>Many businesses also set clear rules for returns, such as a time
limit and needing the receipt. For example, Uniqlo, as shown below.</p>
</blockquote>
<p><strong>[Image R03] Uniqlo return and exchange
conditions</strong></p>
<p>Card <strong>🤔 Think about it</strong> (required):</p>
<blockquote>
<p>Name ONE item Uniqlo will not accept for return. Why do you think a
business would have this rule? [box, hint "Write at least one full
sentence..."]</p>
<p>[Finish Level 3]</p>
</blockquote></td>
</tr>
<tr class="even">
<td><strong>Complete</strong></td>
<td>Badge pop-up: <strong>Service Saver</strong> "You earned the Service
Saver badge!" [Back to my route]. Level 4 unlocks.</td>
</tr>
<tr class="odd">
<td><strong>Teacher only</strong></td>
<td>Returns lines: textbook p. 139, word for word ("a similar product",
corrected in version 0.9.0). Saved as s2.think2. "ONE" is underlined on
screen.</td>
</tr>
</tbody>
</table>

## Level 4: Chat with Alex

*Two step tabs: 1 Chat · 2 Think back.*

<table>
<colgroup>
<col style="width: 20%" />
<col style="width: 80%" />
</colgroup>
<thead>
<tr class="header">
<th colspan="2"><strong>4.1 Tab 1: Chat</strong></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><strong>Trigger</strong></td>
<td>Opening Level 4 (unlocked after Level 3).</td>
</tr>
<tr class="even">
<td><strong>Student sees</strong></td>
<td><p>Level header: [ICON_ALEX] <strong>Level 4: Chat with
Alex</strong> / Be the customer. Chat with Nexora's customer service
officer.</p>
<p><strong>[Image N04] Alex, a friendly Nexora customer service officer
(small picture beside the intro)</strong></p>
<blockquote>
<p>Meet Alex, a customer service officer at Nexora Mobile. You are the
customer. During your chat, try to:</p>
<p>📱 Ask about at least one product, and its price</p>
<p>🤔 Ask a follow-up question or disagree with something (for example,
say the price is too high)</p>
<p>🛠️ Report a problem with a product, and see how Alex responds</p>
</blockquote>
<p>Fold-out tip: <strong>💡 Not sure what to ask? Try these:</strong>
"How much does the Nexora Core cost?" / "Why is the Nexora Prime so
expensive?" / "My phone's screen stopped working. What can I do?"</p>
<blockquote>
<p>Watch how Alex starts the chat, presents information, and responds
when something has gone wrong.</p>
<p>[💬 Open chat with Alex (new tab) ↗]</p>
</blockquote>
<p>Card: <strong>Paste your Gemini conversation share link</strong></p>
<p>🆕 0.12.0: How to get your chat link: (three numbered steps, each
with a numbered circle and an icon, the same in Levels 4, 5 and 6)</p>
<blockquote>
<p>How to get your chat link:</p>
<p>1. 📤 In your Gemini chat, tap Share at the top right.</p>
<p>2. 🔗 Tap Create public link, then tap Copy link.</p>
<p>3. 📋 Come back to this page and paste the link in the box below.</p>
<p>[box, hint "https://gemini.google.com/share/..."]</p>
<p>☐ I have finished chatting with Alex.</p>
<p>[Next: Think back →] (greyed out, with "Tick the box above when
you've finished.")</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><strong>Interactions</strong></td>
<td><ul>
<li><p>The button opens Alex's chat in a new tab.</p></li>
<li><p>Next unlocks once the box is ticked and the pasted link contains
the word "gemini" (any capitals). Otherwise, under the box: "Please
paste the link to your Gemini chat. It should contain the word
Gemini."</p></li>
</ul></td>
</tr>
<tr class="even">
<td><strong>Teacher only</strong></td>
<td>The three share-link steps replace "Use Share in Gemini and copy the
conversation link then paste it below." (0.12.0), because the
simulations showed this is a multi-step task in another app that G1
students find hard. ⚑ Check the button names (Share, Create public link,
Copy link) against Gemini on a Chromebook and an iPad before release.
Alex is a Gemini Skill shared as a chat link (Gems are being phased
out), set in config.js as GEMS.alex. Tested with a student account on 28
October. The app cannot check the chat itself; the link and the tick box
are honesty checks, and the link is saved for the teacher. Alex's
instructions and business profile match the app (four stages, objection
techniques, after-sales support, the 8 steps).</td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 20%" />
<col style="width: 80%" />
</colgroup>
<thead>
<tr class="header">
<th colspan="2"><strong>4.2 Tab 2: Think back</strong></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><strong>Student sees</strong></td>
<td><blockquote>
<p>Answer these without reopening the chat with Alex.</p>
<p><strong>Q1.</strong> Think back to your conversation with Alex.
Identify ONE skill or quality he showed.</p>
<p>Skill or quality: [box]</p>
<p>This is important to customers because [box] (needs at least one full
sentence; the Skill or quality box does not)</p>
<p><strong>Q2.</strong> Match each line to the stage of providing
customer service. Choose a stage for each line.</p>
<p>P. "I'm really sorry your new phone stopped working. Could you tell
me when it happened, so I can help you fix it?" [dropdown: Choose a
stage…]</p>
<p>Q. "Since you play a lot of games, the Nexora Prime's fast processor
would suit you best." [dropdown]</p>
<p>R. "Your purchase is confirmed: the Nexora Core with the 256GB
upgrade and the one-year warranty. You can collect it on Friday. Thank
you for shopping at Nexora. Have a great day!" [dropdown]</p>
<p>S. "Good afternoon! Is there anything I can help you find today?"
[dropdown]</p>
</blockquote>
<p>Each dropdown lists: Approaching customers / Presenting product
information / Closing the customer experience positively / Performing
service recovery.</p>
<blockquote>
<p>[Submit]</p>
</blockquote></td>
</tr>
<tr class="even">
<td><strong>Feedback (Q2)</strong></td>
<td><p>After the first Submit (recorded), each line shows ✓ or ✗. Wrong
lines show their hint and can be changed; one [Check again] at the
bottom. A changed answer shows "👆 Tap Check again to see if you're
right." Still wrong: "✗ The answer is {stage}: {reason}".</p>
<ul>
<li><p>P (Performing service recovery). Hint: "The officer apologises
because something has gone wrong for this customer. Which stage deals
with a problem or complaint?" Right: "Correct: Apologising and asking
about a problem are part of service recovery."</p></li>
<li><p>Q (Presenting product information). Hint: "The officer matches a
phone feature to something the customer does a lot. Which stage is about
presenting a suitable product?" Right: "Correct: Matching a feature to
the customer's needs is presenting product information."</p></li>
<li><p>R (Closing the customer experience positively). Hint: "The
officer sums up what the customer chose and when to collect it. Is this
the start or the end of the interaction?" Right: "Correct: Summing up
the decision and the next steps closes the customer experience
positively."</p></li>
<li><p>S (Approaching customers). Hint: "This is the first thing the
officer says to the customer. Which stage starts the conversation?"
Right: "Correct: A greeting with an offer of help is approaching
customers."</p></li>
</ul></td>
</tr>
<tr class="odd">
<td><strong>Feedback (Q1)</strong></td>
<td>Not marked; both boxes required. 🆕 0.12.0: If either is missing or
the reason is too short, the "Not finished yet" pop-up lists "✗ Q1:
Skill or quality" and "✗ Q1: This is important to customers because".
After Submit, a self-check prompt in the neutral self-check style
(Section C, no ✓ or ✗): "🔎 Self-check: Does it say how this skill or
quality helps the customer? For example, a knowledgeable officer answers
questions accurately, so the customer doesn't get wrong
information."</td>
</tr>
<tr class="even">
<td><strong>Complete</strong></td>
<td>Summary card ("🎉 Great work! You got everything right on the first
try." or "💪 Let's learn from these" with the Look at these again
lines), then 📌 <strong>Remember this</strong>: "The same four stages
happen in every customer interaction, whether it's in a shop or in a
chat." [Finish Level 4]. Badge pop-up <strong>Service Spotter</strong>.
Level 5 unlocks.</td>
</tr>
<tr class="odd">
<td><strong>Teacher only</strong></td>
<td>Answer key: P recovery, Q presenting, R closing, S approaching. Q1
stays open text to keep recall.</td>
</tr>
</tbody>
</table>

## Level 5: Serve Suzzie at Stylez

*Two step tabs: 1 Roleplay · 2 Reflect.*

<table>
<colgroup>
<col style="width: 20%" />
<col style="width: 80%" />
</colgroup>
<thead>
<tr class="header">
<th colspan="2"><strong>5.1 Tab 1: Roleplay</strong></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><strong>Trigger</strong></td>
<td>Opening Level 5 (unlocked after Level 4).</td>
</tr>
<tr class="even">
<td><strong>Student sees</strong></td>
<td><p>Level header: [ICON_SERVE] <strong>Level 5: Serve Suzzie at
Stylez</strong> / Switch roles. Now you're the customer service
officer.</p>
<p><strong>[Image N05] Suzzie, a shopper at the Stylez fashion store
(small picture beside the intro)</strong></p>
<blockquote>
<p>Now switch roles. You are a customer service officer at Stylez, a
retail store. The AI plays Suzzie, a customer with a question or a
problem.</p>
</blockquote>
<p>Card <strong>🏬 About Stylez</strong>:</p>
<blockquote>
<p>Stylez is a casual clothing retailer for teenagers and young adults.
It sells affordable everyday clothing in-store and online, including
T-shirts, jeans, hoodies, dresses, shorts and accessories.</p>
<p><strong>You are the customer service officer. Suzzie is your
customer.</strong> In a fresh chat, greet Suzzie to begin. Try: "Hi,
welcome to Stylez! How may I assist you?"</p>
<p>🗺️ Try to use the four stages from Levels 2 and 3: approach Suzzie,
present product information, close positively (including after-sales
support), and if there's a problem, perform service recovery.</p>
<p>[🛍️ Open chat with Suzzie (new tab) ↗]</p>
</blockquote>
<p>Fold-out: <strong>🏬 Stylez store facts</strong>:</p>
<blockquote>
<p>About Stylez: Business: Casual clothing retailer for teenagers and
young adults; sells affordable everyday clothing in-store and online. /
Products: T-shirts, jeans, hoodies, dresses, shorts and accessories. /
Sizes: XS to XL.</p>
<p>Products and prices: Basic T-shirt: $18 each. Available colours:
black, white, navy blue and grey. / Jeans: $39 each. / Hoodie: $35
each.</p>
<p>Promotions: Promotion 1: Buy 2 Basic T-shirts for $30. / Promotion 2:
Stylez members get 10% off regular-priced items. / Promo code: STYLE10
gives 10% off the first online order. / Promotion condition: Promotions
cannot be combined.</p>
<p>Exchanges and defective items: Exchange: Exchange within 14 days with
receipt. / Exchange conditions: Item must be unworn, unwashed and have
its original tags. / Sale items: No exchange. / Defective items:
Customer may bring the item and receipt to the store for assistance.</p>
<p>Payment, delivery and support: Payment: Cash, cards and common mobile
payment methods. / Online delivery: Free delivery for orders of $60 or
more. / Customer support: Available in-store or through Stylez online
chat.</p>
</blockquote>
<p>Card: <strong>Paste your Gemini conversation share link</strong> with
the three steps on how to get the link (as in 4.1)</p>
<blockquote>
<p>☐ I have finished serving Suzzie.</p>
<p>[Next: Reflect →] (greyed out until ticked and a Gemini link is
pasted)</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><strong>Teacher only</strong></td>
<td>Suzzie's link is GEMS.suzzie in config.js; tested with a student
account on 28 October. The store facts come from the Stylez roleplay
document and match Suzzie's instructions.</td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 20%" />
<col style="width: 80%" />
</colgroup>
<thead>
<tr class="header">
<th colspan="2"><strong>5.2 Tab 2: Reflect</strong></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><strong>Student sees</strong></td>
<td><blockquote>
<p>Think about your roleplay with Suzzie.</p>
<p><strong>Q1. Which stages did you do?</strong> Select every stage you
used: Approach, Present, Close, Recovery. [☐ 👋 Approach] [☐ 📱 Present]
[☐ ✅ Close] [☐ 🛠️ Recovery]</p>
<p>👍 <strong>Q2.</strong> What is one thing you feel you did well when
serving Suzzie? [box, hint "I did well at..."]</p>
<p>🔄 <strong>Q3.</strong> What is one thing you would do differently
next time? [box, hint "Next time, I would..."]</p>
</blockquote>
<p>🆕 0.12.0: Questions labelled Q1, Q2 and Q3 (were 1, 2 and 3).</p>
<blockquote>
<p>[Submit]</p>
</blockquote></td>
</tr>
<tr class="even">
<td><strong>Feedback</strong></td>
<td>Not scored. At least one stage, and at least one full sentence in
each box. 🆕 0.12.0: One "⚠️ Not finished yet" pop-up lists everything
missing at once, e.g. "✗ Q1: Choose the stages you used", "✗ Q2", "✗ Q3"
(before 0.12.0 it listed Q1 first and the boxes as Box 2 and Box 3 on
the next try). Then 📌 <strong>Remember this</strong>: "Look back at the
four stages. Which one would you like to practise more?" [Finish Level
5]</td>
</tr>
<tr class="odd">
<td><strong>Complete</strong></td>
<td>Badge pop-up <strong>Service Star</strong>. Level 6 unlocks.</td>
</tr>
</tbody>
</table>

## Level 6: Win Suzzie Back

*Two step tabs: 1 Roleplay · 2 Reflect. Level card description: "Suzzie
is upset. Use the 8 steps to turn her bad experience into a good one."*

<table>
<colgroup>
<col style="width: 20%" />
<col style="width: 80%" />
</colgroup>
<thead>
<tr class="header">
<th colspan="2"><strong>6.1 Tab 1: Roleplay</strong></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><strong>Trigger</strong></td>
<td>Opening Level 6 (unlocked after Level 5).</td>
</tr>
<tr class="even">
<td><strong>Student sees</strong></td>
<td><p>Level header: [ICON_RECOVER] <strong>Level 6: Win Suzzie
Back</strong> / Suzzie is upset. Use the 8 steps to turn her bad
experience into a good one.</p>
<p><strong>[Image N05] Suzzie, a shopper at the Stylez fashion store
(small picture beside the intro)</strong></p>
<blockquote>
<p>This time, Suzzie is upset about a problem with something she bought
at Stylez. You are the customer service officer. Use the 8 service
recovery steps to win her back. During your chat, try to:</p>
<p>👂 Listen, be patient and apologise for the inconvenience caused</p>
<p>💙 Acknowledge her feelings and ask questions to find out what
happened</p>
<p>🛠️ Offer a solution, and thank her for bringing the problem to your
attention</p>
<p><strong>You are the customer service officer. Suzzie is your
customer.</strong></p>
<p>[🛍️ Open chat with angry Suzzie (new tab) ↗]</p>
</blockquote>
<p>Fold-out: <strong>Show the 8 steps</strong> (the 8 steps in textbook
wording, as on Level 3 card 6)</p>
<p>Fold-out: <strong>🏬 Stylez store facts</strong> (as in Level 5)</p>
<p>Card: <strong>Paste your Gemini conversation share link</strong> with
the three steps on how to get the link (as in 4.1)</p>
<blockquote>
<p>☐ I have finished helping Suzzie.</p>
<p>[Next: Reflect →] (greyed out, with "Tick the box above when you've
finished.")</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><strong>Interactions</strong></td>
<td><ul>
<li><p>Next unlocks once the box is ticked and the pasted link contains
the word "gemini" (any capitals). Otherwise, under the box: "Please
paste the link to your Gemini chat. It should contain the word
Gemini."</p></li>
</ul></td>
</tr>
<tr class="even">
<td><strong>Teacher only</strong></td>
<td>A second Suzzie chatbot made by the group, where Suzzie is an angry
customer (config.js GEMS.suzzieRecovery). It does not replace the Level
5 Suzzie. The intro keeps the problem general so it fits whichever
problem the chatbot raises. The fresh-chat greeting line was removed
here in 0.11.9 (Suzzie opens with her complaint), and kept in Level 5
only. Level title from the textbook's "win a customer back" (p.
141).</td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 20%" />
<col style="width: 80%" />
</colgroup>
<thead>
<tr class="header">
<th colspan="2"><strong>6.2 Tab 2: Reflect</strong></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><strong>Student sees</strong></td>
<td><blockquote>
<p>Think about your chat with Suzzie.</p>
<p><strong>Q1. Which of the 8 steps did you use?</strong> Select every
step you used. [☐ 👂 Listen] [☐ ⏳ Be patient] [☐ 🙏 Apologise] [☐ 💙
Acknowledge] [☐ ❓ Ask questions] [☐ 🛠️ Offer solutions] [☐ 🧑‍💼 Refer] [☐
😊 Thank]</p>
<p>🙂 <strong>Q2.</strong> How did Suzzie feel at the end of the chat?
What did you do that helped? [box, hint "At the end, Suzzie felt...
because I..."]</p>
<p>🔄 <strong>Q3.</strong> What is one thing you would do differently
next time? [box, hint "Next time, I would..."]</p>
</blockquote>
<p>🆕 0.12.0: Questions labelled Q1, Q2 and Q3 (were 1, 2 and 3).</p>
<blockquote>
<p>[Submit]</p>
</blockquote></td>
</tr>
<tr class="even">
<td><strong>Feedback</strong></td>
<td>Not scored. At least one step, and at least one full sentence in
each box. 🆕 0.12.0: One "⚠️ Not finished yet" pop-up lists everything
missing at once: "✗ Q1: Choose the steps you used", "✗ Q2", "✗ Q3"
(never "Box 2" or "Box 3"). Then 📌 <strong>Remember this</strong>: "If
a complaint is handled well, the customer's bad experience can be turned
into a good one." [Finish Level 6]</td>
</tr>
<tr class="odd">
<td><strong>Complete</strong></td>
<td>Badge pop-up <strong>Service Superstar</strong> "You earned the
Service Superstar badge!" [Back to my route]. Level 7 unlocks.</td>
</tr>
<tr class="even">
<td><strong>Teacher only</strong></td>
<td>The step checklist is recall, not a reading task: the steps are
folded away on Tab 1 and not shown on this tab. The recap line is the
textbook's wording (p. 140).</td>
</tr>
</tbody>
</table>

## Level 7: Check and Exit Ticket

*Two step tabs: 1 Check · 2 Exit ticket. Questions are numbered Q1 to Q6
across the level.*

<table>
<colgroup>
<col style="width: 20%" />
<col style="width: 80%" />
</colgroup>
<thead>
<tr class="header">
<th colspan="2"><strong>7.1 Tab 1: Check your
understanding</strong></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><strong>Student sees</strong></td>
<td><p>Level header: [ICON_CHECK] <strong>Level 7: Check and Exit
Ticket</strong> / Check what you've learnt and tell your teacher how
confident you feel.</p>
<blockquote>
<p>Try these without going back to the notes. It is okay to get some
wrong!</p>
<p><strong>Q1.</strong> True or false? Tap True or False for each.</p>
<p>i. Customer service ends once the customer has paid. [True]
[False]</p>
<p>ii. Good product knowledge helps a customer service officer answer
customer questions confidently. [True] [False]</p>
<p>iii. Service recovery is complete once the staff member has
apologised. [True] [False]</p>
<p>iv. A service breakdown occurs when customers make a complaint about
a product or service. [True] [False]</p>
<p><strong>Q2.</strong> A customer at a mobile phone shop says, "This is
the third time I've called about the same faulty charger, and nobody has
fixed it!" Which response best shows good service recovery? Tap one.</p>
<p>A. "I'm sorry about that. Our chargers usually work fine, so it may
be your phone."</p>
<p>B. "I'm sorry you've had to call so many times. Let me personally
make sure this gets fixed today."</p>
<p>C. "I'm sorry about that. Please call our hotline again tomorrow, and
they will check it for you."</p>
<p>D. "Thank you for telling us about this. I'll pass your feedback on
to our team."</p>
<p><strong>Q3.</strong> Explain why quality customer service matters to
a business. Give ONE reason.</p>
<p>Quality customer service matters because [box] (at least one full
sentence)</p>
<p>[Check answer]</p>
</blockquote></td>
</tr>
<tr class="even">
<td><strong>Feedback (Q1, Q2)</strong></td>
<td><p>After the first Check answer (recorded), each item shows ✓ or ✗
with its hint. If anything is wrong, the student can change answers and
tap [Check again] once (second try recorded); anything still wrong then
shows "✗ The answer is …".</p>
<ul>
<li><p>i (False). Hint: "Look back at what customer service means. Does
it stop the moment the customer pays, or continue after the purchase?"
Right: "Correct: Customer service continues even after the customer has
made a purchase."</p></li>
<li><p>ii (True). Hint: "Think about Alex. How did knowing the prices
and features help him answer your questions?" Right: "Correct: Knowing
the product lets staff answer accurately instead of guessing."</p></li>
<li><p>iii (False). Hint: "Count the 8 steps of service recovery. Is
apologising the last step?" Right: "Correct: Apologising is only Step 3;
the officer still needs to acknowledge feelings, ask questions and offer
solutions."</p></li>
<li><p>iv (True). Hint: "Look at the definition of service breakdown in
Level 3. When does a service breakdown occur?" Right: "Correct: That is
the textbook definition of service breakdown."</p></li>
<li><p>Q2 A: "The staff member apologised, but then blamed the
customer's phone. Which step is about acknowledging feelings and
assuring help?" C: "There is an apology, but is a solution offered? Look
at Step 6." D: "Thanking the customer is Step 8, but was the problem
solved? Look at Step 6." B (right): "Correct: B acknowledges the
customer's frustration and offers a solution: making sure the charger is
fixed today."</p></li>
</ul></td>
</tr>
<tr class="odd">
<td><strong>Feedback (Q3)</strong></td>
<td>Not marked; required (at least one full sentence). 🆕 0.12.0: After
Check answer, a self-check prompt in the neutral self-check style
(Section C, no ✓ or ✗): "🔎 Self-check: Did you name one reason
(customers return repeatedly, customers recommend the business to their
relatives and friends, or customer loyalty ensures the continuity of the
business) and explain what it means for the business?"</td>
</tr>
<tr class="even">
<td><strong>Complete</strong></td>
<td>Summary card, then [Next: Exit ticket →] appears once every item is
settled.</td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 20%" />
<col style="width: 80%" />
</colgroup>
<thead>
<tr class="header">
<th colspan="2"><strong>7.2 Tab 2: Exit ticket</strong></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><strong>Student sees</strong></td>
<td><blockquote>
<p><strong>Q4.</strong> What is one thing you have learnt about customer
service? [box, hint "One thing I learnt is..."]</p>
<p><strong>Q5.</strong> What is one question you still have about this
chapter? [box, hint "I am still not sure about..."]</p>
<p><strong>Q6.</strong> How confident are you that you can do each of
these? Tap one face for each.</p>
</blockquote>
<p>Four rows, each with four faces: Not yet / A little / Confident /
Very confident.</p>
<blockquote>
<p>I can explain why quality customer service matters to a business</p>
<p>I can name the skills and qualities a good customer service employee
needs</p>
<p>I can describe the four stages of providing customer service</p>
<p>I can explain what service breakdown is, and how to perform service
recovery</p>
<p>[Submit my exit ticket]</p>
</blockquote></td>
</tr>
<tr class="even">
<td><strong>Feedback</strong></td>
<td>All fields required; Q4 and Q5 need at least one full sentence each.
🆕 0.12.0: One "⚠️ Not finished yet" pop-up lists everything missing at
once, e.g. "✗ Q4", "✗ Q5", "✗ Q6 (row 1)" (the labels already match the
screen). Not scored.</td>
</tr>
<tr class="odd">
<td><strong>Complete</strong></td>
<td>Confetti, then pop-up "🎉 You've finished Chapter 6!" with the
<strong>Completion Champion</strong> badge, [📊 See my learning report]
[Back to my route].</td>
</tr>
</tbody>
</table>

## Learning report

<table>
<colgroup>
<col style="width: 20%" />
<col style="width: 80%" />
</colgroup>
<thead>
<tr class="header">
<th colspan="2"><strong>8.1 My learning report</strong></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><strong>Trigger</strong></td>
<td>"📊 My learning report" on the home page (after all 7 levels), or
from the Level 7 pop-up.</td>
</tr>
<tr class="even">
<td><strong>Student sees</strong></td>
<td><p><strong>📊 My learning report</strong> / {name} · Class {class},
Register No. {n}</p>
<p>One row per level: badge, "✅ {date finished}" or "Not finished yet",
and the badge name.</p>
<blockquote>
<p>🎯 Level 4, Q2: First try {x} / 4. 🎯 Level 7, Q1 and Q2: First try
{y} / 5.</p>
</blockquote>
<p><strong>🔁 Look at these again</strong>: one line per item wrong on
the first try, e.g. "Closing the customer experience positively (Level
3, Stage 3: Closing the customer experience positively)". 🆕 0.12.0: The
three Level 4 Q2 pointers that went to the one-line overview (Level 2,
The four stages) now go to the card where each topic is taught: line Q
"Presenting product information (Level 2, Stage 2: Presenting product
information)"; line R "Closing the customer experience positively (Level
3, Stage 3: Closing the customer experience positively)"; line S
"Approaching customers (Level 2, Stage 1: Approaching customers)". The
other pointers already go to the right card and are unchanged. Before
Levels 4 and 7 are done: "Finish Levels 4 and 7 to see what to look at
again." All right: "Nothing to look at again. You got everything right
on the first try! 🎉"</p>
<p><strong>💭 How confident you felt</strong>: the four exit-ticket rows
with the face chosen.</p>
<p><strong>Your answers to every question</strong>: "These are your
saved answers. Questions you have not answered are marked "Not answered
yet"." Then every answer, level by level, with the same question labels
as on screen (Q1, Q2, …), with first and second tries for marked
questions ("Not needed: Right on the first try" where it applies).</p>
<blockquote>
<p>[Back to my route]</p>
</blockquote></td>
</tr>
</tbody>
</table>

# E. Teacher Mode and footer controls

<table>
<colgroup>
<col style="width: 20%" />
<col style="width: 80%" />
</colgroup>
<thead>
<tr class="header">
<th colspan="2"><strong>T.1 Teacher Mode: sign in</strong></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><strong>Trigger</strong></td>
<td>"Teacher Mode" in the footer (route #teacher).</td>
</tr>
<tr class="even">
<td><strong>Teacher sees</strong></td>
<td><p><strong>Teacher Mode</strong> / Key in the teacher code. [box]
[Enter]</p>
<p>Messages: "Incorrect code." / "Too many wrong codes. Wait 10 minutes
and try again." / "The teacher code has not been set up yet. See the
setup guide." / "The server could not load the results. Wait a minute
and try again."</p></td>
</tr>
<tr class="odd">
<td><strong>Teacher only</strong></td>
<td>TEACHER_CODE lives only in the Apps Script project's Script
Properties and is checked on the server; it is never written in the repo
or this storyboard. Not case sensitive. Locked out for 10 minutes after
10 wrong tries.</td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 20%" />
<col style="width: 80%" />
</colgroup>
<thead>
<tr class="header">
<th colspan="2"><strong>T.2 Teacher home and lesson
preview</strong></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><strong>Teacher sees</strong></td>
<td><p><strong>Teacher Mode</strong> / "View any level without
completing the activities." / [Level 1] [Level 2] [Level 3] [Level 4]
[Level 5] [Level 6] [Level 7] / tabs Classes · Results · This
device.</p>
<p>Each Level button opens a preview laid out like the student pages
(Levels 2 and 3 one card at a time with Back and Next and the progress
line; other levels with their step tabs and Continue), with every card
and tab unlocked: "Teacher preview: all sections are accessible.
Activities are view-only and do not change student progress." [Back to
Teacher Mode], and links to the other levels. Home from a preview
returns to Teacher Mode.</p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 20%" />
<col style="width: 80%" />
</colgroup>
<thead>
<tr class="header">
<th colspan="2"><strong>T.3 Tab: Classes</strong></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><strong>Teacher sees</strong></td>
<td><p><strong>Your classes</strong>: "Select the class students will
register under. Only one class is shown to students at a time. Each
class has register numbers 1 to 50. Saved profiles stay in their
original class."</p>
<p>Each class: name, (◉) Show to students, [Remove].</p>
<p><strong>Add a class</strong> [box, hint "e.g. 3E1"] [Add] / "The
selected class appears at the top left of the student sign-in page. New
students register in that class. Select another class to change
registration."</p></td>
</tr>
<tr class="even">
<td><strong>Interactions</strong></td>
<td><ul>
<li><p>Add refuses blanks ("Key in a class name."), duplicates ("{class}
is already in your classes.") and names over 20 characters ("Class names
can be at most 20 characters.").</p></li>
<li><p>Remove: "Remove {class}? Students' saved answers are kept."
Removed classes still appear in Results as "{class} (removed)".</p></li>
</ul></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 20%" />
<col style="width: 80%" />
</colgroup>
<thead>
<tr class="header">
<th colspan="2"><strong>T.4 Tab: Results</strong></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><strong>Teacher sees</strong></td>
<td><p>Choose a class [dropdown]. Then:</p>
<p><strong>Class summary</strong>: students with saved work; Levels
finished (Level n: x of y); Most missed on the first try; Confidence
(count per face for each statement); Q5: one question I still have
(every answer, with register number).</p>
<p><strong>Students</strong> table: Register No. (with name) | Levels
done | Q2 first try | Q1 and Q2 first try | Confidence. "Tap a row to
open the student's full report."</p>
<p>[⬇️ Download CSV] (file EBS-Ch6-{class}-results-{date}.csv, Singapore
time).</p>
<p>Full report: Level 1 stories, Level 2 and 3 Think about it answers,
Level 4 Q1 and Q2 (first and second try), Level 5 reflections and
stages, Level 6 steps used and reflections, Level 7 Q1 and Q2, exit
ticket, conversation links, [Clear this student's work] and [← Back to
the class].</p>
<p>Clear: "Clear all work for {name}, Class {class}, Register No. {n}?
This deletes their answers, first attempts, badges and progress, and
cannot be undone. Download the CSV first if you want a copy." [Clear
work] [Cancel]. Afterwards: "Work cleared. This student starts again
from Level 1 the next time they log in."</p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 20%" />
<col style="width: 80%" />
</colgroup>
<thead>
<tr class="header">
<th colspan="2"><strong>T.5 Tab: This device</strong></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><strong>Teacher sees</strong></td>
<td><p><strong>🔓 Unlock all levels</strong>: "For demos and for
students who need to skip ahead." [Unlock all levels on this device] /
when on: "All levels are unlocked on this device." [Turn off]</p>
<p><strong>🧹 Reset this device</strong>: "Use the same reset as Reset
progress: enter the reset passcode, choose a registered student profile
and confirm. The saved name, answers, badges and progress will be
cleared, and the register number will be available again." [Reset this
device]</p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 20%" />
<col style="width: 80%" />
</colgroup>
<thead>
<tr class="header">
<th colspan="2"><strong>T.6 Footer: Unlock and Reset
progress</strong></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><strong>Trigger</strong></td>
<td>"Unlock" and "Reset progress" in the footer of every page.</td>
</tr>
<tr class="even">
<td><strong>Teacher sees</strong></td>
<td><p><strong>Unlock student levels</strong>: "Select a registered
student profile and open selected levels or all seven levels. Answers,
completed activities and badges will stay unchanged." / Key in the
unlock passcode. [Continue] → Class, Student profile, "Select levels to
unlock" (Level 1 to 7 tick boxes), [Select all levels] [Unlock selected
levels]. Afterwards: "{name}, Class {class}, Register No. {n}: levels
{list} are now open. Answers and completion remain unchanged."</p>
<p><strong>Reset student progress</strong>: "Select a registered student
profile to reset. You will confirm before any work is cleared." / Key in
the reset passcode. → Class, Student profile, [Continue to reset] →
confirmation explaining that the name, answers, badges and progress are
cleared on this device and the server, the register number is freed, and
other students' work stays intact. [Reset progress] [Cancel].
Afterwards: "Profile reset".</p></td>
</tr>
<tr class="odd">
<td><strong>Teacher only</strong></td>
<td>Unlock uses the teacher code; Reset uses a separate RESET_CODE, also
only in Script Properties. Both are not case sensitive and lock out
after repeated wrong tries.</td>
</tr>
</tbody>
</table>

# F. Images and videos

All images are in assets/img/ and listed in the image map in config.js
(id, file, alt text, placeholder emoji). A missing file shows a
placeholder box with the emoji and label.

| **ID**                                                        | **File**                                                                                                                                                                                                                                              | **Where**                                                                          |
|---------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------|
| WELCOME                                                       | welcome-customer-service-banner.jpg                                                                                                                                                                                                                   | Landing page and home page                                                         |
| ICON_TERMS, ICON_LEARN                                        | icon-key-terms.png, icon-customer-service-learning.png                                                                                                                                                                                                | 4 key terms; Levels 2 and 3 icon                                                   |
| ICON_STORIES, ICON_ALEX, ICON_SERVE, ICON_RECOVER, ICON_CHECK | icon-level-{stories, alex, serve, recover, check}.png                                                                                                                                                                                                 | Level icons for Levels 1, 4, 5, 6 and 7 (home route and level headers)             |
| STAGE1_BANNER to STAGE4_BANNER                                | stage-1-approaching-banner.jpg, stage-2-banner.jpg, stage-3-banner.jpg, stage-4-banner.jpg                                                                                                                                                            | Top of every stage card: Level 2 cards 7 and 10 to 12; Level 3 cards 1, 2, 3 and 5 |
| TERM_SERVICE, TERM_QUALITY, TERM_BREAKDOWN, TERM_RECOVERY     | term-customer-service.png and three more                                                                                                                                                                                                              | Key term cards and definition boxes                                                |
| C01                                                           | C01-good-vs-poor-service-v2.jpg                                                                                                                                                                                                                       | Level 2, card 3                                                                    |
| PK_FEATURES to PK_SELLING_POINT                               | product-knowledge-{features, price, care, warranty, selling-point}-v2.jpg                                                                                                                                                                             | Level 2, card 5 (900 × 900, re-lettered speech bubbles)                            |
| C02                                                           | C02-four-stages-v2.jpg                                                                                                                                                                                                                                | Level 2, card 6                                                                    |
| C03                                                           | C03-three-approaches-v2.jpg                                                                                                                                                                                                                           | Level 2, card 7                                                                    |
| SUITABILITY                                                   | product-suitability-camera.png                                                                                                                                                                                                                        | Level 2, card 11                                                                   |
| C04                                                           | C04-breakdown-to-recovery-v2.jpg                                                                                                                                                                                                                      | Level 3, card 3                                                                    |
| C05                                                           | C05-customer-service-timeline.jpg                                                                                                                                                                                                                     | Level 2, card 2                                                                    |
| C06                                                           | C06-handling-objections-v2.jpg                                                                                                                                                                                                                        | Level 2, card 12                                                                   |
| C07                                                           | C07-closing-positively-v2.jpg                                                                                                                                                                                                                         | Level 3, card 1                                                                    |
| R01, R02                                                      | R01-foodpanda-chat.jpg, R02-foodpanda-voucher.jpg                                                                                                                                                                                                     | Level 3, card 6                                                                    |
| N03                                                           | N03-returns-v2.jpg                                                                                                                                                                                                                                    | Level 3, card 7                                                                    |
| R03                                                           | R03-uniqlo-returns.jpg                                                                                                                                                                                                                                | Level 3, card 7                                                                    |
| N04, N05                                                      | N04-alex.jpg, N05-suzzie.jpg                                                                                                                                                                                                                          | Level 4; Levels 5 and 6                                                            |
| Seven badges                                                  | badge-story-sharer-vibrant.png (1), badge-service-scholar-vibrant.png (2), badge-service-saver.png (3), badge-service-spotter-vibrant.png (4), badge-service-star-vibrant.png (5), badge-service-superstar.png (6), badge-completion-champion.png (7) | Home, badge pop-ups, learning report                                               |

### Alt text for the comics

- C01: Two-panel comic. Left, "GOOD SERVICE": A smiling Nexora staff
  member offers, "Hi! Would you like to take a look at our newest phone
  model available?" The customer replies, "Sure! Let me test it out."
  Right, "POOR SERVICE": A staff member looks at his own phone with arms
  crossed while the customer says, "Excuse me... I need some help." He
  replies, "..."

- C02: Four-panel comic at a Nexora store. 1, APPROACH: The staff member
  says, "Welcome to Nexora! How may I help?" 2, PRESENT: Holding a
  camera, he says, "This camera suits your interest in photos." 3,
  CLOSE: Handing over a Nexora shopping bag, he says, "Thank you for
  shopping with us!" 4, RECOVERY: The customer holds a phone with a
  cracked screen and he says, "I am sorry. Let me help solve this."

- C03: Three-panel comic. 1, "GREETING APPROACH": "Good morning! Welcome
  to Nexora!" 2, "SERVICE APPROACH": "Hi! How may I assist you?" 3,
  "PRODUCT APPROACH": "I noticed that you are interested in this model.
  It is our new arrival. Would you like to try it?"

- C04: Two-panel comic. "SERVICE BREAKDOWN": The customer holds a
  cracked phone: "I just bought this phone and the screen is already
  cracked!" The staff member: "I'm really sorry to hear that. Let me
  take a look and help you with this." "SERVICE RECOVERY": The staff
  member hands over a new phone box: "You're welcome! If you need any
  further help, just let us know." The customer: "Thank you so much for
  helping me! I'm really happy with the new phone."

- Product-knowledge comics: "Comic: A Nexora staff member talks to a
  customer in the shop. He says, …" followed by the line shown on Level
  2 card 5.

- SUITABILITY: A customer shows her photo gallery while the Nexora staff
  member points out a new phone camera and a clear flower photo,
  matching its camera features to her interest in taking photos.

- N03: Returns comic: replacement, exchange and refund at the Nexora
  store. R01, R02 and R03: as in config.js.

### Alt text for the stage banners and level icons

- STAGE1_BANNER: Stage 1: Approaching customers. A smiling Nexora staff
  member welcomes a customer with a friendly wave.

- STAGE2_BANNER: Stage 2: Presenting product information. The Nexora
  staff member helps the customer in the phone shop.

- STAGE3_BANNER: Stage 3: Closing the customer experience positively.
  The Nexora staff member helps the customer in the phone shop.

- STAGE4_BANNER: Stage 4: Performing service recovery. The Nexora staff
  member helps the customer in the phone shop.

- Level icons: Stories notebook and speech bubble (Level 1); Customer
  service headset and chat bubbles (Level 4); Shopping bag and friendly
  service bell (Level 5); Recovery arrows, heart and repair tool (Level
  6); Checklist and pencil (Level 7).

- Service Saver badge: Service Saver badge (gold medallion with a teal
  rim, a green shield and a helping hand).

### Videos

- Video A, "A better welcome at Nexora" (by a groupmate):
  https://youtu.be/\_Esvxks4ZjQ, Level 2 card 8.

- Video B, "The 8 steps in action" (43 seconds, chibi Alex and June):
  https://youtu.be/IWZ4xwI2fF8, Level 3 card 5.

- Both are embedded from YouTube (config.js VIDEOS), never stored in the
  app.

### Alt text for the new comics (version 0.11.0)

- C05: Three-panel comic. 1, WALKS IN: The Nexora staff member waves at
  a customer entering the store: "Welcome to Nexora!" 2, PAYS: At the
  counter, he hands her a Nexora bag with a new phone: "Here's your new
  phone. Enjoy!" 3, A WEEK LATER: At home, the customer messages Nexora
  Online Chat 24/7 on her phone: "I bought a phone last week. How do I
  back up my photos?" The reply: "Happy to help! Let me show you the
  steps."

- C06 (v2): Four-panel comic at a Nexora store. 1, SELLING POINT: The
  customer, holding a phone: "This phone is a bit heavy." The staff
  member: "It's heavier because it has a bigger battery, so it lasts the
  whole day." 2, YES, BUT: Beside a \$1,299 price tag, the customer:
  "The Nexora Prime is expensive." The staff member: "Yes, it costs
  more, but its fast processor runs your games smoothly." 3, SHARE
  CONCERNS: The customer: "Hmm… I'm not so sure if I should get this."
  The staff member: "What worries you most about switching to a new
  phone?" 4, CORRECT MISCONCEPTION: The customer: "So the warranty
  covers everything, right?" The staff member, holding a warranty card:
  "Good question! The warranty covers manufacturing defects. Accidental
  damage, such as dropping the phone, isn't covered."

- C07 (v2, clearer "BUY" in the panel 3 caption): Three-panel comic at a
  Nexora store. 1, SIGNS OF A POSITIVE EXPERIENCE: The smiling customer
  holds her new phone and points at phone cases: "This is exactly the
  phone I was looking for! Do you have a case for it?" The staff member:
  "Yes, this case fits it perfectly." 2, AFTER A SALE: He hands her a
  Nexora bag: "Thank you, I'm sure the product will meet your needs. It
  has been a pleasure serving you." 3, IF THE CUSTOMER DOES NOT BUY: A
  different customer: "I'd like to think about it first." The staff
  member: "Certainly, thank you for your interest. Do come back if you
  decide to buy it another day."

C05 to C07 were drawn by the group in Gemini. Their caption bars and
frames were recoloured to wine red, so they are not mistaken for the
four stage colours, and a comma in C07 panel 3 was corrected to a full
stop to match the textbook.

# G. Student's-eye check and open items

### Checked as a struggling reader, an average student and a strong student

- Levels unlock in order, and the notes cards in Levels 2 and 3 are one
  idea each, so nobody faces a wall of text; bold key words let a weaker
  reader get the gist of every textbook line first.

- Required boxes and quick checks stop a strong student from clicking
  straight through the notes.

- Nothing is pre-selected anywhere. Quick-check options keep one fixed
  order and carry no colour cues.

- Every hint refers to its own question and asks a guiding question
  rather than giving the answer.

- The objection quick check uses new examples and avoids the words "yes,
  but", so it tests understanding rather than word matching.

- Students who paste any Gemini link and tick "finished" without really
  chatting can still answer Level 4 from the notes; the teacher can open
  the saved link.

- Three simulations on 29 October (a struggling reader, an average
  student and a fast student on a Chromebook and an iPad) completed all
  7 levels with every lock, hint and badge working. Found: the
  share-link step was hard to follow; minimum answer lengths differed
  between levels and said "characters"; self-check prompts read like
  wrong answers; one Look at these again line pointed to the wrong
  level; and missing-item pop-ups behaved differently in Levels 5 and 6.
  All five are fixed in 0.12.0.

- Decided on 29 October: the link check stays as it is. Next opens once
  the box is ticked and the link box contains the word "gemini" (any
  capitals). The group knows that typing only "gemini" lets a student
  skip a chatbot; the teacher can spot this in the saved link.

### Still to do

- Clear test data (for example TEST1 rows, including CLAUDESIMULATION1
  to 3) from the Google Sheet and switch the registration class to the
  real class before classes log in.

- ⚑ Check the Gemini button names in the share-link steps on a
  Chromebook and an iPad.

- Delete the old video-refs branch on GitHub.

# H. Changes since the 20 October storyboard

A summary. The full dated list with version numbers is docs/progress.md.

| **Date and version**                                | **Change**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
|-----------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 21 to 24 Oct (0.6.3 to 0.6.26)                      | 4 key terms graphics; graphic icons; vibrant badges and Completion Champion; Stylez store facts; footer Reset progress and Unlock with passcodes; product-knowledge comics; suitability picture; teacher lesson preview; complete answers in the learning report; named student profiles (class, name, register number dropdown 1 to 50); teacher-chosen registration class.                                                                                                                                                                                                                                                                                                                                                                   |
| 26 to 27 Oct (0.6.27 to 0.6.34)                     | Nexora chatbot links; required saved reflections; conversation share link before Next in Levels 3 and 4; Level 2 as single cards with Back and Next; Videos A and B embedded from YouTube.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| 27 Oct (0.7.0 to 0.7.1)                             | Level 2 rebuilt on the syllabus's four stages (15 cards), after-sales support under Stage 3, Stage 1 quick check, sticky Level 2 navigation, tap to enlarge, the Gemini link check accepts any link containing "gemini".                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 27 Oct (0.8.0 to 0.8.1)                             | Key terms as term, definition and example; speech bubbles restored in the product-knowledge comics; the 8 steps in textbook wording only; capital letters after colons; new Alex link (Gemini Skill).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 28 Oct (0.9.0)                                      | Textbook check: "a similar product" in returns; definitions of product knowledge and after-sales service; skills in textbook order; Stage 4 paragraphs in textbook wording; Stage 2 in three parts (needs and wants, presenting the product, questions and objections); Stage 3 in two (closing, after-sales support with enquiries). 18 cards.                                                                                                                                                                                                                                                                                                                                                                                                |
| 28 Oct (0.11.0)                                     | The notes split into Level 2, Learn: Customer Service (Part 1), with Stages 1 and 2 (13 cards), and Level 3, Learn: Customer Service (Part 2), with Stages 3 and 4 (7 cards). Three Nexora comics added (C05 to C07). The 8 steps show all at once, and the 8-steps video moves to its own card. New Level 6, Win Suzzie Back (an angry Suzzie chatbot for service recovery practice, badge Service Superstar). Chat with Alex, Serve Suzzie and the Check and Exit Ticket become Levels 4, 5 and 7. 7 levels.                                                                                                                                                                                                                                 |
| 28 Oct (0.11.1 to 0.11.9)                           | By the group: Service Saver badge; orange key words (#A84B08); the product-knowledge benefits sentence moved into a definition box; stage banners for Stages 1 to 4 replace the stage labels; approach quick-check instruction "Select the most appropriate approach for each question."; duplicate panel 1 bubble removed from C06 (v2); purple customer and blue staff boxes in the objection quick check; duplicate Stage 3 heading removed; clearer "BUY" in C07 (v2); 16px between definition boxes; ONE underlined in the Uniqlo question; illustrated icons and one header style for every level; Level 6 button "Open chat with angry Suzzie" and its greeting line removed; teacher preview laid out like the student pages.          |
| 29 Oct (🆕 0.12.0, after three student simulations) | 1\) Three numbered steps on how to get the Gemini chat link in Levels 4, 5 and 6. 2) One rule for typed answers (at least 20 characters, worded as "at least one full sentence"), with one-word and link boxes exempt. 3) Self-check prompts start "Self-check:" and use a neutral style with no ✓ or ✗. 4) The Level 4 Q2 pointers for lines Q, R and S go to the card where each stage is taught (Level 2, Stage 2; Level 3, Stage 3; Level 2, Stage 1). Work already submitted before 0.12.0 is not re-checked against the new answer-length rule; it applies the next time a student submits. 5) Not finished yet pop-ups list everything at once with Q labels that match the screen (Levels 1, 5 and 6 questions now labelled Q1 to Q3). |
| 28 Oct (0.10.0)                                     | Bold key words inside textbook lines; our own framing lines cut or replaced with textbook sentences; "Remember this" boxes removed from the four stages and returns cards; the 8 steps folded away on the real-life example card; second quick check (objection techniques); speech lines in normal weight. 19 cards.                                                                                                                                                                                                                                                                                                                                                                                                                          |
