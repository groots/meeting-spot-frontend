'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  ShieldCheck,
  Sparkles,
  Share2,
  ArrowRight,
  Send,
  Users,
} from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import ThemeToggle from './components/ThemeToggle';

const features = [
  {
    icon: MapPin,
    title: 'Perfect middlegrounds',
    body: 'Our algorithm finds the ideal meeting spot between everyone\u2019s locations, saving time and travel for all.',
    color: 'text-primary bg-primary/10',
  },
  {
    icon: ShieldCheck,
    title: 'Privacy first',
    body: 'Share a meeting point without revealing your exact address. You decide how much others can see.',
    color: 'text-secondary bg-secondary/10',
  },
  {
    icon: Sparkles,
    title: 'Smart suggestions',
    body: 'Get curated venue recommendations based on travel time, ratings, and the vibe you\u2019re after.',
    color: 'text-accent bg-accent/10',
  },
];

const steps = [
  { icon: Send, title: 'Send an invite', body: 'Enter your location and send a private link to whoever you\u2019re meeting.' },
  { icon: Users, title: 'They add theirs', body: 'Your contact adds their location \u2014 no account or app required.' },
  { icon: Share2, title: 'Meet in the middle', body: 'We surface the best venues at a fair midpoint and you pick one.' },
];

export default function Home() {
  const router = useRouter();
  const { user, token } = useAuth();
  const loggedIn = Boolean(user && token);

  const handleCreateClick = () => {
    router.push(loggedIn ? '/create' : '/auth/login');
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-surface/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <MapPin className="h-5 w-5" />
            </span>
            <span className="font-bold text-lg">Find a Meeting Spot</span>
          </Link>

          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/why-choose-us" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Why Choose Us
              </Link>
              <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </Link>
            </nav>
            <ThemeToggle />
            <div className="flex items-center gap-2">
              {loggedIn ? (
                <Link href="/dashboard" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary-hover">
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/auth/login" className="hidden sm:inline text-sm font-medium text-muted-foreground hover:text-foreground">
                    Log in
                  </Link>
                  <Link href="/auth/register" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary-hover">
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main>
        <section className="relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted-foreground mb-6">
                <Sparkles className="h-3.5 w-3.5 text-accent" />
                Meet halfway, every time
              </span>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.05] mb-6">
                Find the perfect spot to <span className="text-gradient">meet in the middle</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl">
                Send a link, let everyone add their location, and get smart venue
                suggestions at a fair midpoint &mdash; without the back-and-forth.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleCreateClick}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground shadow-sm hover:bg-primary-hover"
                >
                  Create a meeting spot
                  <ArrowRight className="h-4 w-4" />
                </button>
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center rounded-lg border border-border bg-surface px-6 py-3 font-medium text-foreground hover:bg-surface-muted"
                >
                  See pricing
                </Link>
              </div>
            </div>

            {/* Visual card */}
            <div className="relative">
              <div className="float-animation mx-auto max-w-sm">
                <div className="rounded-3xl border border-border bg-surface shadow-lg overflow-hidden">
                  <div className="bg-gradient-primary text-primary-foreground p-4 font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> Perfect middleground found
                  </div>
                  <div className="p-5 space-y-4">
                    <div className="rounded-xl bg-surface-muted p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground text-xs font-bold">You</span>
                        <span className="rounded-lg bg-accent/15 text-accent px-3 py-1.5 text-sm">Let&apos;s meet up! I&apos;m downtown.</span>
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <span className="rounded-lg bg-primary/15 text-primary px-3 py-1.5 text-sm">I&apos;m near Riverside.</span>
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">Alex</span>
                      </div>
                    </div>

                    <div className="rounded-xl border border-border p-4">
                      <p className="text-sm font-medium mb-3">Suggested meeting places</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between border-b border-border pb-2">
                          <span className="text-sm">Cafe Central</span>
                          <span className="rounded-full bg-success/15 text-success px-2 py-0.5 text-xs font-medium">5 min</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Park Plaza</span>
                          <span className="rounded-full bg-info/15 text-info px-2 py-0.5 text-xs font-medium">10 min</span>
                        </div>
                      </div>
                      <button className="mt-4 w-full rounded-lg bg-accent py-2 text-sm font-medium text-accent-foreground hover:bg-accent-hover">
                        Share meeting spot
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="bg-surface-muted py-20">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Why choose us?</h2>
            <p className="text-center text-muted-foreground mb-14 max-w-2xl mx-auto">
              Everything you need to coordinate a meet-up that works for everyone.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {features.map((f) => (
                <div key={f.title} className="rounded-xl border border-border bg-surface p-6 shadow-sm">
                  <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${f.color}`}>
                    <f.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                  <p className="text-muted-foreground">{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-14">How it works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {steps.map((s, i) => (
                <div key={s.title} className="relative rounded-xl border border-border bg-surface p-6">
                  <span className="absolute -top-3 left-6 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    {i + 1}
                  </span>
                  <s.icon className="h-7 w-7 text-primary mb-3 mt-2" />
                  <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
                  <p className="text-muted-foreground">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="pb-20">
          <div className="max-w-5xl mx-auto px-6">
            <div className="rounded-2xl bg-gradient-primary p-10 text-center text-primary-foreground shadow-lg">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">Ready to meet in the middle?</h2>
              <p className="opacity-90 mb-6">Create your first meeting spot in seconds &mdash; it&apos;s free to start.</p>
              <button
                onClick={handleCreateClick}
                className="inline-flex items-center gap-2 rounded-lg bg-surface px-6 py-3 font-medium text-foreground shadow-sm hover:bg-surface-muted"
              >
                Get started
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-surface">
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <MapPin className="h-4 w-4" />
              </span>
              <span className="font-bold">Find a Meeting Spot</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Finding the perfect meeting location has never been easier.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/why-choose-us" className="hover:text-foreground">Features</Link></li>
              <li><Link href="/pricing" className="hover:text-foreground">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/why-choose-us" className="hover:text-foreground">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-foreground">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/privacy-policy" className="hover:text-foreground">Privacy Policy</Link></li>
              <li><Link href="/terms-of-service" className="hover:text-foreground">Terms of Service</Link></li>
              <li><Link href="/data-deletion" className="hover:text-foreground">Data Deletion</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border">
          <div className="max-w-7xl mx-auto px-6 py-6 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Find a Meeting Spot. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
