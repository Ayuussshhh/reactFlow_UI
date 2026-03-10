/**
 * Universal Database Connection String Builder and Parser
 * Supports: PostgreSQL, MySQL, MongoDB, AWS RDS, Azure SQL, Supabase, Google Cloud SQL, MariaDB
 */

export const DATABASE_TYPES = {
  POSTGRESQL: 'postgresql',
  MYSQL: 'mysql',
  MONGODB: 'mongodb',
  MARIADB: 'mariadb',
  SUPABASE: 'supabase',
  NEON: 'neon',
  AWS_RDS_POSTGRES: 'aws-rds-postgres',
  AWS_RDS_MYSQL: 'aws-rds-mysql',
  AZURE_SQL: 'azure-sql',
  GOOGLE_CLOUD_SQL: 'google-cloud-sql',
};

export const DATABASE_LABELS = {
  [DATABASE_TYPES.POSTGRESQL]: 'PostgreSQL',
  [DATABASE_TYPES.MYSQL]: 'MySQL',
  [DATABASE_TYPES.MARIADB]: 'MariaDB',
  [DATABASE_TYPES.MONGODB]: 'MongoDB',
  [DATABASE_TYPES.AZURE_SQL]: 'Azure SQL',
  [DATABASE_TYPES.AWS_RDS_POSTGRES]: 'AWS RDS (PostgreSQL)',
  [DATABASE_TYPES.AWS_RDS_MYSQL]: 'AWS RDS (MySQL)',
  [DATABASE_TYPES.SUPABASE]: 'Supabase',
  [DATABASE_TYPES.GOOGLE_CLOUD_SQL]: 'Google Cloud SQL',
  [DATABASE_TYPES.NEON]: 'Neon',
};

export const DATABASE_ICONS = {
  [DATABASE_TYPES.POSTGRESQL]: '🐘',
  [DATABASE_TYPES.MYSQL]: '🐬',
  [DATABASE_TYPES.MARIADB]: 'Ⓜ️',
  [DATABASE_TYPES.MONGODB]: '🍃',
  [DATABASE_TYPES.AZURE_SQL]: '☁️',
  [DATABASE_TYPES.AWS_RDS_POSTGRES]: '🐘',
  [DATABASE_TYPES.AWS_RDS_MYSQL]: '🐬',
  [DATABASE_TYPES.SUPABASE]: '🚀',
  [DATABASE_TYPES.GOOGLE_CLOUD_SQL]: '☁️',
  [DATABASE_TYPES.NEON]: '⚡',
};

/**
 * Connection string format hints for each database type
 */
export const CONNECTION_STRING_FORMATS = {
  [DATABASE_TYPES.POSTGRESQL]: 'postgresql://user:password@host:5432/database',
  [DATABASE_TYPES.NEON]: 'postgresql://user:password@host.neon.tech/database',
  [DATABASE_TYPES.MYSQL]: 'mysql://user:password@host:3306/database',
  [DATABASE_TYPES.MARIADB]: 'mysql://user:password@host:3306/database',
  [DATABASE_TYPES.MONGODB]: 'mongodb://user:password@host:27017/database',
  [DATABASE_TYPES.AZURE_SQL]: 'Server=servername.database.windows.net;User ID=user;Password=password;Database=database;',
  [DATABASE_TYPES.AWS_RDS_POSTGRES]: 'postgresql://user:password@instance.xxxxx.region.rds.amazonaws.com:5432/database',
  [DATABASE_TYPES.AWS_RDS_MYSQL]: 'mysql://user:password@instance.xxxxx.region.rds.amazonaws.com:3306/database',
  [DATABASE_TYPES.SUPABASE]: 'postgresql://user:password@db.xxxxx.supabase.co:5432/postgres',
  [DATABASE_TYPES.GOOGLE_CLOUD_SQL]: 'postgresql://user:password@host/database',
};

/**
 * Parse a connection string to extract components
 */
