import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Stars, 
  Heart, 
  Users, 
  Sparkles, 
  Zap, 
  Shield, 
  CheckCircle,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";
import cosmicHero from "@/assets/cosmic-hero.jpg";

export default function Landing() {
  const features = [
    {
      icon: Stars,
      title: "Birth Chart",
      description: "Generate precise birth charts using Swiss Ephemeris with AI-powered insights",
      credits: 3,
      color: "from-primary to-primary/70"
    },
    {
      icon: Heart,
      title: "Compatibility Analysis",
      description: "Discover relationship dynamics with synastry and composite charts",
      credits: 5,
      color: "from-accent to-accent/70"
    },
    {
      icon: Sparkles,
      title: "Soulmate Insights",
      description: "Explore soulmate tendencies with AI-generated personality sketches",
      credits: 12,
      color: "from-primary to-accent"
    }
  ];

  const plans = [
    {
      name: "Starter",
      credits: 20,
      price: 9.99,
      popular: false
    },
    {
      name: "Explorer",
      credits: 50,
      price: 19.99,
      popular: true
    },
    {
      name: "Mystic",
      credits: 120,
      price: 39.99,
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-cosmic">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${cosmicHero})` }}
        />
        <div className="absolute inset-0 bg-background/60" />
        
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <div className="mb-6 animate-float">
            <Stars className="w-16 h-16 mx-auto text-accent animate-twinkle" />
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground via-accent to-primary bg-clip-text text-transparent">
            Astral Lab
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Discover your cosmic blueprint with Swiss Ephemeris precision and AI-powered insights
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              variant="stellar" 
              size="lg" 
              className="text-lg px-8 py-4"
              asChild
            >
              <Link to="/solo">
                Generate Your Birth Chart
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            
            <Button 
              variant="cosmic" 
              size="lg" 
              className="text-lg px-8 py-4"
              asChild
            >
              <Link to="/compatibility">
                Check Compatibility
              </Link>
            </Button>
          </div>
          
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Shield className="w-4 h-4" />
            <span>Privacy-first • No data collection • Entertainment only</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Cosmic Features
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Explore the depths of astrology with cutting-edge technology
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-card/50 backdrop-blur-sm border-border/50 hover:shadow-cosmic transition-all duration-300 group">
                <CardHeader className="text-center">
                  <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 group-hover:animate-pulse`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Badge variant="secondary" className="bg-accent/20 text-accent">
                    <Sparkles className="w-3 h-3 mr-1" />
                    {feature.credits} Credits
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 bg-card/20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Choose Your Journey
            </h2>
            <p className="text-xl text-muted-foreground">
              Start with 1 free chart daily, upgrade for deeper insights
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.popular ? 'ring-2 ring-accent shadow-stellar' : 'bg-card/50'} backdrop-blur-sm border-border/50 hover:shadow-cosmic transition-all duration-300`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-aurora">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="text-3xl font-bold text-accent">
                    ${plan.price}
                  </div>
                  <CardDescription>
                    {plan.credits} Credits
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button 
                    variant={plan.popular ? "stellar" : "cosmic"} 
                    className="w-full mb-4"
                    asChild
                  >
                    <Link to="/buy-credits">
                      Get Credits
                    </Link>
                  </Button>
                  <div className="text-sm text-muted-foreground">
                    {Math.floor(plan.credits / 3)} Solo Charts
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-12 px-4 border-t border-border/50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-muted/20 rounded-lg p-6 border border-border/50">
            <p className="text-sm text-muted-foreground">
              <strong className="text-accent">Disclaimer:</strong> Astral Lab provides symbolic entertainment and personal reflection tools. 
              Astrology is not scientifically validated. Please do not use astrological insights for medical, 
              legal, financial, or other important life decisions.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}