"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { X, ArrowRight, Sparkles, BarChart3, Download } from "lucide-react";

const ONBOARDING_KEY = "subsight_onboarding_completed";

const steps = [
  {
    title: "Welcome to Subsight! 🎯",
    description:
      "Track all your subscriptions in one place. Your data stays private everything is stored locally in your browser.",
    icon: Sparkles,
  },
  {
    title: "AI Powered Assistant",
    description:
      "Just type a subscription name and click the sparkle icon. Our AI will auto fill all the details for you.",
    icon: Sparkles,
  },
  {
    title: "Visualize Your Spending",
    description:
      "See beautiful charts and insights about your monthly and annual subscription costs.",
    icon: BarChart3,
  },
  {
    title: "Export & Import",
    description:
      "Export your data to JSON, CSV, or PDF. Import existing subscriptions to get started quickly.",
    icon: Download,
  },
];

export function OnboardingTour() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const completed = localStorage.getItem(ONBOARDING_KEY);
    if (!completed) {
      setIsOpen(true);
    }
  }, []);

  const handleComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setIsOpen(false);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (!isOpen) return null;

  const step = steps[currentStep];
  const Icon = step.icon;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">{step.title}</CardTitle>
                <CardDescription className="text-xs mt-1">
                  Step {currentStep + 1} of {steps.length}
                </CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleSkip}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{step.description}</p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="ghost" onClick={handleSkip}>
            Skip Tour
          </Button>
          <Button onClick={handleNext}>
            {currentStep < steps.length - 1 ? (
              <>
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </>
            ) : (
              "Get Started"
            )}
          </Button>
        </CardFooter>
        <div className="px-6 pb-4">
          <div className="flex gap-1">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  idx <= currentStep ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
