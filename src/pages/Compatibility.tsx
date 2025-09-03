import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  Heart, 
  MapPin, 
  Calendar, 
  Clock, 
  Sparkles, 
  Users,
  Star,
  TrendingUp,
  Lightbulb,
  Zap,
  Globe,
  Clock3
} from "lucide-react";
import { CreditBadge } from "@/components/CreditBadge";
import { PlacesAutocomplete } from "@/components/PlacesAutocomplete";
import { InsufficientCreditsModal } from "@/components/InsufficientCreditsModal";
import { openAIService } from "@/lib/openai";
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

interface CompatibilityAnalysis {
  compatibilityScore: number;
  overallInsights: string[];
  emotionalConnection: string[];
  communication: string[];
  sharedValues: string[];
  challenges: string[];
  opportunities: string[];
  funFacts: string[];
}

export default function Compatibility() {
  const { credits, deductCredits } = useCredits();

  // User's birth data (should be loaded from previous session or context)
  const [userBirthData, setUserBirthData] = useState<BirthData | null>(null);
  
  // Partner's birth data
  const [partnerBirthData, setPartnerBirthData] = useState<BirthData>({
    name: "",
    date: "",
    time: "",
    city: "",
    coordinates: null,
    timezone: undefined
  });

  const [userBirthChart, setUserBirthChart] = useState<any>(null);
  const [partnerBirthChart, setPartnerBirthChart] = useState<any>(null);
  const [compatibilityAnalysis, setCompatibilityAnalysis] = useState<CompatibilityAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisGenerated, setAnalysisGenerated] = useState(false);
  const [showInsufficientCredits, setShowInsufficientCredits] = useState(false);
  const [insufficientCreditsData, setInsufficientCreditsData] = useState<{
    requiredCredits: number;
    featureName: string;
  } | null>(null);

  // Load user's birth data from localStorage or context
  useEffect(() => {
    const savedUserData = localStorage.getItem('cosmic-connections-user-birth-data');
    const savedUserChart = localStorage.getItem('cosmic-connections-user-birth-chart');
    
    if (savedUserData) {
      setUserBirthData(JSON.parse(savedUserData));
    }
    if (savedUserChart) {
      setUserBirthChart(JSON.parse(savedUserChart));
    }
  }, []);

  const handlePartnerBirthDataChange = (field: keyof BirthData, value: any) => {
    setPartnerBirthData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGeneratePartnerChart = async () => {
    if (!partnerBirthData.name || !partnerBirthData.date || !partnerBirthData.time || !partnerBirthData.coordinates) {
      setError('Please fill in all partner details');
      return;
    }

    // Check if user has enough credits
    if (credits < 2) {
      setInsufficientCreditsData({
        requiredCredits: 2,
        featureName: 'Partner Birth Chart'
      });
      setShowInsufficientCredits(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const chartData = await swissEphemerisService.calculateBirthChart(partnerBirthData);
      setPartnerBirthChart(chartData);
      
      // Deduct 2 credits for partner chart generation
      deductCredits(2);
    } catch (error) {
      console.error('Error generating partner birth chart:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate partner birth chart');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCompatibilityAnalysis = async () => {
    if (!userBirthChart || !partnerBirthChart) {
      setError('Please generate both birth charts first');
      return;
    }

    // Check if user has enough credits
    if (credits < 5) {
      setInsufficientCreditsData({
        requiredCredits: 5,
        featureName: 'Compatibility Analysis'
      });
      setShowInsufficientCredits(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const analysis = await openAIService.analyzeCompatibility(
        userBirthData!, 
        partnerBirthData, 
        userBirthChart, 
        partnerBirthChart
      );
      setCompatibilityAnalysis(analysis);
      setAnalysisGenerated(true);
      
      // Deduct 5 credits for compatibility analysis
      deductCredits(5);
    } catch (error) {
      console.error('Error generating compatibility analysis:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate compatibility analysis');
    } finally {
      setLoading(false);
    }
  };

  const getCompatibilityColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    if (score >= 40) return "text-orange-500";
    return "text-red-500";
  };

  const getCompatibilityLabel = (score: number) => {
    if (score >= 80) return "Excellent Match";
    if (score >= 60) return "Good Match";
    if (score >= 40) return "Moderate Match";
    return "Challenging Match";
  };

  return (
    <div className="min-h-screen bg-gradient-cosmic pt-24 pb-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Heart className="w-8 h-8 text-pink-500" />
            <h1 className="text-4xl md:text-5xl font-bold text-stellar-shine">
              Compatibility Analysis
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover the cosmic connection between you and your partner through detailed astrological compatibility analysis
          </p>
          <div className="flex justify-center mt-4">
            <CreditBadge credits={credits} />
          </div>
        </div>

        {/* User Birth Chart Status */}
        {userBirthData && userBirthChart ? (
          <Card className="mb-6 border-2 border-emerald-400/50 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 backdrop-blur-sm shadow-lg shadow-emerald-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-600">
                <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full">
                  <Star className="w-5 h-5 text-white" />
                </div>
                Your Birth Chart Ready
              </CardTitle>
              <CardDescription className="text-white-700/80 font-medium">
                {userBirthData.name} - Born {userBirthData.date} at {userBirthData.time} in {userBirthData.city}
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <Card className="mb-6 border-2 border-amber-400/50 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 backdrop-blur-sm shadow-lg shadow-amber-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-600">
                <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full">
                  <Users className="w-5 h-5 text-white" />
                </div>
                Generate Your Birth Chart First
              </CardTitle>
              <CardDescription className="text-amber-700/80 font-medium">
                Please go to the Solo Analysis page and generate your birth chart before using compatibility analysis.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* Partner Birth Data Form */}
        <Card className="mb-6 border-2 border-pink-400/30 bg-gradient-to-br from-pink-500/5 via-purple-500/5 to-indigo-500/5 backdrop-blur-sm shadow-lg shadow-pink-500/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-pink-600">
              <div className="p-2 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full shadow-lg">
                <Heart className="w-5 h-5 text-white" />
              </div>
              Partner's Birth Information
            </CardTitle>
            <CardDescription className="text-pink-700/80 font-medium">
              Enter your partner's birth details to generate their birth chart
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="partner-name" className="text-base font-semibold flex items-center gap-2 text-pink-700">
                  <div className="p-1 bg-gradient-to-r from-pink-400 to-rose-400 rounded">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  Partner's Name
                </Label>
                <Input
                  id="partner-name"
                  placeholder="Enter partner's name"
                  value={partnerBirthData.name}
                  onChange={(e) => handlePartnerBirthDataChange('name', e.target.value)}
                  className="bg-gradient-to-r from-pink-50/50 to-purple-50/50 border-pink-300/50 text-base h-12 input-cosmic focus:border-pink-400 focus:ring-pink-400/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="partner-date" className="text-base font-semibold flex items-center gap-2 text-purple-700">
                  <div className="p-1 bg-gradient-to-r from-purple-400 to-indigo-400 rounded">
                    <Calendar className="w-4 h-4 text-white" />
                  </div>
                  Birth Date
                </Label>
                <Input
                  id="partner-date"
                  type="date"
                  value={partnerBirthData.date}
                  onChange={(e) => handlePartnerBirthDataChange('date', e.target.value)}
                  className="bg-gradient-to-r from-purple-50/50 to-indigo-50/50 border-purple-300/50 text-base h-12 input-cosmic focus:border-purple-400 focus:ring-purple-400/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="partner-time" className="text-base font-semibold flex items-center gap-2 text-indigo-700">
                  <div className="p-1 bg-gradient-to-r from-indigo-400 to-blue-400 rounded">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  Birth Time
                </Label>
                <Input
                  id="partner-time"
                  type="time"
                  value={partnerBirthData.time}
                  onChange={(e) => handlePartnerBirthDataChange('time', e.target.value)}
                  className="bg-gradient-to-r from-indigo-50/50 to-blue-50/50 border-indigo-300/50 text-base h-12 input-cosmic focus:border-indigo-400 focus:ring-indigo-400/20"
                />
              </div>

              <div className="space-y-2">
                <PlacesAutocomplete
                  value={partnerBirthData.city}
                  onChange={(city, coordinates, timezone) => {
                    handlePartnerBirthDataChange('city', city);
                    handlePartnerBirthDataChange('coordinates', coordinates);
                    handlePartnerBirthDataChange('timezone', timezone);
                  }}
                  placeholder="Search for partner's birth city"
                  label="Birth City"
                  coordinates={partnerBirthData.coordinates}
                  timezone={partnerBirthData.timezone}
                />
              </div>
            </div>

            <div className="flex justify-center">
              <Button
                onClick={handleGeneratePartnerChart}
                disabled={loading || !partnerBirthData.name || !partnerBirthData.date || !partnerBirthData.time || !partnerBirthData.coordinates}
                className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 text-white px-10 py-4 text-lg font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 border-white/20"
              >
                {loading ? (
                  <>
                    <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin mr-3" />
                    Generating Partner Chart...
                  </>
                ) : (
                  <>
                    <div className="p-1 bg-white/20 rounded-full mr-3">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    Generate Partner Chart (2 Credits)
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Partner Birth Chart Status */}
        {partnerBirthChart && (
          <Card className="mb-6 border-2 border-emerald-400/50 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 backdrop-blur-sm shadow-lg shadow-emerald-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-600">
                <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full">
                  <Star className="w-5 h-5 text-white" />
                </div>
                Partner's Birth Chart Ready
              </CardTitle>
              <CardDescription className="text-emerald-700/80 font-medium">
                {partnerBirthData.name} - Born {partnerBirthData.date} at {partnerBirthData.time} in {partnerBirthData.city}
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* Compatibility Analysis Button */}
        {userBirthChart && partnerBirthChart && (
          <Card className="mb-6 border-2 border-rose-400/30 bg-gradient-to-br from-rose-500/5 via-pink-500/5 to-purple-500/5 backdrop-blur-sm shadow-lg shadow-rose-500/10">
            <CardContent className="pt-6">
              <div className="text-center">
                <Button
                  onClick={handleGenerateCompatibilityAnalysis}
                  disabled={loading}
                  className="bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 hover:from-rose-600 hover:via-pink-600 hover:to-purple-600 text-white px-16 py-5 text-2xl font-bold rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 border-2 border-white/20"
                >
                  {loading ? (
                    <>
                      <div className="w-7 h-7 border-3 border-white border-t-transparent rounded-full animate-spin mr-4" />
                      Analyzing Compatibility...
                    </>
                  ) : (
                    <>
                      <div className="p-2 bg-white/20 rounded-full mr-4">
                        <Heart className="w-7 h-7" />
                      </div>
                      Analyze Compatibility (5 Credits)
                    </>
                  )}
                </Button>
                <p className="text-base text-rose-700/80 font-medium mt-4">
                  Get detailed compatibility insights, relationship dynamics, and fun facts
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Compatibility Results */}
        {compatibilityAnalysis && analysisGenerated && (
          <div className="space-y-6">
            {/* Compatibility Score */}
            <Card className="border-2 border-pink-400/50 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-indigo-500/10 backdrop-blur-sm shadow-2xl shadow-pink-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-center justify-center text-pink-600">
                  <div className="p-3 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full shadow-lg">
                    <Heart className="w-8 h-8 text-white" />
                  </div>
                  Compatibility Score
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="mb-6">
                  <div className={`text-8xl font-black ${getCompatibilityColor(compatibilityAnalysis.compatibilityScore)} drop-shadow-lg`}>
                    {compatibilityAnalysis.compatibilityScore}%
                  </div>
                  <div className={`text-2xl font-bold ${getCompatibilityColor(compatibilityAnalysis.compatibilityScore)} mt-2`}>
                    {getCompatibilityLabel(compatibilityAnalysis.compatibilityScore)}
                  </div>
                </div>
                <div className="mb-6">
                  <Progress 
                    value={compatibilityAnalysis.compatibilityScore} 
                    className="h-4 bg-white/20"
                  />
                </div>
                <p className="text-pink-700/80 font-medium text-lg">
                  Based on astrological analysis of both birth charts
                </p>
              </CardContent>
            </Card>

            {/* Overall Insights */}
            <Card className="border-2 border-yellow-400/30 bg-gradient-to-br from-yellow-500/5 via-amber-500/5 to-orange-500/5 backdrop-blur-sm shadow-lg shadow-yellow-500/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-yellow-600">
                  <div className="p-2 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full shadow-lg">
                    <Lightbulb className="w-6 h-6 text-white" />
                  </div>
                  Overall Compatibility Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {compatibilityAnalysis.overallInsights.map((insight, index) => (
                    <div key={index} className="p-5 bg-gradient-to-r from-yellow-50/70 to-amber-50/70 rounded-xl border-2 border-yellow-200/50 shadow-md hover:shadow-lg transition-all duration-300">
                      <p className="text-base font-medium text-yellow-800">{insight}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Detailed Analysis Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Emotional Connection */}
              <Card className="border-2 border-pink-400/30 bg-gradient-to-br from-pink-500/5 via-rose-500/5 to-red-500/5 backdrop-blur-sm shadow-lg shadow-pink-500/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-pink-600">
                    <div className="p-2 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full shadow-lg">
                      <Heart className="w-5 h-5 text-white" />
                    </div>
                    Emotional Connection
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {compatibilityAnalysis.emotionalConnection.map((item, index) => (
                      <div key={index} className="p-4 bg-gradient-to-r from-pink-50/70 to-rose-50/70 rounded-xl border-2 border-pink-200/50 shadow-md hover:shadow-lg transition-all duration-300">
                        <p className="text-sm font-medium text-pink-800">{item}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Communication */}
              <Card className="border-2 border-blue-400/30 bg-gradient-to-br from-blue-500/5 via-indigo-500/5 to-purple-500/5 backdrop-blur-sm shadow-lg shadow-blue-500/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-blue-600">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full shadow-lg">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    Communication
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {compatibilityAnalysis.communication.map((item, index) => (
                      <div key={index} className="p-4 bg-gradient-to-r from-blue-50/70 to-indigo-50/70 rounded-xl border-2 border-blue-200/50 shadow-md hover:shadow-lg transition-all duration-300">
                        <p className="text-sm font-medium text-blue-800">{item}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Shared Values */}
              <Card className="border-2 border-green-400/30 bg-gradient-to-br from-green-500/5 via-emerald-500/5 to-teal-500/5 backdrop-blur-sm shadow-lg shadow-green-500/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-green-600">
                    <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full shadow-lg">
                      <Star className="w-5 h-5 text-white" />
                    </div>
                    Shared Values
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {compatibilityAnalysis.sharedValues.map((item, index) => (
                      <div key={index} className="p-4 bg-gradient-to-r from-green-50/70 to-emerald-50/70 rounded-xl border-2 border-green-200/50 shadow-md hover:shadow-lg transition-all duration-300">
                        <p className="text-sm font-medium text-green-800">{item}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Challenges */}
              <Card className="border-2 border-orange-400/30 bg-gradient-to-br from-orange-500/5 via-amber-500/5 to-yellow-500/5 backdrop-blur-sm shadow-lg shadow-orange-500/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-orange-600">
                    <div className="p-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full shadow-lg">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    Growth Areas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {compatibilityAnalysis.challenges.map((item, index) => (
                      <div key={index} className="p-4 bg-gradient-to-r from-orange-50/70 to-amber-50/70 rounded-xl border-2 border-orange-200/50 shadow-md hover:shadow-lg transition-all duration-300">
                        <p className="text-sm font-medium text-orange-800">{item}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Opportunities */}
            <Card className="border-2 border-purple-400/30 bg-gradient-to-br from-purple-500/5 via-violet-500/5 to-indigo-500/5 backdrop-blur-sm shadow-lg shadow-purple-500/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-purple-600">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full shadow-lg">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  Opportunities & Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {compatibilityAnalysis.opportunities.map((item, index) => (
                    <div key={index} className="p-5 bg-gradient-to-r from-purple-50/70 to-violet-50/70 rounded-xl border-2 border-purple-200/50 shadow-md hover:shadow-lg transition-all duration-300">
                      <p className="text-base font-medium text-purple-800">{item}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Fun Facts */}
            <Card className="border-2 border-indigo-400/30 bg-gradient-to-br from-indigo-500/5 via-blue-500/5 to-cyan-500/5 backdrop-blur-sm shadow-lg shadow-indigo-500/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-indigo-600">
                  <div className="p-2 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full shadow-lg">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  Fun Astrological Facts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {compatibilityAnalysis.funFacts.map((fact, index) => (
                    <div key={index} className="p-5 bg-gradient-to-r from-indigo-50/70 to-blue-50/70 rounded-xl border-2 border-indigo-200/50 shadow-md hover:shadow-lg transition-all duration-300">
                      <p className="text-base font-medium text-indigo-800">{fact}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <Card className="border-2 border-red-400/50 bg-gradient-to-r from-red-500/10 via-rose-500/10 to-pink-500/10 backdrop-blur-sm shadow-lg shadow-red-500/20">
            <CardContent className="pt-6">
              <div className="text-center text-red-600">
                <div className="p-3 bg-gradient-to-r from-red-500 to-rose-500 rounded-full w-fit mx-auto mb-4">
                  <div className="w-6 h-6 text-white">⚠️</div>
                </div>
                <p className="font-bold text-lg">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Insufficient Credits Modal */}
        {insufficientCreditsData && (
          <InsufficientCreditsModal
            isOpen={showInsufficientCredits}
            onClose={() => {
              setShowInsufficientCredits(false);
              setInsufficientCreditsData(null);
            }}
            requiredCredits={insufficientCreditsData.requiredCredits}
            featureName={insufficientCreditsData.featureName}
            featureIcon={<Heart className="w-5 h-5" />}
          />
        )}
      </div>
    </div>
  );
}
