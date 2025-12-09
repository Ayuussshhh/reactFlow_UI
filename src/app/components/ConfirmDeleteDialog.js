"use client";

import { TrashIcon } from '@heroicons/react/24/outline';

function ConfirmDeleteDialog({ open, setOpen, toDelete, handleDeleteDatabase }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-2xl p-8 w-96 shadow-2xl border border-neutral-200/50 transform transition-all duration-300 animate-scale-in">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 bg-danger-100 rounded-full flex items-center justify-center">
            <TrashIcon className="w-6 h-6 text-danger-600" />
          </div>
        </div>

        {/* Content */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">Delete Database?</h2>
          <p className="text-sm text-neutral-600">
            You're about to delete <span className="font-semibold text-neutral-900">{toDelete}</span>. This cannot be undone.
          </p>
        </div>

        {/* Warning */}
        <div className="bg-danger-50 border border-danger-200 rounded-lg p-3 mb-6">
          <p className="text-xs text-danger-700 font-medium">⚠️ All tables and data will be permanently deleted</p>
        </div>

        {/* Actions */}
        <div className="flex space-x-3 justify-center">
          <button
            onClick={() => setOpen(false)}
            className="btn-secondary px-6"
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteDatabase}
            className="btn-danger px-6"
          >
            Delete Database
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDeleteDialog;