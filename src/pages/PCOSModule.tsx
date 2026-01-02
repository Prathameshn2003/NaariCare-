import { useState, useMemo } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { RiskGauge } from "@/components/health/RiskGauge";
import { RiskChart } from "@/components/health/RiskChart";
import { HealthDisclaimer } from "@/components/health/HealthDisclaimer";
import { Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

type RiskLevel = "low" | "medium" | "high";

const PCOS_API = import.meta.env.VITE_PCOS_API_URL;

async function predictPCOS(payload: any) {
  const res = await fetch(`${PCOS_API}/predict-pcos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Prediction failed");
  return data;
}

export default function PCOSModule() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const [form, setForm] = useState({
    age: 15,
    weight: 30,
    bmi: 15,
    cycle_regular: "Irregular",
    cycle_length: 15,
    weight_gain: "No",
    hair_growth: "No",
    hair_loss: "No",
    pimples: "No",
    skin_darkening: "No",
    fast_food: "No",
    exercise: "No",
    follicle_left: 0,
    follicle_right: 0,
    endometrium: 1,
  });

  const update = (k: string, v: any) =>
    setForm((p) => ({ ...p, [k]: v }));

  const fallbackScore = useMemo(() => {
    let s = 0;
    if (form.cycle_regular === "Irregular") s += 20;
    if (form.hair_growth === "Yes") s += 15;
    if (form.hair_loss === "Yes") s += 15;
    if (form.pimples === "Yes") s += 10;
    if (form.weight_gain === "Yes") s += 10;
    if (form.follicle_left + form.follicle_right >= 12) s += 20;
    return Math.min(s, 100);
  }, [form]);

  const riskLevel: RiskLevel =
    fallbackScore < 30 ? "low" : fallbackScore < 60 ? "medium" : "high";

  const assess = async () => {
    if (!user) {
      toast({ title: "Login required", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        age: Number(form.age),
        weight: Number(form.weight),
        bmi: Number(form.bmi),
        cycle: form.cycle_regular === "Irregular" ? 0 : 1,
        cycle_length: Number(form.cycle_length),
        weight_gain: form.weight_gain === "Yes" ? 1 : 0,
        hair_growth: form.hair_growth === "Yes" ? 1 : 0,
        skin_darkening: form.skin_darkening === "Yes" ? 1 : 0,
        hair_loss: form.hair_loss === "Yes" ? 1 : 0,
        pimples: form.pimples === "Yes" ? 1 : 0,
        fast_food: form.fast_food === "Yes" ? 1 : 0,
        regular_exercise: form.exercise === "Yes" ? 1 : 0,
        follicle_left: Number(form.follicle_left),
        follicle_right: Number(form.follicle_right),
        endometrium: Number(form.endometrium),
      };

      const res = await predictPCOS(payload);
      setResult(res);

      await supabase.from("health_assessments").insert({
        user_id: user.id,
        assessment_type: "pcos",
        risk_score: res.risk_score,
        risk_category: res.risk_level.toLowerCase(),
        responses: form,
      });

      toast({ title: "PCOS assessment completed" });
    } catch (e: any) {
      toast({
        title: "Assessment failed",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16 max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
          <Activity className="text-accent" />
          PCOS Detection & Risk Assessment
        </h1>

        {/* FORM */}
        <div className="space-y-4">
          {[
            ["Age (yrs)", "age"],
            ["Weight (kg)", "weight"],
            ["BMI", "bmi"],
            ["Cycle length (days)", "cycle_length"],
            ["Follicle Left", "follicle_left"],
            ["Follicle Right", "follicle_right"],
            ["Endometrium (mm)", "endometrium"],
          ].map(([l, k]) => (
            <div key={k}>
              <label className="text-sm">{l}</label>
              <input
                type="number"
                value={(form as any)[k]}
                onChange={(e) => update(k, Number(e.target.value))}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          ))}

          {[
            ["Cycle Regularity", "cycle_regular"],
            ["Weight gain", "weight_gain"],
            ["Hair growth", "hair_growth"],
            ["Hair loss", "hair_loss"],
            ["Skin darkening", "skin_darkening"],
            ["Pimples", "pimples"],
            ["Fast food", "fast_food"],
            ["Regular exercise", "exercise"],
          ].map(([l, k]) => (
            <div key={k}>
              <label className="text-sm">{l}</label>
              <select
                value={(form as any)[k]}
                onChange={(e) => update(k, e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                {k === "cycle_regular" ? (
                  <>
                    <option>Regular</option>
                    <option>Irregular</option>
                  </>
                ) : (
                  <>
                    <option>No</option>
                    <option>Yes</option>
                  </>
                )}
              </select>
            </div>
          ))}
        </div>

        <Button className="w-full mt-6" onClick={assess} disabled={loading}>
          Assess PCOS Risk
        </Button>

        {result && (
          <div className="mt-10 space-y-6">
            <RiskGauge
              score={result.risk_score}
              label="PCOS Risk"
              color={
                result.risk_level === "Low"
                  ? "text-teal"
                  : result.risk_level === "Medium"
                  ? "text-accent"
                  : "text-destructive"
              }
            />

            <RiskChart
              factors={[
                { name: "Cycle", value: form.cycle_regular === "Irregular" ? 3 : 0, maxValue: 3 },
                { name: "Hair", value: form.hair_growth === "Yes" ? 3 : 0, maxValue: 3 },
                { name: "Weight", value: form.weight_gain === "Yes" ? 3 : 0, maxValue: 3 },
              ]}
            />
          </div>
        )}

        <HealthDisclaimer />
      </main>

      <Footer />
    </div>
  );
}  