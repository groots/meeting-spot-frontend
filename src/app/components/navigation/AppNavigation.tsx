'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, MapPin, LogOut } from 'lucide-react';
import { useAuth } from '@/app/contexts/AuthContext';
import ThemeToggle from '../ThemeToggle';

const navLinks = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Create Meeting', href: '/create' },
  { name: 'Contacts', href: '/contacts' },
  { name: 'Subscription', href: '/subscription' },
  { name: 'Profile', href: '/profile' },
];

export default function AppNavigation() {
  const pathname = usePathname() || '';
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href || (href !== '/dashboard' && pathname.startsWith(href));

  // Logged-out: minimal public bar with sign in / sign up.
  if (!user) {
    return (
      <header className="sticky top-0 z-40 border-b border-border bg-surface/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-bold text-primary">
              <MapPin className="h-5 w-5" />
              <span>Find a Meeting Spot</span>
            </Link>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Link
                href="/auth/login"
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Sign in
              </Link>
              <Link
                href="/auth/register"
                className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary-hover"
              >
                Get started
              </Link>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/80 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-primary">
            <MapPin className="h-5 w-5" />
            <span className="hidden sm:inline">Find a Meeting Spot</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex md:items-center md:gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-surface-muted hover:text-foreground'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={logout}
              className="hidden md:inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-surface-muted hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-surface-muted hover:text-foreground"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-surface">
          <nav className="space-y-1 px-4 py-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block rounded-lg px-3 py-2 text-sm font-medium ${
                  isActive(link.href)
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-surface-muted hover:text-foreground'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <button
              onClick={() => {
                setMobileOpen(false);
                logout();
              }}
              className="flex w-full items-center gap-1.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-muted-foreground hover:bg-surface-muted hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
