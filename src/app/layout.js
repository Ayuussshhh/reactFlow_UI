import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata = {
  title: 'SchemaFlow - Database Governance Platform',
  description: 'GitHub PRs for Database Schema. Propose, review, approve, and execute schema changes with full visibility.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body className={`${inter.className} min-h-screen bg-white`}>{children}</body>
    </html>
  );
}
