'use client';

/**
 * Project Store - Manages project state and API interactions
 * Uses Zustand with localStorage persistence
 */
import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

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
          const response = await fetch(`${API_BASE}/projects`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            },
          });

          if (!response.ok) throw new Error('Failed to fetch projects');
          const data = await response.json();
          set({ projects: data.data || [] });
          return data.data || [];
        } catch (error) {
          const errorMsg = error.message;
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
          const response = await fetch(`${API_BASE}/projects`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            },
            body: JSON.stringify(projectData),
          });

          if (!response.ok) throw new Error('Failed to create project');
          const data = await response.json();
          const newProject = data.data;
          
          set((state) => ({
            projects: [...state.projects, newProject],
            currentProject: newProject,
          }));
          
          return newProject;
        } catch (error) {
          set({ error: error.message });
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
          const response = await fetch(`${API_BASE}/projects/${projectId}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            },
          });

          if (!response.ok) throw new Error('Failed to fetch project');
          const data = await response.json();
          set({ currentProject: data.data });
          return data.data;
        } catch (error) {
          set({ error: error.message });
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
          const response = await fetch(`${API_BASE}/projects/${projectId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            },
            body: JSON.stringify(updates),
          });

          if (!response.ok) throw new Error('Failed to update project');
          const data = await response.json();
          
          set((state) => ({
            projects: state.projects.map((p) => (p.id === projectId ? data.data : p)),
            currentProject: data.data,
          }));
          
          return data.data;
        } catch (error) {
          set({ error: error.message });
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
          const response = await fetch(`${API_BASE}/projects/${projectId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            },
          });

          if (!response.ok) throw new Error('Failed to delete project');
          
          set((state) => ({
            projects: state.projects.filter((p) => p.id !== projectId),
            currentProject: state.currentProject?.id === projectId ? null : state.currentProject,
          }));
        } catch (error) {
          set({ error: error.message });
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
          const response = await fetch(`${API_BASE}/projects/${projectId}/connections`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            },
            body: JSON.stringify(connectionData),
          });

          if (!response.ok) throw new Error('Failed to save connection');
          const data = await response.json();
          set({ currentConnection: data.data });
          return data.data;
        } catch (error) {
          set({ error: error.message });
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
          const response = await fetch(`${API_BASE}/projects/${projectId}/connections`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            },
          });

          if (!response.ok) throw new Error('Failed to fetch connections');
          const data = await response.json();
          return data.data || [];
        } catch (error) {
          set({ error: error.message });
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
          const response = await fetch(
            `${API_BASE}/projects/${projectId}/connections/${connectionId}/activate`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
              },
            }
          );

          if (!response.ok) throw new Error('Failed to activate connection');
          const data = await response.json();
          set({ currentConnection: data.data });
          return data.data;
        } catch (error) {
          set({ error: error.message });
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
          await fetch(`${API_BASE}/projects/${projectId}/connections/${connectionId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            },
          });

          set((state) => ({
            currentConnection: state.currentConnection?.id === connectionId ? null : state.currentConnection,
          }));
        } catch (error) {
          set({ error: error.message });
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
