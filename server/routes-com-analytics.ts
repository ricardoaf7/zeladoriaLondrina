/**
 * Rotas do servidor com Analytics incluído
 * Configuração completa de rotas incluindo dashboard de eficiência
 */

import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import multer from "multer";
import * as fs from "fs";
import * as path from "path";
import mapRoutes from "./routes/map-optimization";
import coletaRoutes from "./routes/coleta-publica";
import coletaHtmlRouter from "./routes/coleta-publica-html";
import analyticsRouter from "./routes/analytics";
import dashboardHtmlRouter from "./routes/dashboard-eficiencia-html";
import ocrImportRouter from "./routes/ocr-import";

const upload = multer({
  storage: multer.memoryStorage(),
});

export function registerRoutes(app: Express): Server {
  // Health check endpoint
  app.get("/ping", (req, res) => {
    res.json({ message: "Pong!" });
  });

  // Rotas de autenticação e usuários
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      console.error("❌ Erro ao buscar usuários:", error);
      res.status(500).json({ error: "Erro ao buscar usuários" });
    }
  });

  // Rotas de áreas
  app.get("/api/areas", async (req, res) => {
    try {
      const areas = await storage.getAreas();
      res.json(areas);
    } catch (error) {
      console.error("❌ Erro ao buscar áreas:", error);
      res.status(500).json({ error: "Erro ao buscar áreas" });
    }
  });

  app.post("/api/areas", async (req, res) => {
    try {
      const area = await storage.createArea(req.body);
      res.json(area);
    } catch (error) {
      console.error("❌ Erro ao criar área:", error);
      res.status(500).json({ error: "Erro ao criar área" });
    }
  });

  app.put("/api/areas/:id", async (req, res) => {
    try {
      const area = await storage.updateArea(req.params.id, req.body);
      res.json(area);
    } catch (error) {
      console.error("❌ Erro ao atualizar área:", error);
      res.status(500).json({ error: "Erro ao atualizar área" });
    }
  });

  app.delete("/api/areas/:id", async (req, res) => {
    try {
      await storage.deleteArea(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("❌ Erro ao deletar área:", error);
      res.status(500).json({ error: "Erro ao deletar área" });
    }
  });

  // Rotas de serviços
  app.get("/api/services", async (req, res) => {
    try {
      const services = await storage.getServices();
      res.json(services);
    } catch (error) {
      console.error("❌ Erro ao buscar serviços:", error);
      res.status(500).json({ error: "Erro ao buscar serviços" });
    }
  });

  app.post("/api/services", async (req, res) => {
    try {
      const service = await storage.createService(req.body);
      res.json(service);
    } catch (error) {
      console.error("❌ Erro ao criar serviço:", error);
      res.status(500).json({ error: "Erro ao criar serviço" });
    }
  });

  app.put("/api/services/:id", async (req, res) => {
    try {
      const service = await storage.updateService(req.params.id, req.body);
      res.json(service);
    } catch (error) {
      console.error("❌ Erro ao atualizar serviço:", error);
      res.status(500).json({ error: "Erro ao atualizar serviço" });
    }
  });

  app.delete("/api/services/:id", async (req, res) => {
    try {
      await storage.deleteService(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("❌ Erro ao deletar serviço:", error);
      res.status(500).json({ error: "Erro ao deletar serviço" });
    }
  });

  // Rotas de agendamento
  app.get("/api/schedules", async (req, res) => {
    try {
      const schedules = await storage.getSchedules();
      res.json(schedules);
    } catch (error) {
      console.error("❌ Erro ao buscar agendamentos:", error);
      res.status(500).json({ error: "Erro ao buscar agendamentos" });
    }
  });

  app.post("/api/schedules", async (req, res) => {
    try {
      const schedule = await storage.createSchedule(req.body);
      res.json(schedule);
    } catch (error) {
      console.error("❌ Erro ao criar agendamento:", error);
      res.status(500).json({ error: "Erro ao criar agendamento" });
    }
  });

  app.put("/api/schedules/:id", async (req, res) => {
    try {
      const schedule = await storage.updateSchedule(req.params.id, req.body);
      res.json(schedule);
    } catch (error) {
      console.error("❌ Erro ao atualizar agendamento:", error);
      res.status(500).json({ error: "Erro ao atualizar agendamento" });
    }
  });

  app.delete("/api/schedules/:id", async (req, res) => {
    try {
      await storage.deleteSchedule(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("❌ Erro ao deletar agendamento:", error);
      res.status(500).json({ error: "Erro ao deletar agendamento" });
    }
  });

  // Rotas de registro diário
  app.get("/api/daily-registrations", async (req, res) => {
    try {
      const registrations = await storage.getDailyRegistrations();
      res.json(registrations);
    } catch (error) {
      console.error("❌ Erro ao buscar registros diários:", error);
      res.status(500).json({ error: "Erro ao buscar registros diários" });
    }
  });

  app.post("/api/daily-registrations", async (req, res) => {
    try {
      const registration = await storage.createDailyRegistration(req.body);
      res.json(registration);
    } catch (error) {
      console.error("❌ Erro ao criar registro diário:", error);
      res.status(500).json({ error: "Erro ao criar registro diário" });
    }
  });

  // Rota para upload de CSV
  app.post("/api/upload-csv", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Nenhum arquivo enviado" });
      }

      const fileContent = req.file.buffer.toString("utf-8");
      const lines = fileContent.split("\n").filter(line => line.trim());
      const headers = lines[0].split(",").map(h => h.trim());
      
      const data = lines.slice(1).map(line => {
        const values = line.split(",").map(v => v.trim());
        const obj: any = {};
        headers.forEach((header, index) => {
          obj[header] = values[index] || "";
        });
        return obj;
      });

      // Processar dados do CSV
      const processedData = await processCSVData(data);
      
      res.json({
        success: true,
        message: "Arquivo CSV processado com sucesso",
        data: processedData,
        totalRows: data.length
      });
    } catch (error) {
      console.error("❌ Erro ao processar CSV:", error);
      res.status(500).json({ 
        error: "Erro ao processar arquivo CSV",
        message: error instanceof Error ? error.message : "Erro desconhecido"
      });
    }
  });

  // Rotas de otimização do mapa
  app.use("/api/map", mapRoutes);
  
  // API pública de consulta de coleta
  app.use("/api/coleta", coletaRoutes);
  
  // Página HTML pública de consulta de coleta
  app.use("/consulta-coleta", coletaHtmlRouter);
  
  // Analytics - Dashboard de Eficiência Operacional
  app.use("/api/analytics", analyticsRouter);
  
  // Dashboard HTML de Eficiência
  app.use("/dashboard-eficiencia", dashboardHtmlRouter);
  
  // OCR Import - Importação de áreas por OCR
  app.use("/api/ocr", ocrImportRouter);

  const httpServer = createServer(app);
  return httpServer;
}

