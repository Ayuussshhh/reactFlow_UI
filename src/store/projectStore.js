'use client';

/**
 * Project Store - Manages project state and API interactions
 * Uses Zustand with localStorage persistence
 */
import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { projectsAPI } from '../lib';

export const useProjectStore = create(
  persist(
    subscribeWithSelector((set, get) => ({
      // Projects state
      projects: [],
      currentProject: null,
      currentConnection: null,
      isLoading: false,
      error: null,

      // Actions - Projects
      setProjects: (projects) => set({ projects }),
      setCurrentProject: (project) => set({ currentProject: project }),
      setCurrentConnection: (connection) => set({ currentConnection: connection }),
      setIsLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      // Fetch all projects
      fetchProjects: async () => {
        try {
          set({ isLoading: true, error: null });
          const data = await projectsAPI.list();
          set({ projects: Array.isArray(data) ? data : [] });
          return Array.isArray(data) ? data : [];
        } catch (error) {
          const errorMsg = error.message || 'Failed to fetch projects';
          set({ error: errorMsg });
          console.error('Error fetching projects:', error);
          return [];
        } finally {
          set({ isLoading: false });
        }
      },

      // Create project
      createProject: async (projectData) => {
        try {
          set({ isLoading: true, error: null });
          const newProject = await projectsAPI.create(projectData);
          
          set((state) => ({
            projects: [...state.projects, newProject],
            currentProject: newProject,
          }));
          
          return newProject;
        } catch (error) {
          const errorMsg = error.message || 'Failed to create project';
          set({ error: errorMsg });
          console.error('Error creating project:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      // Get single project
      getProject: async (projectId) => {
        try {
          set({ isLoading: true, error: null });
          const project = await projectsAPI.get(projectId);
          set({ currentProject: project });
          return project;
        } catch (error) {
          const errorMsg = error.message || 'Failed to fetch project';
          set({ error: errorMsg });
          console.error('Error fetching project:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      // Update project
      updateProject: async (projectId, updates) => {
        try {
          set({ isLoading: true, error: null });
          const updatedProject = await projectsAPI.update(projectId, updates);
          
          set((state) => ({
            projects: state.projects.map((p) => (p.id === projectId ? updatedProject : p)),
            currentProject: updatedProject,
          }));
          
          return updatedProject;
        } catch (error) {
          const errorMsg = error.message || 'Failed to update project';
          set({ error: errorMsg });
          console.error('Error updating project:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      // Delete project
      deleteProject: async (projectId) => {
        try {
          set({ isLoading: true, error: null });
          await projectsAPI.delete(projectId);
          
          set((state) => ({
            projects: state.projects.filter((p) => p.id !== projectId),
            currentProject: state.currentProject?.id === projectId ? null : state.currentProject,
          }));
        } catch (error) {
          const errorMsg = error.message || 'Failed to delete project';
          set({ error: errorMsg });
          console.error('Error deleting project:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      // Connections within project
      saveConnection: async (projectId, connectionData) => {
        try {
          set({ isLoading: true, error: null });
          const connection = await projectsAPI.saveConnection(projectId, connectionData);
          set({ currentConnection: connection });
          return connection;
        } catch (error) {
          const errorMsg = error.message || 'Failed to save connection';
          set({ error: errorMsg });
          console.error('Error saving connection:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      // Get project connections
      getConnections: async (projectId) => {
        try {
          set({ isLoading: true, error: null });
          const connections = await projectsAPI.getConnections(projectId);
          return Array.isArray(connections) ? connections : [];
        } catch (error) {
          const errorMsg = error.message || 'Failed to fetch connections';
          set({ error: errorMsg });
          console.error('Error fetching connections:', error);
          return [];
        } finally {
          set({ isLoading: false });
        }
      },

      // Activate connection
      activateConnection: async (projectId, connectionId) => {
        try {
          set({ isLoading: true, error: null });
          const connection = await projectsAPI.activateConnection(projectId, connectionId);
          set({ currentConnection: connection });
          return connection;
        } catch (error) {
          const errorMsg = error.message || 'Failed to activate connection';
          set({ error: errorMsg });
          console.error('Error activating connection:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      // Remove connection
      removeConnection: async (projectId, connectionId) => {
        try {
          set({ isLoading: true, error: null });
          await projectsAPI.deleteConnection(projectId, connectionId);

          set((state) => ({
            currentConnection: state.currentConnection?.id === connectionId ? null : state.currentConnection,
          }));
        } catch (error) {
          const errorMsg = error.message || 'Failed to remove connection';
          set({ error: errorMsg });
          console.error('Error removing connection:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      // Clear everything
      clearProject: () => set({
        currentProject: null,
        currentConnection: null,
        error: null,
      }),
    })),
    {
      name: 'project-store',
      partialize: (state) => ({
        currentProject: state.currentProject,
        projects: state.projects,
      }),
    }
  )
);
