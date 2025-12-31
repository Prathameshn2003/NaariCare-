import { useState, useMemo } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { RiskGauge } from "@/components/health/RiskGauge";
import { RiskChart } from "@/components/health/RiskChart";
import { NearbyDoctors } from "@/components/health/NearbyDoctors";
import { HealthDisclaimer } from "@/components/health/HealthDisclaimer";
import { Recommendations } from "@/components/health/Recommendations";
import { Activity, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

/* ---------------- TYPES ---------------- */
type Step =
  | "education"
  | "questionnaire"
  | "results"
  | "recommendations"
  | "doctors";

type RiskLevel = "low" | "medium" | "high";

/* ---------------- ML API (ENV SAFE) ---------------- */
const PCOS_API = import.meta.env.VITE_PCOS_API_URL;

async function predictPCOS(payload: any) {
  const res = await fetch(`${PCOS_API}/predict-pcos`, {
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
  {
    id: 1,
    text: "How regular are your menstrual cycles?",
    factor: "Cycle Regularity",
    options: [
      { label: "Very regular (21–35 days)", score: 0 },
      { label: "Slightly irregular", score: 1 },
      { label: "Very irregular", score: 2 },
      { label: "Absent for 3+ months", score: 3 },
    ],
  },
  {
    id: 2,
    text: "Do you experience excess hair growth?",
    factor: "Hair Growth",
    options: [
      { label: "No excess hair", score: 0 },
      { label: "Mild", score: 1 },
      { label: "Moderate", score: 2 },
      { label: "Severe", score: 3 },
    ],
  },
  {
    id: 3,
    text: "How severe is your acne?",
    factor: "Acne",
    options: [
      { label: "Clear skin", score: 0 },
      { label: "Occasional acne", score: 1 },
      { label: "Persistent acne", score: 2 },
      { label: "Severe acne", score: 3 },
    ],
  },
  {
    id: 4,
    text: "Have you experienced weight gain?",
    factor: "Weight Gain",
    options: [
      { label: "No weight gain", score: 0 },
      { label: "Mild", score: 1 },
      { label: "Moderate", score: 2 },
      { label: "Significant", score: 3 },
    ],
  },
  {
    id: 5,
    text: "Family history of PCOS or diabetes?",
    factor: "Family History",
    options: [
      { label: "No history", score: 0 },
      { label: "Diabetes", score: 1 },
      { label: "PCOS", score: 2 },
      { label: "Both", score: 3 },
    ],
  },
  {
    id: 6,
    text: "Signs of insulin resistance?",
    factor: "Insulin Resistance",
    options: [
      { label: "No signs", score: 0 },
      { label: "Occasional fatigue", score: 1 },
      { label: "Dark skin patches", score: 2 },
      { label: "Multiple symptoms", score: 3 },
    ],
  },
  {
    id: 7,
    text: "Hair thinning on scalp?",
    factor: "Hair Loss",
    options: [
      { label: "Normal hair", score: 0 },
      { label: "Slight thinning", score: 1 },
      { label: "Noticeable thinning", score: 2 },
      { label: "Severe hair loss", score: 3 },
    ],
  },
];

/* ---------------- COMPONENT ---------------- */
export default function PCOSModule() {
  const { user } = useAuth();

  const [step, setStep] = useState<Step>("education");
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [qIndex, setQIndex] = useState(0);
  const [mlResult, setMlResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  /* ---------------- UI SCORE ---------------- */
  const score = useMemo(() => {
    const total = Object.values(answers).reduce((a, b) => a + b, 0);
    return Math.round((total / (questions.length * 3)) * 100);
  }, [answers]);

  const riskLevel: RiskLevel =
    score < 30 ? "low" : score < 60 ? "medium" : "high";

  const riskFactors = questions.map((q) => ({
    name: q.factor,
    value: answers[q.id] ?? 0,
    maxValue: 3,
  }));

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
    setLoading(true);

    try {
      const result = await predictPCOS({
        age: 24,
        weight: 62,
        bmi: 25.3,
        cycle: nextAnswers[1] >= 2 ? 0 : 1,
        cycle_length: 35,
        weight_gain: nextAnswers[4] >= 2 ? 1 : 0,
        hair_growth: nextAnswers[2] >= 2 ? 1 : 0,
        skin_darkening: nextAnswers[6] >= 2 ? 1 : 0,
        hair_loss: nextAnswers[7] >= 2 ? 1 : 0,
        pimples: nextAnswers[3] >= 2 ? 1 : 0,
        fast_food: 1,
        regular_exercise: 0,
        follicle_left: 6,
        follicle_right: 7,
        endometrium: 8.5,
      });

      setMlResult(result);

      const { error } = await supabase.from("health_assessments").insert({
        user_id: user.id,
        assessment_type: "pcos",
        risk_score: result.risk_score ?? score,
        risk_category: result.risk_level?.toLowerCase() ?? riskLevel,
        responses: nextAnswers,
      });

      if (error) {
        console.error(error);
        toast({ title: "Failed to save result", variant: "destructive" });
        return;
      }

      toast({ title: "PCOS assessment completed" });
    } catch (err) {
      console.error(err);
      toast({ title: "PCOS prediction failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- RESET ---------------- */
  const restart = () => {
    setAnswers({});
    setQIndex(0);
    setMlResult(null);
    setStep("education");
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16 max-w-4xl mx-auto px-4">
        {/* EDUCATION */}
        {step === "education" && (
          <div className="text-center py-16">
            <Activity className="w-16 h-16 mx-auto mb-4 text-accent" />
            <h1 className="text-3xl font-bold mb-4">PCOS Risk Assessment</h1>
            <p className="text-muted-foreground mb-8">
              Answer a few questions to assess your PCOS risk.
            </p>
            <Button size="lg" onClick={() => setStep("questionnaire")}>
              <Sparkles className="mr-2 h-4 w-4" />
              Start Assessment
            </Button>
            <HealthDisclaimer />
          </div>
        )}

        {/* QUESTIONNAIRE */}
        {step === "questionnaire" && (
          <>
            <h2 className="text-2xl font-bold mb-6">
              {questions[qIndex].text}
            </h2>
            {questions[qIndex].options.map((opt, i) => (
              <Button
                key={i}
                className="w-full mb-3"
                onClick={() => handleAnswer(opt.score)}
              >
                {opt.label}
              </Button>
            ))}
          </>
        )}

        {/* RESULTS */}
        {step === "results" && (
          <>
            <RiskGauge
              score={mlResult?.risk_score ?? score}
              label="PCOS Risk"
              color={
                mlResult?.risk_level === "Low"
                  ? "text-teal"
                  : mlResult?.risk_level === "Medium"
                  ? "text-accent"
                  : "text-destructive"
              }
            />

            <div className="mt-4 p-4 rounded-xl bg-muted/60 text-center">
              {mlResult?.risk_level === "Low" && (
                <p className="text-teal">
                  Low risk – lifestyle care suggested
                </p>
              )}
              {mlResult?.risk_level === "Medium" && (
                <p className="text-accent">
                  Medium risk – doctor consultation advised
                </p>
              )}
              {mlResult?.risk_level === "High" && (
                <p className="text-destructive">
                  High risk – strong PCOS indicators
                </p>
              )}
            </div>

            <RiskChart factors={riskFactors} />

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
          <>
            <Recommendations riskLevel={riskLevel} type="pcos" />
            <Button variant="outline" className="mt-6" onClick={restart}>
              Start Again
            </Button>
          </>
        )}

        {/* DOCTORS */}
        {step === "doctors" && (
          <>
            <NearbyDoctors specialty="gynecologist endocrinologist PCOS" />
            <Button variant="outline" className="mt-6" onClick={restart}>
              New Assessment
            </Button>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
