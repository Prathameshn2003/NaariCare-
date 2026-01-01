import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { NearbyDoctors } from "@/components/health/NearbyDoctors";

const Doctors = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* 🔥 Nearby Healthcare Providers (MAIN FEATURE) */}
          <section>
            <NearbyDoctors />
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Doctors;
