import { createFileRoute, Link } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { invitationApi, Invitation } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { RequireAuth } from '@/components/RequireAuth';
import AppLayout from '@/components/AppLayout';

export const Route = createFileRoute('/invitations')({
  component: InvitationsPage,
});

function InvitationsPage() {
  const { user: currentUser } = useAuth();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [quota, setQuota] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      const data = await invitationApi.getInvitations();
      setInvitations(data.invitations);
      setQuota(data.quota);
    } catch (error) {
      console.error('Failed to fetch invitations:', error);
      setStatusMessage({
        type: 'error',
        text: 'Failed to load invitations',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setSending(true);
    setStatusMessage(null);

    try {
      await invitationApi.sendInvitation(
        email.trim(),
        message.trim() || undefined,
      );
      setStatusMessage({
        type: 'success',
        text: `Invitation sent to ${email}`,
      });
      setEmail('');
      setMessage('');
      // Refresh invitations list and quota
      fetchInvitations();
    } catch (error) {
      console.error('Failed to send invitation:', error);
      setStatusMessage({
        type: 'error',
        text:
          error instanceof Error ? error.message : 'Failed to send invitation',
      });
    } finally {
      setSending(false);
    }
  };

  const getInvitationStatus = (
    invitation: Invitation,
  ): { label: string; color: string } => {
    if (invitation.usedCount >= invitation.maxUses) {
      return {
        label: 'Used',
        color:
          'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      };
    }
    if (new Date(invitation.expiresAt) < new Date()) {
      return {
        label: 'Expired',
        color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      };
    }
    return {
      label: 'Pending',
      color:
        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
    };
  };

  return (
    <AppLayout>
      <RequireAuth>
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Invitations
                  </h1>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Invite new users to join Cosmoslide
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Quota:
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      quota > 0
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {quota} remaining
                  </span>
                </div>
              </div>
            </div>

            {/* Send Invitation Form */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md mb-6">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Send Invitation
                </h2>
              </div>
              <form onSubmit={handleSendInvitation} className="p-6 space-y-4">
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
                    disabled={quota <= 0 || sending}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="friend@example.com"
                  />
                </div>
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Personal Message (optional)
                  </label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    maxLength={500}
                    disabled={quota <= 0 || sending}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Add a personal message to your invitation..."
                  />
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {message.length}/500 characters
                  </p>
                </div>

                {statusMessage && (
                  <div
                    className={`p-4 rounded-lg ${
                      statusMessage.type === 'success'
                        ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                        : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                    }`}
                  >
                    {statusMessage.text}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={quota <= 0 || sending || !email.trim()}
                  className="w-full px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {sending
                    ? 'Sending...'
                    : quota <= 0
                      ? 'No Quota Available'
                      : 'Send Invitation'}
                </button>

                {quota <= 0 && (
                  <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                    You don't have any invitation quota. Contact an
                    administrator to request more.
                  </p>
                )}
              </form>
            </div>

            {/* Invitations List */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Sent Invitations
                </h2>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {invitations.length === 0 ? (
                  <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                    You haven't sent any invitations yet.
                  </div>
                ) : (
                  invitations.map((invitation) => {
                    const status = getInvitationStatus(invitation);
                    return (
                      <div key={invitation.id} className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-gray-900 dark:text-white">
                                {invitation.email}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}
                              >
                                {status.label}
                              </span>
                            </div>
                            {invitation.note && (
                              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 italic">
                                "{invitation.note}"
                              </p>
                            )}
                            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                              <span>
                                Sent{' '}
                                {new Date(
                                  invitation.createdAt,
                                ).toLocaleDateString()}
                              </span>
                              <span className="mx-2">•</span>
                              <span>
                                Expires{' '}
                                {new Date(
                                  invitation.expiresAt,
                                ).toLocaleDateString()}
                              </span>
                            </div>
                            {invitation.usedBy && (
                              <div className="mt-2">
                                <Link
                                  to="/$username"
                                  params={{
                                    username: `@${invitation.usedBy.username}`,
                                  }}
                                  className="inline-flex items-center text-sm text-green-600 dark:text-green-400 hover:underline"
                                >
                                  <svg
                                    className="w-4 h-4 mr-1"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                  Accepted by @{invitation.usedBy.username}
                                  {invitation.usedBy.displayName !==
                                    invitation.usedBy.username && (
                                    <span className="ml-1 text-gray-500 dark:text-gray-400">
                                      ({invitation.usedBy.displayName})
                                    </span>
                                  )}
                                </Link>
                                {invitation.usedAt && (
                                  <span className="ml-2 text-xs text-gray-400">
                                    on{' '}
                                    {new Date(
                                      invitation.usedAt,
                                    ).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Back to Settings */}
            <div className="mt-6 text-center">
              <Link
                to="/settings"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Back to Settings
              </Link>
            </div>
          </div>
        )}
      </RequireAuth>
    </AppLayout>
  );
}