/**
 * Processa dados do CSV e os converte para o formato do banco de dados
 */
async function processCSVData(data: any[]) {
  const processed: any[] = [];
  
  for (const row of data) {
    try {
      // Mapear campos do CSV para o formato do banco
      const processedRow = {
        area_name: row.area_name || row.nome_area || row.area || "",
        service_type: row.service_type || row.tipo_servico || row.tipo || "",
        scheduled_date: row.scheduled_date || row.data_agendada || row.data || "",
        status: row.status || row.situacao || "PENDENTE",
        priority: row.priority || row.prioridade || "MEDIA",
        description: row.description || row.descricao || "",
        location: row.location || row.localizacao || row.endereco || "",
        team: row.team || row.equipe || "",
        estimated_duration: parseInt(row.estimated_duration || row.duracao_estimada || "0") || 0,
        actual_duration: parseInt(row.actual_duration || row.duracao_real || "0") || 0,
        cost: parseFloat(row.cost || row.custo || "0") || 0,
        materials_used: row.materials_used || row.materiais_utilizados || "",
        notes: row.notes || row.observacoes || "",
        completion_date: row.completion_date || row.data_conclusao || "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      processed.push(processedRow);
    } catch (error) {
      console.error("❌ Erro ao processar linha do CSV:", error, row);
      // Continuar processando outras linhas mesmo se uma falhar
    }
  }
  
  return processed;
}