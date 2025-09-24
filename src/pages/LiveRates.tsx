import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar, BarChart3, TrendingUp } from "lucide-react";

const LiveRates = () => {
  const [selectedCommodity, setSelectedCommodity] = useState("");
  const [selectedState, setSelectedState] = useState("");

  const commodities = ["Tomato", "Onion", "Potato", "Cabbage", "Carrot", "Cauliflower", "Green Chili", "Brinjal"];
  const states = ["Maharashtra", "Karnataka", "Tamil Nadu", "Gujarat", "Punjab", "Haryana", "Uttar Pradesh", "West Bengal"];

  // Realistic market data
  const marketData = [
    { commodity: "Tomato", currentPrice: "₹42.50", change: "+5.2%", trend: "up", volume: "2,450 MT" },
    { commodity: "Onion", currentPrice: "₹28.30", change: "-2.1%", trend: "down", volume: "3,200 MT" },
    { commodity: "Potato", currentPrice: "₹22.80", change: "+1.8%", trend: "up", volume: "4,100 MT" },
    { commodity: "Cabbage", currentPrice: "₹18.60", change: "+3.4%", trend: "up", volume: "1,800 MT" },
    { commodity: "Carrot", currentPrice: "₹35.20", change: "-0.8%", trend: "down", volume: "1,650 MT" },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-4">Live Rates & Historical Trends</h1>
        <p className="text-lg text-muted-foreground">
          Track real-time market prices and analyze historical trends for informed decision making.
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-8 bg-gradient-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Filter Options
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Commodity</label>
              <Select value={selectedCommodity} onValueChange={setSelectedCommodity}>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="Select commodity" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {commodities.map((commodity) => (
                    <SelectItem key={commodity} value={commodity.toLowerCase()}>
                      {commodity}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">State</label>
              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {states.map((state) => (
                    <SelectItem key={state} value={state.toLowerCase()}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button className="w-full bg-primary hover:bg-primary/90">
                Apply Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Market Overview */}
      <Card className="mb-8 bg-gradient-card border-border shadow-card">
        <CardHeader>
          <CardTitle>Today's Market Overview</CardTitle>
          <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleString()}</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {marketData.map((item) => (
              <div key={item.commodity} className="bg-card border border-border rounded-lg p-4">
                <div className="text-sm font-medium text-muted-foreground">{item.commodity}</div>
                <div className="text-xl font-bold text-primary mt-1">{item.currentPrice}</div>
                <div className={`text-sm mt-1 flex items-center gap-1 ${
                  item.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  <TrendingUp className={`w-3 h-3 ${item.trend === 'down' ? 'rotate-180' : ''}`} />
                  {item.change}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Vol: {item.volume}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-gradient-card border-border shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Price Trends - Last 30 Days
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-muted rounded-lg p-4">
              <div className="h-full flex flex-col justify-between">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>₹50</span>
                  <span className="text-primary font-medium">Tomato Price Trend</span>
                </div>
                <div className="flex-1 flex items-end justify-between px-2">
                  {[32, 35, 38, 42, 39, 41, 45, 43, 47, 42].map((height, i) => (
                    <div key={i} className="w-4 bg-primary/70 rounded-t" style={{height: `${height}%`}} />
                  ))}
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>₹20</span>
                  <span>30 days</span>
                  <span>Today</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Top Performing Commodities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: "Tomato", price: "₹42.50", change: "+5.2%", width: "85%" },
                { name: "Cabbage", price: "₹18.60", change: "+3.4%", width: "68%" },
                { name: "Potato", price: "₹22.80", change: "+1.8%", width: "45%" },
                { name: "Carrot", price: "₹35.20", change: "-0.8%", width: "20%" },
                { name: "Onion", price: "₹28.30", change: "-2.1%", width: "15%" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">{item.name}</span>
                      <span className="text-sm text-primary font-bold">{item.price}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${item.change.startsWith('+') ? 'bg-green-500' : 'bg-red-500'}`}
                        style={{ width: item.width }}
                      />
                    </div>
                  </div>
                  <span className={`ml-3 text-sm font-medium ${
                    item.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {item.change}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LiveRates;