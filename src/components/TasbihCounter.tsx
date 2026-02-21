import { useState } from "react";
import { RotateCcw } from "lucide-react";

const phrases = [
  { arabic: "سُبْحَانَ اللَّهِ", uzbek: "SubhanAlloh", target: 33 },
  { arabic: "الْحَمْدُ لِلَّهِ", uzbek: "Alhamdulillah", target: 33 },
  { arabic: "اللَّهُ أَكْبَرُ", uzbek: "Allohu Akbar", target: 34 },
];

const TasbihCounter = () => {
  const [count, setCount] = useState(0);
  const [phraseIndex, setPhraseIndex] = useState(0);

  const currentPhrase = phrases[phraseIndex];
  const progress = (count / currentPhrase.target) * 100;

  const handleTap = () => {
    if (count >= currentPhrase.target) {
      if (phraseIndex < phrases.length - 1) {
        setPhraseIndex(phraseIndex + 1);
        setCount(0);
      }
      return;
    }
    setCount(count + 1);
  };

  const handleReset = () => {
    setCount(0);
    setPhraseIndex(0);
  };

  return (
    <div className="card-glass gold-border p-5 md:p-6 text-center space-y-5">
      <h3 className="text-lg font-semibold font-serif text-foreground">Raqamli Tasbih</h3>

      {/* Phrase selector */}
      <div className="flex justify-center gap-2">
        {phrases.map((p, i) => (
          <button
            key={p.uzbek}
            onClick={() => { setPhraseIndex(i); setCount(0); }}
            className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
              i === phraseIndex
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-foreground/70 hover:bg-secondary/80"
            }`}
          >
            {p.uzbek}
          </button>
        ))}
      </div>

      {/* Arabic text */}
      <p className="text-2xl md:text-3xl font-serif text-primary gold-glow">{currentPhrase.arabic}</p>

      {/* Circular counter button */}
      <div className="relative inline-flex items-center justify-center">
        <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(162 25% 20%)" strokeWidth="6" />
          <circle
            cx="60" cy="60" r="52" fill="none"
            stroke="hsl(43 65% 52%)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 52}`}
            strokeDashoffset={`${2 * Math.PI * 52 * (1 - progress / 100)}`}
            className="transition-all duration-300"
          />
        </svg>
        <button
          onClick={handleTap}
          className="absolute w-28 h-28 rounded-full bg-secondary hover:bg-secondary/80 active:scale-95 transition-all flex flex-col items-center justify-center"
        >
          <span className="text-3xl font-bold gold-gradient-text font-serif">{count}</span>
          <span className="text-xs text-muted-foreground">/ {currentPhrase.target}</span>
        </button>
      </div>

      {/* Reset */}
      <button
        onClick={handleReset}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <RotateCcw className="w-4 h-4" />
        Qayta boshlash
      </button>
    </div>
  );
};

export default TasbihCounter;
