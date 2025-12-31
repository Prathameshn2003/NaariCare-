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
  Droplets, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  Info,
  Lightbulb,
  Sparkles,
  Calendar
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

type Step = "education" | "questionnaire" | "results" | "recommendations" | "doctors";

const educationContent = {
  title: "Understanding Menstrual Health",
  description: "Your menstrual cycle is a vital sign of overall health. Understanding and tracking it can help identify potential issues early.",
  sections: [
    {
      title: "What is a Normal Cycle?",
      content: "A typical menstrual cycle lasts 21-35 days, with menstruation lasting 2-7 days. Cycles can vary from person to person, and slight variations are usually normal.",
    },
    {
      title: "Common Menstrual Disorders",
      items: ["Dysmenorrhea (painful periods)", "Menorrhagia (heavy bleeding)", "Amenorrhea (absent periods)", "Oligomenorrhea (infrequent periods)", "Premenstrual Syndrome (PMS)", "Premenstrual Dysphoric Disorder (PMDD)"],
    },
    {
      title: "Warning Signs",
      items: ["Extremely painful cramps that interfere with daily life", "Periods lasting more than 7 days", "Bleeding between periods", "Very heavy flow (soaking through protection hourly)", "Missed periods (when not pregnant)", "Severe mood changes"],
    },
    {
      title: "Why Tracking Matters",
      content: "Regular tracking helps identify patterns, predict your cycle, detect irregularities early, and provide valuable information to healthcare providers if issues arise.",
    },
  ],
};

const questions = [
  { 
    id: 1, 
    text: "How would you describe your cycle regularity?", 
    factor: "Cycle Regularity",
    options: [
      { text: "Very regular (predictable within 1-2 days)", score: 0 },
      { text: "Mostly regular (varies by a few days)", score: 1 },
      { text: "Irregular (varies by a week or more)", score: 2 },
      { text: "Very unpredictable or absent", score: 3 }
    ]
  },
  { 
    id: 2, 
    text: "How severe is your menstrual pain?", 
    factor: "Pain Level",
    options: [
      { text: "Minimal or no pain", score: 0 },
      { text: "Mild (manageable without medication)", score: 1 },
      { text: "Moderate (requires pain relief)", score: 2 },
      { text: "Severe (interferes with daily activities)", score: 3 }
    ]
  },
  { 
    id: 3, 
    text: "How would you describe your menstrual flow?", 
    factor: "Flow Intensity",
    options: [
      { text: "Light to moderate", score: 0 },
      { text: "Moderate with occasional heavy days", score: 1 },
      { text: "Heavy (changing protection every 2-3 hours)", score: 2 },
      { text: "Very heavy with clots", score: 3 }
    ]
  },
  { 
    id: 4, 
    text: "How long does your period typically last?", 
    factor: "Period Duration",
    options: [
      { text: "3-5 days", score: 0 },
      { text: "5-7 days", score: 1 },
      { text: "7-10 days", score: 2 },
      { text: "More than 10 days", score: 3 }
    ]
  },
  { 
    id: 5, 
    text: "Do you experience PMS symptoms?", 
    factor: "PMS Symptoms",
    options: [
      { text: "Minimal or none", score: 0 },
      { text: "Mild (slightly noticeable)", score: 1 },
      { text: "Moderate (affects mood/comfort)", score: 2 },
      { text: "Severe (significantly impacts life)", score: 3 }
    ]
  },
  { 
    id: 6, 
    text: "How is your energy level during your period?", 
    factor: "Energy & Fatigue",
    options: [
      { text: "Normal energy levels", score: 0 },
      { text: "Slightly tired", score: 1 },
      { text: "Noticeably fatigued", score: 2 },
      { text: "Extremely exhausted", score: 3 }
    ]
  },
];

