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

  /* ---------- 2. Chatbot links (open in a new tab) ---------- */
  GEMS: {
    alex: "https://gemini.google.com/gem/03f888f88087",
    suzzie: "https://gemini.google.com/share/d/1H4fljjGGGpMKFUnY-CsTxDrElTGAdMZy?usp=sharing"
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
    WELCOME: {file:"assets/img/welcome-customer-service-banner.png",emoji:"👋",label:"Welcome to Customer Service",alt:"Welcome to your journey on Customer Service! The Nexora staff member and customer welcome you to the activity."},
    SUITABILITY: { file: "assets/img/product-suitability-camera.png", emoji: "📱", label: "Matching the phone camera to a customer who enjoys photography", alt: "A customer shows her photo gallery while the Nexora staff member points out a new phone camera and a clear flower photo, matching its camera features to her interest in taking photos." },
    PK_FEATURES: { file: "assets/img/product-knowledge-features-speech.png", emoji: "📱", label: "Nexora product knowledge example", alt: "The Nexora staff member shows a customer a phone screen and explains its screen size and battery features." },
    PK_PRICE: { file: "assets/img/product-knowledge-price-speech.png", emoji: "📱", label: "Nexora product knowledge example", alt: "The Nexora staff member shows a customer blue and black phones and explains price and storage options." },
    PK_CARE: { file: "assets/img/product-knowledge-care-speech.png", emoji: "📱", label: "Nexora product knowledge example", alt: "The Nexora staff member demonstrates wiping a phone screen with a soft dry cloth, with a protective case beside it." },
    PK_WARRANTY: { file: "assets/img/product-knowledge-warranty-speech.png", emoji: "📱", label: "Nexora product knowledge example", alt: "The Nexora staff member gives a customer a receipt and points out after-sales support." },
    PK_SELLING_POINT: { file: "assets/img/product-knowledge-selling-point-speech.png", emoji: "📱", label: "Nexora product knowledge example", alt: "The Nexora staff member compares two fictional phones, using battery symbols to explain longer battery life as a selling point." },
    ICON_TERMS: { file: "assets/img/icon-key-terms.png", emoji: "🔑", label: "4 key terms", alt: "Four key terms graphic" },
    ICON_LEARN: { file: "assets/img/icon-customer-service-learning.png", emoji: "🎓", label: "Learn customer service", alt: "Customer service learning graphic" },
    TERM_SERVICE: { file: "assets/img/term-customer-service.png", emoji: "🎧", label: "Customer service", alt: "Customer service icon" },
    TERM_QUALITY: { file: "assets/img/term-quality-customer-service.png", emoji: "⭐", label: "Quality customer service", alt: "Quality customer service icon" },
    TERM_BREAKDOWN: { file: "assets/img/term-service-breakdown.png", emoji: "⚠️", label: "Service breakdown", alt: "Service breakdown icon" },
    TERM_RECOVERY: { file: "assets/img/term-service-recovery.png", emoji: "🛠️", label: "Service recovery", alt: "Service recovery icon" },
    N01: {
      file: "assets/img/N01-landing-banner.jpg",
      emoji: "🏬",
      label: "Landing banner: the Nexora phone store, with the staff member welcoming a customer",
      alt: "The Nexora phone store, with the staff member welcoming a customer"
    },
    N02: {
      file: "assets/img/N02-product-knowledge.jpg",
      emoji: "📱",
      label: "Product knowledge: a Nexora staff member explaining a phone, with labelled callouts for features, price, care, warranty and unique selling point",
      alt: "A Nexora staff member explaining a phone, with labelled callouts for features, price, care, warranty and unique selling point"
    },
    N03: {
      file: "assets/img/N03-returns.jpg",
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
      file: "assets/img/C01-good-vs-poor-service.jpg",
      emoji: "🖼️",
      label: "Good service vs poor service comic",
      alt: "Two-panel comic. Left, \"GOOD SERVICE\": a smiling Nexora staff member offers, \"Hi! Would you like to take a look at our newest phone model available?\" The customer replies, \"Sure! Let me test it out.\" Right, \"POOR SERVICE\": a staff member looks at his own phone with arms crossed while the customer says, \"Excuse me... I need some help.\" He replies, \"...\""
    },
    C02: {
      file: "assets/img/C02-four-stages.jpg",
      emoji: "🖼️",
      label: "Four stages comic",
      alt: "Four-panel comic at a Nexora store. 1, \"APPROACHING\": the staff member says, \"Hi! Welcome to Nexora!\" and the customer says, \"Hi!\" 2, \"PRESENTING\": \"Since you like taking photos, this model's camera is perfect for you!\" The customer: \"Wow! That looks great!\" 3, \"CLOSING\": \"Great choice! Thank you for purchasing with Nexora.\" The customer: \"Thank you so much! I'm excited to use it!\" 4, \"SERVICE RECOVERY\": the customer says, \"I'm really upset. The screen cracked even though I was using it carefully.\" The staff member: \"I'm sorry. Let me check this for you and see how I can help.\""
    },
    C03: {
      file: "assets/img/C03-three-approaches.jpg",
      emoji: "🖼️",
      label: "Three approaches comic",
      alt: "Three-panel comic. 1, \"GREETING APPROACH\": \"Good morning! Welcome to Nexora!\" 2, \"SERVICE APPROACH\": \"Hi! How may I assist you?\" 3, \"PRODUCT APPROACH\": \"I noticed that you are interested in this model. It is our new arrival. Would you like to try it?\""
    },
    C04: {
      file: "assets/img/C04-breakdown-to-recovery-tanned.png",
      emoji: "🖼️",
      label: "Service breakdown to service recovery comic",
      alt: "Two-panel comic. \"SERVICE BREAKDOWN\": the customer holds a cracked phone: \"I just bought this phone and the screen is already cracked!\" The staff member: \"I'm really sorry to hear that. Let me take a look and help you with this.\" \"SERVICE RECOVERY\": the staff member hands over a new phone box: \"You're welcome! If you need any further help, just let us know.\" The customer: \"Thank you so much for helping me! I'm really happy with the new phone.\""
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
      alt: "Uniqlo return and exchange conditions: returns within 30 days of purchase; products that cannot be returned or exchanged include used, washed and altered products."
    },
    BADGE1: { file: "assets/img/badge-story-sharer-vibrant.png", emoji: "📝", label: "Story Sharer", alt: "Story Sharer badge" },
    BADGE2: { file: "assets/img/badge-service-scholar-vibrant.png", emoji: "🎓", label: "Service Scholar", alt: "Service Scholar badge" },
    BADGE3: { file: "assets/img/badge-service-spotter-vibrant.png", emoji: "🔍", label: "Service Spotter", alt: "Service Spotter badge" },
    BADGE4: { file: "assets/img/badge-service-star-vibrant.png", emoji: "⭐", label: "Service Star", alt: "Service Star badge" },
    BADGE5: { file: "assets/img/badge-completion-champion.png", emoji: "🏆", label: "Completion Champion", alt: "Completion Champion badge" }
  }
};
