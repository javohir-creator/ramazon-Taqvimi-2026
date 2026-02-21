import { Pool } from "pg";

const hasDb = !!process.env.DATABASE_URL;
const pool = hasDb ? new Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.PGSSLMODE ? { rejectUnauthorized: false } : undefined }) : null;

export async function initDb() {
  if (!pool) return;
  await pool.query(`
    create table if not exists prayer_times (
      region_slug text not null,
      region_name text not null,
      district_slug text not null,
      district_name text not null,
      date date not null,
      fajr time not null,
      maghrib time not null,
      primary key (region_slug, district_slug, date)
    )
  `);
  await pool.query(`create index if not exists idx_pt_date on prayer_times(date)`);
  await pool.query(`create index if not exists idx_pt_region_district on prayer_times(region_slug, district_slug)`);
}

export async function upsertPrayerTime(row) {
  if (!pool) return;
  const { region_slug, region_name, district_slug, district_name, date, fajr, maghrib } = row;
  await pool.query(
    `
      insert into prayer_times (region_slug, region_name, district_slug, district_name, date, fajr, maghrib)
      values ($1,$2,$3,$4,$5,$6,$7)
      on conflict (region_slug, district_slug, date) do update
        set fajr = excluded.fajr, maghrib = excluded.maghrib, region_name = excluded.region_name, district_name = excluded.district_name
    `,
    [region_slug, region_name, district_slug, district_name, date, fajr, maghrib]
  );
}

export async function getPrayerTimeByRegionDistrictDate({ region, district, date }) {
  if (!pool) throw new Error("DBRequired");
  const slugify = (s) =>
    String(s || "")
      .toLowerCase()
      .normalize("NFKD")
      .replace(/['‘’ʼʻ`´]/g, "")
      .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
      .replace(/^-+|-+$/g, "");
  const rs = slugify(region);
  const ds = slugify(district);
  const q = await pool.query(
    `
      select region_name, district_name, to_char(date, 'YYYY-MM-DD') as date, to_char(fajr, 'HH24:MI') as fajr, to_char(maghrib, 'HH24:MI') as maghrib
      from prayer_times
      where date = $1
        and (lower(district_slug) = $2 or lower(district_name) = $3)
        and (lower(region_slug) = $4 or lower(region_name) = $5)
      limit 1
    `,
    [date, ds, String(district || "").toLowerCase(), rs, String(region || "").toLowerCase()]
  );
  if (q.rows.length > 0) return q.rows[0];
  const q2 = await pool.query(
    `
      select region_name, district_name, to_char(date, 'YYYY-MM-DD') as date, to_char(fajr, 'HH24:MI') as fajr, to_char(maghrib, 'HH24:MI') as maghrib
      from prayer_times
      where date = $1
        and (lower(district_slug) = $2 or lower(district_name) = $3)
      limit 1
    `,
    [date, ds, String(district || "").toLowerCase()]
  );
  return q2.rows[0] || null;
}

export function dbEnabled() {
  return !!pool;
}

