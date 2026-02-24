/**
 * Schema API endpoints
 */
import api from './axiosInstance';

export const schemaAPI = {
  getTables: async (connectionId) => {
    const { data } = await api.get(`/api/connections/${connectionId}/tables`);
    return data.data || [];
  },

  getForeignKeys: async (connectionId) => {
    const { data } = await api.get(`/api/connections/${connectionId}/foreign-keys`);
    return data.data || [];
  },
};

/**
 * Pipeline API endpoints
 */
export const pipelineAPI = {
  listProposals: async () => {
    const { data } = await api.get('/api/pipeline/proposals');
    return data.data || [];
  },

  createProposal: async (proposal) => {
    const { data } = await api.post('/api/pipeline/proposals', proposal);
    return data.data;
  },

  getProposal: async (id) => {
    const { data } = await api.get(`/api/pipeline/proposals/${id}`);
    return data.data;
  },

  submitForReview: async (id) => {
    const { data } = await api.post(`/api/pipeline/proposals/${id}/submit`);
    return data.data;
  },

  approve: async (id) => {
    const { data } = await api.post(`/api/pipeline/proposals/${id}/approve`);
    return data.data;
  },

  analyze: async (id) => {
    const { data } = await api.post(`/api/pipeline/proposals/${id}/analyze`);
    return data.data;
  },

  execute: async (id) => {
    const { data } = await api.post(`/api/pipeline/proposals/${id}/execute`);
    return data.data;
  },

  addChangeLog: async (proposalId, changeLog) => {
    const { data } = await api.put(`/api/pipeline/proposals/${proposalId}/changelog`, changeLog);
    return data.data;
  },

  listSnapshots: async () => {
    const { data } = await api.get('/api/snapshots');
    return data.data || [];
  },

  getSnapshot: async (id) => {
    const { data } = await api.get(`/api/snapshots/${id}`);
    return data.data;
  },

  createSnapshot: async (snapshot) => {
    const { data } = await api.post('/api/snapshots', snapshot);
    return data.data;
  },

  compareSnapshots: async (id1, id2) => {
    const { data } = await api.post('/api/snapshots/compare', { id1, id2 });
    return data.data;
  },
};

/**
 * Rules API endpoints
 */
export const rulesAPI = {
  getRules: async () => {
    const { data } = await api.get('/api/rules');
    return data.rules || [];
  },
};
