import { upsertPrayerTime } from "../db.js";

const base = "https://namoz-vaqti.uz";
const tz = "Asia/Tashkent";

async function fetchText(url) {
  const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!r.ok) throw new Error(`fetch ${r.status}`);
  return r.text();
}

function toISO(dmy) {
  const m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(dmy);
  if (!m) return null;
  return `${m[3]}-${m[2]}-${m[1]}`;
}

function prettyFromSlug(s) {
  return String(s || "")
    .split("-")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : ""))
    .join(" ");
}

async function listAllSlugs() {
  const md = await fetchText("https://r.jina.ai/http://namoz-vaqti.uz/?lang=lotin&period=today&region=ozbekiston");
  const out = [];
  const re = /\[([^\]]+)\]\((?:https?:\/\/)?namoz-vaqti\.uz\/\?[^)]*?\bregion=([a-z0-9-]+)\)/g;
  let m;
  while ((m = re.exec(md)) !== null) {
    const name = m[1].trim();
    const slug = m[2].trim();
    out.push({ name, slug });
  }
  const seen = new Set();
  return out.filter((x) => {
    const k = x.slug;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

async function getMeta(slug) {
  const url = `${base}/?format=json&lang=lotin&period=today&region=${encodeURIComponent(slug)}`;
  const t = await fetchText(url);
  const data = JSON.parse(t);
  const regionSlug = data?.meta?.region?.parent || slug;
  // Resolve parent region human-readable name exactly as on the site
  let regionName = null;
  try {
    const pt = await fetchText(`${base}/?format=json&lang=lotin&period=today&region=${encodeURIComponent(regionSlug)}`);
    const pdata = JSON.parse(pt);
    regionName = pdata?.meta?.region?.name || null;
  } catch {}
  return {
    district_slug: data?.meta?.region?.slug || slug,
    district_name: data?.meta?.region?.name || prettyFromSlug(slug),
    region_slug: regionSlug,
    region_name: regionName || prettyFromSlug(regionSlug),
  };
}

async function getMonth(slug, ym) {
  const url = `${base}/?format=json&lang=lotin&period=${ym}&region=${encodeURIComponent(slug)}`;
  const t = await fetchText(url);
  const data = JSON.parse(t);
  const rows = Array.isArray(data?.period_table) ? data.period_table : [];
  return rows.map((r) => ({
    date: toISO(r.date),
    fajr: r.times?.bomdod || null,
    maghrib: r.times?.shom || null,
  })).filter((r) => r.date && r.fajr && r.maghrib);
}

export async function runScrape2026() {
  const months = Array.from({ length: 12 }, (_, i) => {
    const mm = String(i + 1).padStart(2, "0");
    return `2026-${mm}`;
    });
  const slugs = await listAllSlugs();
  for (const s of slugs) {
    try {
      const meta = await getMeta(s.slug);
      const region_name = meta.region_name;
      for (const ym of months) {
        const days = await getMonth(s.slug, ym);
        for (const d of days) {
          await upsertPrayerTime({
            region_slug: meta.region_slug,
            region_name,
            district_slug: meta.district_slug,
            district_name: meta.district_name,
            date: d.date,
            fajr: d.fajr,
            maghrib: d.maghrib,
          });
        }
      }
    } catch {
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runScrape2026().then(() => {
    process.exit(0);
  });
}
