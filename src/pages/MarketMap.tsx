import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, TrendingUp, TrendingDown } from "lucide-react";

const MarketMap = () => {
  const regions = [
    { name: "Maharashtra", price: "₹52.30", trend: "up", change: "+2.5%", markets: 45, volume: "3,200 MT" },
    { name: "Karnataka", price: "₹48.80", trend: "down", change: "-1.2%", markets: 38, volume: "2,850 MT" },
    { name: "Tamil Nadu", price: "₹55.20", trend: "up", change: "+3.8%", markets: 42, volume: "2,950 MT" },
    { name: "Gujarat", price: "₹46.90", trend: "up", change: "+1.5%", markets: 35, volume: "2,400 MT" },
    { name: "Punjab", price: "₹44.60", trend: "down", change: "-0.8%", markets: 28, volume: "1,900 MT" },
    { name: "Haryana", price: "₹47.20", trend: "up", change: "+2.1%", markets: 32, volume: "2,100 MT" },
    { name: "Uttar Pradesh", price: "₹45.80", trend: "up", change: "+1.8%", markets: 52, volume: "3,800 MT" },
    { name: "West Bengal", price: "₹49.40", trend: "down", change: "-1.5%", markets: 29, volume: "2,200 MT" },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-4">Market Heatmap</h1>
        <p className="text-lg text-muted-foreground">
          View real-time highest and lowest prices across regions with interactive visualizations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Map Visualization */}
        <div className="lg:col-span-2">
          <Card className="bg-gradient-card border-border shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Regional Price Heatmap
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Interactive Map Placeholder</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Hover over regions to see price information
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Regional Data */}
        <div>
          <Card className="bg-gradient-card border-border shadow-card">
            <CardHeader>
              <CardTitle>Regional Prices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {regions.map((region) => (
                  <div 
                    key={region.name}
                    className="flex items-center justify-between p-3 bg-card border border-border rounded-lg hover:shadow-sm transition-shadow"
                  >
                  <div>
                    <div className="font-medium text-foreground">{region.name}</div>
                    <div className="text-lg font-bold text-primary">{region.price}</div>
                    <div className="text-xs text-muted-foreground">{region.markets} markets • {region.volume}</div>
                  </div>
                  <div className="text-right">
                    <div className={`flex items-center gap-1 ${
                      region.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {region.trend === 'up' ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      <span className="text-sm font-medium">{region.change}</span>
                    </div>
                  </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MarketMap;