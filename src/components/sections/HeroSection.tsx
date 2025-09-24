import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-farm-bg.jpg";

const HeroSection = () => {
  return (
    <section 
      className="relative min-h-[80vh] flex items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${heroImage})` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/70 to-primary/40" />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center text-white">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          AgriPredict
        </h1>
        <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed opacity-95">
          Smart Predictions & Insights for Horticulture Crops
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 shadow-soft">
            <Link to="/rates">View Live Rates</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary">
            <Link to="/prediction">Get Predictions</Link>
          </Button>
        </div>
      </div>
      
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/10" />
    </section>
  );
};

export default HeroSection;