const MenstrualModule = () => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>("education");
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [saving, setSaving] = useState(false);

  const score = useMemo(() => {
    const total = Object.values(answers).reduce((a, b) => a + b, 0);
    const maxScore = questions.length * 3;
    return Math.round((total / maxScore) * 100);
  }, [answers]);

  const riskCategory = useMemo(() => {
    if (score < 30) return { label: "Healthy Cycle", color: "text-teal", level: "low" as const };
    if (score < 60) return { label: "Moderate Concerns", color: "text-accent", level: "medium" as const };
    return { label: "Needs Attention", color: "text-destructive", level: "high" as const };
  }, [score]);

  const riskFactors = useMemo(() => {
    return questions.map((q) => ({
      name: q.factor,
      value: answers[q.id] ?? 0,
      maxValue: 3,
    }));
  }, [answers]);

  const handleAnswer = (value: number) => {
    const newAnswers = { ...answers, [questions[currentQuestion].id]: value };
    setAnswers(newAnswers);
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setCurrentStep("results");
      saveAssessment(newAnswers);
    }
  };

  const saveAssessment = async (finalAnswers: Record<number, number>) => {
    if (!user) return;
    
    setSaving(true);
    try {
      const total = Object.values(finalAnswers).reduce((a, b) => a + b, 0);
      const maxScore = questions.length * 3;
      const finalScore = Math.round((total / maxScore) * 100);
      
      const { error } = await supabase.from("health_assessments").insert({
        user_id: user.id,
        assessment_type: "menstrual",
        risk_score: finalScore,
        risk_category: finalScore < 30 ? "low" : finalScore < 60 ? "medium" : "high",
        responses: finalAnswers,
      });

      if (error) throw error;
      toast({ title: "Assessment saved", description: "Your results have been saved to your profile." });
    } catch (error) {
      console.error("Failed to save assessment:", error);
    } finally {
      setSaving(false);
    }
  };

  const restartAssessment = () => {
    setCurrentStep("education");
    setAnswers({});
    setCurrentQuestion(0);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-2 mb-10">
            {(["education", "questionnaire", "results", "recommendations", "doctors"] as Step[]).map((step, i) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-xs md:text-sm font-medium transition-all duration-300 ${
                  currentStep === step 
                    ? "bg-primary text-primary-foreground scale-110" 
                    : (["education", "questionnaire", "results", "recommendations", "doctors"] as Step[]).indexOf(currentStep) > i
                    ? "bg-teal text-teal-foreground"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {i + 1}
                </div>
                {i < 4 && (
                  <div className={`w-6 md:w-12 h-0.5 transition-colors duration-300 ${
                    (["education", "questionnaire", "results", "recommendations", "doctors"] as Step[]).indexOf(currentStep) > i 
                      ? "bg-teal" 
                      : "bg-border"
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Education Step */}
          {currentStep === "education" && (
            <div className="animate-fade-up">
              <div className="text-center mb-10">
                <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-6">
                  <Droplets className="w-10 h-10 text-primary" />
                </div>
                <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
                  {educationContent.title}
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                  {educationContent.description}
                </p>
              </div>

              <div className="grid gap-6">
                {educationContent.sections.map((section, i) => (
                  <div key={i} className="glass-card rounded-2xl p-6 hover:shadow-glow transition-shadow">
                    <h3 className="font-heading text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Info className="w-5 h-5 text-primary" />
                      {section.title}
                    </h3>
                    {section.content && (
                      <p className="text-muted-foreground">{section.content}</p>
                    )}
                    {section.items && (
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                        {section.items.map((item, j) => (
                          <li key={j} className="flex items-center gap-2 text-sm text-foreground">
                            <CheckCircle2 className="w-4 h-4 text-teal flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <HealthDisclaimer />
              </div>

              <div className="text-center mt-10">
                <Button size="lg" onClick={() => setCurrentStep("questionnaire")} className="group">
                  <Calendar className="w-5 h-5 mr-2" />
                  Start Assessment
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          )}

          {/* Questionnaire Step */}
          {currentStep === "questionnaire" && (
            <div className="animate-fade-up">
              <div className="text-center mb-10">
                <div className="text-sm text-muted-foreground mb-2">
                  Question {currentQuestion + 1} of {questions.length}
                </div>
                <div className="w-full bg-muted rounded-full h-2 mb-8 overflow-hidden">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                  />
                </div>
                <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
                  {questions[currentQuestion].text}
                </h2>
                <p className="text-sm text-muted-foreground mt-2">
                  Factor: {questions[currentQuestion].factor}
                </p>
              </div>

              <div className="grid gap-4 max-w-xl mx-auto">
                {questions[currentQuestion].options.map((option, i) => (
                  <button
                    key={i}
                    onClick={() => handleAnswer(option.score)}
                    className={`glass-card rounded-xl p-4 text-left hover:border-primary hover:shadow-glow transition-all duration-300 border-2 ${
                      answers[questions[currentQuestion].id] === option.score 
                        ? "border-primary bg-primary/10" 
                        : "border-transparent"
                    }`}
                  >
                    <span className="text-foreground font-medium">{option.text}</span>
                  </button>
                ))}
              </div>

              {currentQuestion > 0 && (
                <div className="text-center mt-8">
                  <Button variant="ghost" onClick={() => setCurrentQuestion(currentQuestion - 1)}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous Question
                  </Button>
                </div>
              )}

              {Object.keys(answers).length > 0 && (
                <div className="mt-8 p-4 rounded-xl bg-muted/50 text-center">
                  <p className="text-sm text-muted-foreground">
                    Current Assessment: <span className={riskCategory.color + " font-semibold"}>{score}%</span>
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Results Step */}
          {currentStep === "results" && (
            <div className="animate-fade-up">
              <div className="text-center mb-10">
                <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Your Menstrual Health Assessment
                </h1>
                <p className="text-muted-foreground">
                  Based on your responses, here's your personalized analysis
                </p>
              </div>

              <div className="glass-card rounded-2xl p-8 text-center mb-8">
                <RiskGauge score={score} label="Health Score" color={riskCategory.color} />
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mt-6 ${
                  riskCategory.level === "low" ? "bg-teal/20" : 
                  riskCategory.level === "medium" ? "bg-accent/20" : "bg-destructive/20"
                } ${riskCategory.color}`}>
                  <AlertCircle className="w-4 h-4" />
                  <span className="font-semibold">{riskCategory.label}</span>
                </div>
              </div>

              <div className="glass-card rounded-2xl p-6 mb-8">
                <h3 className="font-heading text-lg font-semibold text-foreground mb-4">
                  Factor Analysis
                </h3>
                <RiskChart factors={riskFactors} />
              </div>

              <div className="glass-card rounded-2xl p-6 mb-8">
                <h3 className="font-heading text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-primary" />
                  Understanding Your Results
                </h3>
                <p className="text-muted-foreground mb-4">
                  {score < 30 
                    ? "Your menstrual health appears to be in good condition. Continue tracking your cycle and maintaining healthy habits."
                    : score < 60 
                    ? "Some aspects of your menstrual health could benefit from attention. Consider lifestyle adjustments and monitoring any patterns."
                    : "Your responses indicate several areas that may need medical attention. We recommend consulting with a gynecologist for proper evaluation."
                  }
                </p>
              </div>

              <HealthDisclaimer />

              <div className="text-center mt-8">
                <Button size="lg" onClick={() => setCurrentStep("recommendations")} className="group">
                  View Recommendations
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          )}

          {/* Recommendations Step */}
          {currentStep === "recommendations" && (
            <div className="animate-fade-up">
              <div className="text-center mb-10">
                <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Your Personalized Plan
                </h1>
                <p className="text-muted-foreground">
                  Recommendations based on your menstrual health profile
                </p>
              </div>

              <Recommendations riskLevel={riskCategory.level} type="menstrual" />

              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
                <Button size="lg" onClick={() => setCurrentStep("doctors")} className="group">
                  Find Nearby Specialists
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button variant="outline" size="lg" onClick={restartAssessment}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Start Over
                </Button>
              </div>
            </div>
          )}

          {/* Doctors Step */}
          {currentStep === "doctors" && (
            <div className="animate-fade-up">
              <div className="text-center mb-10">
                <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Connect with Specialists
                </h1>
                <p className="text-muted-foreground">
                  Find qualified gynecologists near you
                </p>
              </div>

              <NearbyDoctors specialty="gynecologist" />

              <div className="text-center mt-10">
                <Button variant="outline" onClick={restartAssessment}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Start New Assessment
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MenstrualModule;
