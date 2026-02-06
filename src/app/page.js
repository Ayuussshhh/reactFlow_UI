/**
 * Landing Page
 * DBCanvas - Figma for Databases
 */

'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  CircleStackIcon,
  CubeTransparentIcon,
  CodeBracketIcon,
  ArrowRightIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

const features = [
  {
    icon: CubeTransparentIcon,
    title: 'Visual Modeling',
    description: 'Drag, drop, and connect tables on an infinite canvas. Design schemas visually.',
  },
  {
    icon: CircleStackIcon,
    title: 'Live Database',
    description: 'Connect to PostgreSQL and see changes reflected in real-time.',
  },
  {
    icon: CodeBracketIcon,
    title: 'Dev Mode',
    description: 'Export to SQL, Rust (SeaORM), or TypeScript with one click.',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-white/80 backdrop-blur-xl border-b border-neutral-200/60">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-neutral-900">DBCanvas</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors">
              Features
            </a>
            <a href="#about" className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors">
              About
            </a>
          </nav>

          <Link
            href="/erd"
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white text-sm font-semibold rounded-lg shadow-lg shadow-primary-500/30 hover:bg-primary-600 transition-all"
          >
            Open Canvas
            <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-6">
              <SparklesIcon className="w-4 h-4" />
              Now with Rust Backend
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-neutral-900 mb-6 leading-tight">
              Figma for
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-purple-500"> Databases</span>
            </h1>
            
            <p className="text-xl text-neutral-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Design, visualize, and manage your PostgreSQL schemas on an infinite canvas. 
              Export to SQL, Rust, or TypeScript instantly.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/erd"
                className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-lg font-semibold rounded-xl shadow-xl shadow-primary-500/30 hover:shadow-2xl hover:shadow-primary-500/40 hover:-translate-y-0.5 transition-all"
              >
                Start Designing
                <ArrowRightIcon className="w-5 h-5" />
              </Link>
              <a
                href="#features"
                className="flex items-center gap-2 px-8 py-4 text-neutral-700 text-lg font-semibold hover:text-neutral-900 transition-colors"
              >
                Learn More
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">
              Everything you need for database design
            </h2>
            <p className="text-lg text-neutral-600">
              Built with performance and developer experience in mind
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-6 bg-white rounded-2xl border border-neutral-200 shadow-sm hover:shadow-xl transition-all"
              >
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">{feature.title}</h3>
                <p className="text-neutral-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-8 md:p-12 bg-gradient-to-br from-primary-500 to-purple-600 rounded-3xl shadow-2xl">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to transform your database workflow?
            </h2>
            <p className="text-lg text-white/80 mb-8">
              Start designing visually. No installation required.
            </p>
            <Link
              href="/erd"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-600 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
            >
              Open DBCanvas
              <ArrowRightIcon className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-neutral-200">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-neutral-500">
            © 2024 DBCanvas. Built with Rust + Next.js.
          </p>
          <div className="flex items-center gap-6 text-sm text-neutral-500">
            <a href="#" className="hover:text-neutral-900 transition-colors">GitHub</a>
            <a href="#" className="hover:text-neutral-900 transition-colors">Documentation</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
