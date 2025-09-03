import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Stars, 
  MapPin, 
  Calendar, 
  Clock, 
  Sparkles, 
  Download,
  Zap,
  User,
  Globe,
  Clock3
} from "lucide-react";
import { CreditBadge } from "@/components/CreditBadge";
import { ChartWheel } from "@/components/ChartWheel";
import { PlacesAutocomplete } from "@/components/PlacesAutocomplete";
import { openAIService } from "@/lib/openai";
import { PDFExporter } from "@/lib/pdfExport";
import { swissEphemerisService } from "@/lib/swissEphemerisService";
import { useCredits } from "@/contexts/CreditsContext";

interface BirthData {
  name: string;
  date: string;
  time: string;
  city: string;
  coordinates: {
    lat: number;
    lng: number;
  } | null;
  timezone?: string;
}

export default function Solo() {
  const { credits, deductCredits } = useCredits();

  const [birthData, setBirthData] = useState<BirthData>({
    name: "",
    date: "",
    time: "",
    city: "",
    coordinates: null,
    timezone: undefined
  });
  
  const [chartGenerated, setChartGenerated] = useState(false);
  const [analysisGenerated, setAnalysisGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [birthChart, setBirthChart] = useState<any>(null);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateChart = async () => {
    if (!birthData.coordinates) {
      setError('Please select a birth location to generate your chart');
      return;
    }

    if (!birthData.name || !birthData.date || !birthData.time) {
      setError('Please fill in all required fields: name, date, and time');
      return;
    }

    // Check if user has enough credits
    if (credits < 1) {
      setError('Insufficient credits. You need 1 credit to generate a birth chart.');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const chart = await swissEphemerisService.calculateBirthChart(birthData);
      setBirthChart(chart);
      setChartGenerated(true);
      
      // Deduct 1 credit for chart generation
      deductCredits(1);
    } catch (error) {
      console.error('Error generating chart:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate birth chart');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAnalysis = async () => {
    if (!birthChart) {
      setError('Please generate your birth chart first');
      return;
    }

    // Check if user has enough credits
    if (credits < 3) {
      setError('Insufficient credits. You need 3 credits to generate AI analysis.');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const analysis = await openAIService.analyzeBirthChart(birthData, birthChart);
      setAiAnalysis(analysis);
      setAnalysisGenerated(true);
      
      // Deduct 3 credits for AI analysis
      deductCredits(3);
    } catch (error) {
      console.error('Error generating AI analysis:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate AI analysis');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPNG = async () => {
    if (!birthChart || !birthData.name) {
      setError('Please generate a birth chart first');
      return;
    }

    try {
      setLoading(true);
      await PDFExporter.exportBirthChartPNG({
        name: birthData.name,
        date: birthData.date,
        time: birthData.time,
        city: birthData.city,
        coordinates: birthData.coordinates
      });
    } catch (error) {
      console.error('Error exporting PNG:', error);
      setError(error instanceof Error ? error.message : 'Failed to export PNG');
    } finally {
      setLoading(false);
    }
  };

  // Add error boundary
  if (error) {
    console.error('Component error:', error);
  }

  return (
    <div className="min-h-screen bg-gradient-cosmic pt-24 pb-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Stars className="w-10 h-10 text-accent animate-twinkle" />
            <div className="text-4xl md:text-5xl font-bold text-stellar-shine">Generate Birth Chart</div>
            <Stars className="w-10 h-10 text-accent animate-twinkle" />
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Generate your precise birth chart using Swiss Ephemeris calculations
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-500 text-base font-medium">{error}</p>
          </div>
        )}
        
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Birth Data Form - Now takes 1/3 of space */}
          <Card className="card-cosmic lg:col-span-1">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <MapPin className="w-6 h-6 text-accent" />
                Birth Information
              </CardTitle>
              <CardDescription className="text-base">
                Enter your birth details for accurate chart calculation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <Label htmlFor="name" className="text-base font-semibold flex items-center gap-2 mb-2">
                  <User className="w-4 h-4" />
                  Full Name
                </Label>
                <Input
                  id="name"
                  placeholder="Enter your name"
                  value={birthData.name}
                  onChange={(e) => setBirthData(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-background/50 text-base h-12"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date" className="text-base font-semibold flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4" />
                    Birth Date
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={birthData.date}
                    onChange={(e) => setBirthData(prev => ({ ...prev, date: e.target.value }))}
                    className="bg-background/50 text-base h-12"
                  />
                </div>
                <div>
                  <Label htmlFor="time" className="text-base font-semibold flex items-center gap-2 mb-2">
                    <Clock3 className="w-4 h-4" />
                    Birth Time
                  </Label>
                  <Input
                    id="time"
                    type="time"
                    value={birthData.time}
                    onChange={(e) => setBirthData(prev => ({ ...prev, time: e.target.value }))}
                    className="bg-background/50 text-base h-12"
                  />
                </div>
              </div>

              <PlacesAutocomplete
                value={birthData.city}
                coordinates={birthData.coordinates}
                timezone={birthData.timezone}
                onChange={(city, coordinates, timezone) => 
                  setBirthData(prev => ({ 
                    ...prev, 
                    city,
                    coordinates,
                    timezone
                  }))
                }
                placeholder="Search for your birth city"
                label="Birth Location"
              />

              <div className="pt-2">
                <Button 
                  onClick={handleGenerateChart}
                  disabled={!birthData.name || !birthData.date || !birthData.coordinates || loading || credits < 1}
                  className="w-full h-14 text-lg font-semibold btn-cosmic"
                  variant="stellar"
                  size="lg"
                >
                  {loading && !chartGenerated ? (
                    <>
                      <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                      Calculating Chart...
                    </>
                  ) : (
                    <>
                      <Stars className="w-5 h-5 mr-2" />
                      Generate Chart (1 Credit)
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Chart Display - Now takes 2/3 of space */}
          <Card className="card-cosmic lg:col-span-2">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Stars className="w-6 h-6 text-accent" />
                Birth Chart
              </CardTitle>
              <CardDescription className="text-base">
                Precise Calculations using Swiss Ephemeris
              </CardDescription>
            </CardHeader>
            <CardContent>
              {chartGenerated && birthChart ? (
                <div id="birth-chart-container" className="space-y-6">
                  {/* Enhanced Chart Wheel */}
                  <div className="flex justify-center">
                    <div className="relative">
                      <div className="w-80 h-80 bg-gradient-nebula/20 rounded-full border-2 border-accent/30 flex items-center justify-center relative overflow-hidden p-4 shadow-stellar">
                        <ChartWheel size={320} data={birthChart} />
                      </div>
                      {/* Glow effect */}
                      <div className="absolute inset-0 w-80 h-80 bg-accent/10 rounded-full blur-xl animate-pulse"></div>
                    </div>
                  </div>

                  {/* Compact Chart Data Display */}
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Metadata */}
                    <div className="bg-muted/20 p-4 rounded-lg">
                      <p className="font-semibold text-accent mb-3 text-lg">Chart Details</p>
                      <div className="space-y-2 text-base">
                        <div className="flex justify-between">
                          <span>Julian Day:</span>
                          <span className="font-mono">{birthChart.metadata.julianDay}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Local Time:</span>
                          <span className="font-mono">{birthChart.metadata.localTime}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Timezone:</span>
                          <span className="font-mono">{birthChart.metadata.timezone}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Coordinates:</span>
                          <span className="font-mono">{birthChart.metadata.coordinates.lat.toFixed(4)}°, {birthChart.metadata.coordinates.lng.toFixed(4)}°</span>
                        </div>
                      </div>
                    </div>

                    {/* Angles */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-muted/20 p-4 rounded-lg">
                        <p className="font-semibold text-accent text-lg">Ascendant</p>
                        <p className="text-xl font-bold">{birthChart.ascendant.sign} {birthChart.ascendant.degreeInSign.toFixed(2)}°</p>
                        <p className="text-sm text-muted-foreground">{birthChart.ascendant.longitude.toFixed(3)}°</p>
                      </div>
                      <div className="bg-muted/20 p-4 rounded-lg">
                        <p className="font-semibold text-accent text-lg">Midheaven</p>
                        <p className="text-xl font-bold">{birthChart.midheaven.sign} {birthChart.midheaven.degreeInSign.toFixed(2)}°</p>
                        <p className="text-sm text-muted-foreground">{birthChart.midheaven.longitude.toFixed(3)}°</p>
                      </div>
                    </div>
                  </div>
                    
                  {/* Planetary Positions */}
                  <div className="bg-muted/20 p-4 rounded-lg">
                    <p className="font-semibold text-accent mb-3 text-lg">Planetary Positions</p>
                    <div className="grid grid-cols-4 gap-3">
                      {birthChart.planets.map((planet: any, index: number) => (
                        <div key={index} className="text-center p-3 bg-background/30 rounded-lg">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <span className="text-2xl">{planet.symbol}</span>
                            {planet.isRetrograde && <span className="text-red-500 text-sm">℞</span>}
                          </div>
                          <div className="font-semibold text-sm">{planet.planet}</div>
                          <div className="text-muted-foreground text-sm">{planet.sign} {planet.degreeInSign.toFixed(2)}°</div>
                          <div className="text-xs text-muted-foreground">H{planet.house}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* House Cusps */}
                  <div className="bg-muted/20 p-4 rounded-lg">
                    <p className="font-semibold text-accent mb-3 text-lg">House Cusps</p>
                    <div className="grid grid-cols-6 gap-2">
                      {birthChart.houses.map((house: any, index: number) => (
                        <div key={index} className="text-center p-2 bg-background/30 rounded">
                          <div className="font-bold text-lg">H{house.house}</div>
                          <div className="text-muted-foreground text-sm">{house.sign}</div>
                          <div className="text-xs text-muted-foreground">{house.degreeInSign.toFixed(1)}°</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Aspects */}
                  {birthChart.aspects.length > 0 && (
                    <div className="bg-muted/20 p-4 rounded-lg">
                      <p className="font-semibold text-accent mb-3 text-lg">Major Aspects</p>
                      <div className="grid grid-cols-2 gap-3">
                        {birthChart.aspects.slice(0, 8).map((aspect: any, index: number) => (
                          <div key={index} className="flex justify-between p-2 bg-background/30 rounded">
                            <span className="font-medium">{aspect.planet1} {aspect.aspect} {aspect.planet2}</span>
                            <span className="text-muted-foreground">{aspect.orb.toFixed(1)}°</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-center">
                    <Button 
                      variant="cosmic" 
                      size="lg" 
                      className="px-8 h-12 text-base"
                      onClick={() => handleExportPNG()}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Exporting...
                        </>
                      ) : (
                        <>
                          <Download className="w-5 h-5 mr-2" />
                          Export PNG
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="relative mb-6">
                                         <div className="w-32 h-32 bg-gradient-nebula/20 rounded-full border-2 border-accent/30 flex items-center justify-center animate-cosmic-float">
                      <Stars className="w-16 h-16 text-accent animate-pulse" />
                    </div>
                    <div className="absolute inset-0 w-32 h-32 bg-accent/10 rounded-full blur-xl animate-pulse"></div>
                  </div>
                                     <h3 className="text-2xl font-bold mb-2 text-cosmic-glow">Ready to Discover Your Stars?</h3>
                  <p className="text-lg text-muted-foreground text-center max-w-md">
                    Enter your birth details and generate your personalized birth chart
                  </p>

                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* AI Analysis Section */}
        {chartGenerated && (
          <Card className="card-cosmic mt-6">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Zap className="w-6 h-6 text-accent" />
                    AI Analysis
                  </CardTitle>
                  <CardDescription className="text-base">
                    Get personalized insights powered by AstroGPT AI
                  </CardDescription>
                </div>
                <CreditBadge credits={credits} />
              </div>
            </CardHeader>
            <CardContent>
              {analysisGenerated && aiAnalysis ? (
                <div className="space-y-6">
                  {/* Key Insights */}
                  <div>
                    <h4 className="font-semibold text-accent mb-4 text-xl">Key Insights</h4>
                    <div className="grid gap-4">
                      {aiAnalysis.insights.map((insight: string, index: number) => (
                        <div key={index} className="flex items-start gap-4 p-5 bg-muted/20 rounded-lg border border-border/30">
                          <div className="w-3 h-3 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-lg leading-relaxed text-foreground">
                            {insight}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Personality Traits */}
                  {aiAnalysis.personalityTraits.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-accent mb-4 text-xl">Personality Traits</h4>
                      <div className="grid gap-4">
                        {aiAnalysis.personalityTraits.map((trait: string, index: number) => (
                          <div key={index} className="flex items-start gap-4 p-5 bg-muted/20 rounded-lg border border-border/30">
                            <div className="w-3 h-3 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                            <p className="text-lg leading-relaxed text-foreground">
                              {trait}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Personal Life */}
                  {aiAnalysis.personalLife && aiAnalysis.personalLife.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-accent mb-4 text-xl">Personal Life</h4>
                      <div className="grid gap-4">
                        {aiAnalysis.personalLife.map((life: string, index: number) => (
                          <div key={index} className="flex items-start gap-4 p-5 bg-muted/20 rounded-lg border border-border/30">
                            <div className="w-3 h-3 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                            <p className="text-lg leading-relaxed text-foreground">
                              {life}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Work Life */}
                  {aiAnalysis.workLife && aiAnalysis.workLife.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-accent mb-4 text-xl">Work Life</h4>
                      <div className="grid gap-4">
                        {aiAnalysis.workLife.map((work: string, index: number) => (
                          <div key={index} className="flex items-start gap-4 p-5 bg-muted/20 rounded-lg border border-border/30">
                            <div className="w-3 h-3 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                            <p className="text-lg leading-relaxed text-foreground">
                              {work}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Life Path */}
                  {aiAnalysis.lifePath.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-accent mb-4 text-xl">Life Path & Purpose</h4>
                      <div className="grid gap-4">
                        {aiAnalysis.lifePath.map((path: string, index: number) => (
                          <div key={index} className="flex items-start gap-4 p-5 bg-muted/20 rounded-lg border border-border/30">
                            <div className="w-3 h-3 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                            <p className="text-lg leading-relaxed text-foreground">
                              {path}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Relationships */}
                  {aiAnalysis.relationships.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-accent mb-4 text-xl">Relationships</h4>
                      <div className="grid gap-4">
                        {aiAnalysis.relationships.map((rel: string, index: number) => (
                          <div key={index} className="flex items-start gap-4 p-5 bg-muted/20 rounded-lg border border-border/30">
                            <div className="w-3 h-3 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                            <p className="text-lg leading-relaxed text-foreground">
                              {rel}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Challenges & Opportunities */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {aiAnalysis.challenges.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-accent mb-4 text-xl">Challenges</h4>
                        <div className="grid gap-4">
                          {aiAnalysis.challenges.map((challenge: string, index: number) => (
                            <div key={index} className="flex items-start gap-4 p-5 bg-muted/20 rounded-lg border border-border/30">
                              <div className="w-3 h-3 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                              <p className="text-lg leading-relaxed text-foreground">
                                {challenge}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {aiAnalysis.opportunities.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-accent mb-4 text-xl">Opportunities</h4>
                        <div className="grid gap-4">
                          {aiAnalysis.opportunities.map((opportunity: string, index: number) => (
                            <div key={index} className="flex items-start gap-4 p-5 bg-muted/20 rounded-lg border border-border/30">
                              <div className="w-3 h-3 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                              <p className="text-lg leading-relaxed text-foreground">
                                {opportunity}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <Separator className="my-6" />
                  
                  <div className="bg-muted/20 rounded-lg p-4 border border-border/30">
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-accent">Disclaimer:</strong> This analysis is for entertainment 
                      and self-reflection purposes only. Astrology is not scientifically validated.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="relative mb-6">
                    <Sparkles className="w-16 h-16 text-accent mx-auto animate-pulse" />
                    <div className="absolute inset-0 w-16 h-16 bg-accent/20 rounded-full blur-xl animate-pulse"></div>
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Unlock Your Cosmic Insights</h3>
                  <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
                    Generate detailed AI insights about your birth chart and discover your cosmic potential
                  </p>
                  <Button 
                    onClick={handleGenerateAnalysis}
                    disabled={loading || credits < 3}
                    variant="aurora"
                    size="lg"
                    className="h-14 text-lg font-semibold px-8 btn-cosmic"
                  >
                    {loading ? (
                      <>
                        <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                        Generating Analysis...
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5 mr-2" />
                        Generate Analysis (3 Credits)
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}