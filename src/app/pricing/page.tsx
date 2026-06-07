'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

type PriceFrequency = 'monthly' | 'yearly';

// Define a type for the price structure
interface PriceTier {
  monthly: string;
  yearly?: string; // Make yearly optional for future expansion
}

// Features for each tier
const tiers = [
  {
    name: 'Free',
    id: 'free',
    price: { monthly: '$0', yearly: '$0' } as PriceTier,
    description: 'Perfect for occasional meetups',
    features: [
      'Create up to 3 meeting requests per month',
      'One meeting location type per request',
      'Basic location recommendations',
      'Email support'
    ],
    ctaText: 'Start with Free',
    mostPopular: false
  },
  {
    name: 'Basic',
    id: 'basic',
    price: { monthly: '$5.99', yearly: '$59.99' } as PriceTier,
    description: 'For regular social and business meetups',
    features: [
      'Create up to 15 meeting requests per month',
      'Multiple meeting location types',
      'Advanced location recommendations',
      'Contact management',
      'Priority email support'
    ],
    ctaText: 'Subscribe to Basic',
    mostPopular: true
  },
  {
    name: 'Premium',
    id: 'premium',
    price: { monthly: '$12.99', yearly: '$129.99' } as PriceTier,
    description: 'For professionals and frequent meetups',
    features: [
      'Unlimited meeting requests',
      'All location types with premium venues',
      'Premium location recommendations',
      'Advanced contact management',
      'Priority email and chat support',
      'Calendar integrations',
      'Custom meeting templates'
    ],
    ctaText: 'Subscribe to Premium',
    mostPopular: false
  }
];

export default function PricingPage() {
  const [frequency] = useState<PriceFrequency>('monthly'); // For future expansion to annual pricing
  const { user, token } = useAuth();

  return (
    <div className="bg-background py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            <span className="text-gradient">Pricing Plans</span>
          </h1>
          <p className="mt-6 text-xl text-muted-foreground">
            Choose the perfect plan that works for your meeting needs
          </p>
        </div>

        {/* Pricing Tiers */}
        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`flex flex-col rounded-3xl bg-surface shadow-lg transition-all hover:shadow-xl ${
                tier.mostPopular ? 'border-2 border-primary ring-2 ring-primary ring-opacity-20' : 'border border-border'
              }`}
            >
              <div className="p-8 sm:p-10">
                {tier.mostPopular && (
                  <div className="inline-block rounded-full bg-primary/10 px-4 py-1 text-sm font-semibold text-primary">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold text-foreground mt-4">{tier.name}</h3>
                <p className="mt-4 text-sm text-muted-foreground">{tier.description}</p>
                <p className="mt-6">
                  <span className="text-5xl font-extrabold text-foreground">{tier.price[frequency]}</span>
                  <span className="text-base font-medium text-muted-foreground">/month</span>
                </p>
              </div>

              <div className="flex flex-1 flex-col justify-between px-8 pt-6 pb-8 sm:px-10 sm:pt-6">
                <ul className="space-y-4">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <div className="flex-shrink-0">
                        <CheckIcon className="h-6 w-6 text-success" aria-hidden="true" />
                      </div>
                      <p className="ml-3 text-base text-foreground">{feature}</p>
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  <Link
                    href={user && token ? `/subscription?plan=${tier.id}` : '/auth/login?redirect=/subscription'}
                    className={`block w-full rounded-md px-4 py-3 text-center text-base font-medium transition-colors ${
                      tier.mostPopular
                        ? 'bg-primary text-primary-foreground hover:bg-primary-hover'
                        : 'bg-accent text-accent-foreground hover:bg-accent-hover'
                    }`}
                  >
                    {tier.ctaText}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FAQs */}
        <div className="mt-20">
          <h2 className="text-3xl font-extrabold text-center mb-12 text-foreground">
            Frequently Asked Questions
          </h2>

          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold text-foreground">Can I change plans?</h3>
              <p className="mt-2 text-muted-foreground">
                Yes, you can upgrade or downgrade your plan at any time. Your new plan will take effect immediately, and we'll adjust your billing accordingly.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-foreground">What happens when I exceed my monthly meeting limit?</h3>
              <p className="mt-2 text-muted-foreground">
                Once you reach your monthly meeting limit, you'll need to wait until your next billing cycle or upgrade to a higher tier to create more meetings.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-foreground">How do I cancel my subscription?</h3>
              <p className="mt-2 text-muted-foreground">
                You can cancel your subscription at any time from your subscription management page. Your plan will remain active until the end of your current billing period.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-foreground">What payment methods do you accept?</h3>
              <p className="mt-2 text-muted-foreground">
                We accept all major credit cards through our secure payment processor, Stripe.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 