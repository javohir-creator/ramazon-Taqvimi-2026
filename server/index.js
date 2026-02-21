import cors from 'cors';
import express from "express";
import cron from "node-cron";
import { initDb, getPrayerTimeByRegionDistrictDate, dbEnabled } from "./db.js";
import { runScrape2026 } from "./cron/scrape2026.js";

const app = express();

// ✅ CORS sozlamasi (Vercel + local development uchun)
app.use(cors({
  origin: [
    "https://ramazon-taqvimi-2026.vercel.app", 
    "http://localhost:5173"
  ],
  methods: ["GET", "POST"],
  credentials: true
}));

app.use(express.json());
const PORT = process.env.PORT || 3001;

async function fetchText(url) {
  const controller = new AbortController();
  const to = setTimeout(() => controller.abort(), 8000);
  const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" }, signal: controller.signal });
  clearTimeout(to);
  if (!r.ok) throw new Error(`fetch failed ${r.status}`);
  return r.text();
}

function normalizeName(name) {
  if (!name) return "";
  return (
    name
      .replace(/’/g, "'")
      .replace(/ʻ/g, "'")
      .replace(/‘/g, "'")
      .replace(/`/g, "'")
      .replace(/ʼ/g, "'")
      .replace(/ё/gi, "yo")
      .trim()
  );
}

let areasCache = { ts: 0, list: [] };
let nameToSlugCache = { ts: 0, map: new Map() };
async function listAllSlugs() {
  const html = await fetchText("https://namoz-vaqti.uz/?lang=lotin&period=today&region=ozbekiston");
  const slugs = new Set();
  const re = /region=([a-z0-9-]+)/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    slugs.add(m[1]);
  }
  return Array.from(slugs);
}
async function getJsonForSlug(slug) {
  const t = await fetchText(`https://namoz-vaqti.uz/?format=json&lang=lotin&period=today&region=${encodeURIComponent(slug)}`);
  return JSON.parse(t);
}
async function buildAreas() {
  const slugs = await listAllSlugs();
  const parentNameBySlug = new Map();
  const groups = new Map();
  for (const s of slugs) {
    try {
      const data = await getJsonForSlug(s);
      const name = data?.meta?.region?.name;
      const parent = data?.meta?.region?.parent;
      if (!parent || parent === "ozbekiston") {
        parentNameBySlug.set(s, name || s);
        if (!groups.has(s)) groups.set(s, new Set());
      } else if (parent) {
        if (!parentNameBySlug.has(parent)) {
          try {
            const p = await getJsonForSlug(parent);
            parentNameBySlug.set(parent, p?.meta?.region?.name || parent);
          } catch {
            parentNameBySlug.set(parent, parent);
          }
        }
        if (!groups.has(parent)) groups.set(parent, new Set());
        if (name) groups.get(parent).add(name);
      }
    } catch {}
  }
  const regions = [];
  for (const [p, set] of groups.entries()) {
    const rn = parentNameBySlug.get(p) || p;
    regions.push({ name: rn, districts: Array.from(set.values()).sort((a, b) => a.localeCompare(b)) });
  }
  regions.sort((a, b) => a.name.localeCompare(b.name));
  return regions;
}
async function ensureAreas() {
  const now = Date.now();
  if (areasCache.list.length && now - areasCache.ts < 12 * 60 * 60 * 1000) return areasCache.list;
  const built = await buildAreas();
  areasCache = { ts: now, list: built };
  return built;
}
async function ensureNameToSlug() {
  const now = Date.now();
  if (nameToSlugCache.map.size && now - nameToSlugCache.ts < 12 * 60 * 60 * 1000) return nameToSlugCache.map;
  const slugs = await listAllSlugs();
  const map = new Map();
  for (const s of slugs) {
    try {
      const d = await getJsonForSlug(s);
      const n = d?.meta?.region?.name;
      if (n) {
        const raw = String(n).toLowerCase().trim();
        const norm = normalizeName(n).toLowerCase().trim();
        map.set(raw, s);
        map.set(norm, s);
      }
    } catch {}
  }
  nameToSlugCache = { ts: now, map };
  return map;
}

function lookupSlugByNames(n2s, region, district) {
  const candidates = [];
  const rRaw = String(region || "").toLowerCase().trim();
  const dRaw = String(district || "").toLowerCase().trim();
  const rNorm = normalizeName(region).toLowerCase().trim();
  const dNorm = normalizeName(district).toLowerCase().trim();
  if (dRaw) candidates.push(dRaw);
  if (dNorm) candidates.push(dNorm);
  if (rRaw) candidates.push(rRaw);
  if (rNorm) candidates.push(rNorm);
  for (const k of candidates) {
    const val = n2s.get(k);
    if (val) return val;
  }
  return null;
}

async function resolveSlug(region, district) {
  const base = normalizeName(district || region).toLowerCase().trim();
  if (!base) return null;
  const stripSuffix = (s) => s.replace(/\s+(viloyati|tumani|shahri)$/i, "").trim();
  const toSlugNoApos = (s) =>
    s.replace(/’|ʻ|‘|ʼ|`/g, "").replace(/'/g, "").replace(/\s+/g, "-");
  const toSlugDashApos = (s) =>
    s.replace(/’|ʻ|‘|ʼ|`/g, "'").replace(/'/g, "-").replace(/\s+/g, "-");
  const cand = new Set();
  cand.add(toSlugNoApos(base));
  cand.add(toSlugNoApos(stripSuffix(base)));
  cand.add(toSlugDashApos(base));
  cand.add(toSlugDashApos(stripSuffix(base)));
  for (const c of cand) {
    try {
      const j = await getJsonForSlug(c);
      if (j?.meta?.region?.name) return c;
    } catch {}
  }
  try {
    const n2s = await ensureNameToSlug();
    const fromMap = lookupSlugByNames(n2s, region, district);
    if (fromMap) return fromMap;
  } catch {}
  return null;
}

function mapDistrictToRegionQuery(region, district) {
  const r = normalizeName(region);
  const d = normalizeName(district);

  // Toshkent shahri districts share the same timetable
  if (r.toLowerCase().includes("toshkent shahri")) {
    return "Toshkent";
  }

  // General rule: use district name if provided, else fallback to region (city) name
  if (d) {
    return d;
  }
  // Fallbacks for some common region names
  const regionFallbacks = {
    "toshkent viloyati": "Toshkent",
    samarqand: "Samarqand",
    buxoro: "Buxoro",
    "farg'ona": "Farg'ona",
    andijon: "Andijon",
    namangan: "Namangan",
    xorazm: "Urganch",
    qashqadaryo: "Qarshi",
    surxondaryo: "Termiz",
    navoiy: "Navoiy",
    jizzax: "Jizzax",
    sirdaryo: "Guliston",
    "qoraqalpog'iston": "Nukus",
  };
  return regionFallbacks[r.toLowerCase()] || r;
}

function getTashkentDate() {
  const now = new Date();
  try {
    // Create Tashkent-local date parts
    const fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Tashkent",
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });
    const parts = fmt.formatToParts(now);
    const year = Number(parts.find((p) => p.type === "year")?.value);
    const month = Number(parts.find((p) => p.type === "month")?.value);
    const day = Number(parts.find((p) => p.type === "day")?.value);
    return { year, month, day };
  } catch {
    return { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
  }
}

function parseISODate(s) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(s || ""))) return null;
  return s;
}

