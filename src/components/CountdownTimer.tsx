import { useState, useEffect } from "react";

interface CountdownTimerProps {
  iftorlikTime: string; // "HH:MM" format
  saharlikTime: string;
}

const CountdownTimer = ({ iftorlikTime, saharlikTime }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [isUrgent, setIsUrgent] = useState(false);
  const [targetLabel, setTargetLabel] = useState("Iftorlikka");

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      const [iH, iM] = iftorlikTime.split(":").map(Number);
      const [sH, sM] = saharlikTime.split(":").map(Number);

      const iftorlik = new Date(now);
      iftorlik.setHours(iH, iM, 0, 0);

      const saharlik = new Date(now);
      saharlik.setHours(sH, sM, 0, 0);

      let target: Date;
      let label: string;

      if (now < saharlik) {
        target = saharlik;
        label = "Saharlikka";
      } else if (now < iftorlik) {
        target = iftorlik;
        label = "Iftorlikka";
      } else {
        // After iftorlik, show next day's saharlik
        const nextSaharlik = new Date(now);
        nextSaharlik.setDate(nextSaharlik.getDate() + 1);
        nextSaharlik.setHours(sH, sM, 0, 0);
        target = nextSaharlik;
        label = "Saharlikka";
      }

      setTargetLabel(label);

      const diff = target.getTime() - now.getTime();
      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const totalMinutes = Math.floor(diff / 60000);
      setIsUrgent(totalMinutes <= 15);

      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeLeft({ hours, minutes, seconds });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [iftorlikTime, saharlikTime]);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="text-center space-y-4">
      <h2 className="text-xl md:text-2xl font-semibold text-foreground/80">
        {targetLabel} qancha qoldi?
      </h2>
      <div className={`flex items-center justify-center gap-2 md:gap-4 ${isUrgent ? "animate-countdown-urgent" : ""}`}>
        {[
          { value: timeLeft.hours, label: "Soat" },
          { value: timeLeft.minutes, label: "Daqiqa" },
          { value: timeLeft.seconds, label: "Soniya" },
        ].map((item, idx) => (
          <div key={item.label} className="flex items-center gap-2 md:gap-4">
            <div className="flex flex-col items-center">
              <div className={`card-glass ${isUrgent ? "animate-pulse-gold" : ""} gold-border px-4 py-3 md:px-6 md:py-4 min-w-[70px] md:min-w-[90px]`}>
                <span className="text-3xl md:text-5xl lg:text-6xl font-bold gold-gradient-text font-serif">
                  {pad(item.value)}
                </span>
              </div>
              <span className="text-xs md:text-sm text-muted-foreground mt-2">{item.label}</span>
            </div>
            {idx < 2 && (
              <span className="text-2xl md:text-4xl text-primary font-bold gold-glow mb-6">:</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CountdownTimer;
