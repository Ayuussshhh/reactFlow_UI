"use client";

import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

function Snackbar({ open, message, severity }) {
  if (!open) return null;

  const isSuccess = severity === 'success';

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-slide-in-up">
      <div className={`flex items-center space-x-3 px-5 py-3 rounded-lg shadow-lg border backdrop-blur-sm ${
        isSuccess
          ? 'bg-success-50 border-success-200'
          : 'bg-danger-50 border-danger-200'
      }`}>
        {isSuccess ? (
          <CheckCircleIcon className="w-5 h-5 text-success-600 flex-shrink-0" />
        ) : (
          <ExclamationCircleIcon className="w-5 h-5 text-danger-600 flex-shrink-0" />
        )}
        <p className={`text-sm font-medium ${isSuccess ? 'text-success-700' : 'text-danger-700'}`}>
          {message}
        </p>
      </div>
    </div>
  );
}

export default Snackbar;