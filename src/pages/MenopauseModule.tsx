import { useState, useMemo } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { RiskGauge } from "@/components/health/RiskGauge";
import { RiskChart } from "@/components/health/RiskChart";
import { HealthDisclaimer } from "@/components/health/HealthDisclaimer";
import { Recommendations } from "@/components/health/Recommendations";
import {
  Thermometer,
  ArrowRight,
  Heart,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

/* ---------------------------------------
   TYPES
--------------------------------------- */
type Step = "education" | "questionnaire" | "results" | "recommendations";

/* ---------------------------------------
   ML API
--------------------------------------- */
async function predictMenopauseML(payload: any) {
  const res = await fetch("http://localhost:8000/predict-menopause", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("ML API error");
  return res.json();
}

/* ---------------------------------------
   QUESTIONS
--------------------------------------- */
const questions = [
  { id: 1, text: "What is your current age?", options: ["Under 40", "40-45", "46-50", "51 or older"] },
  { id: 2, text: "How regular are your menstrual periods?", options: ["Very regular", "Slightly irregular", "Very irregular", "Periods stopped"] },
  { id: 3, text: "Hot flashes or night sweats?", options: ["Never", "Occasional", "Frequent", "Daily"] },
  { id: 4, text: "Sleep quality?", options: ["Good", "Occasional issues", "Frequent problems", "Severe insomnia"] },
  { id: 5, text: "Mood changes?", options: ["None", "Mild", "Noticeable", "Severe"] },
  { id: 6, text: "Vaginal dryness?", options: ["None", "Occasional", "Frequent", "Constant"] },
  { id: 7, text: "Joint pain?", options: ["None", "Occasional", "Regular", "Severe"] },
  { id: 8, text: "Energy levels?", options: ["Good", "Slightly low", "Fatigued", "Exhausted"] },
];

/* ---------------------------------------
   COMPONENT
--------------------------------------- */
export default function MenopauseModule() {
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState<Step>("education");
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [mlResult, setMlResult] = useState<any>(null);

  /* ---------------------------------------
     SCORE
  --------------------------------------- */
  const score = useMemo(() => {
    const total = Object.values(answers).reduce((a, b) => a + b, 0);
    return Math.round((total / (questions.length * 3)) * 100);
  }, [answers]);

  const riskLevel =
    score < 30 ? "low" : score < 60 ? "medium" : "high";

  /* ---------------------------------------
     ANSWER HANDLER
  --------------------------------------- */
  const handleAnswer = async (value: number) => {
    const newAnswers = { ...answers, [questions[currentQuestion].id]: value };
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((q) => q + 1);
      return;
    }

    setCurrentStep("results");

    const payload = {
      age: 48,
      estrogen: 40,
      fsh: 20,
      years_since_last_period: newAnswers[2] === 3 ? 1.2 : 0.2,
      irregular_periods: newAnswers[2] >= 2 ? 1 : 0,
      missed_periods: newAnswers[2] === 3 ? 1 : 0,
      hot_flashes: newAnswers[3] >= 2 ? 1 : 0,
      night_sweats: newAnswers[3] >= 2 ? 1 : 0,
      sleep_problems: newAnswers[4] >= 2 ? 1 : 0,
      vaginal_dryness: newAnswers[6] >= 2 ? 1 : 0,
      joint_pain: newAnswers[7] >= 2 ? 1 : 0,
    };

    try {
      const prediction = await predictMenopauseML(payload);
      setMlResult(prediction);

      await supabase.from("health_assessments").insert({
        user_id: user?.id,
        assessment_type: "menopause",
        risk_score: prediction.confidence,
        risk_category: riskLevel,
        responses: newAnswers,
        recommendations: prediction,
      });

      toast({ title: "Assessment completed successfully" });
    } catch {
      toast({ title: "Prediction failed", variant: "destructive" });
    }
  };

  /* ---------------------------------------
     RESTART
  --------------------------------------- */
  const restartAssessment = () => {
    setAnswers({});
    setCurrentQuestion(0);
    setMlResult(null);
    setCurrentStep("education");
  };

  /* ---------------------------------------
     UI
  --------------------------------------- */
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-32 pb-16 container mx-auto px-4 max-w-3xl">

        {/* EDUCATION */}
        {currentStep === "education" && (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-teal/20 flex items-center justify-center">
              <Thermometer className="w-10 h-10 text-teal" />
            </div>

            <h1 className="text-3xl font-bold mb-4">
              Menopause Health Assessment
            </h1>

            <p className="text-muted-foreground mb-8">
              Answer a few questions to understand your menopause stage using AI-based prediction.
            </p>

            <Button size="lg" onClick={() => setCurrentStep("questionnaire")}>
              <Heart className="w-5 h-5 mr-2" />
              Start Assessment
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            <div className="mt-10">
              <HealthDisclaimer />
            </div>
          </div>
        )}

        {/* QUESTIONNAIRE */}
        {currentStep === "questionnaire" && (
          <>
            <h2 className="text-2xl font-bold mb-6">
              {questions[currentQuestion].text}
            </h2>

            {questions[currentQuestion].options.map((opt, i) => (
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
        {currentStep === "results" && (
          <>
            <RiskGauge
              score={score}
              label="Symptom Score"
              color={
                riskLevel === "low"
                  ? "text-teal"
                  : riskLevel === "medium"
                  ? "text-accent"
                  : "text-primary"
              }
            />

            {mlResult && (
              <div className="mt-6 p-4 rounded-xl bg-muted text-center">
                <p className="font-bold">{mlResult.stage}</p>
                <p className="text-sm text-muted-foreground">
                  Confidence: {mlResult.confidence}%
                </p>
              </div>
            )}

            <RiskChart
              factors={questions.map((q) => ({
                name: q.text,
                value: answers[q.id] ?? 0,
                maxValue: 3,
              }))}
            />

            <Button className="mt-6" onClick={() => setCurrentStep("recommendations")}>
              View Recommendations
            </Button>
          </>
        )}

        {/* RECOMMENDATIONS */}
        {currentStep === "recommendations" && (
          <>
            <Recommendations riskLevel={riskLevel} type="menopause" />
            <Button variant="outline" className="mt-6" onClick={restartAssessment}>
              Start Again
            </Button>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
