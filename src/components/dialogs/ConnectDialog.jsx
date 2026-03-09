'use client';

/**
 * ConnectDialog - Database connection modal with multi-database support
 */
import { useState, useMemo } from 'react';
import { useUIStore, useConnectionStore, useSchemaStore, useCanvasStore } from '../../store/store';
import { useProjectStore } from '../../store/projectStore';
import { connectionAPI, projectsAPI } from '../../lib';
import { getErrorMessage, logger } from '../../lib/utils';
import {
  DATABASE_TYPES,
  DATABASE_LABELS,
  DATABASE_ICONS,
  CONNECTION_STRING_FORMATS,
  parseConnectionString,
  buildConnectionString,
  getDefaultPort,
} from '../../lib/connectionString';
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

  const [dbType, setDbType] = useState(DATABASE_TYPES.POSTGRESQL);
  const [connectionString, setConnectionString] = useState('');
  const [useAdvanced, setUseAdvanced] = useState(false);
  const [components, setComponents] = useState({
    host: '',
    port: '',
    username: '',
    password: '',
    database: '',
  });
  const [name, setName] = useState('');
  const [environment, setEnvironment] = useState('development');
  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);

  const supportedDatabases = useMemo(() => {
    return Object.entries(DATABASE_TYPES).map(([key, value]) => ({
      id: value,
      label: DATABASE_LABELS[value],
      icon: DATABASE_ICONS[value],
    }));
  }, []);

  const handleComponentChange = (field, value) => {
    setComponents((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTest = async () => {
    let connStr = connectionString;

    if (!useAdvanced && Object.values(components).some((v) => v)) {
      try {
        connStr = buildConnectionString(components, dbType);
      } catch (error) {
        toast.error('Invalid connection components: ' + error.message);
        return;
      }
    }

    if (!connStr || !connStr.trim()) {
      toast.error('Please enter a connection string');
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const result = await connectionAPI.test(connStr.trim());

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
    let connStr = connectionString;

    if (!useAdvanced && Object.values(components).some((v) => v)) {
      try {
        connStr = buildConnectionString(components, dbType);
      } catch (error) {
        toast.error('Invalid connection components: ' + error.message);
        return;
      }
    }

    if (!connStr || !connStr.trim()) {
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
      const result = await connectionAPI.connect(connStr.trim(), name.trim() || undefined, environment);

      if (!result.connection) {
        throw new Error('Failed to establish connection');
      }

      const savedConnection = await projectsAPI.saveConnection(currentProject.id, {
        name: name.trim() || 'Default Connection',
        connectionString: connStr.trim(),
        connectionType: dbType,
        environment,
      });

      if (!savedConnection) {
        throw new Error('Failed to save connection');
      }

      await projectsAPI.activateConnection(currentProject.id, savedConnection.id);

      setConnection(result.connection);
      setCurrentConnection(savedConnection);

      const tables = result.schema?.tables || [];
      const foreignKeys = result.schema?.foreign_keys || result.schema?.foreignKeys || [];

      if (tables.length > 0) {
        setSchema(tables, foreignKeys);
        buildFromSchema(tables, foreignKeys);
      }

      toast.success(`Connected to ${result.connection.database} successfully!`);
      setConnectDialogOpen(false);

      setConnectionString('');
      setComponents({ host: '', port: '', username: '', password: '', database: '' });
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
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-2xl shadow-2xl z-50 overflow-hidden animate-slide-up max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <CircleStackIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <Dialog.Title className="text-lg font-semibold text-slate-900">
                  Connect Database
                </Dialog.Title>
                <Dialog.Description className="text-sm text-slate-500">
                  Add a new database connection to your project
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
            {/* Database Type Selector */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Database Type
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {supportedDatabases.map((db) => (
                  <button
                    key={db.id}
                    onClick={() => {
                      setDbType(db.id);
                      setConnectionString('');
                      setComponents({ host: '', port: '', username: '', password: '', database: '' });
                    }}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      dbType === db.id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <span className="text-2xl mb-1 block">{db.icon}</span>
                    <span className={`text-sm font-medium ${dbType === db.id ? 'text-indigo-700' : 'text-slate-700'}`}>
                      {db.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Mode Toggle */}
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-slate-700">Connection Mode</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setUseAdvanced(false)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      !useAdvanced
                        ? 'bg-white text-indigo-600 border border-indigo-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Simple
                  </button>
                  <button
                    onClick={() => setUseAdvanced(true)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      useAdvanced
                        ? 'bg-white text-indigo-600 border border-indigo-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Advanced
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-600">
                {useAdvanced
                  ? 'Paste your connection string directly'
                  : 'Fill in connection details separately'}
              </p>
            </div>

            {/* Simple Mode - Connection Components */}
            {!useAdvanced && (
              <div className="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Host *</label>
                    <input
                      type="text"
                      value={components.host}
                      onChange={(e) => handleComponentChange('host', e.target.value)}
                      placeholder="localhost"
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Port</label>
                    <input
                      type="number"
                      value={components.port}
                      onChange={(e) => handleComponentChange('port', e.target.value)}
                      placeholder={String(getDefaultPort(dbType))}
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Username</label>
                    <input
                      type="text"
                      value={components.username}
                      onChange={(e) => handleComponentChange('username', e.target.value)}
                      placeholder="user"
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                    <input
                      type="password"
                      value={components.password}
                      onChange={(e) => handleComponentChange('password', e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Database *</label>
                  <input
                    type="text"
                    value={components.database}
                    onChange={(e) => handleComponentChange('database', e.target.value)}
                    placeholder="database_name"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            {/* Advanced Mode - Connection String */}
            {useAdvanced && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Connection String
                </label>
                <textarea
                  value={connectionString}
                  onChange={(e) => setConnectionString(e.target.value)}
                  placeholder={CONNECTION_STRING_FORMATS[dbType] || 'Enter connection string...'}
                  rows={4}
                  className="w-full px-4 py-3 text-sm font-mono bg-slate-50 border border-slate-200 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all resize-none"
                />
                <p className="text-xs text-slate-400 mt-1.5">
                  Format: {CONNECTION_STRING_FORMATS[dbType] || 'See database provider docs'}
                </p>
              </div>
            )}

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
          <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-200 sticky bottom-0">
            <button
              onClick={handleTest}
              disabled={
                !((useAdvanced && connectionString) || 
                  (!useAdvanced && components.host && components.database)) || 
                isTesting
              }
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 hover:border-slate-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <ServerIcon className="w-4 h-4" />
              {isTesting ? 'Testing...' : 'Test Connection'}
            </button>
            <button
              onClick={handleConnect}
              disabled={
                !((useAdvanced && connectionString) || 
                  (!useAdvanced && components.host && components.database)) || 
                isConnecting
              }
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
