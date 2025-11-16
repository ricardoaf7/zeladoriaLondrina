/**
 * Middleware de Segurança para Express
 * Protege contra vulnerabilidades comuns e implementa headers de segurança
 */

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

/**
 * Headers de segurança essenciais
 */
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Previne XSS
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // HTTPS strict transport security
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  
  // Content security policy
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self' data:; " +
    "connect-src 'self' https://api.supabase.co; " +
    "frame-ancestors 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self'"
  );
  
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions policy
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=()'
  );
  
  // Remove headers que identificam a tecnologia
  res.removeHeader('X-Powered-By');
  res.removeHeader('Server');
  
  next();
};

/**
 * Rate limiting simples baseado em memória
 */
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

interface RateLimitOptions {
  windowMs: number;
  max: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
}

export const rateLimiter = (options: RateLimitOptions) => {
  const { windowMs, max, message = 'Muitas requisições, tente novamente mais tarde', skipSuccessfulRequests = false } = options;
  
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    
    // Limpar entradas antigas
    for (const [k, entry] of rateLimitStore.entries()) {
      if (now > entry.resetTime) {
        rateLimitStore.delete(k);
      }
    }
    
    // Obter ou criar entrada
    let entry = rateLimitStore.get(key);
    if (!entry || now > entry.resetTime) {
      entry = {
        count: 0,
        resetTime: now + windowMs
      };
      rateLimitStore.set(key, entry);
    }
    
    // Incrementar contador
    entry.count++;
    
    // Adicionar headers informativos
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - entry.count));
    res.setHeader('X-RateLimit-Reset', new Date(entry.resetTime).toISOString());
    
    // Verificar limite
    if (entry.count > max) {
      res.status(429).json({
        error: 'Too Many Requests',
        message,
        retryAfter: Math.ceil((entry.resetTime - now) / 1000)
      });
      return;
    }
    
    // Override do contador para requisições bem-sucedidas
    if (skipSuccessfulRequests) {
      const originalSend = res.send;
      res.send = function(body) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          entry!.count = Math.max(0, entry!.count - 1);
        }
        return originalSend.call(this, body);
      };
    }
    
    next();
  };
};

/**
 * Proteção contra CSRF
 */
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  // Gerar token CSRF se não existir
  if (!req.session?.csrfToken) {
    if (req.session) {
      req.session.csrfToken = crypto.randomBytes(32).toString('hex');
    }
  }
  
  // Verificar token para métodos não seguros
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    const csrfToken = req.headers['x-csrf-token'] || req.body?._csrf;
    
    if (!csrfToken || csrfToken !== req.session?.csrfToken) {
      res.status(403).json({
        error: 'CSRF token inválido',
        message: 'Token de segurança inválido ou ausente'
      });
      return;
    }
  }
  
  // Adicionar token às respostas
  if (req.session?.csrfToken) {
    res.setHeader('X-CSRF-Token', req.session.csrfToken);
    res.locals.csrfToken = req.session.csrfToken;
  }
  
  next();
};

/**
 * Validação de entrada contra injeção
 */
export const inputValidation = (req: Request, res: Response, next: NextFunction) => {
  const suspiciousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, // XSS
    /(\b(union|select|insert|update|delete|drop|create|alter|exec|script|declare)\b)/gi, // SQL Injection
    /(\b(and|or|not|xor)\b.*\b(=|>|<|like)\b)/gi, // SQL Logic
    /(\.\.\/|\.\.\\|%2e%2e%2f|%2e%2e%5c)/gi, // Path Traversal
    /(javascript:|vbscript:|data:|file:|about:|chrome:)/gi // Protocol Injection
  ];
  
  const checkInput = (input: any): boolean => {
    if (typeof input !== 'string') return true;
    
    return suspiciousPatterns.every(pattern => {
      const matches = input.match(pattern);
      return !matches || matches.length === 0;
    });
  };
  
  const validateObject = (obj: any): boolean => {
    if (typeof obj !== 'object' || obj === null) return true;
    
    for (const value of Object.values(obj)) {
      if (typeof value === 'string') {
        if (!checkInput(value)) return false;
      } else if (typeof value === 'object') {
        if (!validateObject(value)) return false;
      }
    }
    return true;
  };
  
  // Validar todos os inputs
  const inputs = [req.body, req.query, req.params];
  
  for (const input of inputs) {
    if (!validateObject(input)) {
      res.status(400).json({
        error: 'Invalid Input',
        message: 'Dados de entrada contêm padrões suspeitos'
      });
      return;
    }
  }
  
  next();
};

