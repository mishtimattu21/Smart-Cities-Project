import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, CloudRain, Award, FileText } from "lucide-react";

const Knowledge = () => {
  const schemes = [
    {
      title: "PM-KISAN Scheme",
      description: "Direct income support of ₹6,000 per year to small and marginal farmers across India",
      category: "Financial Support",
      status: "Active",
      beneficiaries: "12.5 Cr farmers"
    },
    {
      title: "Pradhan Mantri Fasal Bima Yojana",
      description: "Comprehensive crop insurance covering all stages from sowing to post-harvest",
      category: "Insurance",
      status: "Active",
      beneficiaries: "5.5 Cr farmers"
    },
    {
      title: "Soil Health Card Scheme",
      description: "Soil testing and nutrient management recommendations for optimal crop yield",
      category: "Technical",
      status: "Ongoing",
      beneficiaries: "22 Cr cards issued"
    },
    {
      title: "National Agriculture Market (eNAM)",
      description: "Online trading platform connecting APMC markets for transparent price discovery",
      category: "Marketing",
      status: "Active",
      beneficiaries: "1.7 Cr farmers"
    },
    {
      title: "Kisan Credit Card",
      description: "Credit support for crop cultivation and allied activities at affordable interest rates",
      category: "Financial Support",
      status: "Active",
      beneficiaries: "7 Cr active cards"
    }
  ];

  const articles = [
    { title: "Sustainable Farming Practices for Better Yield", category: "Best Practices", readTime: "5 min read" },
    { title: "Water Conservation Techniques in Agriculture", category: "Water Management", readTime: "7 min read" },
    { title: "Organic Farming: Benefits and Implementation Guide", category: "Organic Farming", readTime: "10 min read" },
    { title: "Integrated Pest Management Strategies", category: "Pest Control", readTime: "6 min read" },
    { title: "Post-Harvest Management Best Practices", category: "Storage", readTime: "8 min read" },
    { title: "Soil Testing and Nutrient Management", category: "Soil Health", readTime: "6 min read" },
    { title: "Climate-Smart Agriculture Techniques", category: "Climate", readTime: "9 min read" },
    { title: "Market Linkage and Price Discovery", category: "Marketing", readTime: "4 min read" },
    { title: "Precision Agriculture Technologies", category: "Technology", readTime: "12 min read" }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-4">Knowledge Center</h1>
        <p className="text-lg text-muted-foreground">
          Access comprehensive information about government schemes, weather insights, and agricultural best practices.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Government Schemes */}
        <Card className="bg-gradient-card border-border shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              Government Schemes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {schemes.map((scheme, index) => (
                <div 
                  key={index}
                  className="p-4 bg-card border border-border rounded-lg hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-foreground">{scheme.title}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {scheme.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{scheme.description}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {scheme.category}
                    </Badge>
                    <span className="text-xs text-primary font-medium">{scheme.beneficiaries}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Weather Insights */}
        <Card className="bg-gradient-card border-border shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CloudRain className="w-5 h-5 text-primary" />
              Weather Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Weather Chart Placeholder */}
              <div className="h-48 bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <CloudRain className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Weather Chart Placeholder</p>
                </div>
              </div>
              
              {/* Weather Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-card border border-border rounded-lg text-center">
                  <div className="text-sm text-muted-foreground">This Week Rainfall</div>
                  <div className="text-lg font-bold text-primary">127mm</div>
                  <div className="text-xs text-green-600">+15% vs normal</div>
                </div>
                <div className="p-3 bg-card border border-border rounded-lg text-center">
                  <div className="text-sm text-muted-foreground">Avg Temperature</div>
                  <div className="text-lg font-bold text-primary">28.5°C</div>
                  <div className="text-xs text-yellow-600">Normal range</div>
                </div>
                <div className="p-3 bg-card border border-border rounded-lg text-center">
                  <div className="text-sm text-muted-foreground">Humidity</div>
                  <div className="text-lg font-bold text-primary">72%</div>
                  <div className="text-xs text-blue-600">Optimal</div>
                </div>
                <div className="p-3 bg-card border border-border rounded-lg text-center">
                  <div className="text-sm text-muted-foreground">Wind Speed</div>
                  <div className="text-lg font-bold text-primary">12 km/h</div>
                  <div className="text-xs text-green-600">Favorable</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Best Practices & Articles */}
      <Card className="mt-8 bg-gradient-card border-border shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Best Practices & Articles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {articles.map((article, index) => (
              <div 
                key={index}
                className="p-4 bg-card border border-border rounded-lg hover:shadow-sm transition-shadow cursor-pointer"
              >
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground text-sm leading-snug mb-2">{article.title}</h4>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">{article.category}</Badge>
                        <span className="text-xs text-muted-foreground">{article.readTime}</span>
                      </div>
                    </div>
                  </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Knowledge;