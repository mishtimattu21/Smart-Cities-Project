import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Download, TrendingUp, Target } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { predictOnion, fetchOnionMeta, fetchCommodityMeta } from "@/lib/predict";

const Prediction = () => {
  const [selectedState, setSelectedState] = useState("");
  const [selectedCommodity, setSelectedCommodity] = useState("");
  const [date, setDate] = useState<Date>();
  const [showPrediction, setShowPrediction] = useState(false);
  const [districts, setDistricts] = useState<string[]>([]);
  const [varieties, setVarieties] = useState<string[]>([]);
  const [markets, setMarkets] = useState<string[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedVariety, setSelectedVariety] = useState("");
  const [selectedMarket, setSelectedMarket] = useState("");
  const grade = "FAQ";

  const DEFAULT_ONION_VARIETIES = [
    "Red",
    "Bombay (U.P.)",
    "Other",
    "Nasik",
    "Onion",
    "1st Sort",
    "Local",
    "Medium",
    "Dry F.A.Q.",
    "Beelary-Red",
    "Pusa-Red",
    "Hybrid",
    "Bellary",
    "2nd Sort",
    "White",
    "Bangalore-Samall",
    "Big",
    "Small",
    "Small - I",
    "Puna",
    "Telagi",
    "Pole",
  ];

  const loadVarieties = async (state?: string, district?: string) => {
    const vts = await fetchOnionMeta("varieties", { state, district });
    const merged = Array.from(new Set([...(vts.items || []), ...DEFAULT_ONION_VARIETIES])).filter(Boolean).sort();
    setVarieties(merged);
  };

  const loadMarkets = async (state?: string, district?: string) => {
    const m = await fetchOnionMeta("markets", { state, district });
    const uniqueSorted = Array.from(new Set(m.items || [])).filter(Boolean).sort();
    setMarkets(uniqueSorted);
  };

  const [states, setStates] = useState<string[]>([]);
  const commodities = ["Onion", "Wheat", "Rice", "Potato"];

  const [predictions, setPredictions] = useState<number[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load states from the selected commodity's CSV (default Onion initially)
  useEffect(() => {
    const loadStates = async (commodity: string) => {
      if (commodity.toLowerCase() === "onion") {
        const s = await fetchOnionMeta("states");
        setStates(Array.from(new Set(s.items)).sort());
      } else {
        const s = await fetchCommodityMeta(commodity.toLowerCase() as any, "states");
        setStates(Array.from(new Set(s.items)).sort());
      }
    };
    void loadStates(selectedCommodity || "Onion");
  }, [selectedCommodity]);

  // Load dependent drop-downs from the respective commodity CSV
  const handleStateChange = async (value: string) => {
    setSelectedState(value);
    setSelectedDistrict("");
    setSelectedVariety("");
    setSelectedMarket("");
    const c = selectedCommodity || "Onion";
    if (c === "Onion") {
      const d = await fetchOnionMeta("districts", { state: value });
      setDistricts(d.items);
      await loadVarieties(value);
      setMarkets([]);
    } else {
      const d = await fetchCommodityMeta(c.toLowerCase() as any, "districts", { state: value });
      setDistricts(d.items);
      const v = await fetchCommodityMeta(c.toLowerCase() as any, "varieties", { state: value });
      setVarieties(v.items);
      setMarkets([]);
    }
  };

  const handlePredict = async () => {
    if (!(selectedState && selectedCommodity && date)) return;
    setShowPrediction(true);
    setError(null);
    setLoading(true);
    setPredictions(null);
    try {
      if (selectedCommodity) {
        const res = await predictOnion(7, {
          state: selectedState,
          district: selectedDistrict,
          market: selectedMarket,
          variety: selectedVariety,
          grade,
          dateISO: (date as Date).toISOString(),
          commodity: selectedCommodity as any,
        });
        setPredictions(res.predictions);
      } 
    } catch (e) {
      setError(e instanceof Error ? e.message : "Prediction failed");
    } finally {
      setLoading(false);
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
              <Select value={selectedState} onValueChange={handleStateChange}>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {states.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Commodity</label>
              <Select value={selectedCommodity} onValueChange={async (v) => {
                setSelectedCommodity(v);
                const low = v.toLowerCase();
                if (selectedState) {
                  if (low === "onion") {
                    const d = await fetchOnionMeta("districts", { state: selectedState });
                    setDistricts(d.items);
                    await loadVarieties(selectedState);
                    setMarkets([]);
                  } else {
                    const d = await fetchCommodityMeta(low as any, "districts", { state: selectedState });
                    setDistricts(d.items);
                    const vv = await fetchCommodityMeta(low as any, "varieties", { state: selectedState });
                    setVarieties(vv.items);
                    setMarkets([]);
                  }
                } else {
                  setDistricts([]);
                  setVarieties([]);
                  setMarkets([]);
                }
              }}>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="Select commodity" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {commodities.map((commodity) => (
                    <SelectItem key={commodity} value={commodity}>
                      {commodity}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedCommodity && (
              <>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">District</label>
                  <Select value={selectedDistrict} onValueChange={async (d) => {
                    setSelectedDistrict(d);
                    if (selectedState) {
                      try {
                        const low = (selectedCommodity || "Onion").toLowerCase();
                        if (low === "onion") {
                          await loadMarkets(selectedState, d);
                          await loadVarieties(selectedState, d);
                        } else {
                          const m = await fetchCommodityMeta(low as any, "markets", { state: selectedState, district: d });
                          setMarkets(m.items);
                          const vts = await fetchCommodityMeta(low as any, "varieties", { state: selectedState, district: d });
                          setVarieties(vts.items);
                        }
                      } catch (_) {
                        setMarkets([]);
                      }
                    }
                  }}>
                    <SelectTrigger className="bg-background border-border">
                      <SelectValue placeholder="Select district" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border max-h-64 overflow-auto">
                      {districts.map((d) => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Variety</label>
                  <Select value={selectedVariety} onValueChange={setSelectedVariety}>
                    <SelectTrigger className="bg-background border-border">
                      <SelectValue placeholder="Select variety" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border max-h-64 overflow-auto">
                      {varieties.map((v) => (
                        <SelectItem key={v} value={v}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Market</label>
                  <Select value={selectedMarket} onValueChange={setSelectedMarket}>
                    <SelectTrigger className="bg-background border-border">
                      <SelectValue placeholder="Select market" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border max-h-64 overflow-auto">
                      {markets.map((m) => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

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
                  <div className="text-sm text-muted-foreground mb-1">Predicted Price (Next 7 days)</div>
                  {loading ? (
                    <div className="text-muted-foreground">Running model…</div>
                  ) : error ? (
                    <div className="text-red-600 text-sm">{error}</div>
                  ) : predictions ? (
                    <div className="text-2xl font-bold text-primary">₹{predictions[0].toFixed(2)}/kg</div>
                  ) : (
                    <div className="text-muted-foreground">No data</div>
                  )}
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
                    {predictions ? 'Bullish (+12.5%)' : 'Pending'}
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