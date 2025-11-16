/**
 * Servidor Express Seguro com Middlewares de Proteção
 * Implementa todas as camadas de segurança necessárias
 */

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { 
  securityHeaders, 
  rateLimiter, 
  csrfProtection, 
  inputValidation, 
  securityLogger,
  secureCors,
  bruteForceProtection,
  outputSanitization
} from "./middleware/security";
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();

// Configuração de segurança
const securityConfig = {
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 1000, // limite de 1000 requisições por IP
    message: 'Muitas requisições deste IP, tente novamente mais tarde'
  },
  bruteForce: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    maxAttempts: 5,
    message: 'Muitas tentativas de login. Tente novamente mais tarde.'
  }
};

// Declaração de tipos
declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}

// ===== SEGURANÇA - MIDDLEWARES DE PROTEÇÃO =====

// Headers de segurança
app.use(securityHeaders);

// CORS seguro
app.use(secureCors);

// Rate limiting global
app.use(rateLimiter(securityConfig.rateLimit));

// Proteção contra brute force no login
app.use(bruteForceProtection);

// Logger de segurança
app.use(securityLogger);

// CSRF Protection (após sessão ser configurada)
app.use(csrfProtection);

// Validação de entrada contra injeção
app.use(inputValidation);

// Sanitização de saída
app.use(outputSanitization);

// Body parsers com limites de tamanho
app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  },
  limit: '10mb' // limite de tamanho para prevenir DoS
}));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Logging de requisições
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// ===== INICIALIZAÇÃO DO SERVIDOR =====

(async () => {
  const server = await registerRoutes(app);

  // Error handling
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Nunca expor detalhes de erro em produção
    const errorResponse = {
      message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : message,
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    };

    res.status(status).json(errorResponse);
    
    // Log do erro para monitoramento
    console.error('🚨 Server Error:', {
      status,
      message: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString()
    });
  });

  // Setup Vite ou static serving
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Port configuration
  const port = parseInt(process.env.PORT || '5000', 10);
  
  server.listen({
    port,
    host: "0.0.0.0",
  }, () => {
    log(`🛡️  Secure server serving on port ${port}`);
    log(`🔒 Security middlewares active`);
    log(`📊 Rate limiting: ${securityConfig.rateLimit.max} req/15min`);
    log(`🚪 Brute force protection: ${securityConfig.bruteForce.maxAttempts} attempts/15min`);
  });
})();

export default app;