app.get("/api/times", async (req, res) => {
  try {
    const region = String(req.query.region || "");
    const district = String(req.query.district || "");
    const queryName = mapDistrictToRegionQuery(region, district);

    const { year, month, day } = getTashkentDate();

    const url = `https://islomapi.uz/api/daily?region=${encodeURIComponent(queryName)}&month=${month}&day=${day}`;
    const resp = await fetch(url, { timeout: 10000 });
    if (!resp.ok) {
      return res.status(502).json({ error: "UpstreamError", message: `Failed to fetch from islomapi.uz`, detail: { status: resp.status } });
    }
    const data = await resp.json();
    const fajr = data?.times?.tong_saharlik || null;
    const maghrib = data?.times?.shom_iftor || null;
    const apiDate = data?.date ? new Date(data.date) : null;

    let finalFajr = fajr;
    let finalMaghrib = maghrib;

    const needsFallback =
      !finalFajr ||
      !finalMaghrib ||
      (apiDate && Number.isFinite(apiDate.getFullYear()) && apiDate.getFullYear() !== year);

    if (needsFallback && /toshkent/i.test(queryName)) {
      try {
        // Use r.jina.ai proxy to get a clean, markdown-like view of the timetable
        const md = await fetchText("https://r.jina.ai/http://islom.uz/vremyanamazov/27/11");
        const timesRows = [];
        const lineRegex = /^\|\s*(\d{1,2})\s*\|[^|]*\|\s*(\d{2}:\d{2})\s*\|[^|]*\|[^|]*\|[^|]*\|\s*(\d{2}:\d{2})\s*\|/gm;
        let m;
        while ((m = lineRegex.exec(md)) !== null) {
          const fajrMd = m[2];
          const maghribMd = m[3];
          timesRows.push([fajrMd, maghribMd]);
        }
        const tz = "Asia/Tashkent";
        const now = new Date();
        const tsFmt = new Intl.DateTimeFormat("en-US", { timeZone: tz, year: "numeric", month: "numeric", day: "numeric" });
        const parts = tsFmt.formatToParts(now);
        const y = Number(parts.find((p) => p.type === "year")?.value);
        const mo = Number(parts.find((p) => p.type === "month")?.value);
        const da = Number(parts.find((p) => p.type === "day")?.value);
        const todayTz = new Date(Date.UTC(y, mo - 1, da));
        const ramadanStart = new Date(Date.UTC(2026, 1, 19));
        const diff = Math.floor((todayTz.getTime() - ramadanStart.getTime()) / 86400000) + 1;
        const ramadanDay = Math.min(Math.max(1, diff), 30);
        const row = timesRows[ramadanDay - 1];
        if (row) {
          finalFajr = row[0];
          finalMaghrib = row[1];
        }
      } catch {
      }
    }

    if (!finalFajr || !finalMaghrib) {
      return res.status(502).json({ error: "ParseError", message: "Could not parse saharlik or iftorlik times" });
    }

    res.json({
      region: normalizeName(region) || queryName,
      district: normalizeName(district) || queryName,
      fajr: finalFajr,
      maghrib: finalMaghrib,
    });
  } catch (e) {
    res.status(500).json({ error: "ServerError", message: e?.message || "Unknown error" });
  }
});

