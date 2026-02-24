/**
 * DEPRECATED: This file has been reorganized into modular API files.
 * 
 * ⚠️ MIGRATION GUIDE ⚠️
 * 
 * OLD (Deprecated):
 *   import { authAPI, projectsAPI } from '@/lib/client'
 * 
 * NEW (Use this instead):
 *   import { authAPI, projectsAPI } from '@/lib'
 * 
 * Or import specific APIs:
 *   import { authAPI } from '@/lib/api/auth'
 *   import { projectsAPI } from '@/lib/api/projects'
 *   import { connectionAPI, snapshotAPI } from '@/lib/api/connection'
 *   import { schemaAPI, pipelineAPI, rulesAPI } from '@/lib/api'
 * 
 * All API modules are now located in:
 *   - src/lib/api/auth.js
 *   - src/lib/api/connection.js (connectionAPI & snapshotAPI)
 *   - src/lib/api/projects.js
 *   - src/lib/api/index.js (schemaAPI, pipelineAPI, rulesAPI)
 *   - src/lib/api/axiosInstance.js (axios config)
 * 
 * Main export:
 *   - src/lib/index.js (re-exports all APIs)
 */

throw new Error(
  'The API client has been reorganized. ' +
  'Import from "@/lib" instead of "@/lib/client". ' +
  'See this file for migration details.'
);
