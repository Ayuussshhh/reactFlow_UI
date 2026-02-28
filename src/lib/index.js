/**
 * API Client - Main Export File
 * 
 * Clean imports:
 *   import { authAPI, connectionAPI, projectsAPI } from '@/lib';
 *   import { pipelineAPI, schemaAPI, snapshotAPI } from '@/lib';
 * 
 * Direct imports:
 *   import { authAPI } from '@/lib/api/auth';
 *   import { connectionAPI, snapshotAPI } from '@/lib/api/connection';
 *   import { projectsAPI } from '@/lib/api/projects';
 *   import { schemaAPI, pipelineAPI, rulesAPI } from '@/lib/api';
 */

// Auth API
export { authAPI } from './api/auth';

// Connection & Snapshot APIs  
export { connectionAPI, snapshotAPI } from './api/connection';

// Projects API
export { projectsAPI } from './api/projects';

// Schema, Pipeline & Rules APIs
export { schemaAPI, pipelineAPI, rulesAPI } from './api/index';

// Axios instance (for custom requests)
export { default as api } from './api/axiosInstance';
