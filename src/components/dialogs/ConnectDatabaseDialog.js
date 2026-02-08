/**
 * Connect Database Dialog
 * 
 * Allows users to connect to any PostgreSQL database by providing
 * a connection string. This is the primary way to add databases in SchemaFlow.
 */

'use client';

import { useState, useCallback } from 'react';
import { 
  LinkIcon, 
  ServerIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { Dialog, DialogFooter } from '../ui/Dialog';
import { Button, Input } from '../ui/index';
import { connectionAPI } from '../../lib/api';

// Environment options
const ENVIRONMENTS = [
  { value: 'development', label: 'Development', color: 'bg-green-100 text-green-700' },
  { value: 'staging', label: 'Staging', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'production', label: 'Production', color: 'bg-red-100 text-red-700' },
];

export default function ConnectDatabaseDialog({ open, onClose, onConnected }) {
  const [connectionString, setConnectionString] = useState('');
  const [name, setName] = useState('');
  const [environment, setEnvironment] = useState('development');
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [error, setError] = useState('');
  const [testResult, setTestResult] = useState(null);

  // Parse connection string to show preview
  const parseConnectionString = useCallback((str) => {
    try {
      if (!str) return null;
      const url = new URL(str);
      return {
        host: url.hostname,
        port: url.port || '5432',
        database: url.pathname.replace('/', ''),
        user: url.username,
      };
    } catch {
      return null;
    }
  }, []);

  const parsed = parseConnectionString(connectionString);

  // Test connection without connecting
  const handleTest = async () => {
    if (!connectionString.trim()) {
      setError('Connection string is required');
      return;
    }

    setIsTesting(true);
    setError('');
    setTestResult(null);

    try {
      const result = await connectionAPI.test(connectionString);
      setTestResult({
        success: true,
        latency: result.latencyMs,
        version: result.serverVersion,
      });
    } catch (err) {
      setTestResult({
        success: false,
        error: err.message || 'Connection failed',
      });
    } finally {
      setIsTesting(false);
    }
  };

  // Connect to database
  const handleConnect = async (e) => {
    e.preventDefault();
    
    if (!connectionString.trim()) {
      setError('Connection string is required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await connectionAPI.connect(
        connectionString,
        name.trim() || null,
        environment
      );
      
      // Call parent callback with connection result
      if (onConnected) {
        onConnected(result);
      }
      
      handleClose();
    } catch (err) {
      setError(err.message || 'Failed to connect');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setConnectionString('');
    setName('');
    setEnvironment('development');
    setError('');
    setTestResult(null);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="Connect to Database"
      description="Connect to any PostgreSQL database using a connection string"
      size="lg"
    >
      <form onSubmit={handleConnect}>
        <div className="space-y-6">
          {/* Connection String Input */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
              <LinkIcon className="w-6 h-6 text-primary-600" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Connection String
              </label>
              <input
                type="text"
                className={`w-full px-4 py-3 rounded-lg border font-mono text-sm ${
                  error ? 'border-red-300 bg-red-50' : 'border-neutral-300'
                } focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
                placeholder="postgres://username:password@host:5432/database"
                value={connectionString}
                onChange={(e) => {
                  setConnectionString(e.target.value);
                  setError('');
                  setTestResult(null);
                }}
                autoFocus
              />
              {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
              )}
              <p className="mt-2 text-xs text-neutral-500">
                Supports PostgreSQL connection strings. Your credentials are processed securely.
              </p>
            </div>
          </div>

          {/* Connection Preview */}
          {parsed && (
            <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
              <div className="flex items-center gap-2 mb-3">
                <ServerIcon className="w-4 h-4 text-neutral-500" />
                <span className="text-sm font-medium text-neutral-700">Connection Preview</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-neutral-500">Host:</span>{' '}
                  <span className="font-medium">{parsed.host}</span>
                </div>
                <div>
                  <span className="text-neutral-500">Port:</span>{' '}
                  <span className="font-medium">{parsed.port}</span>
                </div>
                <div>
                  <span className="text-neutral-500">Database:</span>{' '}
                  <span className="font-medium">{parsed.database}</span>
                </div>
                <div>
                  <span className="text-neutral-500">User:</span>{' '}
                  <span className="font-medium">{parsed.user}</span>
                </div>
              </div>
            </div>
          )}

          {/* Test Result */}
          {testResult && (
            <div className={`rounded-lg p-4 border ${
              testResult.success 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center gap-2">
                {testResult.success ? (
                  <>
                    <CheckCircleIcon className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-green-700">
                      Connection successful! ({testResult.latency}ms)
                    </span>
                  </>
                ) : (
                  <>
                    <ExclamationCircleIcon className="w-5 h-5 text-red-600" />
                    <span className="text-sm font-medium text-red-700">
                      {testResult.error}
                    </span>
                  </>
                )}
              </div>
              {testResult.success && testResult.version && (
                <p className="mt-1 text-xs text-green-600 ml-7">
                  {testResult.version}
                </p>
              )}
            </div>
          )}

          {/* Optional Settings */}
          <div className="grid grid-cols-2 gap-4">
            {/* Friendly Name */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Friendly Name (optional)
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., Production DB"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Environment */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Environment
              </label>
              <select
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={environment}
                onChange={(e) => setEnvironment(e.target.value)}
              >
                {ENVIRONMENTS.map((env) => (
                  <option key={env.value} value={env.value}>
                    {env.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button
            type="button"
            variant="secondary"
            onClick={handleTest}
            disabled={!connectionString.trim() || isTesting || isLoading}
          >
            {isTesting ? (
              <>
                <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              'Test Connection'
            )}
          </Button>
          <div className="flex-1" />
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="primary" 
            isLoading={isLoading}
            disabled={!connectionString.trim()}
          >
            Connect
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
