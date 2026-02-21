import { useEffect, useState } from "react";
import StarryBackground from "@/components/StarryBackground";
import CountdownTimer from "@/components/CountdownTimer";
import RegionSelector from "@/components/RegionSelector";
import DuaCard from "@/components/DuaCard";
import TasbihCounter from "@/components/TasbihCounter";
import DailyHadith from "@/components/DailyHadith";
import QiblaCompass from "@/components/QiblaCompass";
import ZakatCalculator from "@/components/ZakatCalculator";
import NotificationSettings from "@/components/NotificationSettings";
import PrayerTimesTable from "@/components/PrayerTimesTable";
import { Moon, Sun } from "lucide-react";
import { generatePrayerTimes, duas } from "@/data/prayerTimes";
import { useDynamicFavicon } from "@/hooks/useDynamicFavicon";

const Index = () => {
  const [areaList, setAreaList] = useState<{ name: string; districts: string[] }[]>([]);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");

  const [fajr, setFajr] = useState("05:00");
  const [maghrib, setMaghrib] = useState("18:00");
  const [schedule, setSchedule] = useState<{ day: number; saharlik: string; iftorlik: string }[]>([]);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/areas", { signal: controller.signal })
      .then(async (r) => {
        if (!r.ok) throw new Error("failed");
        return r.json();
      })
      .then((data) => {
        const arr = Array.isArray(data?.regions) ? data.regions : [];
        setAreaList(arr);
        if (arr.length > 0) {
          const r0 = arr[0];
          if (!selectedRegion) {
            setSelectedRegion(r0.name);
            setSelectedDistrict(r0.districts[0] || "");
          }
        }
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!selectedRegion && !selectedDistrict) return;
    const controller = new AbortController();
    const qs = new URLSearchParams({ region: selectedRegion, district: selectedDistrict });
    fetch(`https://ramazon-taqvimi-2026.onrender.com/api/namozvaqti?${qs.toString()}`, {
  signal: controller.signal
      })
      .then(async (r) => {
        if (!r.ok) throw new Error("failed");
        return r.json();
      })
      .then((data) => {
        if (data?.fajr && data?.maghrib) {
          setFajr(data.fajr);
          setMaghrib(data.maghrib);
        }
      })
      .catch((e) => {
        if (e.name !== 'AbortError') console.error("namozvaqti fetch error", e);
      });
    return () => controller.abort();
  }, [selectedRegion, selectedDistrict]);

  useEffect(() => {
    if (!selectedRegion && !selectedDistrict) return;
    const controller = new AbortController();
    const qs = new URLSearchParams({ region: selectedRegion, district: selectedDistrict });
    fetch(`https://ramazon-taqvimi-2026.onrender.com/api/ramazon-2026?${qs.toString()}`, {
  signal: controller.signal
      })
      .then(async (r) => {
        if (!r.ok) throw new Error("failed");
        return r.json();
      })
      .then((data) => {
        const days = Array.isArray(data?.days) ? data.days : [];
        const mapped = days.map((d: { day: number | string; saharlik: string; iftorlik: string }) => ({
          day: Number(d.day),
          saharlik: String(d.saharlik),
          iftorlik: String(d.iftorlik),
        }));
        if (mapped.length > 0) {
          setSchedule(mapped);
        }
      })
      .catch((e) => {
        if (e.name !== 'AbortError') console.error("ramazon-2026 fetch error", e);
      });
    return () => controller.abort();
  }, [selectedRegion, selectedDistrict]);
  const prayerTimes = schedule;
  // Calculate Ramadan day based on actual Ramadan 2026 start date (Feb 19, 2026)
  const ramadanStart = new Date(2026, 1, 19); // February 19, 2026
  const today = new Date();
  const diffTime = today.getTime() - ramadanStart.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  const currentDay = Math.min(Math.max(1, diffDays), 30);
  const todayTime = { saharlik: fajr, iftorlik: maghrib };

  useDynamicFavicon();

  return (
    <div className="relative min-h-screen">
      <StarryBackground />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8 md:py-12 space-y-8">
        {/* Header */}
        <header className="text-center space-y-3">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif gold-gradient-text animate-float">
            ☪ Ramazon Taqvimi
          </h1>
          <p className="text-foreground/70 text-sm md:text-base">
            {selectedRegion} — {selectedDistrict} • {currentDay}-kun
          </p>
        </header>

        {/* Region Selector */}
        <RegionSelector
          selectedRegion={selectedRegion}
          selectedDistrict={selectedDistrict}
          onRegionChange={setSelectedRegion}
          onDistrictChange={setSelectedDistrict}
          regions={areaList}
        />

        {/* Countdown Timer */}
        <CountdownTimer
          iftorlikTime={todayTime.iftorlik}
          saharlikTime={todayTime.saharlik}
        />

        <div className="grid grid-cols-2 gap-4">
          <div className="card-glass gold-border p-5 md:p-6 text-center space-y-3">
            <div className="flex items-center justify-center gap-2">
              <Moon className="w-5 h-5 text-primary" />
              <span className="text-sm md:text-base text-muted-foreground">Saharlik</span>
            </div>
            <p className="text-3xl md:text-4xl font-bold gold-gradient-text font-serif">{todayTime.saharlik}</p>
            <p className="text-xs text-muted-foreground">Og'iz yopish vaqti</p>
          </div>
          <div className="card-glass gold-border p-5 md:p-6 text-center space-y-3">
            <div className="flex items-center justify-center gap-2">
              <Sun className="w-5 h-5 text-primary" />
              <span className="text-sm md:text-base text-muted-foreground">Iftorlik</span>
            </div>
            <p className="text-3xl md:text-4xl font-bold gold-gradient-text font-serif">{todayTime.iftorlik}</p>
            <p className="text-xs text-muted-foreground">Og'iz ochish vaqti</p>
          </div>
        </div>
        <PrayerTimesTable times={prayerTimes} currentDay={currentDay} />

        {/* Duas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DuaCard
            title="Saharlik Duosi"
            arabic={duas.saharlik.arabic}
            uzbek={duas.saharlik.uzbek}
            meaning={duas.saharlik.meaning}
          />
          <DuaCard
            title="Iftorlik Duosi"
            arabic={duas.iftorlik.arabic}
            uzbek={duas.iftorlik.uzbek}
            meaning={duas.iftorlik.meaning}
          />
        </div>

        {/* Notification Settings */}
        <NotificationSettings
          iftorlikTime={todayTime.iftorlik}
          saharlikTime={todayTime.saharlik}
        />

        {/* Daily Hadith */}
        <DailyHadith day={currentDay} />

        {/* Qibla Compass & Tasbih side by side on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <QiblaCompass region={selectedRegion} />
          <TasbihCounter />
        </div>

        {/* Zakat Calculator */}
        <ZakatCalculator />

        {/* Footer */}
        <footer className="text-center text-xs text-muted-foreground pb-4 space-y-1">
          <p>Ramazon Muborak! 🌙</p>
          <p>Barcha vaqtlar namoz-vaqti.uz saytidan olingan.</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
