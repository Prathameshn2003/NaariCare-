import { useState, useMemo } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { RiskGauge } from "@/components/health/RiskGauge";
import { HealthDisclaimer } from "@/components/health/HealthDisclaimer";
import { Thermometer } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

/* ---------------- TYPES ---------------- */
type RiskLevel = "low" | "medium" | "high";

/* ---------------- API (FINAL FIX) ---------------- */
const MENOPAUSE_API = import.meta.env.VITE_MENOPAUSE_API_URL;

if (!MENOPAUSE_API) {
  console.error("❌ VITE_MENOPAUSE_API_URL is missing");
}

/* ---------------- ML CALL ---------------- */
async function predictMenopause(payload: any) {
  const res = await fetch(`${MENOPAUSE_API}/predict-menopause`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Prediction failed");
  return data;
}

/* ---------------- COMPONENT ---------------- */
export default function MenopauseModule() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const [form, setForm] = useState({
    age: 36,
    estrogen: 40,
    fsh: 20,
    years_since_last_period: 0.2,
    irregular_periods: "No",
    missed_periods: "No",
    hot_flashes: "No",
    night_sweats: "No",
    sleep_problems: "No",
    vaginal_dryness: "No",
    joint_pain: "No",
  });

  const update = (k: string, v: any) =>
    setForm((p) => ({ ...p, [k]: v }));

  /* ---------------- FALLBACK SCORE ---------------- */
  const score = useMemo(() => {
    let s = 0;
    if (form.age >= 45) s += 20;
    if (form.estrogen < 50) s += 20;
    if (form.fsh >= 25) s += 20;

    [
      "irregular_periods",
      "missed_periods",
      "hot_flashes",
      "night_sweats",
      "sleep_problems",
      "vaginal_dryness",
      "joint_pain",
    ].forEach((k) => {
      if ((form as any)[k] === "Yes") s += 5;
    });

    return Math.min(s, 100);
  }, [form]);

  const riskLevel: RiskLevel =
    score < 30 ? "low" : score < 60 ? "medium" : "high";

  const gaugeColor =
    riskLevel === "low"
      ? "text-teal"
      : riskLevel === "medium"
      ? "text-accent"
      : "text-primary";

  /* ---------------- SUBMIT ---------------- */
  const assess = async () => {
    if (!user) {
      toast({ title: "Please login first", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        age: form.age,
        estrogen: form.estrogen,
        fsh: form.fsh,
        years_since_last_period: form.years_since_last_period,
        irregular_periods: form.irregular_periods === "Yes" ? 1 : 0,
        missed_periods: form.missed_periods === "Yes" ? 1 : 0,
        hot_flashes: form.hot_flashes === "Yes" ? 1 : 0,
        night_sweats: form.night_sweats === "Yes" ? 1 : 0,
        sleep_problems: form.sleep_problems === "Yes" ? 1 : 0,
        vaginal_dryness: form.vaginal_dryness === "Yes" ? 1 : 0,
        joint_pain: form.joint_pain === "Yes" ? 1 : 0,
      };

      const res = await predictMenopause(payload);
      setResult(res);

      await supabase.from("health_assessments").insert({
        user_id: user.id,
        assessment_type: "menopause",
        risk_score: res.confidence ?? score,
        risk_category: riskLevel,
        responses: form,
      });

      toast({ title: "Menopause assessment completed" });
    } catch (e: any) {
      toast({
        title: "Prediction failed",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16 max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
          <Thermometer className="text-accent" />
          Menopause Detection & Assessment
        </h1>

        <div className="space-y-4">
          {[
            ["Age (years)", "age"],
            ["Estrogen Level", "estrogen"],
            ["FSH Level", "fsh"],
            ["Years Since Last Period", "years_since_last_period"],
          ].map(([l, k]) => (
            <div key={k}>
              <label className="text-sm">{l}</label>
              <input
                type="number"
                value={(form as any)[k]}
                onChange={(e) => update(k, Number(e.target.value))}
                className="w-full rounded-md border px-3 py-2 no-spinner"
              />
            </div>
          ))}

          {[
            ["Irregular Periods", "irregular_periods"],
            ["Missed Periods", "missed_periods"],
            ["Hot Flashes", "hot_flashes"],
            ["Night Sweats", "night_sweats"],
            ["Sleep Problems", "sleep_problems"],
            ["Vaginal Dryness", "vaginal_dryness"],
            ["Joint Pain", "joint_pain"],
          ].map(([l, k]) => (
            <div key={k}>
              <label className="text-sm">{l}</label>
              <div className="flex gap-6 mt-1">
                {["No", "Yes"].map((v) => (
                  <label key={v} className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={(form as any)[k] === v}
                      onChange={() => update(k, v)}
                    />
                    {v}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <Button className="w-full mt-6" onClick={assess} disabled={loading}>
          Predict Menopause Risk
        </Button>

        {result && (
          <div className="mt-10 space-y-6">
            <RiskGauge
              score={result.confidence ?? score}
              label="Menopause Risk"
              color={gaugeColor}
            />
          </div>
        )}

        <HealthDisclaimer />
      </main>

      <Footer />
    </div>
  );
}
