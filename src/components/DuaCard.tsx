import { BookOpen } from "lucide-react";

interface DuaCardProps {
  title: string;
  arabic: string;
  uzbek: string;
  meaning: string;
}

const DuaCard = ({ title, arabic, uzbek, meaning }: DuaCardProps) => {
  return (
    <div className="card-glass gold-border p-5 md:p-6 space-y-4">
      <div className="flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold font-serif text-foreground">{title}</h3>
      </div>
      <p className="text-xl md:text-2xl text-right leading-relaxed font-serif text-primary" dir="rtl">
        {arabic}
      </p>
      <p className="text-sm text-foreground/80 italic">{uzbek}</p>
      <div className="border-t border-border/50 pt-3">
        <p className="text-sm text-muted-foreground">
          <span className="text-primary font-medium">Ma'nosi: </span>
          {meaning}
        </p>
      </div>
    </div>
  );
};

export default DuaCard;
