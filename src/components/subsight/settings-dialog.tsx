"use client";

import { useState } from "react";
import { useSubscriptions } from "@/contexts/subscription-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Settings, Target, Globe, Tag } from "lucide-react";
import { CURRENCIES, Currency } from "@/lib/types";
import { getCurrencySymbol } from "@/lib/currency";
import { useToast } from "@/hooks/use-toast";

export function SettingsDialog() {
  const { 
    spendingGoals, 
    addSpendingGoal, 
    deleteSpendingGoal,
    customCategories,
    addCustomCategory,
    deleteCustomCategory,
    displayCurrency,
    setDisplayCurrency
  } = useSubscriptions();
  
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  
  // Goal form state
  const [goalType, setGoalType] = useState<'monthly' | 'annual'>('monthly');
  const [goalAmount, setGoalAmount] = useState('');
  const [goalCurrency, setGoalCurrency] = useState<Currency>('USD');
  
  // Category form state
  const [categoryName, setCategoryName] = useState('');
  const [categoryColor, setCategoryColor] = useState('#22c55e');

  const handleAddGoal = () => {
    if (!goalAmount) return;
    
    addSpendingGoal({
      type: goalType,
      amount: parseFloat(goalAmount),
      currency: goalCurrency,
    });
    
    setGoalAmount('');
    toast({ title: "Goal Added", description: `${goalType} spending goal created` });
  };

  const handleAddCategory = () => {
    if (!categoryName) return;
    
    addCustomCategory({
      name: categoryName,
      color: categoryColor,
      icon: 'tag',
    });
    
    setCategoryName('');
    toast({ title: "Category Added", description: `Custom category "${categoryName}" created` });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Manage your spending goals, custom categories, and preferences
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Currency Settings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Display Currency
              </CardTitle>
              <CardDescription>Choose your preferred currency for display</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={displayCurrency} onValueChange={(value) => setDisplayCurrency(value as Currency)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map(currency => (
                    <SelectItem key={currency} value={currency}>
                      {getCurrencySymbol(currency)} {currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Spending Goals */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="w-4 h-4" />
                Spending Goals
              </CardTitle>
              <CardDescription>Set monthly or annual spending limits</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Select value={goalType} onValueChange={(value: 'monthly' | 'annual') => setGoalType(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="annual">Annual</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  placeholder="Amount"
                  value={goalAmount}
                  onChange={(e) => setGoalAmount(e.target.value)}
                  className="flex-1"
                />
                <Select value={goalCurrency} onValueChange={(value) => setGoalCurrency(value as Currency)}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map(currency => (
                      <SelectItem key={currency} value={currency}>{currency}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleAddGoal} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-2">
                {spendingGoals.map(goal => (
                  <div key={goal.id} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                    <span className="text-sm">
                      {goal.type} limit: {getCurrencySymbol(goal.currency)}{goal.amount}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteSpendingGoal(goal.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Custom Categories */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Custom Categories
              </CardTitle>
              <CardDescription>Create your own subscription categories</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Category name"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="flex-1"
                />
                <input
                  type="color"
                  value={categoryColor}
                  onChange={(e) => setCategoryColor(e.target.value)}
                  className="w-12 h-10 rounded border"
                />
                <Button onClick={handleAddCategory} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {customCategories.map(category => (
                  <Badge
                    key={category.id}
                    variant="secondary"
                    className="flex items-center gap-1"
                    style={{ backgroundColor: category.color + '20', color: category.color }}
                  >
                    {category.name}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => deleteCustomCategory(category.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}