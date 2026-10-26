/* ============================================================
   EBS Chapter 6 — local test server
   Zero dependencies: plain Node http server.

   Serves the app exactly as Vercel publishes it: only index.html,
   app.js, styles.css, config.js and assets/ are reachable. Docs,
   tests, this folder and hidden files are never served.

   It also stands in for the Google Apps Script web app at /api:
   it runs apps-script/Code.gs itself (see apps-script-mock.js), so
   the actions, requests and replies are exactly the live ones.
   Data is kept in server/data/ (never committed).

   Run:  TEACHER_CODE=yourcode npm start   (then open http://localhost:8787)
   The teacher code comes from the TEACHER_CODE environment variable,
   like Script Properties on the live script. Never write it in a file.
   ============================================================ */

const http = require("http");
const fs = require("fs");
const path = require("path");

const { createAppsScript } = require("./apps-script-mock");

const PORT = process.env.PORT || 8787;
const ROOT = path.join(__dirname, "..");
const DATA_DIR = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(__dirname, "data");
const script = createAppsScript({ dataDir: DATA_DIR, teacherCode: process.env.TEACHER_CODE || "", resetCode: process.env.RESET_CODE || "" });
// Only the Playwright tests turn these on (reset the data, make saves fail for a while).
const TEST_HOOKS = process.env.ALLOW_TEST_HOOKS === "1";
const MAX_BODY = 200 * 1024;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".vtt": "text/vtt; charset=utf-8"
};

// The same files Vercel publishes (see .vercelignore).
const PUBLIC_FILES = ["index.html", "app.js", "styles.css", "config.js"];
function isPublic(rel) {
  const parts = rel.split("/");
  if (parts.some(p => p === "" || p.startsWith(".") || p === "..")) return false;
  return PUBLIC_FILES.includes(rel) || parts[0] === "assets";
}

function serveStatic(req, res) {
  let urlPath;
  try { urlPath = decodeURIComponent(req.url.split("?")[0]); } catch (e) { urlPath = ""; }
  if (urlPath === "/" || urlPath === "") urlPath = "/index.html";
  const rel = urlPath.replace(/^\/+/, "");
  const filePath = path.normalize(path.join(ROOT, rel));
  if (!isPublic(rel) || !filePath.startsWith(ROOT + path.sep)) {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found");
    return;
  }
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not found");
      return;
    }
    // config.js says SERVER: "live" for students. Here the app must talk to this local
    // stand-in instead, so testing never reads or writes the real Google Sheet.
    if (rel === "config.js") {
      content = Buffer.from(content.toString("utf8").replace(/SERVER:\s*"live"/, 'SERVER: "local"'), "utf8");
    }
    res.writeHead(200, {
      "Content-Type": MIME[path.extname(filePath).toLowerCase()] || "application/octet-stream",
      "Cache-Control": "no-store"
    });
    res.end(req.method === "HEAD" ? undefined : content);
  });
}

function sendJsonText(res, text) {
  // Apps Script always answers 200; failures are {ok:false, error} in the body.
  res.writeHead(200, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  res.end(text);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", c => {
      size += c.length;
      if (size > MAX_BODY) { reject(new Error("too large")); req.destroy(); return; }
      chunks.push(c);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");

  if (url.pathname === "/api") {
    if (req.method === "GET") {
      sendJsonText(res, script.doGet(Object.fromEntries(url.searchParams)));
      return;
    }
    if (req.method === "POST") {
      let body;
      try { body = await readBody(req); } catch (e) { sendJsonText(res, JSON.stringify({ ok: false, error: "too_big" })); return; }
      sendJsonText(res, script.doPost(body));
      return;
    }
  }

  if (TEST_HOOKS && req.method === "POST" && url.pathname.startsWith("/__test/")) {
    if (url.pathname === "/__test/reset") script.reset();
    if (url.pathname === "/__test/busy") script.hooks.busy = Number(url.searchParams.get("n")) || 0;
    sendJsonText(res, JSON.stringify({ ok: true }));
    return;
  }

  if (req.method === "GET" || req.method === "HEAD") {
    serveStatic(req, res);
    return;
  }
  res.writeHead(405, { "Content-Type": "text/plain" });
  res.end("Method not allowed");
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`EBS Chapter 6 test server running at http://localhost:${PORT}`);
    if (!process.env.TEACHER_CODE) console.log("No TEACHER_CODE set, so Teacher Mode will refuse every code.");
  });
}

module.exports = { server };
