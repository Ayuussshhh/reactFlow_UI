'use client';

/**
 * ConnectDialog - Database connection modal
 */
import { useState } from 'react';
import { useUIStore, useConnectionStore, useSchemaStore, useCanvasStore } from '../../store/store';
import { useProjectStore } from '../../store/projectStore';
import { connectionAPI, projectsAPI } from '../../lib';
import { getErrorMessage, logger } from '../../lib/utils';
import * as Dialog from '@radix-ui/react-dialog';
import {
  XMarkIcon,
  CircleStackIcon,
  ServerIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function ConnectDialog() {
  const { connectDialogOpen, setConnectDialogOpen } = useUIStore();
  const { setConnection, setConnecting, isConnecting } = useConnectionStore();
  const { setSchema, setLoading: setSchemaLoading } = useSchemaStore();
  const { buildFromSchema } = useCanvasStore();
  const { currentProject, setCurrentConnection } = useProjectStore();

  const [connectionString, setConnectionString] = useState('');
  const [name, setName] = useState('');
  const [environment, setEnvironment] = useState('development');
  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);

  const handleTest = async () => {
    if (!connectionString || !connectionString.trim()) {
      toast.error('Please enter a connection string');
      return;
    }
    
    setIsTesting(true);
    setTestResult(null);
    
    try {
      const result = await connectionAPI.test(connectionString.trim());
      
      if (result.success) {
        setTestResult({
          success: true,
          latencyMs: result.latencyMs || 0,
          serverVersion: result.serverVersion || 'Unknown',
        });
        toast.success('Connection successful!');
      } else {
        throw new Error('Connection test failed');
      }
    } catch (error) {
      const errorMsg = getErrorMessage(error);
      logger.warn('ConnectDialog', 'Connection test failed', { message: errorMsg });
      setTestResult({
        success: false,
        message: errorMsg,
      });
      toast.error(errorMsg);
    } finally {
      setIsTesting(false);
    }
  };

  const handleConnect = async () => {
    // Validation
    if (!connectionString || !connectionString.trim()) {
      toast.error('Please enter a connection string');
      return;
    }
    
    if (!currentProject) {
      toast.error('Please select a project first');
      return;
    }
    
    setConnecting(true);
    setSchemaLoading(true);
    
    try {
      // Step 1: Connect to database and introspect schema
      console.log('Step 1: Connecting to database...');
      const result = await connectionAPI.connect(
        connectionString.trim(),
        name.trim() || undefined,
        environment
      );
      
      if (!result.connection) {
        throw new Error('Failed to establish connection');
      }
      
      console.log('Step 2: Saving connection to project...');
      // Step 2: Save connection to project
      const savedConnection = await projectsAPI.saveConnection(currentProject.id, {
        name: name.trim() || 'Default Connection',
        connection_string: connectionString.trim(),
        connection_type: 'postgresql',
        environment,
      });
      
      if (!savedConnection) {
        throw new Error('Failed to save connection');
      }
      
      console.log('Step 3: Activating connection...');
      // Step 3: Activate the connection
      await projectsAPI.activateConnection(currentProject.id, savedConnection.id);
      
      console.log('Step 4: Updating stores...');
      // Step 4: Update stores with connection data
      setConnection(result.connection);
      setCurrentConnection(savedConnection);
      
      // Step 5: Process schema data
      const tables = result.schema?.tables || [];
      const foreignKeys = result.schema?.foreign_keys || result.schema?.foreignKeys || [];
      
      if (tables.length > 0) {
        setSchema(tables, foreignKeys);
        buildFromSchema(tables, foreignKeys);
      }
      
      // Success
      toast.success(`Connected to ${result.connection.database} successfully!`);
      setConnectDialogOpen(false);
      
      // Reset form
      setConnectionString('');
      setName('');
      setEnvironment('development');
      setTestResult(null);
    } catch (error) {
      const errorMsg = getErrorMessage(error);
      logger.error('ConnectDialog', 'Connection failed', { error, message: errorMsg });
      toast.error(errorMsg);
    } finally {
      setConnecting(false);
      setSchemaLoading(false);
    }
  };

  return (
    <Dialog.Root open={connectDialogOpen} onOpenChange={setConnectDialogOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-2xl shadow-2xl z-50 overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <CircleStackIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <Dialog.Title className="text-lg font-semibold text-slate-900">
                  Connect Database
                </Dialog.Title>
                <Dialog.Description className="text-sm text-slate-500">
                  Enter your PostgreSQL connection details
                </Dialog.Description>
              </div>
            </div>
            <Dialog.Close asChild>
              <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          {/* Content */}
          <div className="p-6 space-y-5">
            {/* Connection String */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Connection String
              </label>
              <textarea
                value={connectionString}
                onChange={(e) => setConnectionString(e.target.value)}
                placeholder="postgres://user:password@host:5432/database"
                rows={3}
                className="w-full px-4 py-3 text-sm font-mono bg-slate-50 border border-slate-200 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all resize-none"
              />
              <p className="text-xs text-slate-400 mt-1.5">
                Format: postgres://user:password@host:port/database
              </p>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Connection Name <span className="font-normal text-slate-400">(optional)</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Database"
                className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
              />
            </div>

            {/* Environment */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Environment
              </label>
              <div className="flex gap-2">
                {[
                  { id: 'development', label: 'Development', color: 'emerald' },
                  { id: 'staging', label: 'Staging', color: 'amber' },
                  { id: 'production', label: 'Production', color: 'red' },
                ].map((env) => (
                  <button
                    key={env.id}
                    onClick={() => setEnvironment(env.id)}
                    className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      environment === env.id
                        ? env.id === 'development'
                          ? 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-500'
                          : env.id === 'staging'
                          ? 'bg-amber-100 text-amber-700 ring-2 ring-amber-500'
                          : 'bg-red-100 text-red-700 ring-2 ring-red-500'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {env.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Test Result */}
            {testResult && (
              <div
                className={`p-4 rounded-xl flex items-start gap-3 ${
                  testResult.success
                    ? 'bg-emerald-50 border border-emerald-200'
                    : 'bg-red-50 border border-red-200'
                }`}
              >
                {testResult.success ? (
                  <CheckCircleIcon className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <ExclamationCircleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <p
                    className={`text-sm font-semibold ${
                      testResult.success ? 'text-emerald-700' : 'text-red-700'
                    }`}
                  >
                    {testResult.success ? 'Connection successful!' : 'Connection failed'}
                  </p>
                  {testResult.success ? (
                    <p className="text-xs text-emerald-600 mt-1">
                      Latency: {testResult.latencyMs}ms • Server: {testResult.serverVersion}
                    </p>
                  ) : (
                    <p className="text-xs text-red-600 mt-1">{testResult.message}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-200">
            <button
              onClick={handleTest}
              disabled={!connectionString || isTesting}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 hover:border-slate-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <ServerIcon className="w-4 h-4" />
              {isTesting ? 'Testing...' : 'Test Connection'}
            </button>
            <button
              onClick={handleConnect}
              disabled={!connectionString || isConnecting}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl hover:from-indigo-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-indigo-500/25"
            >
              {isConnecting ? 'Connecting...' : 'Connect'}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
