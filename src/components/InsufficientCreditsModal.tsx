import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, 
  CreditCard, 
  Star, 
  Heart, 
  Users, 
  Sparkles,
  Zap
} from "lucide-react";
import { useCredits } from "@/contexts/CreditsContext";

interface InsufficientCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  requiredCredits: number;
  featureName: string;
  featureIcon?: React.ReactNode;
}

export function InsufficientCreditsModal({ 
  isOpen, 
  onClose, 
  requiredCredits, 
  featureName,
  featureIcon = <Star className="w-5 h-5" />
}: InsufficientCreditsModalProps) {
  const { credits } = useCredits();

  if (!isOpen) return null;

  const neededCredits = requiredCredits - credits;

  const quickPackages = [
    { credits: 10, price: 4.99, popular: false },
    { credits: 25, price: 9.99, popular: true },
    { credits: 50, price: 17.99, popular: false }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-2 border-orange-400/50 bg-gradient-to-br from-orange-500/10 via-red-500/10 to-pink-500/10 backdrop-blur-sm shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-full w-fit mb-3">
            <AlertTriangle className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-xl text-orange-600">Insufficient Credits</CardTitle>
          <CardDescription className="text-orange-700/80">
            You need {neededCredits} more credits to use {featureName}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Current Status */}
          <div className="p-4 bg-gradient-to-r from-orange-50/70 to-red-50/70 rounded-xl border-2 border-orange-200/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-gradient-to-r from-orange-400 to-red-400 rounded">
                  {featureIcon}
                </div>
                <span className="font-semibold text-orange-800">{featureName}</span>
              </div>
              <Badge variant="outline" className="border-orange-400 text-orange-600">
                {requiredCredits} credits
              </Badge>
            </div>
            <div className="text-sm text-orange-700">
              You have {credits} credits • Need {neededCredits} more
            </div>
          </div>

          {/* Quick Purchase Options */}
          <div>
            <h4 className="font-semibold text-orange-700 mb-3">Quick Purchase Options:</h4>
            <div className="space-y-2">
              {quickPackages.map((pkg, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50/50 to-red-50/50 rounded-lg border border-orange-200/50">
                  <div className="flex items-center gap-3">
                    <div className="p-1 bg-gradient-to-r from-orange-400 to-red-400 rounded">
                      <CreditCard className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-orange-800">
                        {pkg.credits} Credits
                        {pkg.popular && <Badge className="ml-2 bg-pink-500 text-white text-xs">Popular</Badge>}
                      </div>
                      <div className="text-sm text-orange-600">${pkg.price}</div>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                  >
                    Buy
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1 border-orange-300 text-orange-600 hover:bg-orange-50"
            >
              Maybe Later
            </Button>
            <Button 
              className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Buy Credits
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
