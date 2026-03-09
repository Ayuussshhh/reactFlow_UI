/**
 * Landing Page
 * SchemaFlow - GitHub PR for Databases
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BoltIcon,
  ShieldCheckIcon,
  CodeBracketIcon,
  ArrowRightIcon,
  SparklesIcon,
  UserGroupIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../store/store';

const features = [
  {
    icon: ShieldCheckIcon,
    title: 'Governance Built-in',
    description: 'Review schema changes like code PRs. Approve, comment, and track all modifications.',
  },
  {
    icon: BoltIcon,
    title: 'Risk Simulation',
    description: 'Preview impact before execution. See estimated times, table locks, and affected dependencies.',
  },
  {
    icon: UserGroupIcon,
    title: 'Role-Based Access',
    description: 'Developers propose, admins approve. Complete audit trail for compliance.',
  },
  {
    icon: CodeBracketIcon,
    title: 'Dev Mode',
    description: 'Toggle between friendly names and raw SQL types. Full migration script generation.',
  },
  {
    icon: ClockIcon,
    title: 'Version Control',
    description: 'Every change is tracked. Rollback to any previous state with one click.',
  },
  {
    icon: SparklesIcon,
    title: 'Visual First',
    description: 'Drag-and-drop schema design on an infinite canvas. See relationships at a glance.',
  },
];

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-white/90 backdrop-blur-xl border-b border-neutral-100">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <BoltIcon className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-neutral-900">SchemaFlow</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors">
              How it Works
            </a>
          </nav>

          <Link
            href="/dashboard"
            className="btn-primary"
          >
            Open App
            <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium mb-8">
              <SparklesIcon className="w-4 h-4" />
              Database Governance Platform
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-neutral-900 mb-8 leading-tight tracking-tight">
              GitHub PRs for
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
                Database Schema
              </span>
            </h1>
            
            <p className="text-xl text-neutral-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              Propose, review, approve, and execute schema changes with full visibility. 
              Stop breaking production with untested migrations.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/dashboard"
                className="flex items-center gap-3 px-8 py-4 bg-neutral-900 text-white text-lg font-semibold rounded-xl shadow-xl hover:bg-neutral-800 hover:-translate-y-0.5 transition-all"
              >
                Start Free
                <ArrowRightIcon className="w-5 h-5" />
              </Link>
              <a
                href="#features"
                className="flex items-center gap-2 px-8 py-4 text-neutral-600 text-lg font-medium hover:text-neutral-900 transition-colors"
              >
                See Features
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Workflow */}
      <section id="how-it-works" className="py-20 px-6 bg-neutral-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">
              Four simple steps
            </h2>
            <p className="text-lg text-neutral-600">
              From proposal to production with full governance
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '1', title: 'Mirror', desc: 'Connect to your database. We create a live semantic map.' },
              { step: '2', title: 'Propose', desc: 'Make changes visually. Create a proposal like a PR.' },
              { step: '3', title: 'Simulate', desc: 'See estimated runtime, locks, and downstream impact.' },
              { step: '4', title: 'Execute', desc: 'Admin approves. Migrations run with automatic rollback.' },
            ].map((item) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <div className="p-6 bg-white rounded-2xl border border-neutral-200 shadow-sm h-full">
                  <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center text-lg font-bold mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">{item.title}</h3>
                  <p className="text-neutral-600 text-sm">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">
              Everything you need
            </h2>
            <p className="text-lg text-neutral-600">
              Built for teams who care about database stability
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="p-6 bg-white rounded-2xl border border-neutral-200 hover:border-neutral-300 hover:shadow-lg transition-all"
              >
                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">{feature.title}</h3>
                <p className="text-neutral-600 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="p-10 md:p-16 bg-neutral-900 rounded-3xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Stop breaking production
            </h2>
            <p className="text-lg text-neutral-400 mb-10 max-w-xl mx-auto">
              Join teams who review schema changes like code. Start for free with unlimited proposals.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-3 px-8 py-4 bg-white text-neutral-900 text-lg font-semibold rounded-xl hover:bg-neutral-100 transition-colors"
            >
              Get Started
              <ArrowRightIcon className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-neutral-100">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BoltIcon className="w-5 h-5 text-indigo-600" />
            <span className="font-semibold text-neutral-900">SchemaFlow</span>
          </div>
          <p className="text-sm text-neutral-500">
            © 2024 SchemaFlow. Built with Rust + Next.js
          </p>
        </div>
      </footer>
    </div>
  );
}
