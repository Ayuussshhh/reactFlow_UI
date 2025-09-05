function AddTableDialog({
  open,
  setOpen,
  selectedDb,
  tableName,
  setTableName,
  columns,
  setColumns,
  handleCreateTable,
}) {
  const addColumn = () => {
    setColumns((prev) => [...prev, { name: '', type: '' }]);
  };

  const updateColumn = (index, field, value) => {
    const newColumns = [...columns];
    newColumns[index][field] = value;
    setColumns(newColumns);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-sm transform transition-all duration-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Create Table in {selectedDb}</h2>
        <input
          autoFocus
          type="text"
          placeholder="Table Name"
          className="w-full px-3 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 mb-4"
          value={tableName}
          onChange={(e) => setTableName(e.target.value)}
        />
        <div className="space-y-3">
          {columns.map((col, index) => (
            <div key={index} className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Column Name"
                className="px-3 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={col.name}
                onChange={(e) => updateColumn(index, 'name', e.target.value)}
              />
              <input
                type="text"
                placeholder="Type (e.g., VARCHAR(100))"
                className="px-3 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={col.type}
                onChange={(e) => updateColumn(index, 'type', e.target.value)}
              />
            </div>
          ))}
        </div>
        <button
          onClick={addColumn}
          className="mt-4 px-3 py-1.5 bg-indigo-50 text-indigo-500 rounded-md hover:bg-indigo-100 transition-colors flex items-center space-x-1 mx-auto text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Column</span>
        </button>
        <div className="flex justify-end space-x-2 mt-4">
          <button
            onClick={() => setOpen(false)}
            className="px-4 py-1.5 text-gray-600 rounded-md hover:bg-gray-100 transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateTable}
            disabled={!selectedDb}
            className="px-4 py-1.5 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Table
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddTableDialog;