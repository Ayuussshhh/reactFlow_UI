'use client';

/**
 * AuthGuard - Protected route wrapper
 * Redirects unauthenticated users to login
 * Optionally enforces role-based access
 */
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/store';
import { BoltIcon } from '@heroicons/react/24/outline';

export default function AuthGuard({ 
  children, 
  allowedRoles = null,  // null = any authenticated user, array = specific roles
  fallbackPath = '/login'
}) {
  const router = useRouter();
  const { isAuthenticated, user, accessToken } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Give hydration a moment to complete
    const timer = setTimeout(() => {
      if (!isAuthenticated || !accessToken) {
        router.replace(fallbackPath);
        return;
      }

      // Check role-based access
      if (allowedRoles && user) {
        const hasAccess = allowedRoles.includes(user.role);
        if (!hasAccess) {
          router.replace('/unauthorized');
          return;
        }
      }

      setIsChecking(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [isAuthenticated, accessToken, user, allowedRoles, router, fallbackPath]);

  // Loading state while checking auth
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <BoltIcon className="w-8 h-8 text-white" />
          </div>
          <div className="flex items-center gap-2 justify-center">
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <p className="text-sm text-neutral-500 mt-4">Verifying access...</p>
        </div>
      </div>
    );
  }

  return children;
}

// Role constants for consistency
export const ROLES = {
  ADMIN: 'Admin',
  DEVELOPER: 'Developer',
  VIEWER: 'Viewer',
};

// Convenience wrappers
export function AdminOnly({ children }) {
  return (
    <AuthGuard allowedRoles={[ROLES.ADMIN]}>
      {children}
    </AuthGuard>
  );
}

export function DevAndAbove({ children }) {
  return (
    <AuthGuard allowedRoles={[ROLES.ADMIN, ROLES.DEVELOPER]}>
      {children}
    </AuthGuard>
  );
}
