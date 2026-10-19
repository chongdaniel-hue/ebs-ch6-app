/* ============================================================
   Stand-ins for the Google services used by apps-script/Code.gs,
   so the local test server can run Code.gs itself. Only the
   methods Code.gs calls are provided; if Code.gs starts using a
   new method, add it here (and the test run will tell you if you
   forget, because the action replies "server_error").

   The "spreadsheet" is kept in server/data/sheets.json. Every cell
   is stored as text, like the plain-text format Code.gs sets on its
   tabs in the real Google Sheet.
   ============================================================ */

const fs = require("fs");
const path = require("path");
const vm = require("vm");

function createAppsScript({ dataDir, teacherCode }) {
  const file = path.join(dataDir, "sheets.json");
  let book = {};
  try { book = JSON.parse(fs.readFileSync(file, "utf8")); } catch (e) { book = {}; }
  const save = () => {
    fs.mkdirSync(dataDir, { recursive: true });
    fs.writeFileSync(file, JSON.stringify(book, null, 1));
  };

  // Test hooks: make the next N saves fail as if the lock could not be had.
  const hooks = { busy: 0 };

  function makeSheet(name) {
    const rows = () => book[name];
    const sheet = {
      getLastRow() {
        const r = rows();
        let last = r.length;
        while (last > 0 && r[last - 1].every(v => v === "")) last--;
        return last;
      },
      getMaxRows() { return Math.max(1000, rows().length); },
      setFrozenRows() { return sheet; },
      deleteRow(n) { rows().splice(n - 1, 1); },
      getRange(row, col, numRows, numCols) {
        numRows = numRows || 1;
        numCols = numCols || 1;
        const range = {
          getValues() {
            const out = [];
            for (let i = 0; i < numRows; i++) {
              const src = rows()[row - 1 + i] || [];
              const line = [];
              for (let j = 0; j < numCols; j++) line.push(src[col - 1 + j] === undefined ? "" : src[col - 1 + j]);
              out.push(line);
            }
            return out;
          },
          setValues(values) {
            if (values.length !== numRows || values.some(v => v.length !== numCols)) {
              throw new Error("The number of rows or columns in the data does not match the range.");
            }
            for (let i = 0; i < numRows; i++) {
              const r = rows();
              while (r.length < row + i) r.push([]);
              const line = r[row - 1 + i];
              for (let j = 0; j < numCols; j++) {
                while (line.length < col + j) line.push("");
                const v = values[i][j];
                line[col - 1 + j] = v === null || v === undefined ? "" : String(v);
              }
            }
            return range;
          },
          setNumberFormat() { return range; },
          setFontWeight() { return range; }
        };
        return range;
      }
    };
    return sheet;
  }

  const spreadsheet = {
    getSheetByName(name) { return book[name] ? makeSheet(name) : null; },
    insertSheet(name) { book[name] = []; return makeSheet(name); }
  };

  const cacheStore = new Map();
  const cache = {
    get(k) {
      const hit = cacheStore.get(k);
      if (!hit) return null;
      if (Date.now() > hit.until) { cacheStore.delete(k); return null; }
      return hit.v;
    },
    put(k, v, seconds) { cacheStore.set(k, { v: String(v), until: Date.now() + (seconds || 600) * 1000 }); },
    remove(k) { cacheStore.delete(k); }
  };

  const services = {
    SpreadsheetApp: { getActiveSpreadsheet: () => spreadsheet, flush() {} },
    LockService: {
      getScriptLock: () => ({
        tryLock() { if (hooks.busy > 0) { hooks.busy--; return false; } return true; },
        releaseLock() {}
      })
    },
    CacheService: { getScriptCache: () => cache },
    PropertiesService: {
      getScriptProperties: () => ({ getProperty: (k) => (k === "TEACHER_CODE" ? teacherCode || null : null) })
    },
    ContentService: {
      MimeType: { JSON: "application/json" },
      createTextOutput(text) {
        const out = { text, setMimeType() { return out; }, getContent() { return text; } };
        return out;
      }
    },
    Utilities: {
      formatDate(date, timeZone, pattern) {
        if (pattern !== "yyyy-MM-dd HH:mm:ss") throw new Error("Mock formatDate only supports yyyy-MM-dd HH:mm:ss");
        const p = {};
        new Intl.DateTimeFormat("en-GB", {
          timeZone, year: "numeric", month: "2-digit", day: "2-digit",
          hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23"
        }).formatToParts(date).forEach(x => { p[x.type] = x.value; });
        return `${p.year}-${p.month}-${p.day} ${p.hour}:${p.minute}:${p.second}`;
      }
    },
    console
  };

  const context = vm.createContext(services);
  const code = fs.readFileSync(path.join(__dirname, "..", "apps-script", "Code.gs"), "utf8");
  vm.runInContext(code, context, { filename: "Code.gs" });

  return {
    doGet(parameter) {
      const out = context.doGet({ parameter });
      save();
      return out.getContent();
    },
    doPost(contents) {
      const out = context.doPost({ postData: { contents, type: "text/plain" }, parameter: {} });
      save();
      return out.getContent();
    },
    reset() { book = {}; cacheStore.clear(); hooks.busy = 0; save(); },
    hooks,
    context
  };
}

module.exports = { createAppsScript };
