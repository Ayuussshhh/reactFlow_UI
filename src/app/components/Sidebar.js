"use client";

import { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

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
  const [hoveredDb, setHoveredDb] = useState(null);

  const filteredDatabases = databases.filter((db) =>
    db.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <aside
        className={`bg-white border-r border-neutral-200/50 backdrop-blur-sm flex flex-col transition-all duration-300 ${
          sidebarOpen ? 'w-72' : 'w-0 overflow-hidden'
        } h-[calc(100vh-56px)]`}
      >
        {/* Header Section */}
        <div className="p-4 space-y-4 border-b border-neutral-200/50">
          <h2 className="text-sm font-bold text-neutral-900">Databases</h2>
          <div className="relative group">
            <input
              type="text"
              placeholder="Search databases..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field w-full pl-9 text-sm"
            />
            <svg className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Databases List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {filteredDatabases.length > 0 ? (
            filteredDatabases.map((db) => (
              <div
                key={db}
                onMouseEnter={() => setHoveredDb(db)}
                onMouseLeave={() => setHoveredDb(null)}
                className={`group px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 ${
                  selectedDb === db
                    ? 'bg-primary-50 border border-primary-200'
                    : 'hover:bg-neutral-50 border border-transparent'
                }`}
                onClick={() => loadTablesOnCanvas(db)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    {/* DB Icon */}
                    <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                      selectedDb === db
                        ? 'bg-primary-100'
                        : 'bg-neutral-100 group-hover:bg-neutral-200'
                    }`}>
                      <svg className={`w-4 h-4 ${selectedDb === db ? 'text-primary-600' : 'text-neutral-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7m0 0c0 2.21-3.582 4-8 4s-8-1.79-8-4m0 0c0-2.21 3.582-4 8-4s8 1.79 8 4m0 6c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-semibold truncate ${selectedDb === db ? 'text-primary-600' : 'text-neutral-900'}`}>
                        {db}
                      </p>
                      <p className="text-xs text-neutral-500">PostgreSQL</p>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <span className={`flex-shrink-0 w-2 h-2 rounded-full transition-all ${
                    selectedDb === db ? 'bg-success-500 shadow-md' : 'bg-neutral-300'
                  }`}></span>

                  {/* Delete Button */}
                  {hoveredDb === db && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setToDelete(db);
                        setOpenConfirmDelete(true);
                      }}
                      className="flex-shrink-0 ml-2 p-1.5 text-danger-600 hover:bg-danger-50 rounded-md transition-all"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <svg className="w-8 h-8 text-neutral-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" />
              </svg>
              <p className="text-xs text-neutral-500">No databases found</p>
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="p-4 space-y-2 border-t border-neutral-200/50">
          <button
            onClick={() => setOpenAddDB(true)}
            className="btn-primary w-full flex items-center justify-center space-x-2 text-sm"
          >
            <PlusIcon className="w-4 h-4" />
            <span>New Database</span>
          </button>
          {selectedDb && (
            <button
              onClick={() => setOpenAddTable(true)}
              className="btn-secondary w-full flex items-center justify-center space-x-2 text-sm"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Add Table</span>
            </button>
          )}
        </div>
      </aside>

      {/* Toggle Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className={`absolute top-14 z-10 p-1.5 bg-white border border-neutral-200/50 rounded-r-lg shadow-sm hover:shadow-md hover:bg-neutral-50 transition-all duration-300 ${
          sidebarOpen ? 'left-72' : 'left-0'
        }`}
      >
        {sidebarOpen ? (
          <ChevronLeftIcon className="w-4 h-4 text-neutral-600" />
        ) : (
          <ChevronRightIcon className="w-4 h-4 text-neutral-600" />
        )}
      </button>
    </>
  );
}

export default Sidebar;