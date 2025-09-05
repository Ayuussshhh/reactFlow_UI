function ConfirmDeleteDialog({ open, setOpen, toDelete, handleDeleteDatabase }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-80 shadow-sm transform transition-all duration-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Delete Database</h2>
        <p className="text-sm text-gray-500 mb-4">
          Are you sure you want to delete <span className="font-medium">{toDelete}</span>? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => setOpen(false)}
            className="px-4 py-1.5 text-gray-600 rounded-md hover:bg-gray-100 transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteDatabase}
            className="px-4 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDeleteDialog;