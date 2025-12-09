"use client";

function AddDatabaseDialog({ open, setOpen, dbName, setDbName, handleCreateDatabase }) {
  if (!open) return null;

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleCreateDatabase();
    if (e.key === 'Escape') setOpen(false);
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-2xl p-8 w-96 shadow-2xl border border-neutral-200/50 transform transition-all duration-300 animate-scale-in">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-neutral-900 mb-1">Create Database</h2>
          <p className="text-sm text-neutral-500">Add a new database to your workspace</p>
        </div>

        {/* Input */}
        <div className="space-y-2 mb-6">
          <label className="block text-sm font-semibold text-neutral-700">Database Name</label>
          <input
            autoFocus
            type="text"
            placeholder="e.g., my_app_db, users_service..."
            className="input-field-lg w-full"
            value={dbName}
            onChange={(e) => setDbName(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <p className="text-xs text-neutral-500">Use lowercase letters, numbers, and underscores</p>
        </div>

        {/* Actions */}
        <div className="flex space-x-3 justify-end">
          <button
            onClick={() => setOpen(false)}
            className="btn-ghost px-6"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateDatabase}
            disabled={!dbName.trim()}
            className="btn-primary px-6"
          >
            Create Database
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddDatabaseDialog;