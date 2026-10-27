**EBS Chapter 6: Customer Service**

Self-study revision app

Screen-by-screen storyboard (as built, 20 October 2026)

# A. How to read this storyboard

This storyboard is the single source of truth for the app. It moves the content of **v7 of the SLS document** into the structure of the **EBS Learning Journey app (V45)**: a landing page with a route of five levels, step tabs inside each level, Submit then recap, badges, a learning report and a teacher area. Edit it directly. Once your group is happy with it, it goes to Claude Code with the build prompt.

- Each screen is a table. Rows in **pale rose** are what the student sees and does, in final wording. Rows marked **Teacher only** (grey) are notes for your group and Claude Code, and never appear on screen.

- Text in **dark red** inside **\[Image …\]** marks an image. Existing images from v7 are named C01 to C04 and R01 to R03; new images are N01 to N05 and the five badges. Each new image shows a placeholder box with an emoji until you add the real file. Prompts for every new image are in Section F.

- Definitions, the returns lines and the 8 service recovery steps use the **textbook's exact wording** (confirmed 19 October). Text with a yellow ⚑ flag is still open (see Section G).

- Student wording follows your house rules: no ampersand, nothing pre-selected, every interaction has a one-line instruction, and at most about 60 words of instruction before an interaction.

# B. What carries over from the LJ app, and what changes

| **Part of the LJ app (V45)**                                                                                                                                                 | **In the Chapter 6 app**                                                                                                                                                                                                                                                                                                     |
|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| App shell: one-page app, hash routes, autosave on the device, offline answer queue, Vercel back end saving to Blob storage                                                   | App shell kept. The code is in a private GitHub repository and Vercel publishes only the app files; the server becomes a Google Sheet run by Google Apps Script (no Vercel serverless functions or Blob storage). Each student's progress is also saved there, so they can carry on from any device (Section D, screen 0.1). |
| Header with school crest and school name                                                                                                                                     | Crest and school name removed: the app is for any school. Header shows the app title only.                                                                                                                                                                                                                                   |
| Team login (choose team, key in access code)                                                                                                                                 | Student login: choose class from a dropdown (classes added by teachers in Teacher Mode), then key in register number. No access code for students.                                                                                                                                                                           |
| "Before you start" pop-up that must be agreed to                                                                                                                             | Kept, rewritten as 5 points on how the module works.                                                                                                                                                                                                                                                                         |
| "Words you'll use today" page                                                                                                                                                | Kept as "4 key terms" (pre-training before Level 2).                                                                                                                                                                                                                                                                         |
| Route of 5 station cards, any order                                                                                                                                          | Kept, but levels now unlock in order (each opens when the one before is finished), because the flow depends on it. Teacher Mode can unlock all levels on a device.                                                                                                                                                           |
| Station page: step dots, reading, warm-up, main task, scenario; Submit, then 💡 recap and missed items                                                                       | Kept: step tabs (sticky), Submit, then recap. New: after Submit, each wrong answer shows a hint written for that question, with one retry before the answer is revealed. The first attempt is what is recorded.                                                                                                              |
| Station badges and team badges                                                                                                                                               | Five new level badges (prompts in Section F). Team badges removed.                                                                                                                                                                                                                                                           |
| Learning report, Email our teachers, post-survey, Help button (calls or WhatsApps teachers), photo tasks, foot-traffic timer, VivoCity unit links, guide characters on pages | Learning report kept. Email, post-survey, Help button, photo tasks, timer and unit links removed. Guide characters removed (Mayer's image principle: the speaker's image does not add learning).                                                                                                                             |
| Teacher Access (results, CSV, team report) and Reset                                                                                                                         | Kept as Teacher Mode, adding a Classes tab where teachers key in class names.                                                                                                                                                                                                                                                |
| Credits footer with the anime-style team picture                                                                                                                             | Picture removed. Text: "A team effort by Anthony, Daniel, Joshua and Jufinnie (NIE 2026)".                                                                                                                                                                                                                                   |
| Teal colour scheme                                                                                                                                                           | Wine red (Section C).                                                                                                                                                                                                                                                                                                        |
| The five parts are called stations                                                                                                                                           | Called levels (Level 1 to Level 5), because the whole app is already called a module.                                                                                                                                                                                                                                        |
| Pinch-to-zoom blocked (maximum-scale=1.0)                                                                                                                                    | Zoom allowed, for accessibility.                                                                                                                                                                                                                                                                                             |

# C. Look, layout and Mayer's principles

### Colours

| **Use**                                             | **Colour**                                                      | **Note**                                                                                                                           |
|-----------------------------------------------------|-----------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------|
| Brand (header, primary buttons, current tab)        | \#8B1E3F                                                        | White text on it passes contrast at 8.9:1                                                                                          |
| Brand dark (headings, hover)                        | \#5C1229                                                        |                                                                                                                                    |
| Brand light (small accents: chips, selected states) | \#F9ECEF                                                        | Cards are white with a thin \#E8DADF border, so they never look like the pink wrong-answer box                                     |
| Page background                                     | \#FAF7F5 (warm off-white)                                       | Text \#1F2937 on it is 13.8:1                                                                                                      |
| Right / wrong feedback                              | Green \#15803D on \#EAFBEF; red \#B91C1C on \#FDECEC            | Kept from the LJ. Because wine red is close to the wrong-answer red, every feedback box also has ✓ or ✗ and a coloured left border |
| The four stages                                     | Blue \#2563EB, orange \#EA580C, green \#16A34A, purple \#7C3AED | Same as the comic caption bars. Used on the stage table only, never in the matching question, where colour would give answers away |

### Layout rules (from your house style)

- Clean sans-serif font (system font stack, as in the LJ). Light, high-contrast theme.

- Sticky top bar (title, 🏠 Home) and sticky step tabs inside a level. Locked tabs show 🔒 and cannot be tapped.

- Inside a step, long content is split by **Continue ↓** buttons that reveal the next part below. Moving between steps uses **Next →**. The two are never labelled the same.

- One filled primary button per group; others outlined; at least 12px apart. Tap targets at least 44px.

- About 40 to 48px between separate blocks; 12 to 16px inside a block.

- Nothing is pre-selected: dropdowns, True/False buttons, MCQ options and confidence faces all start empty. Only the student's own saved answers are restored.

- Works at phone width (360px) and on Chromebooks and laptops. Hints and tips open on tap, never on hover only.

### How the app applies Mayer's principles

| **Principle**                   | **Where it shows in the app**                                                                                                                                                       |
|---------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Multimedia (words and pictures) | The four Nexora comics and the real-life Foodpanda and Uniqlo examples sit inside the notes. New images are added only where they explain an idea; no decorative level banners.     |
| Spatial contiguity              | Each picture sits directly under the paragraph it explains. Feedback appears directly under its question. The Uniqlo screenshot sits right above its "Think about it" box.          |
| Coherence                       | No extra facts beyond the textbook. LJ leftovers that do not serve learning are removed ("Your mission" cards, "Share the jobs" tips, guide characters, emoji clutter).             |
| Signaling                       | Clear headings, bold key terms, numbered stages and steps, the same stage colours on the stage table and comics, and step tabs that show where the student is (site-map principle). |
| Segmenting                      | Level 2 is split into three step tabs, and each tab into Continue ↓ parts, so students move at their own pace.                                                                      |
| Pre-training                    | The "4 key terms" page comes before the notes.                                                                                                                                      |
| Personalization                 | Instructions talk to the student ("you") in a friendly tone. Definitions stay word for word from the textbook.                                                                      |
| Image                           | No guide characters or speaker pictures on learning pages. Alex and Suzzie get one small picture each, to show who the student is chatting with.                                    |
| Accessibility (Hinderliter)     | Zoom allowed; every image has alt text, and for comics the alt text includes all the speech bubbles; contrast at least 4.5:1; text reflows on small screens.                        |

# D. Student screens

*Suggested times (self-study at home): Level 1 about 5 min, Level 2 about 15 min, Level 3 about 10 min, Level 4 about 10 min, Level 5 about 8 min. Total about 45 to 50 min, which can be spread over several sittings.*

## Landing and login