app.get("/api/prayer-times", async (req, res) => {
  try {
    const region = String(req.query.region || "");
    const district = String(req.query.district || "");
    const date = parseISODate(String(req.query.date || ""));
    if (!region || !district || !date) {
      return res.status(400).json({ error: "BadRequest", message: "region, district and date=YYYY-MM-DD are required" });
    }
    if (!/^2026-/.test(date)) {
      return res.status(400).json({ error: "UnsupportedYear", message: "Only 2026 is supported" });
    }
    if (!dbEnabled()) {
      return res.status(503).json({ error: "DBUnavailable", message: "Database is not configured" });
    }
    const row = await getPrayerTimeByRegionDistrictDate({ region, district, date });
    if (!row) {
      return res.status(404).json({ error: "NotFound", message: "No data for given parameters" });
    }
    return res.json({
      region: row.region_name,
      district: row.district_name,
      date: row.date,
      fajr: row.fajr,
      maghrib: row.maghrib,
    });
  } catch (e) {
    res.status(500).json({ error: "ServerError", message: e?.message || "Unknown error" });
  }
});

app.get("/api/namozvaqti", async (req, res) => {
  try {
    const region = String(req.query.region || "");
    const district = String(req.query.district || "");
    const slug = await resolveSlug(region, district);
    if (!region && !district) return res.status(400).json({ error: "BadRequest", message: "region or district required" });
    if (!slug) return res.status(404).json({ error: "NotFound", message: "region not found" });
    let j = null;
    try {
      j = await getJsonForSlug(slug);
    } catch {}
    let fajr = j?.today?.times?.bomdod || j?.today?.times?.tong || null;
    let maghrib = j?.today?.times?.shom || null;
    let date = j?.meta?.date || null;
    if (!fajr || !maghrib || !date) {
      const { year, month, day } = getTashkentDate();
      const ym = `${year}-${String(month).padStart(2, "0")}`;
      const ddmmyyyy = `${String(day).padStart(2, "0")}.${String(month).padStart(2, "0")}.${year}`;
      try {
        const t = await fetchText(`https://namoz-vaqti.uz/?format=json&lang=lotin&period=${ym}&region=${encodeURIComponent(slug)}`);
        const jm = JSON.parse(t);
        const row = (jm?.period_table || []).find((r) => String(r.date) === ddmmyyyy);
        if (row) {
          fajr = row?.times?.bomdod || row?.times?.tong || null;
          maghrib = row?.times?.shom || null;
          date = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        }
      } catch {}
    }
    if (!fajr || !maghrib || !date) return res.status(502).json({ error: "ParseError", message: "times missing" });
    const rname = j?.meta?.region?.name || (district || region);
    return res.json({ region: rname, district: rname, date, fajr, maghrib });
  } catch (e) {
    res.status(500).json({ error: "ServerError", message: e?.message || "Unknown error" });
  }
});

