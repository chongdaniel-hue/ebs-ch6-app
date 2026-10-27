/* ============================================================
   EBS Chapter 6: Customer Service — settings
   Teachers: this is the only file you need to edit.
   ============================================================ */

window.APP_CONFIG = {

  /* ---------- 1. Which server does the app talk to? ----------
     "live"  : the Google Apps Script web app (the Google Sheet). Use this for students.
     "local" : the test server on this computer, for testing only.
     The local test server (server/server.js) always switches this to "local" when it
     hands out this file, so testing on a computer never touches the real Sheet.
     The web app URL comes from docs/apps-script-setup.md, Step 5. */
  SERVER: "live",
  LIVE_URL: "https://script.google.com/macros/s/AKfycbxCZmPHoguRUk-_uFO-7bWp7yTJUfeL_YjKartA6u22h7ks7CV4TzKn9E63DL1wuaad/exec",
  LOCAL_URL: "api",

  /* ---------- Videos (embedded from YouTube, never stored in the app) ----------
     Only the YouTube video ID is needed (the part after youtu.be/). */
  VIDEOS: {
    betterWelcome: {youtubeId: "_Esvxks4ZjQ"},
    serviceRecovery: {youtubeId: "IWZ4xwI2fF8"}
  },

  /* ---------- 2. Chatbot links (open in a new tab) ---------- */

  GEMS: {
    alex: "https://gemini.google.com/share/d/11oY7mUjz7cw16a6GfL5zeeKiwxcCLbz8?usp=sharing",
    suzzie: "https://gemini.google.com/share/d/1D1h2fvX3L6KnSJHjCGQSm1ZkVWUnu8E3?usp=sharing"
  },

  /* ---------- 3. Images ----------
     Every picture in the app is listed here. To add or replace a picture, save it
     in assets/img/ with the file name below. No other change is needed: until the
     file is there, the app shows a light-blue box with the emoji and the label.
     alt   = what a screen reader says (from the storyboard)
     label = the short description shown in the placeholder box */
  UI_ICONS: { file: "assets/icons/ui.svg", symbols: {
    "🏠": "home",
    "📝": "notes",
    "💬": "chat",
    "🛍️": "shopping",
    "✅": "check",
    "📡": "offline",
    "⏳": "hourglass",
    "🗺️": "map",
    "💾": "save",
    "🤖": "robot",
    "🔁": "repeat",
    "🔄": "repeat",
    "👀": "eyes",
    "📋": "clipboard",
    "👋": "wave",
    "🎉": "celebration",
    "🔒": "lock",
    "🔓": "unlock",
    "📊": "report",
    "🏅": "medal",
    "🔍": "search",
    "🔎": "search",
    "⚠️": "warning",
    "🔊": "speaker",
    "⏹": "stop",
    "😊": "happy",
    "😞": "sad",
    "🙁": "sad",
    "🤔": "think",
    "📱": "phone",
    "🛠️": "tools",
    "👂": "ear",
    "😠": "angry",
    "🙏": "apology",
    "😣": "upset",
    "💙": "heart",
    "😐": "calm",
    "❓": "question",
    "🙂": "reassured",
    "🧑‍💼": "staff",
    "🤝": "handshake",
    "⭐": "star",
    "🗣️": "recommend",
    "🎯": "target",
    "🧠": "knowledge",
    "💲": "price",
    "🧴": "care",
    "🛡️": "shield",
    "⏰": "clock",
    "🙋": "help",
    "🛤️": "path",
    "📉": "decline",
    "↩️": "return",
    "💵": "money",
    "👆": "tap",
    "💪": "effort",
    "↗": "external",
    "👍": "thumbs",
    "🏬": "store",
    "😟": "unsure",
    "😄": "very-happy",
    "🏆": "trophy",
    "💭": "thought",
    "⬇️": "download",
    "🧹": "broom",
    "🔑": "key",
    "🎓": "graduate",
    "📖": "graduate",
    "🎧": "headset",
    "🖼️": "picture",
    "🎟️": "ticket",
    "🧾": "receipt",
    "📌": "pin",
    "💡": "bulb",
    "⚑": "flag"
} },
  IMAGES: {
    WELCOME: {file:"assets/img/welcome-customer-service-banner.jpg",emoji:"👋",label:"Welcome to Customer Service",alt:"Welcome to your journey on Customer Service! The Nexora staff member and customer welcome you to the activity."},
    SUITABILITY: { file: "assets/img/product-suitability-camera.png", emoji: "📱", label: "Matching the phone camera to a customer who enjoys photography", alt: "A customer shows her photo gallery while the Nexora staff member points out a new phone camera and a clear flower photo, matching its camera features to her interest in taking photos." },
    PK_FEATURES: { file: "assets/img/product-knowledge-features-v2.jpg", emoji: "📱", label: "Nexora product knowledge example", alt: "Comic: A Nexora staff member talks to a customer in the shop. He says, \"The Nexora Spark has a large screen for reading and an all-day battery.\"" },
    PK_PRICE: { file: "assets/img/product-knowledge-price-v2.jpg", emoji: "📱", label: "Nexora product knowledge example", alt: "Comic: A Nexora staff member talks to a customer in the shop. He says, \"The Nexora Core is $799. You can upgrade to 256GB for $80 more, or 512GB for $160 more.\"" },
    PK_CARE: { file: "assets/img/product-knowledge-care-v2.jpg", emoji: "📱", label: "Nexora product knowledge example", alt: "Comic: A Nexora staff member talks to a customer in the shop. He says, \"You may use a protective case and wipe the screen with a soft, dry cloth to maintain its condition.\"" },
    PK_WARRANTY: { file: "assets/img/product-knowledge-warranty-v2.jpg", emoji: "📱", label: "Nexora product knowledge example", alt: "Comic: A Nexora staff member talks to a customer in the shop. He says, \"Every Nexora phone has a 1-year warranty for manufacturing defects. Keep your receipt, and bring the phone to our Nexora Care Bar if anything goes wrong.\"" },
    PK_SELLING_POINT: { file: "assets/img/product-knowledge-selling-point-v2.jpg", emoji: "📱", label: "Nexora product knowledge example", alt: "Comic: A Nexora staff member talks to a customer in the shop. He says, \"Compared with many phones at this price, the Nexora Spark's all-day battery lasts longer, so it suits you if you use your phone often.\"" },
    ICON_TERMS: { file: "assets/img/icon-key-terms.png", emoji: "🔑", label: "4 key terms", alt: "Four key terms graphic" },
    ICON_LEARN: { file: "assets/img/icon-customer-service-learning.png", emoji: "🎓", label: "Learn customer service", alt: "Customer service learning graphic" },
    TERM_SERVICE: { file: "assets/img/term-customer-service.png", emoji: "🎧", label: "Customer service", alt: "Customer service icon" },
    TERM_QUALITY: { file: "assets/img/term-quality-customer-service.png", emoji: "⭐", label: "Quality customer service", alt: "Quality customer service icon" },
    TERM_BREAKDOWN: { file: "assets/img/term-service-breakdown.png", emoji: "⚠️", label: "Service breakdown", alt: "Service breakdown icon" },
    TERM_RECOVERY: { file: "assets/img/term-service-recovery.png", emoji: "🛠️", label: "Service recovery", alt: "Service recovery icon" },
    N01: {
      file: "assets/img/N01-landing-banner.jpg",
      emoji: "🏬",
      label: "Landing banner: The Nexora phone store, with the staff member welcoming a customer",
      alt: "The Nexora phone store, with the staff member welcoming a customer"
    },
    N03: {
      file: "assets/img/N03-returns-v2.jpg",
      emoji: "🎧",
      label: "Returns comic: replacement, exchange and refund at the Nexora store",
      alt: "Returns comic: replacement, exchange and refund at the Nexora store"
    },
    N04: {
      file: "assets/img/N04-alex.jpg",
      emoji: "🧑‍💼",
      label: "Alex, a friendly Nexora customer service officer",
      alt: "Alex, a friendly Nexora customer service officer"
    },
    N05: {
      file: "assets/img/N05-suzzie.jpg",
      emoji: "🛍️",
      label: "Suzzie, a shopper at the Stylez fashion store",
      alt: "Suzzie, a shopper at the Stylez fashion store"
    },
    C01: {
      file: "assets/img/C01-good-vs-poor-service-v2.jpg",
      emoji: "🖼️",
      label: "Good service vs poor service comic",
      alt: "Two-panel comic. Left, \"GOOD SERVICE\": A smiling Nexora staff member offers, \"Hi! Would you like to take a look at our newest phone model available?\" The customer replies, \"Sure! Let me test it out.\" Right, \"POOR SERVICE\": A staff member looks at his own phone with arms crossed while the customer says, \"Excuse me... I need some help.\" He replies, \"...\""
    },
    C02: {
      file: "assets/img/C02-four-stages-v2.jpg", emoji: "🖼️", label: "Four stages comic",
      alt: "Four-panel comic at a Nexora store. 1, APPROACH: The staff member says, \"Welcome to Nexora! How may I help?\" 2, PRESENT: Holding a camera, he says, \"This camera suits your interest in photos.\" 3, CLOSE: Handing over a Nexora shopping bag, he says, \"Thank you for shopping with us!\" 4, RECOVERY: The customer holds a phone with a cracked screen and he says, \"I am sorry. Let me help solve this.\""
    },
    C03: {
      file: "assets/img/C03-three-approaches-v2.jpg",
      emoji: "🖼️",
      label: "Three approaches comic",
      alt: "Three-panel comic. 1, \"GREETING APPROACH\": \"Good morning! Welcome to Nexora!\" 2, \"SERVICE APPROACH\": \"Hi! How may I assist you?\" 3, \"PRODUCT APPROACH\": \"I noticed that you are interested in this model. It is our new arrival. Would you like to try it?\""
    },
    C04: {
      file: "assets/img/C04-breakdown-to-recovery-v2.jpg",
      emoji: "🖼️",
      label: "Service breakdown to service recovery comic",
      alt: "Two-panel comic. \"SERVICE BREAKDOWN\": The customer holds a cracked phone: \"I just bought this phone and the screen is already cracked!\" The staff member: \"I'm really sorry to hear that. Let me take a look and help you with this.\" \"SERVICE RECOVERY\": The staff member hands over a new phone box: \"You're welcome! If you need any further help, just let us know.\" The customer: \"Thank you so much for helping me! I'm really happy with the new phone.\""
    },
    R01: {
      file: "assets/img/R01-foodpanda-chat.jpg",
      emoji: "💬",
      label: "Foodpanda chat screenshot",
      alt: "Chat screenshot. The customer writes that they have ordered from the merchant at least 4 times and every order was cancelled. Two replies say \"oh\" and \"so sad\"."
    },
    R02: {
      file: "assets/img/R02-foodpanda-voucher.jpg",
      emoji: "🎟️",
      label: "Foodpanda voucher screenshot",
      alt: "Foodpanda voucher reading \"Here's $3.3000000000000003 to say we're sorry.\""
    },
    R03: {
      file: "assets/img/R03-uniqlo-returns.jpg",
      emoji: "🧾",
      label: "Uniqlo return and exchange conditions",
      alt: "Uniqlo return and exchange conditions: Returns within 30 days of purchase; products that cannot be returned or exchanged include used, washed and altered products."
    },
    BADGE1: { file: "assets/img/badge-story-sharer-vibrant.png", emoji: "📝", label: "Story Sharer", alt: "Story Sharer badge" },
    BADGE2: { file: "assets/img/badge-service-scholar-vibrant.png", emoji: "🎓", label: "Service Scholar", alt: "Service Scholar badge" },
    BADGE3: { file: "assets/img/badge-service-spotter-vibrant.png", emoji: "🔍", label: "Service Spotter", alt: "Service Spotter badge" },
    BADGE4: { file: "assets/img/badge-service-star-vibrant.png", emoji: "⭐", label: "Service Star", alt: "Service Star badge" },
    BADGE5: { file: "assets/img/badge-completion-champion.png", emoji: "🏆", label: "Completion Champion", alt: "Completion Champion badge" }
  }
};
