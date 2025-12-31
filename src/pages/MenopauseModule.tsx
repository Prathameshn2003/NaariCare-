import { useState, useMemo } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { RiskGauge } from "@/components/health/RiskGauge";
import { HealthDisclaimer } from "@/components/health/HealthDisclaimer";
import { Recommendations } from "@/components/health/Recommendations";
import { Thermometer, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

/* ---------------- TYPES ---------------- */
type Step = "education" | "questionnaire" | "results" | "recommendations";
type RiskLevel = "low" | "medium" | "high";

/* ---------------- ML API (ENV SAFE) ---------------- */
const MENOPAUSE_API = import.meta.env.VITE_MENOPAUSE_API_URL;

async function predictMenopauseML(payload: any) {
  const res = await fetch(`${MENOPAUSE_API}/predict-menopause`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err);
  }

  return res.json();
}

/* ---------------- QUESTIONS ---------------- */
const questions = [
  { id: 1, text: "What is your current age?", options: ["Under 40", "40–45", "46–50", "51+"] },
  { id: 2, text: "How regular are your periods?", options: ["Regular", "Slightly irregular", "Irregular", "Stopped"] },
  { id: 3, text: "Hot flashes or night sweats?", options: ["Never", "Occasional", "Frequent", "Daily"] },
  { id: 4, text: "Sleep quality?", options: ["Good", "Sometimes poor", "Often poor", "Severe insomnia"] },
  { id: 5, text: "Mood changes?", options: ["None", "Mild", "Moderate", "Severe"] },
  { id: 6, text: "Vaginal dryness?", options: ["None", "Occasional", "Frequent", "Constant"] },
  { id: 7, text: "Joint pain?", options: ["None", "Occasional", "Regular", "Severe"] },
];

/* ---------------- COMPONENT ---------------- */
export default function MenopauseModule() {
  const { user } = useAuth();

  const [step, setStep] = useState<Step>("education");
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [qIndex, setQIndex] = useState(0);
  const [mlResult, setMlResult] = useState<any>(null);

  /* ---------------- SCORE ---------------- */
  const score = useMemo(() => {
    const total = Object.values(answers).reduce((a, b) => a + b, 0);
    return Math.round((total / (questions.length * 3)) * 100);
  }, [answers]);

  const riskLevel: RiskLevel =
    score < 30 ? "low" : score < 60 ? "medium" : "high";

  /* ---------------- ANSWER HANDLER ---------------- */
  const handleAnswer = async (value: number) => {
    if (!user) {
      toast({ title: "Please login first", variant: "destructive" });
      return;
    }

    const nextAnswers = { ...answers, [questions[qIndex].id]: value };
    setAnswers(nextAnswers);

    if (qIndex < questions.length - 1) {
      setQIndex((i) => i + 1);
      return;
    }

    setStep("results");

    try {
      const result = await predictMenopauseML({
        age: 48,
        estrogen: 40,
        fsh: 20,
        years_since_last_period: nextAnswers[2] === 3 ? 1.2 : 0.2,
        irregular_periods: nextAnswers[2] >= 2 ? 1 : 0,
        missed_periods: nextAnswers[2] === 3 ? 1 : 0,
        hot_flashes: nextAnswers[3] >= 2 ? 1 : 0,
        night_sweats: nextAnswers[3] >= 2 ? 1 : 0,
        sleep_problems: nextAnswers[4] >= 2 ? 1 : 0,
        vaginal_dryness: nextAnswers[6] >= 2 ? 1 : 0,
        joint_pain: nextAnswers[7] >= 2 ? 1 : 0,
      });

      setMlResult(result);

      const { error } = await supabase.from("health_assessments").insert({
        user_id: user.id,
        assessment_type: "menopause",
        risk_score: result.confidence ?? score,
        risk_category: riskLevel,
        responses: nextAnswers,
      });

      if (error) {
        console.error("Supabase error:", error);
        toast({ title: "Failed to save result", variant: "destructive" });
        return;
      }

      toast({ title: "Assessment completed successfully" });
    } catch (err) {
      console.error(err);
      toast({ title: "Prediction failed", variant: "destructive" });
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-32 pb-16 max-w-3xl mx-auto px-4">
        {/* EDUCATION */}
        {step === "education" && (
          <div className="text-center py-16">
            <Thermometer className="w-14 h-14 mx-auto text-teal" />
            <h1 className="text-3xl font-bold mt-4">
              Menopause Health Assessment
            </h1>
            <p className="text-muted-foreground mt-2">
              Answer a few questions to understand your menopause risk.
            </p>
            <Button className="mt-6" onClick={() => setStep("questionnaire")}>
              <Heart className="mr-2 h-4 w-4" /> Start Assessment
            </Button>
            <HealthDisclaimer />
          </div>
        )}

        {/* QUESTIONNAIRE */}
        {step === "questionnaire" && (
          <>
            <h2 className="text-xl font-bold mb-6">
              {questions[qIndex].text}
            </h2>
            {questions[qIndex].options.map((opt, i) => (
              <Button
                key={i}
                className="w-full mb-3"
                onClick={() => handleAnswer(i)}
              >
                {opt}
              </Button>
            ))}
          </>
        )}

        {/* RESULTS */}
        {step === "results" && (
          <>
            <RiskGauge
              score={score}
              label="Menopause Risk"
              color={
                riskLevel === "low"
                  ? "text-teal"
                  : riskLevel === "medium"
                  ? "text-accent"
                  : "text-primary"
              }
            />

            {/* USER FRIENDLY MEANING */}
            <div className="mt-4 p-4 rounded-xl bg-muted/60 text-center">
              {riskLevel === "low" && (
                <p className="text-teal font-medium">
                  Low risk – mild or early symptoms
                </p>
              )}
              {riskLevel === "medium" && (
                <p className="text-accent font-medium">
                  Moderate risk – consider consulting a doctor
                </p>
              )}
              {riskLevel === "high" && (
                <p className="text-primary font-medium">
                  High risk – medical advice recommended
                </p>
              )}
            </div>

            <Button
              className="mt-6 w-full"
              onClick={() => setStep("recommendations")}
            >
              View Recommendations
            </Button>
          </>
        )}

        {/* RECOMMENDATIONS */}
        {step === "recommendations" && (
          <Recommendations riskLevel={riskLevel} type="menopause" />
        )}
      </main>

      <Footer />
    </div>
  );
}
