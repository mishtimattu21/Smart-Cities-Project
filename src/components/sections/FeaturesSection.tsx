import { FeatureCard } from "@/components/ui/feature-card";

const FeaturesSection = () => {
  const features = [
    {
      icon: "🌾",
      title: "Real-Time Market Rates",
      description: "Stay updated with the latest crop prices from markets across India."
    },
    {
      icon: "📈",
      title: "Predictive Analytics",
      description: "AI-powered crop price predictions to help you make informed decisions."
    },
    {
      icon: "🗺️",
      title: "Interactive Heatmaps",
      description: "Visualize highest and lowest rates by region with our interactive maps."
    },
    {
      icon: "📚",
      title: "Knowledge Center",
      description: "Access government schemes, weather insights and agricultural best practices."
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Empowering Farmers with Data
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comprehensive tools and insights to help you navigate the agricultural market with confidence.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;