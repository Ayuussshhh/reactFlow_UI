import { Handle, Position } from 'reactflow';

function TableNode({ data }) {
  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm min-w-[220px] transition-all duration-200 hover:shadow-md hover:scale-[1.02]">
      <div className="flex items-center space-x-2 mb-2">
        <svg
          className="w-5 h-5 text-indigo-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
        <h3 className="text-base font-medium text-gray-800">{data.label}</h3>
      </div>
      <p className="text-xs text-gray-500 mb-2">{data.db}</p>
      <hr className="border-gray-100 mb-2" />
      {data.loading ? (
        <p className="text-xs text-gray-400 italic">Loading columns...</p>
      ) : data.columns.length === 0 ? (
        <p className="text-xs text-gray-400">No columns defined</p>
      ) : (
        <ul className="space-y-1">
          {data.columns.map((col, index) => (
            <li
              key={`${data.label}-${col.name}-${index}`}
              className="flex items-center space-x-2 text-xs text-gray-600"
            >
              <span className="w-1.5 h-1.5 bg-indigo-300 rounded-full"></span>
              <span>{col.name}:</span>
              <span className="text-gray-400 font-mono">{col.type}</span>
            </li>
          ))}
        </ul>
      )}
      <Handle
        type="target"
        position={Position.Left}
        className="w-2 h-2 bg-indigo-500 border border-white rounded-full"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-2 h-2 bg-indigo-500 border border-white rounded-full"
      />
    </div>
  );
}

export default TableNode;