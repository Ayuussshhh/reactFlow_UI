/**
 * API Client exports for clean imports
 * Import from @/lib instead of @/lib/client
 */
export { authAPI } from './api/auth';
export { connectionAPI, snapshotAPI } from './api/connection';
export { projectsAPI } from './api/projects';
export { schemaAPI, pipelineAPI, rulesAPI } from './api/index';
export { default as api } from './api/axiosInstance';
