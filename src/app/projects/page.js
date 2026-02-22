'use client';

/**
 * Projects Dashboard - Like Figma/Vercel
 * Shows all projects for current user
 * User selects a project to work with
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  EllipsisVerticalIcon,
  FolderIcon,
  ClockIcon,
  CircleStackIcon,
  TrashIcon,
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

export default function ProjectsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { projects, isLoading, createProject, fetchProjects, deleteProject } = useProjectStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newProjectData, setNewProjectData] = useState({ name: '', description: '', color: 'blue', icon: '📁' });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && isAuthenticated) {
      fetchProjects().catch(() => {
        toast.error('Failed to load projects');
      });
    }
  }, [mounted, isAuthenticated, fetchProjects]);

  const handleCreateProject = async () => {
    if (!newProjectData.name.trim()) {
      toast.error('Project name is required');
      return;
    }

    try {
      await createProject(newProjectData);
      setNewProjectData({ name: '', description: '', color: 'blue', icon: '📁' });
      setShowCreateDialog(false);
      toast.success('Project created successfully');
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project');
    }
  };

  const handleDeleteProject = async (e, projectId) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteProject(projectId);
        toast.success('Project deleted');
      } catch (error) {
        toast.error('Failed to delete project');
      }
    }
  };

  const handleOpenProject = (projectId) => {
    router.push(`/dashboard/${projectId}`);
  };

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Header - Mobile responsive */}
        <div className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-xl sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2 md:gap-3">
                  <div className="w-8 md:w-10 h-8 md:h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <CircleStackIcon className="w-5 md:w-6 h-5 md:h-6 text-white" />
                  </div>
                  <span className="truncate">SchemaFlow</span>
                </h1>
                <p className="text-xs md:text-sm text-slate-400 mt-1 truncate">
                  Welcome back, <span className="font-semibold text-slate-300 hidden sm:inline">{user?.name || 'User'}</span>
                </p>
              </div>

              {/* User Menu */}
              <button
                onClick={() => {
                  useAuthStore.getState().logout();
                  router.push('/login');
                }}
                className="px-3 md:px-4 py-1.5 md:py-2 text-slate-300 hover:text-white transition-colors text-sm md:text-base whitespace-nowrap"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
          {/* Search and Create - Mobile responsive */}
          <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4 mb-8 md:mb-12">
            <div className="flex-1 w-full max-w-md">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm md:text-base"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateDialog(true)}
              className="w-full sm:w-auto px-4 md:px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-indigo-500/50 transition-all text-sm md:text-base"
            >
              <PlusIcon className="w-5 h-5" />
              <span className="hidden sm:inline">New Project</span>
              <span className="sm:hidden">Create</span>
            </motion.button>
          </div>

          {/* Projects Grid */}
          {isLoading || !mounted ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-12">
              <FolderIcon className="w-12 md:w-16 h-12 md:h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg md:text-xl font-semibold text-slate-300 mb-2">No projects yet</h3>
              <p className="text-slate-400 mb-6 text-sm md:text-base">Create your first project to get started</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateDialog(true)}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
              >
                Create Project
              </motion.button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filteredProjects.map((project, index) => {
                const colorConfig = COLORS.find((c) => c.name === project.color) || COLORS[0];
                return (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleOpenProject(project.id)}
                    className="group cursor-pointer"
                  >
                    <div className="relative h-36 md:h-40 rounded-xl overflow-hidden bg-slate-700/50 border border-slate-600 hover:border-indigo-500 transition-all hover:shadow-xl hover:shadow-indigo-500/20">
                      {/* Background gradient */}
                      <div className={`absolute inset-0 ${colorConfig.bg} opacity-10`}></div>

                      {/* Content */}
                      <div className="relative h-full flex flex-col justify-between p-4 md:p-6">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className={`w-10 md:w-12 h-10 md:h-12 rounded-lg ${colorConfig.light} flex items-center justify-center text-xl md:text-2xl mb-2 md:mb-3 group-hover:scale-110 transition-transform`}>
                              {project.icon}
                            </div>
                            <h3 className="text-base md:text-lg font-semibold text-white group-hover:text-indigo-400 transition-colors truncate">
                              {project.name}
                            </h3>
                            {project.description && (
                              <p className="text-xs md:text-sm text-slate-400 mt-1 line-clamp-2">{project.description}</p>
                            )}
                          </div>
                          <button
                            onClick={(e) => handleDeleteProject(e, project.id)}
                            className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                            title="Delete project"
                          >
                            <TrashIcon className="w-4 h-4 text-red-400" />
                          </button>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between text-xs text-slate-400 gap-2">
                          <div className="flex items-center gap-1 truncate">
                            <CircleStackIcon className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{project.connectionCount || 0} conn</span>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <ClockIcon className="w-3 h-3" />
                            <span>{project.updated_at ? new Date(project.updated_at).toLocaleDateString() : 'Never'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Create Project Dialog - Mobile responsive */}
        {showCreateDialog && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-800 border border-slate-700 rounded-xl p-4 md:p-6 max-w-md w-full"
            >
              <h2 className="text-xl md:text-2xl font-bold text-white mb-4">Create New Project</h2>

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Project name"
                  value={newProjectData.name}
                  onChange={(e) => setNewProjectData({ ...newProjectData, name: e.target.value })}
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateProject()}
                  autoFocus
                  className="w-full px-4 py-2 md:py-3 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm md:text-base"
                />

                <input
                  type="text"
                  placeholder="Description (optional)"
                  value={newProjectData.description}
                  onChange={(e) => setNewProjectData({ ...newProjectData, description: e.target.value })}
                  className="w-full px-4 py-2 md:py-3 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm md:text-base"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCreateDialog(false)}
                  className="flex-1 px-4 py-2 rounded-lg bg-slate-700 text-slate-200 font-semibold hover:bg-slate-600 transition-colors text-sm md:text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateProject}
                  className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors text-sm md:text-base"
                >
                  Create
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
