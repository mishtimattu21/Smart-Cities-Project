import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Download, TrendingUp, Target } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const Prediction = () => {
  const [selectedState, setSelectedState] = useState("");
  const [selectedCommodity, setSelectedCommodity] = useState("");
  const [date, setDate] = useState<Date>();
  const [showPrediction, setShowPrediction] = useState(false);

  const states = ["Maharashtra", "Karnataka", "Tamil Nadu", "Gujarat", "Punjab"];
  const commodities = ["Tomato", "Onion", "Potato", "Cabbage", "Carrot"];

  const handlePredict = () => {
    if (selectedState && selectedCommodity && date) {
      setShowPrediction(true);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-4">Predict Crop Prices</h1>
        <p className="text-lg text-muted-foreground">
          Use AI-powered analytics to predict future crop prices and make informed farming decisions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Prediction Form */}
        <Card className="bg-gradient-card border-border shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Prediction Parameters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
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
              <label className="text-sm font-medium text-foreground mb-2 block">Prediction Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-background border-border",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-card border-border" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <Button 
              onClick={handlePredict}
              className="w-full bg-primary hover:bg-primary/90"
              disabled={!selectedState || !selectedCommodity || !date}
            >
              Generate Prediction
            </Button>
          </CardContent>
        </Card>

        {/* Prediction Results */}
        {showPrediction && (
          <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20 shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <TrendingUp className="w-5 h-5" />
                Prediction Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="bg-card p-4 rounded-lg border border-border">
                  <div className="text-sm text-muted-foreground mb-1">Predicted Price (Next Week)</div>
                  <div className="text-2xl font-bold text-primary">₹47.80/kg</div>
                  <div className="text-xs text-muted-foreground mt-1">Current: ₹42.50/kg</div>
                </div>
                
                <div className="bg-card p-4 rounded-lg border border-border">
                  <div className="text-sm text-muted-foreground mb-1">Confidence Level</div>
                  <div className="text-lg font-semibold text-accent-foreground">89%</div>
                  <div className="w-full bg-muted rounded-full h-2 mt-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '89%' }} />
                  </div>
                </div>
                
                <div className="bg-card p-4 rounded-lg border border-border">
                  <div className="text-sm text-muted-foreground mb-1">Trend Direction</div>
                  <div className="text-lg font-semibold text-green-600 flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    Bullish (+12.5%)
                  </div>
                </div>

                <div className="bg-card p-4 rounded-lg border border-border">
                  <div className="text-sm text-muted-foreground mb-1">Key Factors</div>
                  <div className="space-y-1 text-sm">
                    <div className="text-green-600">• Seasonal demand increase</div>
                    <div className="text-yellow-600">• Weather conditions stable</div>
                    <div className="text-red-600">• Transport costs rising</div>
                  </div>
                </div>
              </div>

              <Button className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                <Download className="w-4 h-4 mr-2" />
                Download Report (PDF)
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Prediction;