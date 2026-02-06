/**
 * SQL Preview Panel - Side-peek editor showing generated SQL
 * Figma Dev Mode inspired
 */

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CodeBracketIcon, 
  ClipboardIcon, 
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline';
import { cn } from '../../lib/utils';
import { useAppStore } from '../../store';
import { Highlight, themes } from 'prism-react-renderer';

// SQL Syntax highlighting
function SQLHighlight({ code }) {
  return (
    <Highlight theme={themes.nightOwl} code={code.trim()} language="sql">
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre
          className={cn(className, 'text-sm p-4 rounded-xl overflow-auto')}
          style={{ ...style, background: 'transparent' }}
        >
          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({ line })}>
              <span className="inline-block w-8 text-neutral-500 select-none text-right mr-4">
                {i + 1}
              </span>
              {line.map((token, key) => (
                <span key={key} {...getTokenProps({ token })} />
              ))}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  );
}

export default function SQLPanel() {
  const { sqlPanelOpen, setSQLPanelOpen, currentSQL } = useAppStore();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('sql'); // 'sql' | 'rust' | 'typescript'

  const handleCopy = async () => {
    await navigator.clipboard.writeText(currentSQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate Rust SeaORM model from SQL
  const generateRustModel = (sql) => {
    // Basic conversion - in production this would be more sophisticated
    const tableMatch = sql.match(/CREATE TABLE "(\w+)"/i);
    if (!tableMatch) return '// Select a table to see Rust model';
    
    const tableName = tableMatch[1];
    const camelCase = tableName.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    const pascalCase = camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
    
    return `use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel)]
#[sea_orm(table_name = "${tableName}")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    // Add other fields based on columns
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}`;
  };

  // Generate TypeScript interface from SQL
  const generateTypeScript = (sql) => {
    const tableMatch = sql.match(/CREATE TABLE "(\w+)"/i);
    if (!tableMatch) return '// Select a table to see TypeScript interface';
    
    const tableName = tableMatch[1];
    const pascalCase = tableName
      .split('_')
      .map(s => s.charAt(0).toUpperCase() + s.slice(1))
      .join('');
    
    return `export interface ${pascalCase} {
  id: number;
  // Add other fields based on columns
  created_at: Date;
  updated_at: Date;
}

export type Create${pascalCase}Input = Omit<${pascalCase}, 'id' | 'created_at' | 'updated_at'>;
export type Update${pascalCase}Input = Partial<Create${pascalCase}Input>;`;
  };

  const tabs = [
    { id: 'sql', label: 'SQL', icon: '🐘' },
    { id: 'rust', label: 'Rust', icon: '🦀' },
    { id: 'typescript', label: 'TypeScript', icon: '📘' },
  ];

  const getCodeContent = () => {
    switch (activeTab) {
      case 'rust':
        return generateRustModel(currentSQL);
      case 'typescript':
        return generateTypeScript(currentSQL);
      default:
        return currentSQL || '-- Select a table or create a relationship to see SQL';
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setSQLPanelOpen(!sqlPanelOpen)}
        className={cn(
          'fixed right-0 top-1/2 -translate-y-1/2 z-40',
          'flex items-center gap-2 px-3 py-4',
          'bg-neutral-900 text-white rounded-l-xl shadow-lg',
          'hover:bg-neutral-800 transition-all duration-200',
          sqlPanelOpen && 'opacity-0 pointer-events-none'
        )}
      >
        <CodeBracketIcon className="w-5 h-5" />
        <span className="text-xs font-medium writing-vertical">Dev Mode</span>
      </button>

      {/* Panel */}
      <AnimatePresence>
        {sqlPanelOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={cn(
              'fixed right-0 top-14 bottom-0 z-30',
              'w-[420px] bg-neutral-900/95 backdrop-blur-xl',
              'border-l border-neutral-800 shadow-2xl',
              'flex flex-col'
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary-500/20 rounded-lg flex items-center justify-center">
                  <CodeBracketIcon className="w-4 h-4 text-primary-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Dev Mode</h3>
                  <p className="text-xs text-neutral-400">Export code for your stack</p>
                </div>
              </div>
              <button
                onClick={() => setSQLPanelOpen(false)}
                className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex p-2 gap-1 border-b border-neutral-800">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                    activeTab === tab.id
                      ? 'bg-neutral-800 text-white'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
                  )}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Code Content */}
            <div className="flex-1 overflow-auto">
              <div className="bg-neutral-950/50 min-h-full">
                <SQLHighlight code={getCodeContent()} />
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-neutral-800 flex items-center gap-2">
              <button
                onClick={handleCopy}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all',
                  'bg-primary-500 hover:bg-primary-600 text-white'
                )}
              >
                {copied ? (
                  <>
                    <CheckIcon className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <ClipboardIcon className="w-4 h-4" />
                    Copy Code
                  </>
                )}
              </button>
              <button className="p-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white transition-colors">
                <DocumentDuplicateIcon className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
