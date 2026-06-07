'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { validatePassword } from '../../utils/validation';
import PasswordStrengthMeter from '../../../components/PasswordStrengthMeter';
import PasswordRequirements from '../../../components/PasswordRequirements';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const { register, error } = useAuth();

  // Auto-generate username from email
  useEffect(() => {
    if (email && !username) {
      const emailUsername = email.split('@')[0];
      setUsername(emailUsername);
    }
  }, [email, username]);

  useEffect(() => {
    if (password) {
      const { errors } = validatePassword(password);
      setPasswordErrors(errors);
    } else {
      setPasswordErrors([]);
    }
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { isValid, errors } = validatePassword(password);
    if (!isValid) {
      setPasswordErrors(errors);
      return;
    }

    setIsLoading(true);
    try {
      await register(email, password, { firstName, lastName, username });
      // login() inside register redirects to the dashboard on success.
    } catch (err) {
      // Error is surfaced via AuthContext `error`.
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    'block w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring';

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="mb-8 flex flex-col items-center">
          <Link href="/" className="mb-6 flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <MapPin className="h-5 w-5" />
            </span>
            <span className="font-bold text-lg">Find a Meeting Spot</span>
          </Link>
          <h2 className="text-center text-2xl font-bold tracking-tight text-foreground">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/auth/login" className="font-medium text-primary hover:text-primary-hover">
              Sign in
            </Link>
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-lg bg-error/10 border border-error/20 p-3">
                <div className="text-sm text-error">{error}</div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="first-name" className="text-sm font-medium text-foreground">
                  First name
                </label>
                <input
                  id="first-name"
                  name="firstName"
                  type="text"
                  required
                  className={inputClass}
                  placeholder="Jane"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="last-name" className="text-sm font-medium text-foreground">
                  Last name
                </label>
                <input
                  id="last-name"
                  name="lastName"
                  type="text"
                  className={inputClass}
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="username" className="text-sm font-medium text-foreground">
                Username <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <input
                id="username"
                name="username"
                type="text"
                className={inputClass}
                placeholder="janedoe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="email-address" className="text-sm font-medium text-foreground">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={inputClass}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className={inputClass}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <PasswordStrengthMeter password={password} />
            <PasswordRequirements password={password} />

            <button
              type="submit"
              disabled={isLoading || passwordErrors.length > 0}
              className="relative w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
