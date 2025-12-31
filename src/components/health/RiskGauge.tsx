import { useEffect, useState } from "react";

interface RiskGaugeProps {
  score: number;      // 0 – 100
  label: string;      // e.g. "PCOS Risk", "Menopause Risk"
  color: string;      // Tailwind class: text-teal | text-accent | text-destructive
}

export const RiskGauge = ({ score, label, color }: RiskGaugeProps) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  /* ---------------- SAFETY ---------------- */
  // Clamp score between 0 and 100
  const safeScore = Math.min(100, Math.max(0, score));

  /* ---------------- ANIMATION ---------------- */
  useEffect(() => {
    setAnimatedScore(0); // reset animation on score change

    const timer = setTimeout(() => {
      setAnimatedScore(safeScore);
    }, 100);

    return () => clearTimeout(timer);
  }, [safeScore]);

  /* ---------------- SVG MATH ---------------- */
  const radius = 88;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (animatedScore / 100) * circumference;

  /* ---------------- UI ---------------- */
  return (
    <div className="relative w-48 h-48 mx-auto">
      <svg className="w-full h-full -rotate-90">
        {/* Background ring */}
        <circle
          cx="96"
          cy="96"
          r={radius}
          stroke="currentColor"
          strokeWidth="12"
          fill="none"
          className="text-muted"
        />

        {/* Progress ring */}
        <circle
          cx="96"
          cy="96"
          r={radius}
          stroke="currentColor"
          strokeWidth="12"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={color}
          style={{
            transition: "stroke-dashoffset 1s ease-out",
          }}
        />
      </svg>

      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-5xl font-bold ${color}`}>
          {animatedScore}%
        </span>
        <span className="text-muted-foreground text-sm">
          {label}
        </span>
      </div>
    </div>
  );
};