<table>
<colgroup>
<col style="width: 20%" />
<col style="width: 79%" />
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
<td><p>Sticky top bar: <strong>EBS Chapter 6</strong> (small label) / <strong>Customer Service</strong> (title) / A self-study revision module (subtitle).</p>
<p><strong>[Image N01] 🏬 Landing banner: the Nexora phone store, with the staff member welcoming a customer</strong></p>
<blockquote>
<p>Hi! In this module, you'll revise Chapter 6: Customer Service. You'll read short notes, chat with an AI customer service officer, serve an AI customer yourself, and check what you've learnt.</p>
</blockquote>
<p>Card <strong>Step 1: Log in</strong></p>
<blockquote>
<p>Choose your class. [dropdown: "Choose your class…"]</p>
<p>Key in your register number. [box, hint "e.g. 12"]</p>
<p>[Start]</p>
</blockquote>
<p>Footer: Teacher Mode (link) / A team effort by Anthony, Daniel, Joshua and Jufinnie (NIE 2026) / Version number.</p></td>
</tr>
<tr class="odd">
<td><strong>Interactions</strong></td>
<td><ul>
<li><p>Class dropdown lists the classes saved in Teacher Mode, in the order the teacher added them. Nothing is selected at first.</p></li>
<li><p>Register number box accepts whole numbers 1 to 50 only, with the number keypad on phones.</p></li>
<li><p>Start: checks both fields, then loads any work this student has already saved on the server.</p>
<ul>
<li><p>New student: opens the Before you start pop-up (0.2).</p></li>
<li><p>Returning student: shows "Welcome back! Your work has been loaded." and opens the home page (0.3) where they left off, with their finished levels, badges and saved answers.</p></li>
<li><p>Offline: uses the work saved on this device, and shows the LJ's yellow offline bar until the server can be reached.</p></li>
</ul></li>
</ul></td>
</tr>
<tr class="even">
<td><strong>Messages</strong></td>
<td><ul>
<li><p>No class chosen: "Please choose your class."</p></li>
<li><p>No number: "Please key in your register number."</p></li>
<li><p>Not 1 to 50: "Register numbers are whole numbers from 1 to 50."</p></li>
<li><p>No classes saved yet: dropdown greyed out, with "Your teacher hasn't added your class yet. Ask your teacher to add it."</p></li>
<li><p>Class list cannot load (offline on first visit): "Connect to the internet to load your class list, then refresh this page."</p></li>
</ul></td>
</tr>
<tr class="odd">
<td><strong>Student thinks or does</strong></td>
<td>"I pick my class, type my number and start."</td>
</tr>
<tr class="even">
<td><strong>Teacher only</strong></td>
<td><p>Student identity is class plus register number only, with no names. The server is a Google Sheet owned by one Google account; a school or group account is better than a personal one. Please confirm with your tutor that storing class and register number there is acceptable.</p>
<p>The class list is fetched from the server on load and cached on the device, so a student who has loaded it once can log in offline (as in the LJ).</p>
<p><strong>Saving progress (new).</strong> The app saves the student's whole progress to the server under class plus register number: levels finished, current tab and Continue parts opened, badges, all answers (including half-typed ones) and first attempts. It saves on every Continue, Next, Submit and tab change, and every 30 seconds while the student is typing. A copy is also kept on the device as a backup, and changes made offline are sent when the connection returns (the LJ's offline queue).</p>
<p>If the device copy and the server copy differ, the newer one is used. First attempts are never overwritten once recorded, so a student cannot redo a first try on another device.</p>
<p>There is no password, so anyone who keys in the same class and register number can open that student's work. This is acceptable for a revision module, but tell students to key in their own register number carefully.</p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 20%" />
<col style="width: 79%" />
</colgroup>
<thead>
<tr class="header">
<th colspan="2"><strong>0.2 "Before you start" pop-up</strong></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><strong>Trigger</strong></td>
<td>First time after Start. Reopened any time from "📋 How this works" on the home page. Until the student taps the button, every page shows this pop-up (as in LJ V38).</td>
</tr>
<tr class="even">
<td><strong>Student sees</strong></td>
<td><p><strong>📋 Before you start</strong></p>
<blockquote>
<p>1. Go through the levels in order. Each one opens when you finish the one before.</p>
<p>2. Your work saves automatically. You can stop and come back any time, even on a different device: just log in with the same class and register number.</p>
<p>3. Levels 3 and 4 open an AI chatbot in a new tab. Log in with your school Google account if asked, and don't share personal details in the chat.</p>
<p>4. After you submit, you'll see a hint for anything you got wrong, and you get one more try.</p>
<p>5. Your teacher can see your answers, so do your best.</p>
<p>[✅ I'm ready]</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><strong>Interactions</strong></td>
<td><ul>
<li><p>"I'm ready" closes the pop-up and opens the home page (0.3). When reopened later, the button reads "Close".</p></li>
</ul></td>
</tr>
<tr class="even">
<td><strong>Student thinks or does</strong></td>
<td>"I know the order, that my work saves, and what the chatbots are."</td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 20%" />
<col style="width: 79%" />
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
<td><p>Top bar adds a chip: <strong>Class 3E1 · Register No. 12</strong>.</p>
<blockquote>
<p>{Welcome line, see below}</p>
</blockquote>
<p>Links: 📋 How this works · 🔄 Sharing this device? Switch student</p>
<p>Card: <strong>📘 Start here: 4 key terms</strong> / A 1-minute look before Level 2</p>
<p><strong>Your route</strong>: "2 of 5 levels done" with a progress bar, then five level cards:</p>
<blockquote>
<p>1 📝 <strong>Your Customer Service Stories</strong>: Think about your own experiences as a customer.</p>
<p>2 📘 <strong>Learn: Customer Service</strong>: Short notes on quality customer service, the four stages and service recovery.</p>
<p>3 💬 <strong>Chat with Alex</strong>: Be the customer. Chat with Nexora's customer service officer.</p>
<p>4 🛍️ <strong>Serve Suzzie at Stylez</strong>: Switch roles. Now you're the customer service officer.</p>
<p>5 ✅ <strong>Check and Exit Ticket</strong>: Check what you've learnt and tell your teacher how confident you feel.</p>
</blockquote>
<p>Each card shows a status: Not started / In progress / ✅ {badge name} / 🔒 Locked.</p>
<p><strong>🏅 Your badges</strong>: five badge slots (greyed out until earned, with the badge name underneath).</p>
<p>After all five levels: button <strong>📊 My learning report</strong>.</p></td>
</tr>
<tr class="odd">
<td><strong>Interactions</strong></td>
<td><ul>
<li><p>Tap an open card to go to that level. Tapping a locked card shows: "Finish Level {n − 1} first to open this level."</p></li>
<li><p>"Switch student" asks: "Log in as a different student? The work for Class {class}, Register No. {n} stays saved." [Switch student] [Cancel]. Switch student returns to 0.1.</p></li>
</ul></td>
</tr>
<tr class="even">
<td><strong>Welcome line</strong></td>
<td><p>Shown in a welcome card at the top of the home page:</p>
<ul>
<li><p>0 done: "👋 Welcome to Chapter 6: Customer Service! In 5 short levels, you'll find out what great customer service looks like, chat with an AI customer service officer, and even serve a customer yourself. Take your time, and do your best. Start with Level 1 below. You've got this!"</p></li>
<li><p>1 to 4 done: "👋 Welcome back! Your work has been loaded. You've finished {n} of 5 levels. Great progress! Carry on with Level {n+1} below." ("Your work has been loaded." only on the first home page after logging in.)</p></li>
<li><p>5 done: "🎉 Amazing work! You've finished all 5 levels. Have a look at your learning report to see how you did." with the 📊 My learning report button inside the card.</p></li>
</ul></td>
</tr>
<tr class="odd">
<td><strong>Teacher only</strong></td>
<td><p>"Switch student" is new (the LJ had no log-out, flagged in its audit), for brothers and sisters or classmates sharing one device. A student who moves to a different device just logs in there, and their saved work loads (see 0.1).</p>
<p>No guide characters on this page (the LJ had them).</p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 20%" />
<col style="width: 79%" />
</colgroup>
<thead>
<tr class="header">
<th colspan="2"><strong>0.4 4 key terms</strong></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><strong>Trigger</strong></td>
<td>Tapping "Start here: 4 key terms". Can be opened any time.</td>
</tr>
<tr class="even">
<td><strong>Student sees</strong></td>
<td><p><strong>📘 4 key terms</strong></p>
<blockquote>
<p>You'll meet these words in Level 2. Read them once now.</p>
</blockquote>
<ul>
<li><p><strong>Customer service</strong>: Customer service refers to what businesses do for their customers so that they are happy and satisfied.</p></li>
<li><p><strong>Quality customer service</strong>: Quality customer service means doing more for customers to exceed their expectations.</p></li>
<li><p><strong>Service breakdown</strong>: A service breakdown occurs when customers make a complaint about a product or service.</p></li>
<li><p><strong>Service recovery</strong>: Service recovery is a process whereby a business takes action in response to service breakdown or failure.</p></li>
</ul>
<blockquote>
<p>[Got it, back to my route]</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><strong>Teacher only</strong></td>
<td>Textbook pp. 120, 123 and 140. The same wording is used in Level 2, so students see each definition twice: once as pre-training and once in context.</td>
</tr>
</tbody>
</table>

## Level 1: Your Customer Service Stories

<table>
<colgroup>
<col style="width: 20%" />
<col style="width: 79%" />
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
<td><p>Level header: <strong>📝 Level 1: Your Customer Service Stories</strong></p>
<blockquote>
<p>Think about your own experiences as a customer. There are no right or wrong answers.</p>
<p>Tip: don't name real people. Your teacher will read your answers.</p>
</blockquote>
<p>Three boxes (stacked on phones, side by side on wider screens):</p>
<blockquote>
<p><strong>1.</strong> Think of a time you got GOOD customer service (e.g. at a bubble tea shop, a hawker stall, or when ordering on GrabFood). What did the staff do? [box, hint "The staff member..."]</p>
<p><strong>2.</strong> Think of a time you got BAD customer service. What happened? [box, hint "What happened was..."]</p>
<p><strong>3.</strong> Look at your two stories. What do you think makes customer service good or bad? [box, hint "I think customer service is good when... and bad when..."]</p>
<p>Type at least one sentence in each box, then tap Submit.</p>
<p>[Submit]</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><strong>Feedback</strong></td>
<td><ul>
<li><p>Any box empty: "Not finished yet" pop-up listing the empty boxes in red, with [Go back] [Submit anyway] (as in the LJ).</p></li>
<li><p>After Submit (not scored), the recap card:</p></li>
</ul>
<blockquote>
<p>📌 <strong>Remember this</strong>: Keep your stories in mind. In Level 2, see whether your ideas match what businesses call quality customer service.</p>
<p>[Finish Level 1]</p>
</blockquote></td>
</tr>
<tr class="even">
<td><strong>Complete</strong></td>
<td>Badge pop-up: <strong>[Badge 1] 📝 Story Sharer</strong> "You earned the Story Sharer badge!" [Back to my route]. Level 2 unlocks.</td>
</tr>
<tr class="odd">
<td><strong>Student thinks or does</strong></td>
<td>"I remember a real good and bad experience and what made the difference."</td>
</tr>
<tr class="even">
<td><strong>Teacher only</strong></td>
<td>Replaces the SLS ITT. Answers go to Teacher Mode under the student's class and register number. The SLS option to record audio is dropped, because the app does not store audio.</td>
</tr>
</tbody>
</table>

## Level 2: Learn: Customer Service

*Three step tabs: 1 Quality Customer Service · 2 The Four Stages · 3 Breakdown and Recovery. Nothing in Level 2 is scored. Tabs unlock in order as each one is read to the end.*

<table>
<colgroup>
<col style="width: 20%" />
<col style="width: 79%" />
</colgroup>
<thead>
<tr class="header">
<th colspan="2"><strong>2.1 Tab 1: Quality Customer Service</strong></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><strong>Trigger</strong></td>
<td>Opening Level 2.</td>
</tr>
<tr class="even">
<td><strong>Student sees (part 1)</strong></td>
<td><p><strong>What is customer service?</strong></p>
<blockquote>
<p>Customer service refers to what businesses do for their customers so that they are happy and satisfied. It takes place the moment a customer enters a shop, a restaurant or an attraction, and continues even after the customer has made a purchase and left the venue.</p>
</blockquote>
<p><strong>What is quality customer service?</strong></p>
<blockquote>
<p>Quality customer service means doing more for customers to exceed their expectations.</p>
</blockquote>
<p><strong>Why does quality customer service matter?</strong></p>
<blockquote>
<p>If a business provides quality customer service:</p>
</blockquote>
<ul>
<li><p>customers will have a positive experience and they will choose to <strong>return repeatedly</strong>;</p></li>
<li><p>customers will <strong>recommend</strong> the business to their relatives and friends; and</p></li>
<li><p><strong>customer loyalty</strong> is created, ensuring the <strong>continuity of the business</strong>.</p></li>
</ul>
<p><strong>[Image C01] Good service vs poor service comic (existing, assets/img/C01-good-vs-poor-service.jpg)</strong></p>
<blockquote>
<p>[Continue ↓]</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><strong>Student sees (part 2)</strong></td>
<td><p><strong>Skills and qualities of a good customer service employee</strong></p>
<blockquote>
<p>Some skills and qualities customer service employees need:</p>
</blockquote>
<ul>
<li><p>Approachable: friendly and easy to talk to, so customers feel comfortable asking for help</p></li>
<li><p>Customer-focused: paying attention to what each customer needs and putting those needs first</p></li>
<li><p>Clear communication skills: explaining things simply</p></li>
<li><p>Knowledgeable: knowing the products well, so you can answer questions accurately</p></li>
<li><p>Problem-solving skills: providing solutions, not just apologising</p></li>
<li><p>Able to close the customer experience positively: ending on a good note, e.g. thanking the customer and inviting them back</p></li>
</ul>
<blockquote>
<p>[Continue ↓]</p>
</blockquote></td>
</tr>
<tr class="even">
<td><strong>Student sees (part 3)</strong></td>
<td><p><strong>Good product knowledge</strong></p>
<blockquote>
<p>Staff need good product knowledge to answer questions accurately, not guess. This includes:</p>
</blockquote>
<ul>
<li><p>Product features and specifications (e.g. screen size, battery life)</p></li>
<li><p>Price and available options</p></li>
<li><p>How to use or care for the product</p></li>
<li><p>Warranty and after-sales support</p></li>
<li><p>Unique selling points of the product (why your product is better than competitors' products)</p></li>
</ul>
<p><strong>[Image N02] 📱 Product knowledge: a Nexora staff member explaining a phone, with labelled callouts for features, price, care, warranty and unique selling point</strong></p>
<blockquote>
<p>[Next: The Four Stages →]</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><strong>Alt text (C01)</strong></td>
<td>Two-panel comic. Left, "GOOD SERVICE": a smiling Nexora staff member offers, "Hi! Would you like to take a look at our newest phone model available?" The customer replies, "Sure! Let me test it out." Right, "POOR SERVICE": a staff member looks at his own phone with arms crossed while the customer says, "Excuse me... I need some help." He replies, "..."</td>
</tr>
<tr class="even">
<td><strong>Student thinks or does</strong></td>
<td>"Quality service means doing more than expected; these are the skills staff need."</td>
</tr>
<tr class="odd">
<td><strong>Teacher only</strong></td>
<td><p>Why it matters: the textbook's three points, word for word (p. 123), with key words in bold for signaling. v7's Reputation point is removed.</p>
<p>Em dashes from v7 are replaced with colons in the skills list to suit narrow screens. The wording is otherwise unchanged.</p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 20%" />
<col style="width: 79%" />
</colgroup>
<thead>
<tr class="header">
<th colspan="2"><strong>2.2 Tab 2: The Four Stages</strong></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><strong>Trigger</strong></td>
<td>Next → from Tab 1.</td>
</tr>
<tr class="even">
<td><strong>Student sees (part 1)</strong></td>
<td><p><strong>The four stages of providing customer service</strong></p>
<p>Table with a coloured bar on the left of each row (blue, orange, green, purple):</p>
<ul>
<li><p>1. Approaching customers: Greet the customer, show you're happy to help.</p></li>
<li><p>2. Presenting product information: Find out their needs, present a suitable product, explain why it suits their needs, handle questions or objections (when the customer is unsure or disagrees).</p></li>
<li><p>3. Closing the customer experience positively: Summarise what the customer decided and any next steps (e.g. warranty, collection date), thank the customer, leave a good final impression.</p></li>
<li><p>4. Performing service recovery: Respond well when something goes wrong.</p></li>
</ul>
<p><strong>[Image C02] Four stages comic (existing, assets/img/C02-four-stages.jpg)</strong></p>
<blockquote>
<p>[Continue ↓]</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><strong>Student sees (part 2)</strong></td>
<td><p><strong>Approaching customers: 3 approaches</strong></p>
<blockquote>
<p><strong>When to approach:</strong> as soon as a customer enters the store. If you are busy serving someone else, still acknowledge the new customer by making eye contact, smiling and greeting them politely.</p>
</blockquote>
<ul>
<li><p><strong>1. Greeting Approach</strong> Greet the customer in a friendly way as they enter, e.g. "Good morning!" For a regular customer, use their name: "Good morning, Mr Tan!"</p></li>
<li><p><strong>2. Service Approach</strong> Ask a polite question to show you're ready to help, e.g. "How may I assist you?" If a customer comes up to you to ask for something or to pay, serve them as quickly as possible.</p></li>
<li><p>You can also combine the greeting and service approaches: "Good morning! How may I assist you?"</p></li>
<li><p><strong>3. Product Approach</strong> When a customer is looking closely at a product, ask a question about it to help them go from just being interested to actually buying it, e.g. "This phone has a great camera. Would you like to try it out?"</p></li>
</ul>
<blockquote>
<p>Whether salespeople use the greeting, service or product approach, the purpose is to:</p>
</blockquote>
<ul>
<li><p>make customers feel comfortable or welcome in the store so that they are likely to buy from the business; and</p></li>
<li><p>ensure customers return to the business again in the future.</p></li>
</ul>
<p><strong>[Image C03] Three approaches comic (existing, assets/img/C03-three-approaches.jpg)</strong></p>
<blockquote>
<p>[Continue ↓]</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><strong>Student sees (part 3)</strong></td>
<td><p><strong>Watch: A better welcome at Nexora</strong></p>
<blockquote>
<p>Watch this video showing poor and good service. Notice what Alex does differently and how June responds.</p>
</blockquote>
<p><strong>[Video A] A better welcome at Nexora</strong> (YouTube, https://youtu.be/_Esvxks4ZjQ; embedded player, students press play)</p>
<p>Small link under the video, opens in a new tab: Video not loading? Watch it on YouTube</p>
<p>Box <strong>Think about it</strong> (required): What did Alex do to make June feel welcome? Why did she bring her friend back? [box, hint "Write at least 20 characters..."]</p>
<blockquote>
<p>[Continue ↓]</p>
</blockquote></td>
</tr>
<tr class="even">
<td><strong>Student sees (part 4)</strong></td>
<td><p><strong>Presenting product information: suitability</strong></p>
<blockquote>
<p>Don't just list every good feature. Point out the features that match what this customer needs. For example, a customer who takes lots of photos should hear information about the phone's camera, not how good the phone looks.</p>
<p>[Next: Breakdown and Recovery →]</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><strong>Alt text</strong></td>
<td><p>C02: Four-panel comic at a Nexora store. 1, "APPROACHING": the staff member says, "Hi! Welcome to Nexora!" and the customer says, "Hi!" 2, "PRESENTING": "Since you like taking photos, this model's camera is perfect for you!" The customer: "Wow! That looks great!" 3, "CLOSING": "Great choice! Thank you for purchasing with Nexora." The customer: "Thank you so much! I'm excited to use it!" 4, "SERVICE RECOVERY": the customer says, "I'm really upset. The screen cracked even though I was using it carefully." The staff member: "I'm sorry. Let me check this for you and see how I can help."</p>
<p>C03: Three-panel comic. 1, "GREETING APPROACH": "Good morning! Welcome to Nexora!" 2, "SERVICE APPROACH": "Hi! How may I assist you?" 3, "PRODUCT APPROACH": "I noticed that you are interested in this model. It is our new arrival. Would you like to try it?"</p></td>
</tr>
<tr class="even">
<td><strong>Teacher only</strong></td>
<td><p>In C02 panel 4, the bubbles are read in the wrong order, and panel 3 says "purchasing with". You decided these are not urgent; the alt text gives the correct reading order.</p>
<p>Video A is embedded from YouTube only (privacy-enhanced youtube-nocookie.com player, no autoplay), so it uses none of the app's hosting bandwidth. No transcript box. The Think about it answer (saved as s2.video) must be written before moving on to Tab 3 and before Finish Level 2.</p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 20%" />
<col style="width: 79%" />
</colgroup>
<thead>
<tr class="header">
<th colspan="2"><strong>2.3 Tab 3: Breakdown and Recovery</strong></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><strong>Trigger</strong></td>
<td>Next → from Tab 2.</td>
</tr>
<tr class="even">
<td><strong>Student sees (part 1)</strong></td>
<td><p><strong>Service breakdown and service recovery</strong></p>
<ul>
<li><p><strong>Service breakdown:</strong> A service breakdown occurs when customers make a complaint about a product or service. Common causes: unfriendly or unhelpful staff, a product that does not meet expectations, or an advertised product that is not available in the store.</p></li>
<li><p><strong>Service recovery:</strong> Service recovery is a process whereby a business takes action in response to service breakdown or failure.</p></li>
</ul>
<blockquote>
<p>To perform service recovery, follow these 8 steps:</p>
<p>Follow Nexora's staff member as he handles a customer whose new phone screen has cracked.</p>
</blockquote>
<p><strong>The Service Recovery Path</strong> (an interactive graphic built in the page, not an image; layout in the next row)</p>
<ul>
<li><p>👂 <strong>1 Listen</strong>: Listen carefully to the complaint. Give customers full attention. / Bubble: (Puts his own phone away and faces the customer.) / Customer 😠</p></li>
<li><p>⏳ <strong>2 Be patient</strong>: Be patient. Do not interrupt customers when they are describing their unhappiness. / Bubble: (Nods and lets her finish.) / Customer 😠</p></li>
<li><p>🙏 <strong>3 Apologise</strong>: Apologise to the customers for the inconvenience caused. / Bubble: "I'm really sorry for the trouble this has caused you." / Customer 😣</p></li>
<li><p>💙 <strong>4 Acknowledge</strong>: Acknowledge their feelings and assure them of help to solve the problem. / Bubble: "I understand why you're upset. I'll help you sort this out." / Customer 😐</p></li>
<li><p>❓ <strong>5 Ask questions</strong>: Ask questions if more information is needed. / Bubble: "When did you buy it, and when did you first notice the crack?" / Customer 😐</p></li>
<li><p>🛠️ <strong>6 Offer solutions</strong>: Offer solutions. / Bubble: "Since it's still under warranty, I can give you a replacement phone today." / Customer 🙂</p></li>
<li><p>🧑‍💼 <strong>7 Refer</strong>: Refer customers to more senior staff if unable to provide them with an acceptable solution. / Bubble: "If you'd prefer something else, my manager can look at other options for you." / Customer 🙂</p></li>
<li><p>😊 <strong>8 Thank</strong>: Thank customers for bringing the problem to our attention. / Bubble: "Thank you for letting us know about this." / Customer 😊</p></li>
</ul></td>
</tr>
<tr class="odd">
<td><strong>Path design</strong></td>
<td><ul>
<li><p><strong>Layout:</strong> a vertical path of 8 stops joined by a thick line in the service recovery purple (#7C3AED, the same colour as stage 4 in the stage table). Each stop is a large numbered circle with the step's icon, and beside it a card: the short label in bold (large), the textbook wording underneath, and a small speech bubble from the staff member.</p></li>
<li><p><strong>Customer mood meter:</strong> at each stop, a small face shows how the customer feels, moving from 😠 at Step 1 to 😊 at Step 8. On wider screens the faces sit in a column on the right of the path; on phones, inside each card. This shows at a glance why every step matters.</p></li>
<li><p><strong>One step at a time:</strong> the path starts with Step 1 only. A button under the latest stop, <strong>Show Step 2 ↓</strong> (then Step 3, and so on), reveals the next stop with a short slide-in. After Step 8 the button disappears and all 8 stops stay visible for re-reading. Continue ↓ below the path appears only once all 8 have been shown.</p></li>
<li><p><strong>Coming back later:</strong> when the student revisits the tab, all 8 stops are shown at once.</p></li>
<li><p><strong>Accessibility:</strong> the steps are real text (sharp when zoomed, read by screen readers), in a numbered list in the page code. Each face has hidden text (e.g. "Customer feels angry"). The slide-in is switched off for students who have reduced motion turned on.</p></li>
</ul></td>
</tr>
<tr class="even">
<td><strong>Student sees (part 1, continued)</strong></td>
<td><p><em>Shown directly below the Service Recovery Path once all 8 stops have been shown (at once when the student comes back to the tab).</em></p>
<p><strong>Watch: The 8 steps in action</strong></p>
<blockquote>
<p>Watch Alex use all 8 steps to help June with her cracked phone.</p>
</blockquote>
<p><strong>[Video B] The 8 steps in action</strong> (YouTube, https://youtu.be/IWZ4xwI2fF8; embedded player, students press play; no Think about it box, watching is not required)</p>
<p>Small link under the video, opens in a new tab: Video not loading? Watch it on YouTube</p>
<blockquote>
<p>Handled well, a service breakdown can improve customer loyalty. If it is handled badly, you can lose the customer to your competitors.</p>
</blockquote>
<p><strong>[Image C04] Service breakdown to service recovery comic (existing, assets/img/C04-breakdown-to-recovery.jpg)</strong></p>
<blockquote>
<p>[Continue ↓]</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><strong>Student sees (part 2)</strong></td>
<td><p><strong>Real-life example: poor service recovery</strong></p>
<blockquote>
<p>A customer complained to a food delivery app that their orders from one restaurant had been cancelled 4 times. The replies? "oh" and "so sad", followed by a $3.30 voucher "to say we're sorry".</p>
</blockquote>
<p><strong>[Image R01 + R02] Foodpanda chat and voucher screenshots side by side (existing, R01-foodpanda-chat.jpg and R02-foodpanda-voucher.jpg)</strong></p>
<p>Box <strong>Think about it (optional)</strong>: Was this good service recovery? Which of the 8 steps above were missing? [box, hint "I think this was / was not good service recovery because... The steps that were missing were..."]</p>
<blockquote>
<p>[Continue ↓]</p>
</blockquote></td>
</tr>
<tr class="even">
<td><strong>Student sees (part 3)</strong></td>
<td><p><strong>Handling returns of unsatisfactory products</strong></p>
<blockquote>
<p>If a customer returns a product they are unhappy with, the business can offer:</p>
</blockquote>
<ul>
<li><p><strong>Replacement:</strong> Replace it with the same product.</p></li>
<li><p><strong>Exchange:</strong> Offer to exchange it with a different product.</p></li>
<li><p><strong>Refund:</strong> Give a refund.</p></li>
</ul>
<p><strong>[Image N03] 🎧 Returns comic: replacement, exchange and refund at the Nexora store</strong></p>
<blockquote>
<p>Many businesses also set clear rules for returns, such as a time limit and needing the receipt.</p>
</blockquote>
<p><strong>[Image R03] Uniqlo return and exchange conditions, cropped to the time limits and icons (existing, R03-uniqlo-returns.jpg)</strong></p>
<p>Box <strong>Think about it (optional)</strong>: Name ONE item Uniqlo will not accept for return. Why do you think a business would have this rule? [box, hint "One item Uniqlo will not accept is... I think they have this rule because..."]</p>
<blockquote>
<p>[Finish Level 2]</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><strong>Feedback</strong></td>
<td>The two optional boxes are saved and sent to the teacher if filled in, but Finish works even if they are empty.</td>
</tr>
<tr class="even">
<td><strong>Complete</strong></td>
<td>Recap: "📌 <strong>Remember this</strong>: The four stages are approaching customers, presenting product information, closing the customer experience positively and performing service recovery." Badge pop-up: <strong>[Badge 2] 📘 Service Scholar</strong>. Level 3 unlocks.</td>
</tr>
<tr class="odd">
<td><strong>Alt text</strong></td>
<td><p>C04: Two-panel comic. "SERVICE BREAKDOWN": the customer holds a cracked phone: "I just bought this phone and the screen is already cracked!" The staff member: "I'm really sorry to hear that. Let me take a look and help you with this." "SERVICE RECOVERY": the staff member hands over a new phone box: "You're welcome! If you need any further help, just let us know." The customer: "Thank you so much for helping me! I'm really happy with the new phone."</p>
<p>R01: Chat screenshot. The customer writes that they have ordered from the merchant at least 4 times and every order was cancelled. Two replies say "oh" and "so sad". R02: Foodpanda voucher reading "Here's $3.3000000000000003 to say we're sorry."</p>
<p>R03: Uniqlo return and exchange conditions: returns within 30 days of purchase; products that cannot be returned or exchanged include used, washed and altered products.</p></td>
</tr>
<tr class="even">
<td><strong>Teacher only</strong></td>
<td><p>The Service Recovery Path applies Mayer: multimedia (icon, words and a worked example together), spatial contiguity (each example and face sits beside its step), segmenting (one stop at a time, student-paced), signaling (numbers, bold labels, stage 4 purple) and coherence (the faces carry meaning, not decoration). It also gives students the picture they need for the Foodpanda question that follows ("Which of the 8 steps were missing?").</p>
<p>The speech bubbles are example lines (approved 19 October), not textbook wording. They follow the cracked-phone story in C04.</p>
<p>The Uniqlo image is already cropped in the assets pack.</p></td>
</tr>
</tbody>
</table>

## Level 3: Chat with Alex

*Two step tabs: 1 Chat · 2 Think back.*

<table>
<colgroup>
<col style="width: 20%" />
<col style="width: 79%" />
</colgroup>
<thead>
<tr class="header">
<th colspan="2"><strong>3.1 Tab 1: Chat</strong></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><strong>Trigger</strong></td>
<td>Opening Level 3 (unlocked after Level 2).</td>
</tr>
<tr class="even">
<td><strong>Student sees</strong></td>
<td><p><strong>[Image N04] 🧑‍💼 Alex, a friendly Nexora customer service officer (small square picture beside the intro)</strong></p>
<blockquote>
<p>Meet Alex, a customer service officer at Nexora Mobile. You are the customer. During your chat, try to:</p>
</blockquote>
<ul>
<li><p>Ask about at least one product, and its price</p></li>
<li><p>Ask a follow-up question or disagree with something (for example, say the price is too high)</p></li>
<li><p>Report a problem with a product, and see how Alex responds</p></li>
</ul>
<p>Collapsed tip <strong>Not sure what to ask? Try these:</strong> "How much does the Nexora Core cost?" / "Why is the Nexora Prime so expensive?" / "My phone's screen stopped working. What can I do?"</p>
<blockquote>
<p>Watch how Alex starts the chat, presents information, and responds when something has gone wrong.</p>
<p>[💬 Open Alex (new tab) ↗]</p>
<p>☐ I have finished chatting with Alex.</p>
<p>[Next: Think back →] (greyed out until the box is ticked)</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><strong>Interactions</strong></td>
<td><ul>
<li><p>Open Alex opens the Gemini Gem link in a new tab. Ticking the box unlocks Next.</p></li>
</ul></td>
</tr>
<tr class="even">
<td><strong>Student thinks or does</strong></td>
<td>"I chat as a customer and notice what Alex does at each stage."</td>
</tr>
<tr class="odd">
<td><strong>Teacher only</strong></td>
<td>The app cannot check that the chat happened; the tick box is an honesty check. Alex's Gem link (kept in the config file so it can be changed without touching the code): https://gemini.google.com/gem/03f888f88087</td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 20%" />
<col style="width: 79%" />
</colgroup>
<thead>
<tr class="header">
<th colspan="2"><strong>3.2 Tab 2: Think back</strong></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><strong>Trigger</strong></td>
<td>Next → from Tab 1.</td>
</tr>
<tr class="even">
<td><strong>Student sees</strong></td>
<td><blockquote>
<p>Answer these without reopening the chat with Alex.</p>
</blockquote>
<p><strong>Q1.</strong> Think back to your conversation with Alex. Identify ONE skill or quality he showed.</p>
<blockquote>
<p>Skill or quality: [box]</p>
<p>This is important to customers because [box]</p>
</blockquote>
<p><strong>Q2.</strong> Match each line to the stage of providing customer service. Choose a stage for each line.</p>
<blockquote>
<p>P. "Could you tell me when the screen first stopped working? Then we can arrange a repair or replacement for you." [dropdown: Choose a stage…]</p>
<p>Q. "Since you play a lot of games, the Nexora Prime's fast processor would suit you best." [dropdown]</p>
<p>R. "So that's the Nexora Core with the 256GB upgrade and the one-year warranty. You can collect it on Friday!" [dropdown]</p>
<p>S. "Good afternoon! Is there anything I can help you find today?" [dropdown]</p>
</blockquote>
<p>Each dropdown lists: Approaching customers / Presenting product information / Closing the customer experience positively / Performing service recovery.</p>
<blockquote>
<p>[Submit]</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><strong>Feedback (Q2)</strong></td>
<td><p>After the first Submit (this attempt is recorded), each line shows ✓ or ✗. Wrong lines show a hint and become editable again; [Check again] appears.</p>
<ul>
<li><p>P wrong: "This officer asks when the screen stopped working and offers a repair. Has something gone wrong for this customer?"</p></li>
<li><p>Q wrong: "The officer matches a phone feature to something the customer does a lot. Which stage is about presenting a suitable product?"</p></li>
<li><p>R wrong: "The officer sums up what the customer chose and when to collect it. Is this the start or the end of the interaction?"</p></li>
<li><p>S wrong: "This is the first thing the officer says to the customer. Which stage starts the conversation?"</p></li>
</ul>
<p>Right (first or second try): P "Correct: asking questions (Step 5) and offering a solution (Step 6) are part of service recovery." / Q "Correct: matching a feature to the customer's needs is presenting product information." / R "Correct: summing up the decision and the next steps closes the customer experience positively." / S "Correct: a greeting with an offer of help is approaching customers."</p>
<p>Still wrong after Check again: the right stage is shown with the same reason as the correct message.</p></td>
</tr>
<tr class="even">
<td><strong>Feedback (Q1)</strong></td>
<td><p>Not marked automatically; both boxes are required. After Submit, a recap appears under Q1:</p>
<blockquote>
<p>Check your reason: does it say how this skill or quality helps the customer? For example, a knowledgeable officer answers questions accurately, so the customer doesn't get wrong information.</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><strong>Complete</strong></td>
<td>Recap: "📌 <strong>Remember this</strong>: The same four stages happen in every customer interaction, whether it's in a shop or in a chat." Badge pop-up <strong>[Badge 3] 🔍 Service Spotter</strong>. Level 4 unlocks.</td>
</tr>
<tr class="even">
<td><strong>Teacher only</strong></td>
<td>Q2 options keep v7's letter order (P recovery, Q presenting, R closing, S approaching), so the answer key 1–S, 2–Q, 3–R, 4–P still holds. Q1 stays open text (not a dropdown) to keep recall, as in v7.</td>
</tr>
</tbody>
</table>

## Level 4: Serve Suzzie at Stylez

*Two step tabs: 1 Roleplay · 2 Reflect.*

<table>
<colgroup>
<col style="width: 20%" />
<col style="width: 79%" />
</colgroup>
<thead>
<tr class="header">
<th colspan="2"><strong>4.1 Tab 1: Roleplay</strong></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><strong>Trigger</strong></td>
<td>Opening Level 4 (unlocked after Level 3).</td>
</tr>
<tr class="even">
<td><strong>Student sees</strong></td>
<td><p><strong>[Image N05] 🛍️ Suzzie, a shopper at the Stylez fashion store (small picture beside the intro)</strong></p>
<blockquote>
<p>Now switch roles. You are a customer service officer at Stylez, a retail store. The AI plays Suzzie, a customer with a question or a problem.</p>
</blockquote>
<p>Card <strong>About Stylez</strong> (placeholder): <mark>⚑ PLACEHOLDER: fill in from the Stylez document (what Stylez sells, prices, store policies) so that it matches what Suzzie's Gem knows. Claude Code builds the card with this placeholder text until then.</mark></p>
<blockquote>
<p><strong>You start the conversation.</strong> Try: "Hi, welcome to Stylez! How may I assist you?"</p>
<p>Try to use the four stages from Level 2: approach Suzzie, present product information, close positively, and if there's a problem, perform service recovery.</p>
<p>[🛍️ Open Suzzie (new tab) ↗]</p>
<p>☐ I have finished serving Suzzie.</p>
<p>[Next: Reflect →] (greyed out until ticked)</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><strong>Student thinks or does</strong></td>
<td>"I know what Stylez sells and how to open; I try all four stages."</td>
</tr>
<tr class="even">
<td><strong>Teacher only</strong></td>
<td><p>Suzzie's Gem link (in the config file): https://gemini.google.com/gem/1lfkE4kuic0cBsFwXlTNjKbOaGi6r0tK_?usp=sharing</p>
<p>"Level 2" replaces v7's "Section 1", because the app has no section numbers. The opening line was suggested in the 1 October walkthrough; delete it if Suzzie's Gem already starts the chat.</p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 20%" />
<col style="width: 79%" />
</colgroup>
<thead>
<tr class="header">
<th colspan="2"><strong>4.2 Tab 2: Reflect</strong></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><strong>Student sees</strong></td>
<td><blockquote>
<p>Think about your roleplay with Suzzie.</p>
<p><strong>1.</strong> What is one thing you feel you did well when serving Suzzie? [box, hint "I did well at..."]</p>
<p><strong>2.</strong> What is one thing you would do differently next time? [box, hint "Next time, I would..."]</p>
<p>[Submit]</p>
</blockquote></td>
</tr>
<tr class="even">
<td><strong>Feedback</strong></td>
<td>Not scored; both boxes required ("Not finished yet" if empty). Recap: "📌 <strong>Remember this</strong>: Look back at the four stages. Which one would you like to practise more?"</td>
</tr>
<tr class="odd">
<td><strong>Complete</strong></td>
<td>Badge pop-up <strong>[Badge 4] ⭐ Service Star</strong>. Level 5 unlocks.</td>
</tr>
</tbody>
</table>

## Level 5: Check and Exit Ticket

*Two step tabs: 1 Check · 2 Exit ticket.*

<table>
<colgroup>
<col style="width: 20%" />
<col style="width: 79%" />
</colgroup>
<thead>
<tr class="header">
<th colspan="2"><strong>5.1 Tab 1: Check your understanding</strong></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><strong>Trigger</strong></td>
<td>Opening Level 5 (unlocked after Level 4).</td>
</tr>
<tr class="even">
<td><strong>Student sees</strong></td>
<td><blockquote>
<p>Try these without going back to the notes. It is okay to get some wrong!</p>
</blockquote>
<p><strong>Q3. True or false?</strong> Tap True or False for each.</p>
<blockquote>
<p>i. Customer service ends once the customer has paid. [True] [False]</p>
<p>ii. Good product knowledge helps a customer service officer answer customer questions confidently. [True] [False]</p>
<p>iii. Service recovery is complete once the staff member has apologised. [True] [False]</p>
<p>iv. A service breakdown occurs when customers make a complaint about a product or service. [True] [False]</p>
</blockquote>
<p><strong>Q4.</strong> A customer at a mobile phone shop says, "This is the third time I've called about the same faulty charger, and nobody has fixed it!" Which response best shows good service recovery? Tap one.</p>
<blockquote>
<p>A. "I'm sorry about that. Our chargers usually work fine, so it may be your phone."</p>
<p>B. "I'm sorry you've had to call so many times. Let me personally make sure this gets fixed today."</p>
<p>C. "I'm sorry about that. Please call our hotline again tomorrow, and they will check it for you."</p>
<p>D. "Thank you for telling us about this. I'll pass your feedback on to our team."</p>
</blockquote>
<p><strong>Q5.</strong> Explain why quality customer service matters to a business. Give ONE reason.</p>
<blockquote>
<p>Quality customer service matters because [box]</p>
<p>[Submit]</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><strong>Feedback (Q3)</strong></td>
<td><p>After the first Submit (recorded), wrong items show a hint and can be changed once ([Check again]).</p>
<ul>
<li><p>i wrong (True): "Look back at what customer service means. Does it stop the moment the customer pays, or continue after the purchase?"</p></li>
<li><p>ii wrong (False): "Think about Alex. How did knowing the prices and features help him answer your questions?"</p></li>
<li><p>iii wrong (True): "Count the 8 steps of service recovery. Is apologising the last step?"</p></li>
<li><p>iv wrong (False): "Look at the definition of service breakdown in Level 2. When does a service breakdown occur?"</p></li>
</ul>
<p>Right: i "Correct: customer service continues even after the customer has made a purchase." ii "Correct: knowing the product lets staff answer accurately instead of guessing." iii "Correct: apologising is only Step 3; the officer still needs to acknowledge feelings, ask questions and offer solutions." iv "Correct: that is the textbook definition of service breakdown."</p></td>
</tr>
<tr class="even">
<td><strong>Feedback (Q4)</strong></td>
<td><ul>
<li><p>A: "The staff member apologised, but then blamed the customer's phone. Which step is about acknowledging feelings and assuring help?"</p></li>
<li><p>C: "There is an apology, but is a solution offered? Look at Step 6."</p></li>
<li><p>D: "Thanking the customer is Step 8, but was the problem solved? Look at Step 6."</p></li>
<li><p>B (right): "Correct: B acknowledges the customer's frustration and offers a solution: making sure the charger is fixed today."</p></li>
</ul>
<p>Still wrong after Check again: B is shown with the correct message.</p></td>
</tr>
<tr class="odd">
<td><strong>Feedback (Q5)</strong></td>
<td>Not marked automatically; the box is required. After Submit: "Check your answer: did you name one reason (customers return repeatedly, customers recommend the business to their relatives and friends, or customer loyalty ensures the continuity of the business) and explain what it means for the business?"</td>
</tr>
<tr class="even">
<td><strong>Teacher only</strong></td>
<td><p>Statement iv uses the textbook definition, matching Level 2.</p>
<p>The Q3 and Q4 hints come from v7's answer key, rewritten so each refers to its own statement.</p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 20%" />
<col style="width: 79%" />
</colgroup>
<thead>
<tr class="header">
<th colspan="2"><strong>5.2 Tab 2: Exit ticket</strong></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><strong>Student sees</strong></td>
<td><p><strong>Q6.</strong> What is one thing you have learnt about customer service? [box, hint "One thing I learnt is..."]</p>
<p><strong>Q7.</strong> What is one question you still have about this chapter? [box, hint "I am still not sure about..."]</p>
<p><strong>Q8.</strong> How confident are you that you can do each of these? Tap one face for each.</p>
<p>Four rows, each with a row of four faces (as in the LJ's Level 5 rating row), labels underneath: 😟 Not yet / 🙁 A little / 🙂 Confident / 😄 Very confident.</p>
<blockquote>
<p>I can explain why quality customer service matters to a business</p>
<p>I can name the skills and qualities a good customer service employee needs</p>
<p>I can describe the four stages of providing customer service</p>
<p>I can explain what service breakdown is, and how to perform service recovery</p>
<p>[Submit my exit ticket]</p>
</blockquote></td>
</tr>
<tr class="even">
<td><strong>Feedback</strong></td>
<td>All fields required ("Not finished yet" lists what's missing). Exit tickets are not scored.</td>
</tr>
<tr class="odd">
<td><strong>Complete</strong></td>
<td>Pop-up: "🎉 You've finished Chapter 6!" with <strong>[Badge 5] 🏆 Chapter 6 Champion</strong>, and buttons [📊 See my learning report] [Back to my route].</td>
</tr>
<tr class="even">
<td><strong>Teacher only</strong></td>
<td>The "be honest" line was removed by your group in v6, so there is no intro line here.</td>
</tr>
</tbody>
</table>

## Learning report

<table>
<colgroup>
<col style="width: 20%" />
<col style="width: 79%" />
</colgroup>
<thead>
<tr class="header">
<th colspan="2"><strong>6.1 My learning report</strong></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><strong>Trigger</strong></td>
<td>"My learning report" on the home page (after all 5 levels), or from the Level 5 pop-up.</td>
</tr>
<tr class="even">
<td><strong>Student sees</strong></td>
<td><p><strong>📊 My learning report</strong>: Class {class}, Register No. {n}</p>
<ul>
<li><p>One row per level: ✅ and the date finished, plus the badge.</p></li>
<li><p>Level 3, Q2: first try {x} / 4. Level 5, Q3 and Q4: first try {y} / 5.</p></li>
<li><p><strong>Look at these again:</strong> one line per item wrong on the first try, naming the topic and where to find it, e.g. "Closing the customer experience positively (Level 2, The Four Stages)".</p></li>
<li><p><strong>How confident you felt:</strong> the four exit-ticket rows with the face the student chose.</p></li>
</ul>
<blockquote>
<p>[Back to my route]</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><strong>Teacher only</strong></td>
<td>The LJ hid scores from students; for self-study revision, showing first-try scores helps students see what to revise. Hide them if you prefer the LJ's approach.</td>
</tr>
</tbody>
</table>

# E. Teacher Mode

<table>
<colgroup>
<col style="width: 20%" />
<col style="width: 79%" />
</colgroup>
<thead>
<tr class="header">
<th colspan="2"><strong>T.1 Teacher Mode: sign in</strong></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><strong>Trigger</strong></td>
<td>"Teacher Mode" link in the footer (route #teacher).</td>
</tr>
<tr class="even">
<td><strong>Teacher sees</strong></td>
<td><p><strong>Teacher Mode</strong> / Key in the teacher code. [box] [Enter]</p>
<p>Wrong code: "Incorrect code." Server problem: "The server could not load the results. Wait a minute and try again." (as in LJ V33).</p></td>
</tr>
<tr class="odd">
<td><strong>Teacher only</strong></td>
<td>The teacher code is checked on the server and never written in app.js or anywhere in the repo (as in the LJ). It is not case sensitive: the script compares it after trimming spaces and ignoring capitals. The group has chosen the code; it is not written in this storyboard because the repo is public. Use a new code for this app, stored in the Apps Script project's settings (Script Properties), never in the code.</td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 20%" />
<col style="width: 79%" />
</colgroup>
<thead>
<tr class="header">
<th colspan="2"><strong>T.2 Tab: Classes</strong></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><strong>Teacher sees</strong></td>
<td><p><strong>Your classes</strong>: list of class names, each with [Remove].</p>
<p>Add a class: [box, hint "e.g. 3E1"] [Add]</p>
<p>Note: "Classes appear in the class dropdown on the home page, in this order."</p></td>
</tr>
<tr class="even">
<td><strong>Interactions</strong></td>
<td><ul>
<li><p>Add: trims spaces; refuses blanks, duplicates (any capitals) and names over 20 characters, with a short message for each.</p></li>
<li><p>Remove: "Remove {class}? Students' saved answers are kept." [Remove] [Cancel].</p></li>
</ul></td>
</tr>
<tr class="odd">
<td><strong>Teacher only</strong></td>
<td>The class list is saved on the server (a Classes tab in the Google Sheet), so every device sees the same list. Anyone can read the list; only the teacher code can change it.</td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 20%" />
<col style="width: 79%" />
</colgroup>
<thead>
<tr class="header">
<th colspan="2"><strong>T.3 Tab: Results</strong></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><strong>Teacher sees</strong></td>
<td><p>Choose a class [dropdown]. Then:</p>
<ul>
<li><p><strong>Class summary</strong>: how many students finished each level; the most-missed Q2 and Q3/Q4 items (first try); the confidence spread for each of the four exit-ticket rows; and a list of all Q7 answers ("one question I still have") for planning reteaching.</p></li>
<li><p><strong>Students table</strong>: Register No. | Levels done | Q2 first try | Q3 and Q4 first try | Confidence (four faces). Tap a row to open the student's full report: Level 1 stories, Level 2 optional answers, Q1, Q2 (first and second try), Level 4 reflections, Q3 to Q5, and the exit ticket.</p></li>
<li><p>[Download CSV] for the chosen class.</p></li>
<li><p>In a student's full report: [Clear this student's work]. Pop-up: "Clear all work for Class {class}, Register No. {n}? This deletes their answers, first attempts, badges and progress, and cannot be undone. Download the CSV first if you want a copy." [Clear work] [Cancel]. Afterwards: "Work cleared. This student starts again from Level 1 the next time they log in."</p></li>
</ul></td>
</tr>
<tr class="even">
<td><strong>Teacher only</strong></td>
<td><p>Clear this student's work is for a student who keyed in the wrong register number and wrote over a classmate's work, or who needs a fresh start. It needs the teacher code (checked on the server).</p>
<p>The server records when the work was cleared. Any older copy still on a device is thrown away the next time that device connects, so the cleared work does not come back through the newer-copy-wins rule.</p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 20%" />
<col style="width: 79%" />
</colgroup>
<thead>
<tr class="header">
<th colspan="2"><strong>T.4 Tab: This device</strong></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><strong>Teacher sees</strong></td>
<td><ul>
<li><p>[Unlock all levels on this device]: for demos and for students who need to skip ahead. Shows "All levels are unlocked on this device." and can be turned off.</p></li>
<li><p>[Reset this device]: logs out the student and clears the copy of their work on this device (asks for the teacher code again, as in the LJ). Their work stays saved on the server.</p></li>
</ul></td>
</tr>
</tbody>
</table>

# F. Images and image prompts

### Existing images (from v7, in the assets pack)

| **ID**   | **File**                                                     | **Where**                                                |
|----------|--------------------------------------------------------------|----------------------------------------------------------|
| C01      | assets/img/C01-good-vs-poor-service.jpg                      | Level 2, Tab 1, part 1                                   |
| C02      | assets/img/C02-four-stages.jpg                               | Level 2, Tab 2, part 1                                   |
| C03      | assets/img/C03-three-approaches.jpg                          | Level 2, Tab 2, part 2                                   |
| C04      | assets/img/C04-breakdown-to-recovery.jpg                     | Level 2, Tab 3, part 1                                   |
| R01, R02 | assets/img/R01-foodpanda-chat.jpg, R02-foodpanda-voucher.jpg | Level 2, Tab 3, part 2 (side by side; stacked on phones) |
| R03      | assets/img/R03-uniqlo-returns.jpg (cropped)                  | Level 2, Tab 3, part 3                                   |

*The VivoCity images, logos, badges, guide characters, school crest and team picture from the LJ are all removed.*

### New images (placeholder box with emoji until the file is added)

For N01 to N05, attach C02 (the four-stages comic) as a style reference when you generate, so the Nexora store and characters match. Prompts work in Gemini or ChatGPT.

| **N01 🏬 Landing banner** |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
|---------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **File**                  | assets/img/N01-landing-banner.jpg, wide 1200 × 480 px                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| **Prompt**                | A wide banner illustration in the same colourful, anime-style flat illustration as the attached Nexora comic, for a secondary school revision app about customer service. A bright, modern phone store called Nexora, with a blue Nexora sign, white display tables with smartphones, and phone cases on the back wall. On the right, the friendly young male staff member (short dark brown hair, black Nexora polo shirt, blue lanyard and staff pass) greets a teenage girl customer (long brown hair, pink hoodie, beige backpack) who has just walked in; both are smiling. Leave clear empty space on the left third for a title to be placed over it later. No text other than the Nexora sign. Clean, minimal background, landscape format. |

| **N02 📱 Product knowledge** |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
|------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **File**                     | assets/img/N02-product-knowledge.jpg, about 1200 × 800 px                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| **Prompt**                   | A single illustration in the same anime-style flat illustration as the attached Nexora comic. The Nexora staff member holds up a smartphone and explains it to the teenage girl customer at a display table. Around the phone are five neat, short callout labels with thin pointer lines, in a simple bold font: "FEATURES", "PRICE", "HOW TO USE", "WARRANTY" and "WHY IT'S BETTER". No other text and no speech bubbles. Bright, clean background, the same two characters as the reference. |

| **N03 🎧 Returns: replacement, exchange, refund** |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
|---------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **File**                                          | assets/img/N03-returns.jpg, wide 1800 × 600 px                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| **Prompt**                                        | A three-panel horizontal comic strip in the same anime-style flat illustration and caption-bar style as the attached Nexora comic. In every panel the teenage girl customer is at the Nexora counter returning a pair of wireless earbuds that don't work, and the same staff member helps her. Panel 1, caption bar "REPLACEMENT": he hands her a new box of the same earbuds, speech bubble "Let me give you a new pair." Panel 2, caption bar "EXCHANGE": he holds out a different pair of earbuds, speech bubble "Would you like to try this one instead?" Panel 3, caption bar "REFUND": he hands her the money back with a receipt, speech bubble "Here is your full refund." Each panel has one speech bubble and one bold caption in a coloured bar at the bottom (blue, orange, green). Bright, clean backgrounds, the same two characters in all three panels. |

| **N04 🧑‍💼 Alex** |                                                                                                                                                                                                                                                                                                                                                                            |
|-----------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **File**        | assets/img/N04-alex.jpg, square 600 × 600 px                                                                                                                                                                                                                                                                                                                               |
| **Prompt**      | A friendly head-and-shoulders portrait in the same anime-style flat illustration as the attached Nexora comic, used as a chat profile picture. A young customer service officer named Alex, wearing a black Nexora polo shirt with a blue lanyard and staff pass and a small headset, smiling warmly, looking at the viewer. Plain soft blue circular background. No text. |

| **N05 🛍️ Suzzie at Stylez** |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
|-----------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **File**                    | assets/img/N05-suzzie.jpg, square 600 × 600 px                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| **Prompt**                  | A friendly head-and-shoulders portrait in the same anime-style flat illustration as the attached Nexora comic, used as a chat profile picture. A shopper named Suzzie holding a shopping bag with "Stylez" written on it, standing in a bright fashion store with clothes racks blurred behind her, looking slightly unsure, as if about to ask a question. No other text. \[Check Suzzie's age, look and the store's style against your groupmate's Stylez document before generating.\] |

### Badges (for ChatGPT)

Generate the five badges as one consistent set. Paste the **style block** first in the same chat, then each badge prompt one at a time, so the set keeps the same look. Save each as a square PNG (1024 × 1024 px; the app shows them at about 120 px). Until then, each badge shows its emoji in a rounded placeholder box.

| **Style Style block (paste once, before the badges)** |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
|-------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Prompt**                                            | I'm making a set of five achievement badges for a secondary school revision app about customer service. Make every badge in the same style: a round badge with a thick outer ring in deep wine red (#5C1229) and a soft pale-rose inner circle (#F9ECEF), one simple, bold, flat-vector icon in the centre using wine red, white and one accent colour, and a ribbon banner across the bottom of the badge in wine red (#8B1E3F) showing the badge name in white, bold, rounded, easy-to-read capital letters. The ribbon text is the only text on the badge, and it must be spelled exactly as I give it. Clean edges, gentle shading, no gradients that look muddy, plain white background, centred, square image. Friendly and modern, suitable for 15-year-old students. Reply "Ready" and wait for the first badge. |

| **Badge 1 📝 Story Sharer (Level 1)** |                                                                                                                                                      |
|---------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------|
| **File**                              | assets/img/badge-story-sharer.png                                                                                                                    |
| **Prompt**                            | BADGE 1. Ribbon text: "STORY SHARER". Centre icon: a speech bubble with a small smiley face inside it, next to a pencil. Accent colour: warm yellow. |

| **Badge 2 📘 Service Scholar (Level 2)** |                                                                                                                                             |
|------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------|
| **File**                                 | assets/img/badge-service-scholar.png                                                                                                        |
| **Prompt**                               | BADGE 2. Ribbon text: "SERVICE SCHOLAR". Centre icon: an open book with a small shop-counter bell on the right page. Accent colour: orange. |

| **Badge 3 🔍 Service Spotter (Level 3)** |                                                                                                                                              |
|------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------|
| **File**                                 | assets/img/badge-service-spotter.png                                                                                                         |
| **Prompt**                               | BADGE 3. Ribbon text: "SERVICE SPOTTER". Centre icon: a magnifying glass over a chat bubble that has three dots in it. Accent colour: green. |

| **Badge 4 ⭐ Service Star (Level 4)** |                                                                                                                                             |
|---------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------|
| **File**                              | assets/img/badge-service-star.png                                                                                                           |
| **Prompt**                            | BADGE 4. Ribbon text: "SERVICE STAR". Centre icon: a big five-pointed star with a small name-tag shape in front of it. Accent colour: gold. |

| **Badge 5 🏆 Chapter 6 Champion (Level 5)** |                                                                                                                                                            |
|---------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **File**                                    | assets/img/badge-chapter-6-champion.png                                                                                                                    |
| **Prompt**                                  | BADGE 5. Ribbon text: "CHAPTER 6 CHAMPION". Centre icon: a trophy cup with a large number 6 on it and two small sparkles. Accent colour: purple (#7C3AED). |

*ChatGPT sometimes misspells badge text. Check each ribbon carefully; if one is wrong, ask it to "redo the same badge, ribbon text exactly: …".*

# G. Student's-eye check and open items

### Checked as a struggling reader, an average student and a strong student

- Order matters in this module (stories before notes, notes before Alex, Alex before Suzzie), so levels unlock in order; a strong student can't skip straight to the quiz. Teacher Mode can unlock everything.

- Every instruction before an interaction is under about 60 words; the longest notes sections are split with Continue ↓ so students never face a wall of text.

- Nothing is pre-selected anywhere, so no answer can be gamed from a default.

- The Q2 dropdown options and the Q3/Q4 answers carry no colour or order cues; stage colours appear only in the notes.

- v7 referred to "Section 1", which doesn't exist in the app; it now says "Level 2".

- Students who tick "I have finished" without chatting can still answer Level 3 from the notes; this is accepted, because the app cannot check, and the teacher can see Q1 answers that don't refer to the chat.

- Every hint refers to its own question and asks a guiding question rather than giving the answer.

### Still to do before students use it

- **Pictures:** generate N01 to N05 and the five badges from Section F and save them in assets/img/ with the file names listed; they replace the placeholders automatically.

- **About Stylez card:** fill it in from the Stylez document so it matches Suzzie's Gem, and check Suzzie's look before generating N05.

- **Level 4 opening line:** delete it if Suzzie's Gem starts the chat itself.

- **Privacy:** confirm with the tutor that storing class and register number in the Google Sheet is acceptable.

- **Teacher code:** kept in Script Properties only. Consider a code that cannot be guessed from the app.

# H. Changes agreed during the build

These decisions were made while the app was built (19 to 20 October 2026). They are part of this storyboard and override anything earlier in it. Student-facing wording below is final.

### Look and Mayer's principles (for G1 students)

- **Theme:** wine red (brand \#8B1E3F, dark \#5C1229, light \#F9ECEF, background \#FAF7F5, white cards with a thin \#E8DADF border). Every feedback box has ✓ or ✗ and a coloured left border, so meaning never relies on colour.

- **One style per meaning:** 📖 definition box for textbook definitions; icon cards for lists of points; speech bubbles for what staff say; 💡 tip box; 📌 amber "Remember this" recap card. Every notes heading carries an icon.

- **Level 1:** three equal cards in a row (😊 GOOD, 😞 BAD, 🤔 what makes it good or bad) with the boxes lined up; stacked on phones.

- **Level 2:** the three reasons (🔁 🗣️ 🤝), six skills, five product-knowledge points, two purposes of approaching and the three returns (🔁 🔄 💵) are icon cards; the three approaches are cards with their examples as speech bubbles; stage icons 👋 📱 ✅ 🛠️ beside the stage colours; Service Recovery Path circles are white with a purple ring and number badge.

- **Segmenting:** extra Continue ↓ points in Level 2: before "Why does quality customer service matter?", before "Whether salespeople use the greeting, service or product approach...", before "To perform service recovery, follow these 8 steps:" and before "Many businesses also set clear rules for returns...".

- **Card text (Level 2):** cards that continued a sentence now start with a capital letter (the three reasons and the two purposes of approaching; words and punctuation unchanged). Skills and qualities cards and the Replacement, Exchange and Refund cards show the name in bold on its own line with no colon, and the description below it starting with a capital letter.

- **🔊 Read aloud:** each block of notes in Level 2 and the 4 key terms page has a "🔊 Read aloud" button, which shows "⏹ Stop" while reading (browser speech, notes only, never questions or answers; tap again to stop). It is not called "Listen", because path Step 1 is "Listen".

- **Approach card titles** have no colon: "1. Greeting Approach", "2. Service Approach", "3. Product Approach".

- **Image sizes:** badges about 256px wide, icons about 160px, example and comic pictures about 900px, so pages load quickly.

- **Level header:** each level shows its card description under the title; finished tabs show ✓.

- **Images:** always shown in full and centred; the Foodpanda pair is the same height. R03 was re-cropped to the first row of icons because the original screenshot was cut off.

- **Before you start:** an icon beside each point (🗺️ 💾 🤖 🔁 👀).

- **Video A, "Watch: A better welcome at Nexora" (27 October 2026):** moved from Tab 1 (after "Why does quality customer service matter?") to its own Continue ↓ part in Tab 2, directly after the three approaches, the two purposes and C03, with its required Think about it box ("What did Alex do to make June feel welcome? Why did she bring her friend back?") directly under it. That answer is now needed before going on to Tab 3 and before Finish Level 2, instead of before leaving Tab 1. It is embedded from YouTube (https://youtu.be/_Esvxks4ZjQ) instead of a video file in the app; the transcript box and the app's own captions file are removed.

- **Video B, "Watch: The 8 steps in action" (27 October 2026):** added in Tab 3 directly below the Service Recovery Path and above "Handled well, a service breakdown can improve customer loyalty...", shown once all 8 stops have been shown. Instruction: "Watch Alex use all 8 steps to help June with her cracked phone." Embedded from YouTube (https://youtu.be/IWZ4xwI2fF8). No Think about it box; watching is not required.

- **Both videos:** the privacy-enhanced YouTube player (youtube-nocookie.com), never starting by itself, in a 16:9 box with the same thin border and rounded corners as the other pictures, with a small "Video not loading? Watch it on YouTube" link underneath (opens in a new tab) for school networks that block embedded YouTube. No transcript box. 🔊 Read aloud skips the videos.

### Feedback on marked questions

- **One Check again per tab,** at the bottom, checking every item still waiting. Finish Level 3 and "Next: Exit ticket →" appear only once every item is settled.

- **Revealed answer:** "✗ The answer is {answer}: {reason}"; the correct option is outlined in green with "✓ Correct answer" and the student's wrong pick is marked ✗.

- **Learning report, second try:** "Not needed: right on the first try" when the first try was right; "Not attempted yet" when the first try was wrong and there is no second try yet.

- **Changed answer before Check again:** the old hint fades and "👆 Tap Check again to see if you're right." shows instead.

- **Summary card** (from the LJ app), above the 📌 card in Level 3 and at the end of Level 5 Check: "🎉 Great work! You got everything right on the first try." or "💪 Let's learn from these. Good effort! Here are N things to look at again:" followed by the Look at these again lines.

- **Look at these again lines** (summary card and learning report): P "Performing service recovery (Level 2, Breakdown and Recovery)"; Q "Presenting product information (Level 2, The Four Stages)"; R "Closing the customer experience positively (Level 2, The Four Stages)"; S "Approaching customers (Level 2, The Four Stages)"; Q3 i "What customer service is (Level 2, Quality Customer Service)"; Q3 ii "Good product knowledge (Level 2, Quality Customer Service)"; Q3 iii and Q4 "The 8 steps of service recovery (Level 2, Breakdown and Recovery)"; Q3 iv "Service breakdown (Level 2, Breakdown and Recovery)"; nothing wrong "Nothing to look at again. You got everything right on the first try! 🎉".

- **Required questions:** only Level 1 offers Submit anyway; every other required question must be filled in. "Not finished yet" lists missing items by name.

- **Greyed-out Next** (Levels 3 and 4): "Tick the box above when you've finished." underneath.

- **Badge pop-ups 2 to 4:** "You earned the {badge name} badge!" \[Back to my route\].

- **Offline bar:** "📡 No internet. Your work is saved on this device and will be sent when the connection is back."

### Data, Teacher Mode and hosting

- **Saving:** each answer box is merged separately (the newest wins), first attempts are never overwritten, and saves are spaced out so a class of 40 stays within Google's limits.

- **Teacher Mode:** Classes, Results (class summary, students table, full report, CSV in Singapore time, Clear this student's work) and This device (Unlock all levels, Reset this device). The teacher code is not case sensitive and is locked out for 10 minutes after 10 wrong tries.

- **Hosting:** private GitHub repository chongdaniel-hue/ebs-ch6-app, published by Vercel (only index.html, app.js, styles.css, config.js, vercel.json and assets/ are public). The Google Sheet "EBS Chapter 6 student work" and its Apps Script are owned by Dan's MOE account. Setup and handover steps: docs/apps-script-setup.md, docs/github-setup.md and docs/HANDOVER.md in the repository.
