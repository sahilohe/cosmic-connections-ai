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
  Zap 
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
}

export default function Solo() {
  const { credits, deductCredits } = useCredits();

  const [birthData, setBirthData] = useState<BirthData>({
    name: "",
    date: "",
    time: "",
    city: "",
    coordinates: null
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
    <div className="min-h-screen bg-gradient-cosmic py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Debug info */}

        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Stars className="w-8 h-8 text-accent animate-twinkle" />
            <div className="text-3xl md:text-4xl font-bold">Generate Birth Chart</div>
            <Stars className="w-8 h-8 text-accent animate-twinkle" />
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Generate your precise birth chart using Swiss Ephemeris calculations
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}
        
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Birth Data Form */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-accent" />
                Birth Information
              </CardTitle>
              <CardDescription>
                Enter your birth details for accurate chart calculation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Enter your name"
                  value={birthData.name}
                  onChange={(e) => setBirthData(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-background/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Birth Date
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={birthData.date}
                    onChange={(e) => setBirthData(prev => ({ ...prev, date: e.target.value }))}
                    className="bg-background/50"
                  />
                </div>
                <div>
                  <Label htmlFor="time" className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Birth Time
                  </Label>
                  <Input
                    id="time"
                    type="time"
                    value={birthData.time}
                    onChange={(e) => setBirthData(prev => ({ ...prev, time: e.target.value }))}
                    className="bg-background/50"
                  />
                </div>
              </div>

              <PlacesAutocomplete
                value={birthData.city}
                coordinates={birthData.coordinates}
                onChange={(city, coordinates) => 
                  setBirthData(prev => ({ 
                    ...prev, 
                    city,
                    coordinates 
                  }))
                }
                placeholder="Search for your birth city"
                label="Birth Location"
              />



              <div className="pt-4">
                <Button 
                  onClick={handleGenerateChart}
                  disabled={!birthData.name || !birthData.date || !birthData.coordinates || loading || credits < 1}
                  className="w-full"
                  variant="stellar"
                  size="lg"
                >
                  {loading && !chartGenerated ? (
                    <>
                      <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                      Calculating Chart...
                    </>
                  ) : (
                    <>
                      <Stars className="w-4 h-4 mr-2" />
                      Generate Chart (1 Credit)
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Chart Display */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stars className="w-5 h-5 text-accent" />
                Birth Chart
              </CardTitle>
              <CardDescription>
                Swiss Ephemeris precision calculations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {chartGenerated && birthChart ? (
                <div id="birth-chart-container" className="space-y-6">
                  {/* Enhanced Chart Wheel */}
                  <div className="aspect-square bg-gradient-nebula/20 rounded-full border-2 border-accent/30 flex items-center justify-center relative overflow-hidden p-4">
                    <ChartWheel size={280} data={birthChart} />
                  </div>

                  {/* Chart Data Display */}
                  <div className="space-y-4">
                    {/* Metadata */}
                    <div className="bg-muted/20 p-3 rounded-lg text-xs">
                      <p className="font-semibold text-accent mb-2">Chart Details</p>
                      <div className="grid grid-cols-2 gap-2">
                        <span>Julian Day:</span>
                        <span>{birthChart.metadata.julianDay}</span>
                        <span>Local Time:</span>
                        <span>{birthChart.metadata.localTime}</span>
                        <span>Timezone:</span>
                        <span>{birthChart.metadata.timezone}</span>
                        <span>Coordinates:</span>
                        <span>{birthChart.metadata.coordinates.lat.toFixed(4)}°, {birthChart.metadata.coordinates.lng.toFixed(4)}°</span>
                      </div>
                    </div>

                    {/* Angles */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-muted/20 p-3 rounded-lg">
                        <p className="font-semibold text-accent">Ascendant</p>
                        <p>{birthChart.ascendant.sign} {birthChart.ascendant.degreeInSign.toFixed(2)}°</p>
                        <p className="text-xs text-muted-foreground">{birthChart.ascendant.longitude.toFixed(3)}°</p>
                      </div>
                      <div className="bg-muted/20 p-3 rounded-lg">
                        <p className="font-semibold text-accent">Midheaven</p>
                        <p>{birthChart.midheaven.sign} {birthChart.midheaven.degreeInSign.toFixed(2)}°</p>
                        <p className="text-xs text-muted-foreground">{birthChart.midheaven.longitude.toFixed(3)}°</p>
                      </div>
                    </div>
                    
                    {/* Planetary Positions */}
                    <div className="bg-muted/20 p-3 rounded-lg">
                      <p className="font-semibold text-accent mb-2">Planetary Positions</p>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        {birthChart.planets.map((planet: any, index: number) => (
                          <div key={index} className="flex flex-col">
                            <div className="flex items-center gap-1">
                              <span className="text-lg">{planet.symbol}</span>
                              <span className="font-medium">{planet.planet}</span>
                              {planet.isRetrograde && <span className="text-red-500">℞</span>}
                            </div>
                            <span className="text-muted-foreground">{planet.sign} {planet.degreeInSign.toFixed(2)}°</span>
                            <span className="text-xs text-muted-foreground">H{planet.house}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* House Cusps */}
                    <div className="bg-muted/20 p-3 rounded-lg">
                      <p className="font-semibold text-accent mb-2">House Cusps</p>
                      <div className="grid grid-cols-4 gap-2 text-xs">
                        {birthChart.houses.map((house: any, index: number) => (
                          <div key={index} className="text-center">
                            <div className="font-medium">H{house.house}</div>
                            <div className="text-muted-foreground">{house.sign}</div>
                            <div className="text-xs text-muted-foreground">{house.degreeInSign.toFixed(1)}°</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Aspects */}
                    {birthChart.aspects.length > 0 && (
                      <div className="bg-muted/20 p-3 rounded-lg">
                        <p className="font-semibold text-accent mb-2">Major Aspects</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {birthChart.aspects.slice(0, 8).map((aspect: any, index: number) => (
                            <div key={index} className="flex justify-between">
                              <span>{aspect.planet1} {aspect.aspect} {aspect.planet2}</span>
                              <span className="text-muted-foreground">{aspect.orb.toFixed(1)}°</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-center">
                    <Button 
                      variant="cosmic" 
                      size="sm" 
                      className="px-8"
                      onClick={() => handleExportPNG()}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Exporting...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Export PNG
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="aspect-square bg-muted/20 rounded-lg border-2 border-dashed border-border flex items-center justify-center">
                  <div className="text-center">
                    <Stars className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Enter birth details and generate chart
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* AI Analysis Section */}
        {chartGenerated && (
          <Card className="mt-8 bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-accent" />
                    AI Analysis
                  </CardTitle>
                  <CardDescription>
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
                    <h4 className="font-semibold text-accent mb-3">Key Insights</h4>
                    <div className="grid gap-4">
                      {aiAnalysis.insights.map((insight: string, index: number) => (
                        <div key={index} className="flex items-start gap-3 p-4 bg-muted/20 rounded-lg border border-border/30">
                          <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-base leading-relaxed text-foreground">
                            {insight}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Personality Traits */}
                  {aiAnalysis.personalityTraits.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-accent mb-3">Personality Traits</h4>
                      <div className="grid gap-3">
                        {aiAnalysis.personalityTraits.map((trait: string, index: number) => (
                          <div key={index} className="flex items-start gap-3 p-4 bg-muted/20 rounded-lg border border-border/30">
                            <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                            <p className="text-base leading-relaxed text-foreground">
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
                      <h4 className="font-semibold text-accent mb-3">Personal Life</h4>
                      <div className="grid gap-3">
                        {aiAnalysis.personalLife.map((life: string, index: number) => (
                          <div key={index} className="flex items-start gap-3 p-4 bg-muted/20 rounded-lg border border-border/30">
                            <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                            <p className="text-base leading-relaxed text-foreground">
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
                      <h4 className="font-semibold text-accent mb-3">Work Life</h4>
                      <div className="grid gap-3">
                        {aiAnalysis.workLife.map((work: string, index: number) => (
                          <div key={index} className="flex items-start gap-3 p-4 bg-muted/20 rounded-lg border border-border/30">
                            <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                            <p className="text-base leading-relaxed text-foreground">
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
                      <h4 className="font-semibold text-accent mb-3">Life Path & Purpose</h4>
                      <div className="grid gap-3">
                        {aiAnalysis.lifePath.map((path: string, index: number) => (
                          <div key={index} className="flex items-start gap-3 p-4 bg-muted/20 rounded-lg border border-border/30">
                            <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                            <p className="text-base leading-relaxed text-foreground">
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
                      <h4 className="font-semibold text-accent mb-3">Relationships</h4>
                      <div className="grid gap-3">
                        {aiAnalysis.relationships.map((rel: string, index: number) => (
                          <div key={index} className="flex items-start gap-3 p-4 bg-muted/20 rounded-lg border border-border/30">
                            <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                            <p className="text-base leading-relaxed text-foreground">
                              {rel}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}



                  {/* Challenges & Opportunities */}
                  <div className="grid md:grid-cols-2 gap-4">
                    {aiAnalysis.challenges.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-accent mb-3">Challenges</h4>
                        <div className="grid gap-3">
                          {aiAnalysis.challenges.map((challenge: string, index: number) => (
                            <div key={index} className="flex items-start gap-3 p-4 bg-muted/20 rounded-lg border border-border/30">
                              <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                              <p className="text-base leading-relaxed text-foreground">
                                {challenge}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {aiAnalysis.opportunities.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-accent mb-3">Opportunities</h4>
                        <div className="grid gap-3">
                          {aiAnalysis.opportunities.map((opportunity: string, index: number) => (
                            <div key={index} className="flex items-start gap-3 p-4 bg-muted/20 rounded-lg border border-border/30">
                              <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                              <p className="text-base leading-relaxed text-foreground">
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
                    <p className="text-xs text-muted-foreground">
                      <strong className="text-accent">Disclaimer:</strong> This analysis is for entertainment 
                      and self-reflection purposes only. Astrology is not scientifically validated.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Sparkles className="w-12 h-12 text-accent mx-auto mb-4 animate-pulse" />
                  <p className="text-muted-foreground mb-6">
                    Generate detailed AI insights about your birth chart
                  </p>
                  <Button 
                    onClick={handleGenerateAnalysis}
                    disabled={loading || credits < 3}
                    variant="aurora"
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                        Generating Analysis...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
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