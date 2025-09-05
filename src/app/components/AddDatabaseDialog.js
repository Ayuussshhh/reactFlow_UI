function AddDatabaseDialog({ open, setOpen, dbName, setDbName, handleCreateDatabase }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-80 shadow-sm transform transition-all duration-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Create New Database</h2>
        <input
          autoFocus
          type="text"
          placeholder="Database Name"
          className="w-full px-3 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
          value={dbName}
          onChange={(e) => setDbName(e.target.value)}
        />
        <div className="flex justify-end space-x-2 mt-4">
          <button
            onClick={() => setOpen(false)}
            className="px-4 py-1.5 text-gray-600 rounded-md hover:bg-gray-100 transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateDatabase}
            className="px-4 py-1.5 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors text-sm"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddDatabaseDialog;