/* ============================================================
   EBS Chapter 6 — local test server
   Zero dependencies: plain Node http server.

   Serves the app exactly as GitHub Pages will: only index.html,
   app.js, styles.css, config.js and assets/ are reachable. Docs,
   tests, this folder and hidden files are never served.

   Slice 2 adds the local stand-in for the Google Apps Script API
   (same actions, same request and response shapes), storing data
   in server/data/.

   Run:  npm start   (then open http://localhost:8787)
   ============================================================ */

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 8787;
const ROOT = path.join(__dirname, "..");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml"
};

// The same files the GitHub Pages workflow publishes.
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
    res.writeHead(200, {
      "Content-Type": MIME[path.extname(filePath).toLowerCase()] || "application/octet-stream",
      "Cache-Control": "no-store"
    });
    res.end(req.method === "HEAD" ? undefined : content);
  });
}

const server = http.createServer((req, res) => {
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
  });
}

module.exports = { server };
