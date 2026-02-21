import { useState } from "react";
import { Calculator } from "lucide-react";

// Nisab thresholds (approximate, should be updated with real-time prices)
const GOLD_NISAB_GRAMS = 85; // 85 grams of gold
const SILVER_NISAB_GRAMS = 595; // 595 grams of silver
const ZAKAT_RATE = 0.025; // 2.5%

const ZakatCalculator = () => {
  const [cash, setCash] = useState("");
  const [gold, setGold] = useState("");
  const [silver, setSilver] = useState("");
  const [savings, setSavings] = useState("");
  const [investments, setInvestments] = useState("");
  const [debts, setDebts] = useState("");
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const totalAssets =
      (parseFloat(cash) || 0) +
      (parseFloat(gold) || 0) +
      (parseFloat(silver) || 0) +
      (parseFloat(savings) || 0) +
      (parseFloat(investments) || 0);

    const totalDebts = parseFloat(debts) || 0;
    const netWealth = totalAssets - totalDebts;

    if (netWealth > 0) {
      setResult(netWealth * ZAKAT_RATE);
    } else {
      setResult(0);
    }
  };

  const reset = () => {
    setCash("");
    setGold("");
    setSilver("");
    setSavings("");
    setInvestments("");
    setDebts("");
    setResult(null);
  };

  const formatMoney = (n: number) =>
    new Intl.NumberFormat("uz-UZ", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);

  const fields = [
    { label: "Naqd pul", value: cash, setter: setCash, placeholder: "so'm" },
    { label: "Oltin qiymati", value: gold, setter: setGold, placeholder: "so'm" },
    { label: "Kumush qiymati", value: silver, setter: setSilver, placeholder: "so'm" },
    { label: "Jamg'arma", value: savings, setter: setSavings, placeholder: "so'm" },
    { label: "Investitsiyalar", value: investments, setter: setInvestments, placeholder: "so'm" },
    { label: "Qarzlar (ayiriladi)", value: debts, setter: setDebts, placeholder: "so'm" },
  ];

  return (
    <div className="card-glass gold-border p-5 md:p-6 space-y-5">
      <div className="flex items-center gap-2">
        <Calculator className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold font-serif text-foreground">Zakat Hisoblagich</h3>
      </div>

      <p className="text-sm text-muted-foreground">
        Mol-mulkingiz qiymatini kiriting. Zakat — yillik daromadning 2.5% ni tashkil etadi.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {fields.map((field) => (
          <div key={field.label} className="space-y-1">
            <label className="text-xs text-muted-foreground">{field.label}</label>
            <input
              type="number"
              value={field.value}
              onChange={(e) => field.setter(e.target.value)}
              placeholder={field.placeholder}
              className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm focus:ring-2 focus:ring-primary focus:outline-none placeholder:text-muted-foreground/50"
            />
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={calculate}
          className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Hisoblash
        </button>
        <button
          onClick={reset}
          className="px-4 py-2.5 rounded-lg bg-secondary text-foreground text-sm hover:bg-secondary/80 transition-colors"
        >
          Tozalash
        </button>
      </div>

      {result !== null && (
        <div className="card-glass gold-border p-4 text-center space-y-2 animate-scale-in">
          <p className="text-sm text-muted-foreground">Sizning zakat miqdoringiz:</p>
          <p className="text-3xl font-bold gold-gradient-text font-serif">
            {formatMoney(result)} so'm
          </p>
          {result === 0 && (
            <p className="text-xs text-muted-foreground">Mol-mulkingiz nisab chegarasidan past yoki qarzlaringiz ko'p.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ZakatCalculator;