/**
 * Logger de segurança para eventos suspeitos
 */
export const securityLogger = (req: Request, res: Response, next: NextFunction) => {
  const originalSend = res.send;
  
  res.send = function(body) {
    // Log de eventos suspeitos
    if (req.statusCode >= 400) {
      const logData = {
        timestamp: new Date().toISOString(),
        ip: req.ip,
        method: req.method,
        url: req.url,
        userAgent: req.get('User-Agent'),
        statusCode: res.statusCode,
        referer: req.get('Referer')
      };
      
      // Em produção, enviar para serviço de logging
      if (process.env.NODE_ENV === 'production') {
        console.warn('🚨 Security Event:', JSON.stringify(logData));
      } else {
        console.warn('🚨 Security Event:', logData);
      }
    }
    
    return originalSend.call(this, body);
  };
  
  next();
};

/**
 * Configuração de CORS segura
 */
export const secureCors = (req: Request, res: Response, next: NextFunction) => {
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://zeladoria-londrina.vercel.app'
  ];
  
  const origin = req.get('Origin');
  
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  
  next();
};

/**
 * Proteção contra brute force no login
 */
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();

export const bruteForceProtection = (req: Request, res: Response, next: NextFunction) => {
  if (req.path !== '/api/auth/login' || req.method !== 'POST') {
    next();
    return;
  }
  
  const key = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutos
  const maxAttempts = 5;
  
  // Limpar tentativas antigas
  for (const [k, attempt] of loginAttempts.entries()) {
    if (now - attempt.lastAttempt > windowMs) {
      loginAttempts.delete(k);
    }
  }
  
  // Obter tentativas atuais
  const attempt = loginAttempts.get(key) || { count: 0, lastAttempt: now };
  
  // Verificar se excedeu o limite
  if (attempt.count >= maxAttempts) {
    const timeLeft = Math.ceil((windowMs - (now - attempt.lastAttempt)) / 1000);
    res.status(429).json({
      error: 'Too Many Login Attempts',
      message: `Muitas tentativas de login. Tente novamente em ${timeLeft} segundos.`,
      retryAfter: timeLeft
    });
    return;
  }
  
  // Monitorar resultado do login
  const originalSend = res.send;
  res.send = function(body) {
    const isFailedLogin = res.statusCode === 401;
    
    if (isFailedLogin) {
      attempt.count++;
      attempt.lastAttempt = now;
      loginAttempts.set(key, attempt);
      
      console.warn(`🚨 Failed login attempt ${attempt.count}/${maxAttempts} from ${key}`);
    } else if (res.statusCode === 200) {
      // Login bem-sucedido, resetar contador
      loginAttempts.delete(key);
    }
    
    return originalSend.call(this, body);
  };
  
  next();
};

/**
 * Sanitização de saída
 */
export const outputSanitization = (req: Request, res: Response, next: NextFunction) => {
  const originalJson = res.json;
  
  res.json = function(body) {
    const sanitizedBody = sanitizeOutput(body);
    return originalJson.call(this, sanitizedBody);
  };
  
  next();
};

/**
 * Função auxiliar para sanitizar saída
 */
function sanitizeOutput(obj: any): any {
  if (typeof obj === 'string') {
    // Escapar HTML
    return obj
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeOutput);
  }
  
  if (typeof obj === 'object' && obj !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      // Remover dados sensíveis
      if (key.toLowerCase().includes('password') || 
          key.toLowerCase().includes('secret') || 
          key.toLowerCase().includes('token') ||
          key.toLowerCase().includes('key')) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = sanitizeOutput(value);
      }
    }
    return sanitized;
  }
  
  return obj;
}