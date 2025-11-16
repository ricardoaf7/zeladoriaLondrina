/**
 * Configurações de Segurança Centralizadas
 * Centraliza todas as configurações de segurança do sistema
 */

export interface SecurityConfig {
  // Rate Limiting
  rateLimit: {
    windowMs: number;
    max: number;
    message: string;
    skipSuccessfulRequests: boolean;
  };
  
  // CORS
  cors: {
    allowedOrigins: string[];
    allowedMethods: string[];
    allowedHeaders: string[];
    credentials: boolean;
    maxAge: number;
  };
  
  // Brute Force Protection
  bruteForce: {
    windowMs: number;
    maxAttempts: number;
    message: string;
  };
  
  // File Upload
  upload: {
    maxFileSize: number;
    allowedMimeTypes: string[];
    maxFiles: number;
  };
  
  // Session
  session: {
    secret: string;
    resave: boolean;
    saveUninitialized: boolean;
    cookie: {
      secure: boolean;
      httpOnly: boolean;
      maxAge: number;
      sameSite: 'strict' | 'lax' | 'none' | boolean;
    };
  };
  
  // JWT
  jwt: {
    secret: string;
    expiresIn: string;
    issuer: string;
    audience: string;
  };
  
  // Input Validation
  inputValidation: {
    maxInputLength: number;
    patterns: {
      suspicious: RegExp[];
      sqlInjection: RegExp[];
      xss: RegExp[];
      pathTraversal: RegExp[];
    };
  };
  
  // Logging
  logging: {
    level: 'error' | 'warn' | 'info' | 'debug';
    enableSecurityEvents: boolean;
    enableRequestLogging: boolean;
    redactSensitiveData: boolean;
  };
}

/**
 * Configurações padrão de segurança
 */
export const defaultSecurityConfig: SecurityConfig = {
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 1000, // 1000 requisições por janela
    message: 'Muitas requisições deste IP, tente novamente mais tarde',
    skipSuccessfulRequests: false
  },
  
  cors: {
    allowedOrigins: [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://zeladoria-londrina.vercel.app',
      ...(process.env.ALLOWED_ORIGINS?.split(',') || [])
    ],
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Requested-With'],
    credentials: true,
    maxAge: 86400 // 24 horas
  },
  
  bruteForce: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    maxAttempts: 5,
    message: 'Muitas tentativas de login. Tente novamente mais tarde.'
  },
  
  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'application/pdf',
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ],
    maxFiles: 10
  },
  
  session: {
    secret: process.env.SESSION_SECRET || process.env.JWT_SECRET || 'fallback-secret-change-immediately',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 horas
      sameSite: 'strict'
    }
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret-change-immediately',
    expiresIn: '24h',
    issuer: 'zeladoria-londrina-api',
    audience: 'zeladoria-londrina-users'
  },
  
  inputValidation: {
    maxInputLength: 10000, // 10KB por campo
    patterns: {
      suspicious: [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, // XSS
        /javascript:|vbscript:|data:|file:|about:|chrome:/gi, // Protocol injection
        /(\.{2}[\\\/]|%2e%2e%2f|%2e%2e%5c)/gi // Path traversal
      ],
      sqlInjection: [
        /(\b(union|select|insert|update|delete|drop|create|alter|exec|script|declare)\b)/gi,
        /(\b(and|or|not|xor)\b.*\b(=|>|<|like)\b)/gi,
        /('|")\s*(or|and)\s*('|")/gi
      ],
      xss: [
        /<.*>/gi, // Qualquer tag HTML
        /on\w+\s*=/gi, // Event handlers
        /javascript:/gi // JavaScript protocol
      ],
      pathTraversal: [
        /\.\.\//gi,
        /\.\.\\/gi,
        /%2e%2e%2f/gi,
        /%2e%2e%5c/gi
      ]
    }
  },
  
  logging: {
    level: (process.env.LOG_LEVEL as 'error' | 'warn' | 'info' | 'debug') || 'info',
    enableSecurityEvents: true,
    enableRequestLogging: process.env.NODE_ENV !== 'test',
    redactSensitiveData: true
  }
};

/**
 * Valida se as configurações de segurança estão adequadas
 */
