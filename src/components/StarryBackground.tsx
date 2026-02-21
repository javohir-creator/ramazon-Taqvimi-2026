import { useMemo } from "react";
import mosqueBg from "@/assets/mosque-bg.jpg";

const StarryBackground = () => {
  const stars = useMemo(() => {
    return Array.from({ length: 60 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 60}%`,
      size: Math.random() * 3 + 1,
      duration: `${Math.random() * 3 + 2}s`,
      delay: `${Math.random() * 4}s`,
    }));
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Background image with parallax-like effect */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
        style={{ backgroundImage: `url(${mosqueBg})` }}
      />
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-background/60" />
      {/* Twinkling stars */}
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-primary/80 animate-twinkle"
          style={{
            left: star.left,
            top: star.top,
            width: `${star.size}px`,
            height: `${star.size}px`,
            "--twinkle-duration": star.duration,
            "--twinkle-delay": star.delay,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
};

export default StarryBackground;
