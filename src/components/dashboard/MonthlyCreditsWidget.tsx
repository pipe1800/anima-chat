import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Zap, CreditCard } from 'lucide-react';

interface MonthlyCreditsWidgetProps {
  creditsUsed: number;
  currentBalance: number;
  monthlyAllowance: number;
}

export function MonthlyCreditsWidget({ creditsUsed, currentBalance, monthlyAllowance }: MonthlyCreditsWidgetProps) {
  const usagePercentage = monthlyAllowance > 0 ? (creditsUsed / monthlyAllowance) * 100 : 0;
  
  return (
    <Card className="bg-[#1a1a2e] border-gray-700/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-white text-lg flex items-center gap-2">
          <Zap className="w-5 h-5 text-[#FF7A00]" />
          Credit Balance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Current Balance</span>
            <span className="text-white font-medium">
              {currentBalance.toLocaleString()} credits
            </span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Used This Month</span>
            <span className="text-white font-medium">
              {creditsUsed.toLocaleString()} / {monthlyAllowance.toLocaleString()}
            </span>
          </div>
          
          <Progress 
            value={usagePercentage} 
            className="h-2 bg-gray-700"
            style={{
              '--progress-background': '#FF7A00'
            } as React.CSSProperties}
          />
        </div>
        
        <div className="text-xs text-gray-500">
          Credits accumulate monthly and never expire
        </div>
        
        <Button
          variant="link"
          className="text-[#FF7A00] hover:text-[#FF7A00]/80 p-0 h-auto text-sm flex items-center gap-1"
        >
          <CreditCard className="w-3 h-3" />
          Upgrade for More Credits
        </Button>
      </CardContent>
    </Card>
  );
}