export function validateSecurityConfig(config: SecurityConfig): string[] {
  const warnings: string[] = [];
  
  // Validar secrets
  if (config.jwt.secret.includes('fallback')) {
    warnings.push('JWT_SECRET está usando valor padrão - Configure uma chave segura!');
  }
  
  if (config.session.secret.includes('fallback')) {
    warnings.push('SESSION_SECRET está usando valor padrão - Configure uma chave segura!');
  }
  
  // Validar rate limiting
  if (config.rateLimit.max > 10000) {
    warnings.push('Rate limit muito alto - Considere reduzir para melhor proteção');
  }
  
  // Validar CORS
  if (config.cors.allowedOrigins.includes('*')) {
    warnings.push('CORS configurado com wildcard (*) - Isso é inseguro em produção');
  }
  
  // Validar upload
  if (config.upload.maxFileSize > 50 * 1024 * 1024) {
    warnings.push('Limite de upload muito alto - Considere reduzir para 10MB ou menos');
  }
  
  // Validar brute force
  if (config.bruteForce.maxAttempts > 10) {
    warnings.push('Limite de tentativas de login muito alto - Considere reduzir para 5 ou menos');
  }
  
  // Validar sessão
  if (config.session.cookie.maxAge > 7 * 24 * 60 * 60 * 1000) {
    warnings.push('Duração da sessão muito longa - Considere reduzir para 24 horas ou menos');
  }
  
  return warnings;
}

/**
 * Obtém configurações baseadas no ambiente
 */
export function getSecurityConfig(): SecurityConfig {
  const env = process.env.NODE_ENV || 'development';
  
  const config = { ...defaultSecurityConfig };
  
  // Ajustes para produção
  if (env === 'production') {
    config.rateLimit.max = 500; // Mais restritivo em produção
    config.bruteForce.maxAttempts = 3; // Mais restritivo
    config.session.cookie.secure = true;
    config.session.cookie.sameSite = 'strict';
    config.logging.level = 'warn';
  }
  
  // Ajustes para desenvolvimento
  if (env === 'development') {
    config.rateLimit.max = 2000; // Mais permissivo em dev
    config.logging.level = 'debug';
    config.cors.allowedOrigins.push('http://localhost:*');
  }
  
  // Ajustes para teste
  if (env === 'test') {
    config.rateLimit.max = 10000; // Sem limites em testes
    config.logging.enableRequestLogging = false;
  }
  
  return config;
}

/**
 * Função auxiliar para verificar se uma string contém padrões suspeitos
 */
export function containsSuspiciousPatterns(input: string, config: SecurityConfig): boolean {
  const patterns = [
    ...config.inputValidation.patterns.suspicious,
    ...config.inputValidation.patterns.sqlInjection,
    ...config.inputValidation.patterns.xss,
    ...config.inputValidation.patterns.pathTraversal
  ];
  
  return patterns.some(pattern => pattern.test(input));
}

/**
 * Sanitiza uma string removendo caracteres perigosos
 */
export function sanitizeInput(input: string, maxLength?: number): string {
  if (maxLength && input.length > maxLength) {
    input = input.substring(0, maxLength);
  }
  
  // Remover tags HTML
  input = input.replace(/<[^>]*>/g, '');
  
  // Escapar caracteres especiais
  input = input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
  
  return input.trim();
}

/**
 * Lista de dados sensíveis que devem ser redactados em logs
 */
export const SENSITIVE_FIELDS = [
  'password',
  'senha',
  'token',
  'secret',
  'key',
  'api_key',
  'apikey',
  'auth',
  'authorization',
  'cookie',
  'session',
  'creditcard',
  'credit_card',
  'cvv',
  'pin',
  'ssn',
  'social_security',
  'cpf',
  'rg',
  'passport',
  'bank_account',
  'routing_number',
  'email',
  'phone',
  'address',
  'location',
  'gps',
  'coordinates'
];

/**
 * Redacta dados sensíveis de um objeto
 */
export function redactSensitiveData(obj: any, fields: string[] = SENSITIVE_FIELDS): any {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  
  const redacted = { ...obj };
  
  for (const key of Object.keys(redacted)) {
    const lowerKey = key.toLowerCase();
    
    if (fields.some(field => lowerKey.includes(field))) {
      redacted[key] = '[REDACTED]';
    } else if (typeof redacted[key] === 'object') {
      redacted[key] = redactSensitiveData(redacted[key], fields);
    }
  }
  
  return redacted;
}