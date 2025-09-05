function Snackbar({ open, message, severity }) {
  if (!open) return null;

  return (
    <div
      className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-md text-white shadow-sm transition-opacity duration-300 ${
        severity === 'success' ? 'bg-green-500' : 'bg-red-500'
      }`}
    >
      {message}
    </div>
  );
}

export default Snackbar;