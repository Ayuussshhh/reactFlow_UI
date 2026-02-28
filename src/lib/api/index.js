/**
 * Schema, Pipeline, and Rules API
 * 
 * These APIs work with the governance pipeline for schema changes.
 */
import api from './axiosInstance';

/**
 * Schema API - For fetching schema info from connections
 * 
 * Note: Schema data is typically returned from:
 * - POST /api/connections (introspects on connect)
 * - POST /api/connections/{id}/introspect (refresh)
 * - GET /api/schema (active connection)
 */
export const schemaAPI = {
  /**
   * Get schema for active connection
   */
  getActiveSchema: async () => {
    const { data } = await api.get('/api/schema');
    return data.data;
  },

  /**
   * Introspect/refresh schema for a connection
   */
  introspect: async (connectionId) => {
    const { data } = await api.post(`/api/connections/${connectionId}/introspect`);
    return data.data;
  },

  /**
   * Build semantic map for a connection
   */
  buildSemanticMap: async (connectionId) => {
    const { data } = await api.post(`/api/connections/${connectionId}/semantic-map`);
    return data.data?.semanticMap || data.data;
  },

  /**
   * Check for schema drift
   */
  checkDrift: async (connectionId) => {
    const { data } = await api.get(`/api/connections/${connectionId}/drift`);
    return {
      hasDrift: data.data?.hasDrift || false,
      changes: data.data?.changes || [],
    };
  },
};

/**
 * Pipeline API - Governance workflow for schema changes
 * 
 * Backend routes:
 * - POST /api/proposals -> create proposal
 * - GET /api/proposals -> list proposals
 * - GET /api/proposals/{id} -> get proposal
 * - POST /api/proposals/{id}/changes -> add change
 * - POST /api/proposals/{id}/migration -> generate migration
 * - POST /api/proposals/{id}/submit -> submit for review
 * - POST /api/proposals/{id}/approve -> approve
 * - POST /api/proposals/{id}/reject -> reject
 * - POST /api/proposals/{id}/comments -> add comment
 * - POST /api/proposals/{id}/analyze -> risk analysis
 * - POST /api/proposals/{id}/execute -> execute
 * - POST /api/proposals/{id}/rollback -> rollback
 * - GET /api/audit-log -> audit log
 */
export const pipelineAPI = {
  /**
   * Create a new schema proposal
   */
  createProposal: async (proposal) => {
    const { data } = await api.post('/api/proposals', proposal);
    return data.data?.proposal || data.data;
  },

  /**
   * List all proposals (optionally filter by connection or status)
   */
  listProposals: async (connectionId, status) => {
    const params = new URLSearchParams();
    if (connectionId) params.set('connection_id', connectionId);
    if (status) params.set('status', status);
    
    const url = params.toString() 
      ? `/api/proposals?${params}` 
      : '/api/proposals';
    
    const { data } = await api.get(url);
    return data.data?.proposals || data.data || [];
  },

  /**
   * Get a proposal by ID
   */
  getProposal: async (id) => {
    const { data } = await api.get(`/api/proposals/${id}`);
    return data.data?.proposal || data.data;
  },

  /**
   * Add a change to an existing proposal
   */
  addChange: async (proposalId, change) => {
    const { data } = await api.post(`/api/proposals/${proposalId}/changes`, { 
      change,
    });
    return data.data;
  },

  /**
   * Generate migration SQL for a proposal
   */
  generateMigration: async (proposalId) => {
    const { data } = await api.post(`/api/proposals/${proposalId}/migration`);
    return data.data?.migration || data.data;
  },

  /**
   * Submit proposal for review
   */
  submitForReview: async (proposalId) => {
    const { data } = await api.post(`/api/proposals/${proposalId}/submit`);
    return data.data;
  },

  /**
   * Approve a proposal
   */
  approve: async (proposalId, comment) => {
    const { data } = await api.post(`/api/proposals/${proposalId}/approve`, { 
      comment,
    });
    return data.data;
  },

  /**
   * Reject a proposal
   */
  reject: async (proposalId, reason) => {
    const { data } = await api.post(`/api/proposals/${proposalId}/reject`, { 
      reason,
    });
    return data.data;
  },

  /**
   * Add a comment to a proposal
   */
  addComment: async (proposalId, content) => {
    const { data } = await api.post(`/api/proposals/${proposalId}/comments`, { 
      content,
    });
    return data.data;
  },

  /**
   * Analyze risk for a proposal
   */
  analyzeRisk: async (proposalId) => {
    const { data } = await api.post(`/api/proposals/${proposalId}/analyze`);
    return data.data?.analysis || data.data;
  },

  /**
   * Execute a proposal (apply changes)
   */
  execute: async (proposalId, dryRun = false) => {
    const { data } = await api.post(`/api/proposals/${proposalId}/execute`, { 
      dryRun,
    });
    return data.data?.result || data.data;
  },

  /**
   * Rollback a proposal
   */
  rollback: async (proposalId) => {
    const { data } = await api.post(`/api/proposals/${proposalId}/rollback`);
    return data.data;
  },

  /**
   * Get audit log
   */
  getAuditLog: async () => {
    const { data } = await api.get('/api/audit-log');
    return data.data?.entries || data.entries || [];
  },
};

/**
 * Rules API - Governance rules
 * 
 * Backend route:
 * - GET /api/rules -> { success, rules }
 */
export const rulesAPI = {
  /**
   * Get all governance rules
   */
  getRules: async () => {
    const { data } = await api.get('/api/rules');
    return data.rules || data.data?.rules || [];
  },
};
