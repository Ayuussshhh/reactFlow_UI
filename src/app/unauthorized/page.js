'use client';

/**
 * Unauthorized Page - Access Denied
 */
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShieldExclamationIcon, HomeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        {/* Icon */}
        <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/20">
          <ShieldExclamationIcon className="w-10 h-10 text-white" />
        </div>

        {/* Message */}
        <h1 className="text-3xl font-bold text-neutral-900 mb-3">Access Denied</h1>
        <p className="text-neutral-600 mb-8">
          You don&apos;t have permission to access this page. Contact your administrator if you believe this is an error.
        </p>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-neutral-700 bg-white border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl hover:from-indigo-600 hover:to-indigo-700 transition-all shadow-lg shadow-indigo-500/30"
          >
            <HomeIcon className="w-4 h-4" />
            Go Home
          </Link>
        </div>

        {/* Role info */}
        <div className="mt-10 p-4 bg-amber-50 rounded-xl border border-amber-200">
          <p className="text-sm text-amber-700">
            <strong>Tip:</strong> Different features require different permission levels. 
            Admin features are restricted to administrators only.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
