/**
 * Utility functions for SchemaFlow
 */

import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind classes with clsx
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Generate SQL CREATE TABLE statement
 */
export function generateCreateTableSQL(tableName, columns) {
  if (!tableName || !columns?.length) return '';

  const columnDefs = columns.map((col) => {
    let def = `  "${col.name}" ${col.type || col.data_type}`;
    if (col.primary_key || col.is_primary_key) def += ' PRIMARY KEY';
    if (col.unique || col.is_unique) def += ' UNIQUE';
    if (col.nullable === false || col.nullable === 'NO') def += ' NOT NULL';
    if (col.default_value) def += ` DEFAULT ${col.default_value}`;
    return def;
  });

  return `CREATE TABLE "${tableName}" (\n${columnDefs.join(',\n')}\n);`;
}

/**
 * Generate SQL ALTER TABLE for foreign key
 */
export function generateForeignKeySQL(config) {
  const { sourceTable, sourceColumn, referencedTable, referencedColumn, onDelete = 'RESTRICT', onUpdate = 'RESTRICT' } = config;
  const constraintName = config.constraintName || `fk_${sourceTable}_${sourceColumn}_${referencedTable}`;

  return `ALTER TABLE "${sourceTable}"
  ADD CONSTRAINT "${constraintName}"
  FOREIGN KEY ("${sourceColumn}")
  REFERENCES "${referencedTable}" ("${referencedColumn}")
  ON DELETE ${onDelete}
  ON UPDATE ${onUpdate};`;
}

/**
 * Generate SQL DROP TABLE statement
 */
export function generateDropTableSQL(tableName) {
  return `DROP TABLE IF EXISTS "${tableName}" CASCADE;`;
}

/**
 * Generate SQL SELECT statement
 */
export function generateSelectSQL(tableName, columns = ['*'], limit = 100) {
  const cols = Array.isArray(columns) ? columns.map(c => `"${c}"`).join(', ') : '*';
  return `SELECT ${cols}\nFROM "${tableName}"\nLIMIT ${limit};`;
}

/**
 * Format SQL for display (basic prettification)
 */
export function formatSQL(sql) {
  return sql
    .replace(/\s+/g, ' ')
    .replace(/\s*,\s*/g, ',\n  ')
    .replace(/\(\s*/g, '(\n  ')
    .replace(/\s*\)/g, '\n)')
    .trim();
}

/**
 * PostgreSQL data types with descriptions
 */
export const POSTGRES_TYPES = [
  { value: 'serial', label: 'SERIAL', group: 'Numeric', description: 'Auto-incrementing 4-byte integer' },
  { value: 'bigserial', label: 'BIGSERIAL', group: 'Numeric', description: 'Auto-incrementing 8-byte integer' },
  { value: 'integer', label: 'INTEGER', group: 'Numeric', description: '4-byte signed integer' },
  { value: 'bigint', label: 'BIGINT', group: 'Numeric', description: '8-byte signed integer' },
  { value: 'smallint', label: 'SMALLINT', group: 'Numeric', description: '2-byte signed integer' },
  { value: 'decimal', label: 'DECIMAL', group: 'Numeric', description: 'Exact numeric with precision' },
  { value: 'real', label: 'REAL', group: 'Numeric', description: '4-byte floating point' },
  { value: 'double precision', label: 'DOUBLE', group: 'Numeric', description: '8-byte floating point' },
  { value: 'varchar(255)', label: 'VARCHAR', group: 'Text', description: 'Variable-length string' },
  { value: 'text', label: 'TEXT', group: 'Text', description: 'Unlimited variable-length string' },
  { value: 'char(50)', label: 'CHAR', group: 'Text', description: 'Fixed-length string' },
  { value: 'boolean', label: 'BOOLEAN', group: 'Boolean', description: 'True/false value' },
  { value: 'date', label: 'DATE', group: 'Date/Time', description: 'Calendar date' },
  { value: 'time', label: 'TIME', group: 'Date/Time', description: 'Time of day' },
  { value: 'timestamp', label: 'TIMESTAMP', group: 'Date/Time', description: 'Date and time' },
  { value: 'timestamptz', label: 'TIMESTAMPTZ', group: 'Date/Time', description: 'Date and time with timezone' },
  { value: 'uuid', label: 'UUID', group: 'Other', description: 'Universally unique identifier' },
  { value: 'json', label: 'JSON', group: 'Other', description: 'JSON data' },
  { value: 'jsonb', label: 'JSONB', group: 'Other', description: 'Binary JSON (faster)' },
  { value: 'bytea', label: 'BYTEA', group: 'Other', description: 'Binary data' },
];

/**
 * Get column type color for UI
 */
export function getTypeColor(type) {
  const normalizedType = (type || '').toLowerCase();
  
  if (['serial', 'bigserial', 'integer', 'bigint', 'smallint', 'int', 'int2', 'int4', 'int8'].some(t => normalizedType.includes(t))) {
    return 'text-blue-600 bg-blue-50';
  }
  if (['decimal', 'numeric', 'real', 'double', 'float'].some(t => normalizedType.includes(t))) {
    return 'text-cyan-600 bg-cyan-50';
  }
  if (['varchar', 'text', 'char'].some(t => normalizedType.includes(t))) {
    return 'text-emerald-600 bg-emerald-50';
  }
  if (['boolean', 'bool'].some(t => normalizedType.includes(t))) {
    return 'text-amber-600 bg-amber-50';
  }
  if (['timestamp', 'date', 'time', 'interval'].some(t => normalizedType.includes(t))) {
    return 'text-purple-600 bg-purple-50';
  }
  if (['uuid'].some(t => normalizedType.includes(t))) {
    return 'text-pink-600 bg-pink-50';
  }
  if (['json', 'jsonb'].some(t => normalizedType.includes(t))) {
    return 'text-orange-600 bg-orange-50';
  }
  
  return 'text-neutral-600 bg-neutral-50';
}

/**
 * Debounce function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Generate random position for new nodes
 */
export function getRandomPosition(index = 0, gridSize = 4) {
  const baseX = 100;
  const baseY = 100;
  const spacingX = 320;
  const spacingY = 400;
  
  return {
    x: baseX + (index % gridSize) * spacingX,
    y: baseY + Math.floor(index / gridSize) * spacingY,
  };
}

/**
 * Parse CSV string to array
 */
export function parseCSV(csvString) {
  const lines = csvString.trim().split('\n');
  if (lines.length === 0) return { headers: [], rows: [] };
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const rows = lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const row = {};
    headers.forEach((h, i) => {
      row[h] = values[i] || '';
    });
    return row;
  });
  
  return { headers, rows };
}
