import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Thermometer, Heart, AlertCircle, CheckCircle } from "lucide-react";

const MenopauseInfo = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24">
        <div className="container mx-auto px-4 py-10">
          {/* Title */}
          <div className="mb-10 max-w-3xl">
            <h1 className="font-heading text-4xl font-bold text-foreground mb-3">
              Menopause Information
            </h1>
            <p className="text-muted-foreground">
              Learn about menopause, its stages, symptoms, and ways to
              manage physical and emotional changes.
            </p>
          </div>

          {/* What is Menopause */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-3 flex items-center gap-2">
              <Thermometer className="w-5 h-5 text-primary" />
              What is Menopause?
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Menopause is a natural biological process marking the end of
              menstrual cycles. It is diagnosed after 12 months without
              a menstrual period.
            </p>
          </section>

          {/* Symptoms */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              Common Symptoms
            </h2>
            <ul className="grid md:grid-cols-2 gap-3 text-muted-foreground">
              <li>• Hot flashes</li>
              <li>• Night sweats</li>
              <li>• Mood changes</li>
              <li>• Sleep disturbances</li>
              <li>• Vaginal dryness</li>
              <li>• Decreased energy levels</li>
            </ul>
          </section>

          {/* Health Tips */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-accent" />
              Health & Wellness Tips
            </h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Eat calcium-rich foods</li>
              <li>• Stay physically active</li>
              <li>• Practice relaxation techniques</li>
              <li>• Talk to a healthcare provider</li>
            </ul>
          </section>

          {/* Footer note */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle className="w-4 h-4 text-primary" />
            Content is for awareness and educational purposes only.
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MenopauseInfo;
