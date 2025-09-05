import { useState } from 'react';

function Sidebar({
  databases,
  selectedDb,
  loadTablesOnCanvas,
  setOpenAddDB,
  setOpenAddTable,
  setToDelete,
  setOpenConfirmDelete,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [search, setSearch] = useState('');

  const filteredDatabases = databases.filter((db) =>
    db.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <aside
        className={`bg-white border-r border-gray-100 flex flex-col transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'
        }`}
      >
        <div className="p-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search databases..."
              className="w-full pl-8 pr-3 py-1.5 bg-gray-100 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <svg
              className="w-4 h-4 text-gray-500 absolute left-2.5 top-1/2 transform -translate-y-1/2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
        <hr className="border-gray-100" />
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredDatabases.map((db) => (
            <div
              key={db}
              onClick={() => loadTablesOnCanvas(db)}
              className={`px-3 py-2 flex items-center justify-between cursor-pointer rounded-md transition-all ${
                selectedDb === db ? 'bg-indigo-50' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-indigo-50 rounded-md flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-indigo-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 12h14M5 12a2 2 0 01-2-2v-4a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2"
                    />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center space-x-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    <span className="text-sm font-medium text-gray-800">{db}</span>
                  </div>
                  <p className="text-xs text-gray-500">PostgreSQL</p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setToDelete(db);
                  setOpenConfirmDelete(true);
                }}
                className="p-1.5 hover:bg-red-50 rounded-md transition-colors"
              >
                <svg
                  className="w-4 h-4 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
        <div className="p-4 space-y-2">
          <button
            onClick={() => setOpenAddDB(true)}
            className="w-full px-4 py-1.5 border border-indigo-500 text-indigo-500 rounded-md hover:bg-indigo-50 transition-colors text-sm font-medium"
          >
            Add Database
          </button>
          {selectedDb && (
            <button
              onClick={() => setOpenAddTable(true)}
              className="w-full px-4 py-1.5 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors text-sm font-medium"
            >
              Add Table to {selectedDb}
            </button>
          )}
        </div>
      </aside>
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute left-0 top-1/2 transform translate-y-1/2 z-10 p-1.5 bg-white border border-gray-100 rounded-r-md shadow-sm hover:bg-gray-100 transition-all"
        style={{ left: sidebarOpen ? '16rem' : '0' }}
      >
        <svg
          className={`w-4 h-4 text-gray-600 transform ${sidebarOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
    </>
  );
}

export default Sidebar;