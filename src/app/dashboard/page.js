'use client';

/**
 * Dashboard - Main hub after login
 * Shows user's projects and provides access to create new projects
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FolderIcon,
  ClockIcon,
  EllipsisVerticalIcon,
  TrashIcon,
  ArrowRightIcon,
  SparklesIcon,
  CircleStackIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../../store/store';
import { useProjectStore } from '../../store/projectStore';
import { AuthGuard } from '../../components/auth';
import toast from 'react-hot-toast';

const COLORS = [
  { name: 'blue', bg: 'bg-blue-500', light: 'bg-blue-100', text: 'text-blue-700' },
  { name: 'indigo', bg: 'bg-indigo-500', light: 'bg-indigo-100', text: 'text-indigo-700' },
  { name: 'purple', bg: 'bg-purple-500', light: 'bg-purple-100', text: 'text-purple-700' },
  { name: 'pink', bg: 'bg-pink-500', light: 'bg-pink-100', text: 'text-pink-700' },
  { name: 'teal', bg: 'bg-teal-500', light: 'bg-teal-100', text: 'text-teal-700' },
  { name: 'emerald', bg: 'bg-emerald-500', light: 'bg-emerald-100', text: 'text-emerald-700' },
];

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { projects, isLoading, createProject, fetchProjects, deleteProject } = useProjectStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newProjectData, setNewProjectData] = useState({ name: '', description: '', color: 'blue', icon: '📊' });
  const [isCreating, setIsCreating] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (mounted && isAuthenticated) {
      fetchProjects().catch(() => {
        toast.error('Failed to load projects');
      });
    }
  }, [mounted, isAuthenticated, router, fetchProjects]);

  const handleCreateProject = async () => {
    if (!newProjectData.name.trim()) {
      toast.error('Project name is required');
      return;
    }

    setIsCreating(true);
    try {
      await createProject({
        name: newProjectData.name,
        description: newProjectData.description || null,
        icon: newProjectData.icon,
        color: newProjectData.color,
      });
      toast.success('Project created successfully!');
      setShowCreateDialog(false);
      setNewProjectData({ name: '', description: '', color: 'blue', icon: '📊' });
    } catch (error) {
      toast.error(error.message || 'Failed to create project');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteProject(projectId);
        toast.success('Project deleted');
      } catch {
        toast.error('Failed to delete project');
      }
    }
  };

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!mounted || !isAuthenticated) {
    return <AuthGuard />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="sticky top-0 z-50 px-6 py-4 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <CircleStackIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">SchemaFlow</h1>
              <p className="text-xs text-slate-500">Database Governance Platform</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-slate-900">{user?.name || user?.email}</p>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>
            <button
              onClick={() => logout()}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome back, {user?.name?.split(' ')[0] || 'there'}!</h2>
          <p className="text-slate-600">Manage your database schemas and propose changes with confidence.</p>
        </div>

        {/* Controls Section */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex-1 relative max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCreateDialog(true)}
            className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-medium rounded-lg hover:shadow-lg hover:shadow-indigo-500/30 transition-all flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Create Project
          </motion.button>
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
              <p className="text-slate-600">Loading projects...</p>
            </div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FolderIcon className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No projects yet</h3>
            <p className="text-slate-600 mb-6">Create your first project to get started</p>
            <button
              onClick={() => setShowCreateDialog(true)}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-500 text-white font-medium rounded-lg hover:bg-indigo-600 transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              Create Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => {
              const color = COLORS.find((c) => c.name === project.color) || COLORS[0];
              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all cursor-pointer overflow-hidden"
                  onClick={() => router.push(`/projects/${project.id}`)}
                >
                  {/* Color Top Bar */}
                  <div className={`h-1 ${color.bg}`} />

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 ${color.light} rounded-lg flex items-center justify-center text-2xl`}>
                        {project.icon || '📁'}
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProject(project.id);
                          }}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete project"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold text-slate-900 mb-2 truncate">{project.name}</h3>
                    {project.description && (
                      <p className="text-sm text-slate-600 mb-4 line-clamp-2">{project.description}</p>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <ClockIcon className="w-4 h-4" />
                        {new Date(project.created_at).toLocaleDateString()}
                      </div>
                      <ArrowRightIcon className="w-4 h-4 text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      {/* Create Project Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowCreateDialog(false)}
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative z-10 bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8"
          >
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Create New Project</h2>
              <p className="text-slate-600">Set up a new database project to manage schema changes</p>
            </div>

            <div className="space-y-4 mb-6">
              {/* Project Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Project Name *
                </label>
                <input
                  type="text"
                  placeholder="My Database Project"
                  value={newProjectData.name}
                  onChange={(e) => setNewProjectData({ ...newProjectData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  placeholder="What is this project about?"
                  value={newProjectData.description}
                  onChange={(e) => setNewProjectData({ ...newProjectData, description: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  rows="3"
                />
              </div>

              {/* Icon & Color */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Icon
                  </label>
                  <input
                    type="text"
                    placeholder="📁"
                    maxLength="2"
                    value={newProjectData.icon}
                    onChange={(e) => setNewProjectData({ ...newProjectData, icon: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-center text-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Color
                  </label>
                  <select
                    value={newProjectData.color}
                    onChange={(e) => setNewProjectData({ ...newProjectData, color: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {COLORS.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name.charAt(0).toUpperCase() + c.name.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateDialog(false)}
                className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                disabled={isCreating}
                className="flex-1 px-4 py-2.5 bg-indigo-500 text-white font-medium rounded-lg hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isCreating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Project'
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