app.get("/api/ramazon-2026", async (req, res) => {
  try {
    const region = String(req.query.region || "");
    const district = String(req.query.district || "");
    if (!region && !district) return res.status(400).json({ error: "BadRequest", message: "region or district required" });
    const slug = await resolveSlug(region, district);
    if (!slug) return res.status(404).json({ error: "NotFound", message: "region not found" });
    let regionName = null;
    try {
      const j0 = await getJsonForSlug(slug);
      regionName = j0?.meta?.region?.name || null;
    } catch {}
    const months = ["2026-02", "2026-03"];
    const byDate = new Map();
    for (const ym of months) {
      try {
        const t = await fetchText(`https://namoz-vaqti.uz/?format=json&lang=lotin&period=${ym}&region=${encodeURIComponent(slug)}`);
        const j = JSON.parse(t);
        for (const row of j?.period_table || []) {
          const [dd, MM, yyyy] = String(row.date || "").split(".");
          if (!yyyy || !MM || !dd) continue;
          const iso = `${yyyy}-${MM}-${dd}`;
          const bom = row?.times?.bomdod || row?.times?.tong || null;
          const sho = row?.times?.shom || null;
          if (bom && sho) byDate.set(iso, { fajr: bom, maghrib: sho });
        }
      } catch {}
    }
    const start = new Date(Date.UTC(2026, 1, 19)); // 2026-02-19
    const out = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date(start.getTime() + i * 86400000);
      const iso = d.toISOString().slice(0, 10);
      const pair = byDate.get(iso);
      if (!pair) continue;
      out.push({ day: i + 1, date: iso, saharlik: pair.fajr, iftorlik: pair.maghrib });
    }
    const rname = regionName || region || district || "";
    return res.json({ region: rname, district: rname, days: out });
  } catch (e) {
    res.status(500).json({ error: "ServerError", message: e?.message || "Unknown error" });
  }
});

app.get("/api/areas", async (_req, res) => {
  try {
    if (dbEnabled()) {
      const { Pool } = await import("pg");
      const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.PGSSLMODE ? { rejectUnauthorized: false } : undefined });
      const q = await pool.query(
        `
          select region_name, district_name
          from prayer_times
          where date between '2026-01-01' and '2026-12-31'
          group by region_name, district_name
          order by region_name, district_name
        `
      );
      await pool.end();
      const map = new Map();
      for (const r of q.rows) {
        if (!map.has(r.region_name)) map.set(r.region_name, new Set());
        map.get(r.region_name).add(r.district_name);
      }
      const regions = Array.from(map.entries()).map(([name, set]) => ({
        name,
        districts: Array.from(set.values()),
      }));
      return res.json({ regions });
    } else {
      const regions = await ensureAreas();
      return res.json({ regions });
    }
  } catch (e) {
    res.status(500).json({ error: "ServerError", message: e?.message || "Unknown error" });
  }
});

app.get("/", (_req, res) => {
  res.json({
    name: "Ramazon Taqvimi API",
    status: "ok",
    endpoints: ["/api/areas", "/api/namozvaqti", "/api/ramazon-2026", "/api/times", "/api/prayer-times"],
  });
});

initDb().then(() => {
  if (process.env.SCHEDULE_SCRAPER !== "0") {
    cron.schedule("5 0 * * *", async () => {
      try {
        await runScrape2026();
      } catch {}
    }, { timezone: "Asia/Tashkent" });
  }
  app.listen(PORT, () => {
    console.log(`[server] listening on http://localhost:${PORT}`);
  });
});
