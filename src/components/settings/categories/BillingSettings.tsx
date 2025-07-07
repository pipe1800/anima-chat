import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CreditCard } from 'lucide-react';

export const BillingSettings = () => {
  // This would typically come from your payment provider/database
  const paymentMethod = {
    type: 'card', // or 'paypal'
    cardType: 'Visa',
    lastFour: '4242',
    expiryMonth: '12',
    expiryYear: '25'
  };

  const renderPaymentMethod = () => {
    if (paymentMethod.type === 'paypal') {
      return (
        <div className="flex items-center">
          <div className="w-6 h-6 bg-blue-600 rounded mr-3 flex items-center justify-center">
            <span className="text-white text-xs font-bold">PP</span>
          </div>
          <div>
            <p className="text-white">PayPal</p>
            <p className="text-gray-400 text-sm">Connected account</p>
          </div>
        </div>
      );
    } else {
      return (
        <div className="flex items-center">
          <CreditCard className="w-6 h-6 text-gray-400 mr-3" />
          <div>
            <p className="text-white">{paymentMethod.cardType} ending in {paymentMethod.lastFour}</p>
            <p className="text-gray-400 text-sm">Expires {paymentMethod.expiryMonth}/{paymentMethod.expiryYear}</p>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Billing Settings</h2>
        <p className="text-gray-300">Manage your subscription and payment information</p>
      </div>

      <div className="space-y-6">
        {/* Current Plan */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Current Plan</h3>
          <div className="bg-gray-800/50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-white font-medium">Whale Tier</h4>
                <p className="text-gray-400 text-sm">16K context, unlimited characters</p>
              </div>
              <Badge className="bg-[#FF7A00] text-white">Active</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Next billing date: January 15, 2024</span>
              <span className="text-white font-semibold">$19.99/month</span>
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-800">
              Change Plan
            </Button>
            <Button variant="outline" className="border-red-600 text-red-400 hover:bg-red-600/10">
              Cancel Subscription
            </Button>
          </div>
        </div>

        <Separator className="bg-gray-700" />

        {/* Payment Method */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Payment Method</h3>
          <div className="bg-gray-800/50 rounded-lg p-4">
            {renderPaymentMethod()}
          </div>
          <Button variant="outline" className="mt-3 border-gray-600 text-white hover:bg-gray-800">
            Manage Payment Method
          </Button>
        </div>

        <Separator className="bg-gray-700" />

        {/* Billing History */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Billing History</h3>
          <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-800">
            View All Invoices
          </Button>
        </div>
      </div>
    </div>
  );
};
