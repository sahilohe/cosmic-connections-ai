import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  CreditCard, 
  Star, 
  Heart, 
  Users, 
  Sparkles,
  Zap,
  Check,
  Crown,
  Gem,
  Camera
} from "lucide-react";
import { CreditBadge } from "@/components/CreditBadge";
import { useCredits } from "@/contexts/CreditsContext";

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  popular?: boolean;
  bonus?: number;
  icon: React.ReactNode;
  color: string;
}

const creditPackages: CreditPackage[] = [
  {
    id: "starter",
    name: "Starter Pack",
    credits: 10,
    price: 4.99,
    icon: <Star className="w-6 h-6" />,
    color: "from-blue-500 to-indigo-500"
  },
  {
    id: "popular",
    name: "Popular Pack",
    credits: 25,
    price: 9.99,
    popular: true,
    bonus: 5,
    icon: <Heart className="w-6 h-6" />,
    color: "from-pink-500 to-purple-500"
  },
  {
    id: "premium",
    name: "Premium Pack",
    credits: 50,
    price: 17.99,
    bonus: 15,
    icon: <Crown className="w-6 h-6" />,
    color: "from-yellow-500 to-orange-500"
  },
  {
    id: "ultimate",
    name: "Ultimate Pack",
    credits: 100,
    price: 29.99,
    bonus: 40,
    icon: <Gem className="w-6 h-6" />,
    color: "from-purple-500 to-pink-500"
  }
];

const features = [
  { name: "Birth Chart Generation", cost: 1, icon: <Star className="w-4 h-4" /> },
  { name: "AI Personality Analysis", cost: 3, icon: <Sparkles className="w-4 h-4" /> },
  { name: "Partner Birth Chart", cost: 2, icon: <Users className="w-4 h-4" /> },
  { name: "Compatibility Analysis", cost: 5, icon: <Heart className="w-4 h-4" /> },
  { name: "Soulmate Analysis", cost: 4, icon: <Heart className="w-4 h-4" /> },
  { name: "Soulmate Sketch", cost: 6, icon: <Camera className="w-4 h-4" /> }
];

export default function BuyCredits() {
  const { credits } = useCredits();
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePurchase = async (packageId: string) => {
    setLoading(true);
    setSelectedPackage(packageId);
    
    // Simulate payment processing
    setTimeout(() => {
      setLoading(false);
      setSelectedPackage(null);
      // In a real app, you would integrate with a payment processor here
      alert("Payment integration coming soon! This is a demo.");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-cosmic pt-24 pb-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <CreditCard className="w-8 h-8 text-purple-500" />
            <h1 className="text-4xl md:text-5xl font-bold text-stellar-shine">
              Buy Credits
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            Unlock the full power of cosmic insights with our credit system. Get detailed astrological analysis and compatibility reports.
          </p>
          <div className="flex justify-center">
            <CreditBadge credits={credits} />
          </div>
        </div>

        {/* Current Credits Status */}
        <Card className="mb-8 border-2 border-purple-400/50 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-indigo-500/10 backdrop-blur-sm shadow-lg shadow-purple-500/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {credits} Credits
              </div>
              <p className="text-purple-700/80">
                {credits >= 10 ? "You have plenty of credits!" : credits >= 5 ? "You have some credits left" : "You're running low on credits"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Feature Costs */}
        <Card className="mb-8 border-2 border-blue-400/30 bg-gradient-to-br from-blue-500/5 via-indigo-500/5 to-purple-500/5 backdrop-blur-sm shadow-lg shadow-blue-500/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-blue-600">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full shadow-lg">
                <Zap className="w-5 h-5 text-white" />
              </div>
              Feature Costs
            </CardTitle>
            <CardDescription className="text-blue-700/80">
              See how many credits each feature requires
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="p-4 bg-gradient-to-r from-blue-50/70 to-indigo-50/70 rounded-xl border-2 border-blue-200/50 shadow-md">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-1 bg-gradient-to-r from-blue-400 to-indigo-400 rounded">
                      {feature.icon}
                    </div>
                    <span className="font-semibold text-blue-800">{feature.cost}</span>
                  </div>
                  <p className="text-sm text-blue-700">{feature.name}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Credit Packages */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {creditPackages.map((pkg) => (
            <Card 
              key={pkg.id} 
              className={`relative border-2 ${
                pkg.popular 
                  ? 'border-pink-400/50 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-indigo-500/10 shadow-xl shadow-pink-500/20' 
                  : 'border-purple-400/30 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-indigo-500/5 shadow-lg shadow-purple-500/10'
              } backdrop-blur-sm hover:shadow-2xl transition-all duration-300 transform hover:scale-105`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className={`mx-auto p-3 bg-gradient-to-r ${pkg.color} rounded-full w-fit mb-3`}>
                  {pkg.icon}
                </div>
                <CardTitle className="text-xl text-purple-600">{pkg.name}</CardTitle>
                <CardDescription className="text-purple-700/80">
                  {pkg.bonus ? `${pkg.credits + pkg.bonus} credits (${pkg.bonus} bonus)` : `${pkg.credits} credits`}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="text-center">
                <div className="mb-4">
                  <div className="text-3xl font-bold text-purple-600 mb-1">
                    ${pkg.price}
                  </div>
                  <div className="text-sm text-purple-700/80">
                    ${(pkg.price / (pkg.credits + (pkg.bonus || 0))).toFixed(2)} per credit
                  </div>
                </div>
                
                <Button
                  onClick={() => handlePurchase(pkg.id)}
                  disabled={loading && selectedPackage === pkg.id}
                  className={`w-full bg-gradient-to-r ${pkg.color} hover:opacity-90 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300`}
                >
                  {loading && selectedPackage === pkg.id ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Buy Now
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Benefits Section */}
        <Card className="border-2 border-green-400/30 bg-gradient-to-br from-green-500/5 via-emerald-500/5 to-teal-500/5 backdrop-blur-sm shadow-lg shadow-green-500/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-green-600">
              <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full shadow-lg">
                <Check className="w-5 h-5 text-white" />
              </div>
              Why Choose Our Credits?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4">
                <div className="p-3 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full w-fit mx-auto mb-3">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-green-700 mb-2">Professional Analysis</h3>
                <p className="text-sm text-green-600">Get detailed insights powered by Swiss Ephemeris and AI</p>
              </div>
              <div className="text-center p-4">
                <div className="p-3 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full w-fit mx-auto mb-3">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-blue-700 mb-2">Relationship Insights</h3>
                <p className="text-sm text-blue-600">Discover compatibility and relationship dynamics</p>
              </div>
              <div className="text-center p-4">
                <div className="p-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full w-fit mx-auto mb-3">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-purple-700 mb-2">Easy to Use</h3>
                <p className="text-sm text-purple-600">Simple credit system with transparent pricing</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
