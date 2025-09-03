import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Settings, 
  Plus, 
  Minus, 
  RotateCcw, 
  Zap,
  Star,
  Heart,
  Users,
  Sparkles
} from "lucide-react";
import { useCredits } from "@/contexts/CreditsContext";

export function DeveloperCreditsPanel() {
  const { credits, addCredits, setCredits, resetCredits, isDeveloper } = useCredits();
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);

  if (!isDeveloper) {
    return null;
  }

  const handleAddCredits = (amount: number) => {
    addCredits(amount);
  };

  const handleSetCredits = (amount: number) => {
    setCredits(amount);
  };

  const handleCustomAdd = () => {
    const amount = parseInt(customAmount);
    if (!isNaN(amount) && amount > 0) {
      addCredits(amount);
      setCustomAmount("");
    }
  };

  const handleCustomSet = () => {
    const amount = parseInt(customAmount);
    if (!isNaN(amount) && amount >= 0) {
      setCredits(amount);
      setCustomAmount("");
    }
  };

  const quickAmounts = [5, 10, 25, 50, 100];

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Settings className="w-5 h-5" />
        </Button>
      ) : (
        <Card className="w-80 border-2 border-purple-400/50 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-indigo-500/10 backdrop-blur-sm shadow-2xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-purple-600">
                <div className="p-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded">
                  <Settings className="w-4 h-4 text-white" />
                </div>
                Dev Credits Panel
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-purple-600 hover:text-purple-700"
              >
                ×
              </Button>
            </div>
            <CardDescription className="text-purple-700/80">
              Developer mode - Manage credits for testing
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Current Credits Display */}
            <div className="text-center p-4 bg-gradient-to-r from-purple-50/70 to-pink-50/70 rounded-xl border-2 border-purple-200/50">
              <div className="text-3xl font-bold text-purple-600 mb-1">
                {credits}
              </div>
              <div className="text-sm text-purple-700/80 font-medium">
                Current Credits
              </div>
            </div>

            <Separator className="bg-purple-200/50" />

            {/* Quick Add Buttons */}
            <div>
              <Label className="text-sm font-semibold text-purple-700 mb-2 block">
                Quick Add Credits
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {quickAmounts.map((amount) => (
                  <Button
                    key={amount}
                    onClick={() => handleAddCredits(amount)}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-sm py-2"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    +{amount}
                  </Button>
                ))}
              </div>
            </div>

            <Separator className="bg-purple-200/50" />

            {/* Custom Amount */}
            <div>
              <Label className="text-sm font-semibold text-purple-700 mb-2 block">
                Custom Amount
              </Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Amount"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="bg-white/50 border-purple-300/50 focus:border-purple-400"
                />
                <Button
                  onClick={handleCustomAdd}
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-3"
                >
                  <Plus className="w-4 h-4" />
                </Button>
                <Button
                  onClick={handleCustomSet}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-3"
                >
                  <Zap className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <Separator className="bg-purple-200/50" />

            {/* Reset Button */}
            <Button
              onClick={resetCredits}
              className="w-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset to 3 Credits
            </Button>

            {/* Feature Costs Reference */}
            <div className="p-3 bg-gradient-to-r from-indigo-50/70 to-blue-50/70 rounded-lg border border-indigo-200/50">
              <div className="text-xs font-semibold text-indigo-700 mb-2">Feature Costs:</div>
              <div className="space-y-1 text-xs text-indigo-600">
                <div className="flex items-center gap-2">
                  <Star className="w-3 h-3" />
                  Birth Chart: 1 credit
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3 h-3" />
                  AI Analysis: 3 credits
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="w-3 h-3" />
                  Partner Chart: 2 credits
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-3 h-3" />
                  Compatibility: 5 credits
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
