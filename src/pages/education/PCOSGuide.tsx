import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeartPulse, Activity, AlertTriangle, CheckCircle } from "lucide-react";

const PCOSGuide = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24">
        <div className="container mx-auto px-4 py-10">
          {/* Title */}
          <div className="mb-10 max-w-3xl">
            <h1 className="font-heading text-4xl font-bold text-foreground mb-3">
              PCOS Guide
            </h1>
            <p className="text-muted-foreground">
              Understand Polycystic Ovary Syndrome (PCOS), its symptoms,
              causes, diagnosis, and lifestyle management.
            </p>
          </div>

          {/* What is PCOS */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-3 flex items-center gap-2">
              <HeartPulse className="w-5 h-5 text-primary" />
              What is PCOS?
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Polycystic Ovary Syndrome (PCOS) is a hormonal disorder common
              among women of reproductive age. It may cause irregular periods,
              excess androgen levels, and polycystic ovaries.
            </p>
          </section>

          {/* Symptoms */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Common Symptoms
            </h2>
            <ul className="grid md:grid-cols-2 gap-3 text-muted-foreground">
              <li>• Irregular or missed periods</li>
              <li>• Excess facial or body hair</li>
              <li>• Acne and oily skin</li>
              <li>• Weight gain or difficulty losing weight</li>
              <li>• Hair thinning or scalp hair loss</li>
              <li>• Difficulty conceiving</li>
            </ul>
          </section>

          {/* Management */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-accent" />
              Management & Lifestyle Tips
            </h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Maintain a balanced, low-GI diet</li>
              <li>• Exercise regularly</li>
              <li>• Manage stress and sleep well</li>
              <li>• Regular medical checkups</li>
            </ul>
          </section>

          {/* Footer note */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle className="w-4 h-4 text-primary" />
            This information is educational and not a medical diagnosis.
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PCOSGuide;
