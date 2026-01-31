import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { z } from 'zod';

const searchSchema = z.object({
  invitation: z.string().optional(),
});

export const Route = createFileRoute('/auth/signup')({
  validateSearch: searchSchema,
  component: SignUpPage,
});

function SignUpPage() {
  const navigate = useNavigate();
  const { invitation } = Route.useSearch();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Send magic link request with invitation code
      await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/auth/magic-link`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, invitationCode: invitation }),
        },
      ).then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || 'Failed to send magic link');
        }
      });

      setMessage({
        type: 'success',
        text: 'Check your email for a magic link to complete your signup!',
      });
      setEmail('');
    } catch (error) {
      console.error('Signup error:', error);
      setMessage({
        type: 'error',
        text:
          error instanceof Error ? error.message : 'Failed to send signup link',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Invitation Required
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You need an invitation link to sign up for Cosmoslide.
          </p>
          <button
            onClick={() => navigate({ to: '/auth/signin' })}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Already have an account? Sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome to Cosmoslide
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            You've been invited to join! Enter your email to get started.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>

            {message && (
              <div
                className={`p-4 rounded-lg ${
                  message.type === 'success'
                    ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                    : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                }`}
              >
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? 'Sending...' : 'Continue with Email'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate({ to: '/auth/signin' })}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Already have an account? Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
