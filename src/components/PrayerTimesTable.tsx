import type { PrayerTime } from "@/data/prayerTimes";

interface PrayerTimesTableProps {
  times: PrayerTime[];
  currentDay: number;
}

const PrayerTimesTable = ({ times, currentDay }: PrayerTimesTableProps) => {
  return (
    <div className="space-y-6">
      {/* Full schedule */}
      <div className="card-glass gold-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="text-lg font-semibold font-serif text-foreground">Ramazon Taqvimi</h3>
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-secondary">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Kun</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">Saharlik</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">Iftorlik</th>
              </tr>
            </thead>
            <tbody>
              {times.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-sm text-muted-foreground">
                    Jadval yuklanmoqda…
                  </td>
                </tr>
              ) : (
                times.map((time) => (
                  <tr
                    key={time.day}
                    className={`border-t border-border/50 transition-colors ${
                      time.day === currentDay
                        ? "bg-primary/10 border-l-2 border-l-primary"
                        : "hover:bg-secondary/50"
                    }`}
                  >
                    <td className="px-4 py-3 text-sm font-medium">
                      {time.day}-kun
                      {time.day === currentDay && (
                        <span className="ml-2 text-xs text-primary font-semibold">Bugun</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-sm">{time.saharlik}</td>
                    <td className="px-4 py-3 text-center text-sm">{time.iftorlik}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PrayerTimesTable;
