import { Link, useLocation, useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  const { user: currentUser, loading: authLoading, signOut } = useAuth();

  const handleSignOut = () => {
    signOut();
    navigate({ to: '/auth/signin' });
    onClose?.();
  };

  const handleLinkClick = () => {
    onClose?.();
  };

  const navLinks = [
    { href: '/home', label: 'Home', icon: '🏠', requiresAuth: true },
    {
      href: '/timeline/public',
      label: 'Public',
      icon: '🌍',
      requiresAuth: false,
    },
    { href: '/search', label: 'Search', icon: '🔍', requiresAuth: true },
    {
      href: '/presentations',
      label: 'Presentations',
      icon: '📄',
      requiresAuth: true,
    },
    { href: '/upload', label: 'Upload', icon: '📤', requiresAuth: true },
    { href: '/settings', label: 'Settings', icon: '⚙️', requiresAuth: true },
  ];

  const visibleLinks = navLinks.filter(
    (link) => !link.requiresAuth || currentUser,
  );

  return (
    <aside className="flex flex-col h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      {/* Logo */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <Link
          to="/"
          onClick={handleLinkClick}
          className="flex items-center space-x-2"
        >
          <span className="text-2xl">🌐</span>
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            Cosmoslide
          </span>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {visibleLinks.map((link) => (
          <Link
            key={link.href}
            to={link.href}
            onClick={handleLinkClick}
            className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              pathname === link.href || pathname.startsWith(link.href + '/')
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <span className="mr-3 text-lg">{link.icon}</span>
            {link.label}
          </Link>
        ))}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        {authLoading ? (
          <div className="flex items-center space-x-3 px-4 py-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
            <div className="flex-1">
              <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          </div>
        ) : currentUser ? (
          <div className="space-y-3">
            <Link
              to="/$username"
              params={{ username: `@${currentUser.username}` }}
              onClick={handleLinkClick}
              className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold">
                  {currentUser.username[0]?.toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  @{currentUser.username}
                </p>
              </div>
            </Link>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <span className="mr-3 text-lg">🚪</span>
              Sign out
            </button>
          </div>
        ) : (
          <Link
            to="/auth/signin"
            onClick={handleLinkClick}
            className="flex items-center justify-center px-4 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign in
          </Link>
        )}
      </div>
    </aside>
  );
}
