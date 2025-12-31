import { useState, useMemo } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { RiskGauge } from "@/components/health/RiskGauge";
import { RiskChart } from "@/components/health/RiskChart";
import { NearbyDoctors } from "@/components/health/NearbyDoctors";
import { HealthDisclaimer } from "@/components/health/HealthDisclaimer";
import { Recommendations } from "@/components/health/Recommendations";
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Info,
  Lightbulb,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

type Step =
  | "education"
  | "questionnaire"
  | "results"
  | "recommendations"
  | "doctors";

/* ---------------------------------------
   ML API
--------------------------------------- */
async function predictPCOS(payload: any) {
  const res = await fetch("http://localhost:8001/predict-pcos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("PCOS ML API error");
  return res.json();
}

/* ---------------------------------------
   QUESTIONS (FIXED)
--------------------------------------- */
const questions = [
  {
    id: 1,
    text: "How regular are your menstrual cycles?",
    factor: "Cycle Regularity",
    options: [
      { label: "Very regular (21–35 days)", score: 0 },
      { label: "Slightly irregular (varies by 1–2 weeks)", score: 1 },
      { label: "Very irregular (unpredictable)", score: 2 },
      { label: "Absent for 3+ months", score: 3 },
    ],
  },
  {
    id: 2,
    text: "Do you experience excess hair growth?",
    factor: "Hair Growth",
    options: [
      { label: "No excess hair", score: 0 },
      { label: "Mild (few hairs)", score: 1 },
      { label: "Moderate (needs removal)", score: 2 },
      { label: "Severe (significant growth)", score: 3 },
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
      { label: "Severe cystic acne", score: 3 },
    ],
  },
  {
    id: 4,
    text: "Have you experienced weight gain?",
    factor: "Weight",
    options: [
      { label: "No weight gain", score: 0 },
      { label: "Mild (1–5 kg)", score: 1 },
      { label: "Moderate (5–15 kg)", score: 2 },
      { label: "Significant (>15 kg)", score: 3 },
    ],
  },
  {
    id: 5,
    text: "Family history of PCOS or diabetes?",
    factor: "Family History",
    options: [
      { label: "No family history", score: 0 },
      { label: "Diabetes in family", score: 1 },
      { label: "PCOS in family", score: 2 },
      { label: "Both PCOS & diabetes", score: 3 },
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

export default function PCOSModule() {
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState<Step>("education");
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [mlResult, setMlResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  /* ---------------------------------------
     SCORE (UI ONLY)
  --------------------------------------- */
  const score = useMemo(() => {
    const total = Object.values(answers).reduce((a, b) => a + b, 0);
    return Math.round((total / (questions.length * 3)) * 100);
  }, [answers]);

  const riskLevel = score < 30 ? "low" : score < 60 ? "medium" : "high";

  const riskFactors = questions.map((q) => ({
    name: q.factor,
    value: answers[q.id] ?? 0,
    maxValue: 3,
  }));

  /* ---------------------------------------
     ANSWER HANDLER
  --------------------------------------- */
  const handleAnswer = async (scoreValue: number) => {
    const newAnswers = {
      ...answers,
      [questions[currentQuestion].id]: scoreValue,
    };
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((q) => q + 1);
      return;
    }

    setCurrentStep("results");
    setLoading(true);

    const payload = {
      age: 24,
      weight: 62,
      bmi: 25.3,
      cycle: newAnswers[1] >= 2 ? 0 : 1,
      cycle_length: 35,
      weight_gain: newAnswers[4] >= 2 ? 1 : 0,
      hair_growth: newAnswers[2] >= 2 ? 1 : 0,
      skin_darkening: newAnswers[6] >= 2 ? 1 : 0,
      hair_loss: newAnswers[7] >= 2 ? 1 : 0,
      pimples: newAnswers[3] >= 2 ? 1 : 0,
      fast_food: 1,
      regular_exercise: 0,
      follicle_left: 6,
      follicle_right: 7,
      endometrium: 8.5,
    };

    try {
      const prediction = await predictPCOS(payload);
      setMlResult(prediction);

      await supabase.from("health_assessments").insert({
        user_id: user?.id,
        assessment_type: "pcos",
        risk_score: prediction.risk_score,
        risk_category: prediction.risk_level.toLowerCase(),
        responses: newAnswers,
        recommendations: prediction,
      });

      toast({ title: "PCOS assessment completed" });
    } catch (err) {
      toast({ title: "PCOS prediction failed", variant: "destructive" });
    } finally {
      setLoading(false);
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

      <main className="pt-24 pb-16 container mx-auto px-4 max-w-4xl">
        {currentStep === "education" && (
          <div className="text-center py-16">
            <Activity className="w-16 h-16 mx-auto mb-4 text-accent" />
            <h1 className="text-3xl font-bold mb-4">PCOS Risk Assessment</h1>
            <p className="text-muted-foreground mb-8">
              Answer a few questions to assess your PCOS risk using AI.
            </p>
            <Button size="lg" onClick={() => setCurrentStep("questionnaire")}>
              <Sparkles className="w-4 h-4 mr-2" />
              Start Assessment
            </Button>
            <HealthDisclaimer />
          </div>
        )}

        {currentStep === "questionnaire" && (
          <>
            <h2 className="text-2xl font-bold mb-6">
              {questions[currentQuestion].text}
            </h2>
            {questions[currentQuestion].options.map((option, i) => (
              <Button
                key={i}
                className="w-full mb-3"
                onClick={() => handleAnswer(option.score)}
              >
                {option.label}
              </Button>
            ))}
          </>
        )}

        {currentStep === "results" && (
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
            <RiskChart factors={riskFactors} />
            <Button
              className="mt-6"
              onClick={() => setCurrentStep("recommendations")}
            >
              View Recommendations
            </Button>
          </>
        )}

        {currentStep === "recommendations" && (
          <>
            <Recommendations riskLevel={riskLevel} type="pcos" />
            <Button variant="outline" className="mt-6" onClick={restartAssessment}>
              Start Again
            </Button>
          </>
        )}

        {currentStep === "doctors" && (
          <>
            <NearbyDoctors specialty="gynecologist endocrinologist PCOS" />
            <Button variant="outline" className="mt-6" onClick={restartAssessment}>
              Start New Assessment
            </Button>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
