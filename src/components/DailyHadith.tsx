import { Sparkles } from "lucide-react";
import { dailyHadiths } from "@/data/prayerTimes";

interface DailyHadithProps {
  day: number;
}

const DailyHadith = ({ day }: DailyHadithProps) => {
  const hadith = dailyHadiths[(day - 1) % dailyHadiths.length];

  return (
    <div className="card-glass gold-border p-5 md:p-6 space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold font-serif text-foreground">Kunlik Hadis</h3>
      </div>
      <blockquote className="text-foreground/90 italic leading-relaxed border-l-2 border-primary pl-4">
        {hadith}
      </blockquote>
    </div>
  );
};

export default DailyHadith;
