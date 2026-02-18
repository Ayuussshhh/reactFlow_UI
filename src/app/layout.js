import './globals.css';

export const metadata = {
  title: 'SchemaFlow - Database Governance Platform',
  description: 'GitHub PRs for Database Schema. Propose, review, approve, and execute schema changes with full visibility.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-white">{children}</body>
    </html>
  );
}
