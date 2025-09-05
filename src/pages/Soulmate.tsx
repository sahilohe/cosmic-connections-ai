import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Heart, 
  Star, 
  Users, 
  Sparkles, 
  Calendar,
  MapPin,
  Eye,
  Clock,
  Zap,
  Lightbulb,
  Crown,
  Gem,
  Camera
} from "lucide-react";
import { CreditBadge } from "@/components/CreditBadge";
import { InsufficientCreditsModal } from "@/components/InsufficientCreditsModal";
import { openAIService } from "@/lib/openai";
import { replicateService } from "@/lib/replicateService";
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

interface SoulmateAnalysis {
  idealSoulmate: string[];
  personalityTraits: string[];
  physicalCharacteristics: string[];
  meetingWindow: string[];
  howYoullMeet: string[];
  relationshipDynamics: string[];
  soulmateFacts: string[];
  timingInsights: string[];
}

export default function Soulmate() {
  const { credits, deductCredits } = useCredits();

  // User's birth data (should be loaded from previous session or context)
  const [userBirthData, setUserBirthData] = useState<BirthData | null>(null);
  const [userBirthChart, setUserBirthChart] = useState<any>(null);
  const [soulmateAnalysis, setSoulmateAnalysis] = useState<SoulmateAnalysis | null>(null);
  const [soulmateSketch, setSoulmateSketch] = useState<string | null>(null);
  const [sketchDescription, setSketchDescription] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sketchLoading, setSketchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisGenerated, setAnalysisGenerated] = useState(false);
  const [sketchGenerated, setSketchGenerated] = useState(false);
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

  const handleGenerateSoulmateAnalysis = async () => {
    if (!userBirthChart) {
      setError('Please generate your birth chart first on the Solo Analysis page');
      return;
    }

    // Check if user has enough credits
    if (credits < 4) {
      setInsufficientCreditsData({
        requiredCredits: 4,
        featureName: 'Soulmate Analysis'
      });
      setShowInsufficientCredits(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const analysis = await openAIService.analyzeSoulmate(userBirthData!, userBirthChart);
      setSoulmateAnalysis(analysis);
      setAnalysisGenerated(true);
      
      // Deduct 4 credits for soulmate analysis
      deductCredits(4);
    } catch (error) {
      console.error('Error generating soulmate analysis:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate soulmate analysis');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSoulmateSketch = async () => {
    if (!userBirthChart) {
      setError('Please generate your birth chart first on the Solo Analysis page');
      return;
    }

    // Check if user has enough credits
    if (credits < 6) {
      setInsufficientCreditsData({
        requiredCredits: 6,
        featureName: 'Soulmate Sketch'
      });
      setShowInsufficientCredits(true);
      return;
    }

    setSketchLoading(true);
    setError(null);

    try {
      // Test API key first
      const isApiKeyValid = await replicateService.testApiKey();
      if (!isApiKeyValid) {
        throw new Error('Invalid Replicate API key. Please check your .env file and ensure VITE_REPLICATE_API_KEY is set correctly.');
      }

      // First generate the soulmate description
      const description = await openAIService.generateSoulmateDescription(userBirthData!, userBirthChart);
      setSketchDescription(description);
      
      // Then generate the sketch using Replicate
      const sketchUrl = await replicateService.generateSoulmateSketch(description);
      setSoulmateSketch(sketchUrl);
      setSketchGenerated(true);
      
      // Scroll to top to show the focused sketch
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Deduct 6 credits for sketch generation
      deductCredits(6);
    } catch (error) {
      console.error('Error generating soulmate sketch:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate soulmate sketch');
    } finally {
      setSketchLoading(false);
    }
  };

  const closeSketchFocus = () => {
    setSketchGenerated(false);
  };

  return (
    <div className="min-h-screen bg-gradient-cosmic pt-24 pb-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Heart className="w-8 h-8 text-pink-500" />
            <h1 className="text-4xl md:text-5xl font-bold text-stellar-shine">
              Soulmate Analysis
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover your ideal soulmate through the stars. Learn about their personality, when you'll meet, and how your love story will unfold.
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
                Please go to the Solo Analysis page and generate your birth chart before using soulmate analysis.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* Soulmate Features - Side by Side */}
        {userBirthChart && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Discover Your Soulmate */}
            <Card className="border-2 border-pink-400/30 bg-gradient-to-br from-pink-500/5 via-purple-500/5 to-indigo-500/5 backdrop-blur-sm shadow-lg shadow-pink-500/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-pink-600">
                  <div className="p-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full shadow-lg">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  Discover Your Soulmate
                </CardTitle>
                <CardDescription className="text-pink-700/80">
                  Get detailed insights about your ideal soulmate, meeting timing, and love story
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handleGenerateSoulmateAnalysis}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 text-white py-6 text-xl font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 border-white/20"
                >
                  {loading ? (
                    <>
                      <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin mr-3" />
                      Analyzing Your Soulmate...
                    </>
                  ) : (
                    <>
                      <div className="p-1 bg-white/20 rounded-full mr-3">
                        <Heart className="w-6 h-6" />
                      </div>
                      Discover Your Soulmate (4 Credits)
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Soulmate Sketch Feature */}
            <Card className={`border-2 ${analysisGenerated ? 'border-indigo-400/30' : 'border-gray-300/30'} bg-gradient-to-br ${analysisGenerated ? 'from-indigo-500/5 via-blue-500/5 to-cyan-500/5' : 'from-gray-500/5 via-gray-400/5 to-gray-300/5'} backdrop-blur-sm shadow-lg ${analysisGenerated ? 'shadow-indigo-500/10' : 'shadow-gray-500/10'}`}>
              <CardHeader>
                <CardTitle className={`flex items-center gap-3 ${analysisGenerated ? 'text-indigo-600' : 'text-gray-500'}`}>
                  <div className={`p-2 bg-gradient-to-r ${analysisGenerated ? 'from-indigo-500 to-blue-500' : 'from-gray-400 to-gray-500'} rounded-full shadow-lg`}>
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                  Soulmate Sketch Generator
                  {!analysisGenerated && (
                    <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs">
                      Unlock Required
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className={`${analysisGenerated ? 'text-indigo-700/80' : 'text-gray-500/80'}`}>
                  {analysisGenerated 
                    ? "Generate an AI-powered pencil sketch of your ideal soulmate based on your birth chart"
                    : "Complete soulmate analysis first to unlock this feature"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!analysisGenerated ? (
                  <div className="text-center p-8">
                    <div className="p-4 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full w-fit mx-auto mb-4">
                      <Camera className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-600 mb-2">Locked Feature</h3>
                    <p className="text-gray-500 mb-4">
                      Complete the "Discover Your Soulmate" analysis first to unlock the sketch generator.
                    </p>
                    <Button 
                      disabled 
                      className="bg-gradient-to-r from-gray-400 to-gray-500 text-white opacity-50 cursor-not-allowed"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Generate Sketch (Locked)
                    </Button>
                  </div>
                ) : !sketchGenerated ? (
                  <div className="text-center">
                    <Button
                      onClick={handleGenerateSoulmateSketch}
                      disabled={sketchLoading || !userBirthChart}
                      className="bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500 hover:from-indigo-600 hover:via-blue-600 hover:to-cyan-600 text-white px-8 py-4 text-lg font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 border-white/20 w-full"
                    >
                      {sketchLoading ? (
                        <>
                          <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin mr-3" />
                          Generating Sketch... Takes around 15-20 seconds.
                        </>
                      ) : (
                        <>
                          <div className="p-1 bg-white/20 rounded-full mr-3">
                            <Camera className="w-5 h-5" />
                          </div>
                          Generate Soulmate Sketch (6 Credits)
                        </>
                      )}
                    </Button>
                    <p className="text-base text-indigo-700/80 font-medium mt-4">
                      Create a realistic pencil sketch of your ideal soulmate using AI
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Generated Sketch */}
                    <div className="text-center">
                      <h3 className="text-lg font-bold text-indigo-700 mb-3">Your Soulmate Sketch</h3>
                      <div className="bg-gradient-to-r from-indigo-50/70 to-blue-50/70 rounded-xl border-2 border-indigo-200/50 p-4">
                        {soulmateSketch && (
                          <img 
                            src={soulmateSketch} 
                            alt="Soulmate Sketch" 
                            className="max-w-full h-auto rounded-lg shadow-lg mx-auto"
                            style={{ maxHeight: '300px' }}
                          />
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    {sketchDescription && (
                      <div className="bg-gradient-to-r from-indigo-50/70 to-blue-50/70 rounded-xl border-2 border-indigo-200/50 p-3">
                        <h4 className="font-semibold text-indigo-700 mb-2 text-sm">AI Description:</h4>
                        <p className="text-indigo-600 text-xs">{sketchDescription}</p>
                      </div>
                    )}

                    {/* Regenerate Button */}
                    <div className="text-center">
                      <Button
                        onClick={handleGenerateSoulmateSketch}
                        disabled={sketchLoading}
                        variant="outline"
                        className="border-indigo-300 text-indigo-600 hover:bg-indigo-50 text-sm"
                      >
                        {sketchLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mr-2" />
                            Regenerating...
                          </>
                        ) : (
                          <>
                            <Camera className="w-4 h-4 mr-2" />
                            Generate New Sketch (6 Credits)
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Soulmate Results */}
        {soulmateAnalysis && analysisGenerated && (
          <div className={`space-y-6 transition-all duration-500 ${sketchGenerated ? 'blur-sm opacity-30 pointer-events-none' : 'blur-0 opacity-100'}`}>
            {/* Ideal Soulmate Overview */}
            <Card className="border-2 border-pink-400/50 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-indigo-500/10 backdrop-blur-sm shadow-2xl shadow-pink-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-center justify-center text-pink-600">
                  <div className="p-3 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full shadow-lg">
                    <Heart className="w-8 h-8 text-white" />
                  </div>
                  Your Ideal Soulmate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {soulmateAnalysis.idealSoulmate.map((insight, index) => (
                    <div key={index} className="p-5 bg-gradient-to-r from-pink-50/70 to-rose-50/70 rounded-xl border-2 border-pink-200/50 shadow-md hover:shadow-lg transition-all duration-300">
                      <p className="text-base font-medium text-pink-800">{insight}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Detailed Analysis Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personality Traits */}
              <Card className="border-2 border-purple-400/30 bg-gradient-to-br from-purple-500/5 via-violet-500/5 to-indigo-500/5 backdrop-blur-sm shadow-lg shadow-purple-500/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-purple-600">
                    <div className="p-2 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full shadow-lg">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    Personality Traits
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {soulmateAnalysis.personalityTraits.map((trait, index) => (
                      <div key={index} className="p-4 bg-gradient-to-r from-purple-50/70 to-violet-50/70 rounded-xl border-2 border-purple-200/50 shadow-md hover:shadow-lg transition-all duration-300">
                        <p className="text-sm font-medium text-purple-800">{trait}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Physical Characteristics */}
              <Card className="border-2 border-blue-400/30 bg-gradient-to-br from-blue-500/5 via-indigo-500/5 to-purple-500/5 backdrop-blur-sm shadow-lg shadow-blue-500/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-blue-600">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full shadow-lg">
                      <Eye className="w-5 h-5 text-white" />
                    </div>
                    Physical Characteristics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {soulmateAnalysis.physicalCharacteristics.map((characteristic, index) => (
                      <div key={index} className="p-4 bg-gradient-to-r from-blue-50/70 to-indigo-50/70 rounded-xl border-2 border-blue-200/50 shadow-md hover:shadow-lg transition-all duration-300">
                        <p className="text-sm font-medium text-blue-800">{characteristic}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Meeting Window */}
              <Card className="border-2 border-green-400/30 bg-gradient-to-br from-green-500/5 via-emerald-500/5 to-teal-500/5 backdrop-blur-sm shadow-lg shadow-green-500/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-green-600">
                    <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full shadow-lg">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    Meeting Window
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {soulmateAnalysis.meetingWindow.map((timing, index) => (
                      <div key={index} className="p-4 bg-gradient-to-r from-green-50/70 to-emerald-50/70 rounded-xl border-2 border-green-200/50 shadow-md hover:shadow-lg transition-all duration-300">
                        <p className="text-sm font-medium text-green-800">{timing}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* How You'll Meet */}
              <Card className="border-2 border-orange-400/30 bg-gradient-to-br from-orange-500/5 via-amber-500/5 to-yellow-500/5 backdrop-blur-sm shadow-lg shadow-orange-500/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-orange-600">
                    <div className="p-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full shadow-lg">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    How You'll Meet
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {soulmateAnalysis.howYoullMeet.map((meeting, index) => (
                      <div key={index} className="p-4 bg-gradient-to-r from-orange-50/70 to-amber-50/70 rounded-xl border-2 border-orange-200/50 shadow-md hover:shadow-lg transition-all duration-300">
                        <p className="text-sm font-medium text-orange-800">{meeting}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Relationship Dynamics & Soulmate Facts - Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Relationship Dynamics */}
              <Card className="border-2 border-rose-400/30 bg-gradient-to-br from-rose-500/5 via-pink-500/5 to-purple-500/5 backdrop-blur-sm shadow-lg shadow-rose-500/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-rose-600">
                    <div className="p-2 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full shadow-lg">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    Relationship Dynamics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {soulmateAnalysis.relationshipDynamics.map((dynamic, index) => (
                      <div key={index} className="p-4 bg-gradient-to-r from-rose-50/70 to-pink-50/70 rounded-xl border-2 border-rose-200/50 shadow-md hover:shadow-lg transition-all duration-300">
                        <p className="text-sm font-medium text-rose-800">{dynamic}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Soulmate Facts */}
              <Card className="border-2 border-indigo-400/30 bg-gradient-to-br from-indigo-500/5 via-blue-500/5 to-cyan-500/5 backdrop-blur-sm shadow-lg shadow-indigo-500/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-indigo-600">
                    <div className="p-2 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full shadow-lg">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    Soulmate Facts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {soulmateAnalysis.soulmateFacts.map((fact, index) => (
                      <div key={index} className="p-4 bg-gradient-to-r from-indigo-50/70 to-blue-50/70 rounded-xl border-2 border-indigo-200/50 shadow-md hover:shadow-lg transition-all duration-300">
                        <p className="text-sm font-medium text-indigo-800">{fact}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Timing Insights */}
            <Card className="border-2 border-yellow-400/30 bg-gradient-to-br from-yellow-500/5 via-amber-500/5 to-orange-500/5 backdrop-blur-sm shadow-lg shadow-yellow-500/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-yellow-600">
                  <div className="p-2 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full shadow-lg">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  Timing Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {soulmateAnalysis.timingInsights.map((insight, index) => (
                    <div key={index} className="p-5 bg-gradient-to-r from-yellow-50/70 to-amber-50/70 rounded-xl border-2 border-yellow-200/50 shadow-md hover:shadow-lg transition-all duration-300">
                      <p className="text-base font-medium text-yellow-800">{insight}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Focused Sketch Display - Shows when sketch is generated */}
        {sketchGenerated && soulmateSketch && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-indigo-500 to-blue-500 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-full">
                      <Camera className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Your Soulmate Sketch</h2>
                      <p className="text-indigo-100">AI-generated portrait based on your birth chart</p>
                    </div>
                  </div>
                  <Button
                    onClick={closeSketchFocus}
                    variant="ghost"
                    className="text-white hover:bg-white/20 rounded-full p-2"
                  >
                    <div className="w-6 h-6 text-xl">×</div>
                  </Button>
                </div>
              </div>

              {/* Sketch Content */}
              <div className="p-6">
                <div className="text-center">
                  <div className="bg-gradient-to-r from-indigo-50/70 to-blue-50/70 rounded-xl border-2 border-indigo-200/50 p-6 mb-6">
                    <img 
                      src={soulmateSketch} 
                      alt="Soulmate Sketch" 
                      className="max-w-full h-auto rounded-lg shadow-lg mx-auto"
                      style={{ maxHeight: '60vh' }}
                    />
                  </div>

                  {/* Description */}
                  {sketchDescription && (
                    <div className="bg-gradient-to-r from-indigo-50/70 to-blue-50/70 rounded-xl border-2 border-indigo-200/50 p-4 mb-6">
                      <h4 className="font-semibold text-indigo-700 mb-2">AI Description:</h4>
                      <p className="text-indigo-600 text-sm">{sketchDescription}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-4 justify-center">
                    <Button
                      onClick={handleGenerateSoulmateSketch}
                      disabled={sketchLoading}
                      className="bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white"
                    >
                      {sketchLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Regenerating...
                        </>
                      ) : (
                        <>
                          <Camera className="w-4 h-4 mr-2" />
                          Generate New Sketch (6 Credits)
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={closeSketchFocus}
                      variant="outline"
                      className="border-indigo-300 text-indigo-600 hover:bg-indigo-50"
                    >
                      Close Focus
                    </Button>
                  </div>
                </div>
              </div>
            </div>
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