export function parseConnectionString(connectionString, dbType) {
  const result = {
    host: '',
    port: '',
    username: '',
    password: '',
    database: '',
    raw: connectionString,
  };

  if (!connectionString) return result;

  try {
    switch (dbType) {
      case DATABASE_TYPES.MONGODB: {
        const mongoUrl = new URL(connectionString);
        result.username = mongoUrl.username;
        result.password = mongoUrl.password;
        result.host = mongoUrl.hostname;
        result.port = mongoUrl.port || '27017';
        result.database = mongoUrl.pathname?.replace(/^\//, '') || '';
        break;
      }

      case DATABASE_TYPES.AZURE_SQL: {
        const parts = connectionString.split(';').reduce((acc, part) => {
          const [key, value] = part.split('=');
          if (key && value) acc[key.trim()] = value.trim();
          return acc;
        }, {});
        result.host = parts['Server']?.replace('tcp:', '') || '';
        result.username = parts['User ID'] || '';
        result.password = parts['Password'] || '';
        result.database = parts['Database'] || '';
        result.port = '1433';
        break;
      }

      case DATABASE_TYPES.POSTGRESQL:
      case DATABASE_TYPES.NEON:
      case DATABASE_TYPES.MYSQL:
      case DATABASE_TYPES.MARIADB:
      case DATABASE_TYPES.AWS_RDS_POSTGRES:
      case DATABASE_TYPES.AWS_RDS_MYSQL:
      case DATABASE_TYPES.SUPABASE:
      case DATABASE_TYPES.GOOGLE_CLOUD_SQL:
      default: {
        // Standard URI parsing for postgres/mysql
        const url = new URL(connectionString.replace(/^(mysql|postgres|postgresql):/, 'postgres://'));
        result.username = url.username;
        result.password = url.password;
        result.host = url.hostname;
        result.port = url.port || (dbType?.includes('mysql') ? '3306' : '5432');
        result.database = url.pathname?.replace(/^\//, '') || '';
        break;
      }
    }
  } catch (error) {
    console.error('Error parsing connection string:', error);
  }

  return result;
}

/**
 * Build a connection string from components
 */
export function buildConnectionString(components, dbType) {
  const { username, password, host, port, database } = components;

  if (!host || !database) {
    throw new Error('Host and database are required');
  }

  switch (dbType) {
    case DATABASE_TYPES.MONGODB: {
      const mongoPort = port || '27017';
      if (username && password) {
        return `mongodb://${username}:${password}@${host}:${mongoPort}/${database}`;
      }
      return `mongodb://${host}:${mongoPort}/${database}`;
    }

    case DATABASE_TYPES.AZURE_SQL: {
      const parts = [];
      parts.push(`Server=tcp:${host},1433`);
      parts.push(`User ID=${username}`);
      if (password) parts.push(`Password=${password}`);
      parts.push(`Database=${database}`);
      parts.push('Encrypt=true');
      parts.push('TrustServerCertificate=false');
      parts.push('Connection Timeout=30');
      return parts.join(';');
    }

    case DATABASE_TYPES.POSTGRESQL:
    case DATABASE_TYPES.NEON:
    case DATABASE_TYPES.MYSQL:
    case DATABASE_TYPES.MARIADB:
    case DATABASE_TYPES.AWS_RDS_POSTGRES:
    case DATABASE_TYPES.AWS_RDS_MYSQL:
    case DATABASE_TYPES.SUPABASE:
    case DATABASE_TYPES.GOOGLE_CLOUD_SQL:
    default: {
      const protocol = dbType?.includes('mysql') ? 'mysql' : 'postgresql';
      const dbPort = port || (dbType?.includes('mysql') ? '3306' : '5432');
      
      if (username && password) {
        return `${protocol}://${username}:${password}@${host}:${dbPort}/${database}`;
      }
      return `${protocol}://${host}:${dbPort}/${database}`;
    }
  }
}

/**
 * Get the default port for a database type
 */
export function getDefaultPort(dbType) {
  const ports = {
    [DATABASE_TYPES.POSTGRESQL]: 5432,
    [DATABASE_TYPES.NEON]: 5432,
    [DATABASE_TYPES.MYSQL]: 3306,
    [DATABASE_TYPES.MARIADB]: 3306,
    [DATABASE_TYPES.MONGODB]: 27017,
    [DATABASE_TYPES.AZURE_SQL]: 1433,
    [DATABASE_TYPES.AWS_RDS_POSTGRES]: 5432,
    [DATABASE_TYPES.AWS_RDS_MYSQL]: 3306,
    [DATABASE_TYPES.SUPABASE]: 5432,
    [DATABASE_TYPES.GOOGLE_CLOUD_SQL]: 5432,
  };
  return ports[dbType] || 5432;
}

/**
 * Validate connection string format
 */
export function validateConnectionString(connectionString, dbType) {
  if (!connectionString?.trim()) {
    return { valid: false, error: 'Connection string is required' };
  }

  try {
    parseConnectionString(connectionString, dbType);
    return { valid: true };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

/**
 * Get all supported database types
 */
export function getSupportedDatabaseTypes() {
  return Object.keys(DATABASE_TYPES);
}

/**
 * Get database type info
 */
export function getDatabaseInfo(dbType) {
  return {
    type: dbType,
    label: DATABASE_LABELS[dbType] || 'Unknown',
    icon: DATABASE_ICONS[dbType] || '🗄️',
    format: CONNECTION_STRING_FORMATS[dbType] || '',
    defaultPort: getDefaultPort(dbType),
  };
}
