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
import dashboardHtmlRouter from "./routes/dashboard-eficiencia-html";
import ocrImportRouter from "./routes/ocr-import";
import mapPerformanceRouter from "./routes/map-performance";
import ocrImportHtmlRouter from "./routes/ocr-import";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check/ping endpoint
  app.get("/ping", (req, res) => {
    res.json({ message: "Pong!" });
  });
  // Endpoint de backup: exportar todos os dados em JSON
  app.get("/api/backup", async (req, res) => {
    try {
      const allAreas = await storage.getAllAreas("rocagem");
      const config = await storage.getConfig();
      
      const backup = {
        version: "1.0",
        exportDate: new Date().toISOString(),
        data: {
          areas: allAreas,
          config: config,
        },
        stats: {
          totalAreas: allAreas.length,
          areasWithMowing: allAreas.filter(a => a.ultimaRocagem).length,
        }
      };
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=zeladoria_backup_${new Date().toISOString().split('T')[0]}.json`);
      res.json(backup);
    } catch (error) {
      console.error("Error creating backup:", error);
      res.status(500).json({ error: "Falha ao gerar backup" });
    }
  });

  app.get("/api/admin/download-csv", async (req, res) => {
    try {
      const csvPath = path.join(process.cwd(), "server", "data", "areas_londrina.csv");
      
      if (!fs.existsSync(csvPath)) {
        res.status(404).json({ error: "Arquivo CSV não encontrado no servidor" });
        return;
      }
      
      res.download(csvPath, "areas_londrina.csv");
    } catch (error) {
      console.error("Error downloading CSV:", error);
      res.status(500).json({ error: "Falha ao baixar arquivo CSV" });
    }
  });

  app.get("/api/areas/rocagem", async (req, res) => {
    try {
      const areas = await storage.getAllAreas("rocagem");
      res.json(areas);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch roçagem areas" });
    }
  });

  app.get("/api/areas/jardins", async (req, res) => {
    try {
      const areas = await storage.getAllAreas("jardins");
      res.json(areas);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch jardins areas" });
    }
  });

  // Novo endpoint otimizado: dados leves para mapa (com suporte a viewport bounds)
  app.get("/api/areas/light", async (req, res) => {
    try {
      const servico = req.query.servico as string || "rocagem";
      const boundsParam = req.query.bounds as string;
      
      let areas = await storage.getAllAreas(servico);
      
      // Filtrar por bounds se fornecido (viewport do mapa)
      if (boundsParam) {
        try {
          const bounds = JSON.parse(boundsParam);
          // Validar bounds usando Number.isFinite para aceitar valores zero/negativos
          if (Number.isFinite(bounds.north) && Number.isFinite(bounds.south) && 
              Number.isFinite(bounds.east) && Number.isFinite(bounds.west)) {
            areas = areas.filter(area => {
              if (area.lat === null || area.lat === undefined || 
                  area.lng === null || area.lng === undefined) return false;
              return area.lat >= bounds.south && 
                     area.lat <= bounds.north && 
                     area.lng >= bounds.west && 
                     area.lng <= bounds.east;
            });
          }
        } catch (e) {
          console.error("Error parsing bounds:", e);
          res.status(400).json({ error: "Invalid bounds format" });
          return;
        }
      }
      
      // Retornar apenas campos essenciais para o mapa
      const lightAreas = areas.map(area => ({
        id: area.id,
        lat: area.lat,
        lng: area.lng,
        status: area.status,
        proximaPrevisao: area.proximaPrevisao,
        lote: area.lote,
        servico: area.servico,
        endereco: area.endereco,
        bairro: area.bairro,
        ultimaRocagem: area.ultimaRocagem,
        metragem_m2: area.metragem_m2,
        manualSchedule: area.manualSchedule,
      }));
      
      res.json(lightAreas);
    } catch (error) {
      console.error("Error fetching light areas:", error);
      res.status(500).json({ error: "Failed to fetch light areas" });
    }
  });

  // Novo endpoint: busca server-side otimizada
  app.get("/api/areas/search", async (req, res) => {
    try {
      const query = (req.query.q as string || "").trim();
      const servico = req.query.servico as string || "rocagem";
      
      if (!query) {
        res.json([]);
        return;
      }
      
      // Usar método otimizado do storage que filtra direto no banco
      const results = await storage.searchAreas(query, servico, 50);
      
      res.json(results);
    } catch (error) {
      console.error("Error searching areas:", error);
      res.status(500).json({ error: "Failed to search areas" });
    }
  });

  // Novo endpoint: detalhes completos de uma área específica
  app.get("/api/areas/:id", async (req, res) => {
    try {
      const areaId = parseInt(req.params.id);
      const area = await storage.getAreaById(areaId);
      
      if (!area) {
        res.status(404).json({ error: "Area not found" });
        return;
      }
      
      res.json(area);
    } catch (error) {
      console.error("Error fetching area details:", error);
      res.status(500).json({ error: "Failed to fetch area details" });
    }
  });

  app.get("/api/teams", async (req, res) => {
    try {
      const teams = await storage.getAllTeams();
      res.json(teams);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch teams" });
    }
  });

  app.get("/api/config", async (req, res) => {
    try {
      const config = await storage.getConfig();
      res.json(config);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch configuration" });
    }
  });

  app.patch("/api/config", async (req, res) => {
    try {
      const configSchema = z.object({
        mowingProductionRate: z.object({
          lote1: z.number(),
          lote2: z.number(),
        }).partial().optional(),
      });

      const validatedConfig = configSchema.parse(req.body);
      const updatedConfig = await storage.updateConfig(validatedConfig as any);
      res.json(updatedConfig);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid configuration data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update configuration" });
      }
    }
  });

  app.patch("/api/areas/:id/status", async (req, res) => {
    try {
      const areaId = parseInt(req.params.id);
      const statusSchema = z.object({
        status: z.enum(["Pendente", "Em Execução", "Concluído"]),
      });

      const { status } = statusSchema.parse(req.body);
      const updatedArea = await storage.updateAreaStatus(areaId, status);

      if (!updatedArea) {
        res.status(404).json({ error: "Area not found" });
        return;
      }

      res.json(updatedArea);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid status data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update area status" });
      }
    }
  });

  app.patch("/api/teams/:id/assign", async (req, res) => {
    try {
      const teamId = parseInt(req.params.id);
      const assignSchema = z.object({
        areaId: z.number(),
      });

      const { areaId } = assignSchema.parse(req.body);
      const updatedTeam = await storage.assignTeamToArea(teamId, areaId);

      if (!updatedTeam) {
        res.status(404).json({ error: "Team not found" });
        return;
      }

      res.json(updatedTeam);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid assignment data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to assign team" });
      }
    }
  });

  app.patch("/api/areas/:id/polygon", async (req, res) => {
    try {
      const areaId = parseInt(req.params.id);
      const polygonSchema = z.object({
        polygon: z.array(z.object({
          lat: z.number(),
          lng: z.number(),
        })),
      });

      const { polygon } = polygonSchema.parse(req.body);
      const updatedArea = await storage.updateAreaPolygon(areaId, polygon);

      if (!updatedArea) {
        res.status(404).json({ error: "Area not found" });
        return;
      }

      res.json(updatedArea);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid polygon data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update polygon" });
      }
    }
  });

  app.patch("/api/areas/:id/position", async (req, res) => {
    try {
      const areaId = parseInt(req.params.id);
      const positionSchema = z.object({
        lat: z.number(),
        lng: z.number(),
      });

      const { lat, lng } = positionSchema.parse(req.body);
      const updatedArea = await storage.updateAreaPosition(areaId, lat, lng);

      if (!updatedArea) {
        res.status(404).json({ error: "Area not found" });
        return;
      }

      res.json(updatedArea);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid position data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update position" });
      }
    }
  });

  app.patch("/api/areas/:id/manual-forecast", async (req, res) => {
    try {
      const areaId = parseInt(req.params.id);
      const manualForecastSchema = z.object({
        proximaPrevisao: z.string().min(1),
      });

      const { proximaPrevisao } = manualForecastSchema.parse(req.body);
      
      const updatedArea = await storage.updateArea(areaId, {
        proximaPrevisao,
        manualSchedule: true,
      });

      if (!updatedArea) {
        res.status(404).json({ error: "Area not found" });
        return;
      }

      res.json(updatedArea);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid manual forecast data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to set manual forecast" });
      }
    }
  });

  app.patch("/api/areas/:id", async (req, res) => {
    try {
      const areaId = parseInt(req.params.id);
      const updateSchema = z.object({
        endereco: z.string().optional(),
        bairro: z.string().optional(),
        metragem_m2: z.number().optional(),
        lote: z.number().optional(),
        ultimaRocagem: z.string().min(1).optional(),
        status: z.enum(["Pendente", "Em Execução", "Concluído"]).optional(),
        registradoPor: z.string().optional(),
      });

      const data = updateSchema.parse(req.body);
      
      // Se está registrando roçagem, adicionar timestamp automático
      if (data.ultimaRocagem) {
        const dataComTimestamp = {
          ...data,
          dataRegistro: new Date().toISOString(),
          manualSchedule: false,
        };
        
        // Aplicar atualizações incluindo auditoria
        const updatedArea = await storage.updateArea(areaId, dataComTimestamp);
        
        if (!updatedArea) {
          res.status(404).json({ error: "Area not found" });
          return;
        }
        
        // Recalcular previsões de todo o lote
        await storage.registerDailyMowing([areaId], data.ultimaRocagem, 'completed');
        
        // Buscar área novamente após recálculo
        const reloadedArea = await storage.getAreaById(areaId);
        if (!reloadedArea) {
          res.status(404).json({ error: "Area not found after recalculation" });
          return;
        }
        
        res.json(reloadedArea);
        return;
      }
      
      // Atualizações sem registro de roçagem
      const updatedArea = await storage.updateArea(areaId, data);
      
      if (!updatedArea) {
        res.status(404).json({ error: "Area not found" });
        return;
      }

      res.json(updatedArea);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid area data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update area" });
      }
    }
  });

  app.post("/api/areas/:id/history", async (req, res) => {
    try {
      const areaId = parseInt(req.params.id);
      const historyEntrySchema = z.object({
        date: z.string(),
        status: z.string(),
        observation: z.string().optional(),
      });

      const entry = historyEntrySchema.parse(req.body);
      const updatedArea = await storage.addHistoryEntry(areaId, entry);

      if (!updatedArea) {
        res.status(404).json({ error: "Area not found" });
        return;
      }

      res.json(updatedArea);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid history entry", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to add history entry" });
      }
    }
  });

  app.get("/api/areas/:id/history", async (req, res) => {
    try {
      const areaId = parseInt(req.params.id);
      const page = parseInt((req.query.page as string) || "1");
      const pageSize = parseInt((req.query.pageSize as string) || "20");
      const type = (req.query.type as string) as 'completed' | 'forecast' | undefined;
      const from = req.query.from as string | undefined;
      const to = req.query.to as string | undefined;
      const history = await storage.getAreaHistory(areaId, page, pageSize, type as any, from, to);
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch area history" });
    }
  });

  app.post("/api/areas/:id/register", async (req, res) => {
    try {
      const areaId = parseInt(req.params.id);
      const schema = z.object({
        date: z.string(),
        type: z.enum(['completed', 'forecast']),
        observation: z.string().optional(),
        registradoPor: z.string().optional(),
      });
      const { date, type, observation, registradoPor } = schema.parse(req.body);
      const status = type === 'completed' ? 'Concluído' : 'Previsto';
      const event = await storage.createMowingEvent(areaId, date, type, status, observation, registradoPor);
      if (type === 'completed') {
        await storage.registerDailyMowing([areaId], date, 'completed');
      }
      res.json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid register data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to register area event" });
      }
    }
  });

  app.post("/api/events/:id/photos", async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const schema = z.object({
        kind: z.enum(['before', 'after', 'extra']),
        storagePath: z.string(),
        takenAt: z.string().optional(),
        uploadedBy: z.string().optional(),
      });
      const { kind, storagePath, takenAt, uploadedBy } = schema.parse(req.body);
      const photo = await storage.addEventPhoto(eventId, kind, storagePath, takenAt, uploadedBy);
      res.json(photo);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid photo data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to add event photo" });
      }
    }
  });

  app.get("/api/events/:id/photos", async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const photos = await storage.getEventPhotos(eventId);
      res.json(photos);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch event photos" });
    }
  });

  app.post("/api/areas/register-daily", async (req, res) => {
    try {
      const registerSchema = z.object({
        areaIds: z.array(z.number()).min(1, "Selecione pelo menos uma área"),
        date: z.string(),
        type: z.enum(['completed', 'forecast']).default('completed'),
      });

      const { areaIds, date, type } = registerSchema.parse(req.body);
      await storage.registerDailyMowing(areaIds, date, type);

      const typeLabel = type === 'completed' ? 'registrada' : 'prevista';
      res.json({ 
        success: true, 
        message: `${areaIds.length} área(s) ${typeLabel}(s) com sucesso`,
        count: areaIds.length 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Dados inválidos", details: error.errors });
      } else {
        console.error("Error registering daily mowing:", error);
        res.status(500).json({ error: "Falha ao registrar roçagem" });
      }
    }
  });

  // ROTAS ADMIN PERIGOSAS REMOVIDAS:
  // - POST /api/admin/import-data (risco de sobrescrever dados existentes)
  // - POST /api/admin/clear-simulation (apaga todos os registros de roçagem)
  // - POST /api/admin/import-production (não necessário - banco é compartilhado entre dev e produção)

  app.post("/api/admin/recalculate-schedules", async (req, res) => {
    console.log("📅 Recalculando agendamentos de todas as áreas");
    
    try {
      const { calculateMowingSchedule } = await import('@shared/schedulingAlgorithm');
      
      console.log("📊 Buscando áreas e configurações...");
      const areas = await storage.getAllAreas('rocagem');
      const config = await storage.getConfig();
      
      console.log(`🔢 Processando ${areas.length} áreas...`);
      
      // Calcular para lote 1
      const lote1Results = calculateMowingSchedule(
        areas.filter(a => a.lote === 1),
        1,
        config.mowingProductionRate.lote1,
        new Date()
      );
      
      // Calcular para lote 2
      const lote2Results = calculateMowingSchedule(
        areas.filter(a => a.lote === 2),
        2,
        config.mowingProductionRate.lote2,
        new Date()
      );
      
      const allResults = [...lote1Results, ...lote2Results];
      console.log(`✅ ${allResults.length} previsões calculadas`);
      
      // Atualizar áreas com as previsões
      console.log("💾 Salvando previsões no banco...");
      for (const result of allResults) {
        await storage.updateArea(result.areaId, {
          proximaPrevisao: result.proximaPrevisao,
          daysToComplete: result.daysToComplete
        });
      }
      
      console.log(`✅ Agendamentos recalculados com sucesso!`);
      
      res.json({ 
        success: true, 
        message: `✅ Agendamentos recalculados para ${allResults.length} áreas!`,
        calculated: allResults.length
      });
    } catch (error: any) {
      console.error("💥 ERRO ao recalcular agendamentos:", error);
      res.status(500).json({ 
        error: "Falha ao recalcular agendamentos", 
        details: error.message
      });
    }
  });

  // Endpoint para importar dados CSV em lotes
  app.post("/api/import-batch", async (req, res) => {
    try {
      console.log('📦 Dados recebidos no servidor:', JSON.stringify(req.body).substring(0, 500));
      
      const importSchema = z.object({
        data: z.array(z.object({
          id: z.union([z.number(), z.string()]).transform(val => typeof val === 'string' ? parseInt(val) || 0 : val),
          endereco: z.string(),
          bairro: z.string(),
          status: z.string(),
          tipo: z.string(),
          metragem_m2: z.union([z.number(), z.string()]).transform(val => typeof val === 'string' ? parseFloat(val) || 0 : val),
          lat: z.union([z.number(), z.string()]).transform(val => typeof val === 'string' ? parseFloat(val) || 0 : val),
          lng: z.union([z.number(), z.string()]).transform(val => typeof val === 'string' ? parseFloat(val) || 0 : val),
          ordem: z.union([z.number(), z.string()]).transform(val => typeof val === 'string' ? (val.trim() === '' ? 1 : parseInt(val) || 1) : val),
          observacao: z.string().optional(),
          scheduled_date: z.union([z.string(), z.null()]).optional().nullable(),
          days_to_complete: z.union([z.number(), z.string(), z.null()]).transform(val => val === null || val === undefined ? null : typeof val === 'string' ? parseInt(val) || null : val).optional().nullable(),
          ativo: z.union([z.boolean(), z.string()]).transform(val => typeof val === 'string' ? val === 'true' : val),
          servico: z.string(),
          registrado_por: z.string().optional(),
          history: z.string().optional(),
          lote: z.union([z.number(), z.string(), z.null()]).transform(val => val === null || val === undefined || (typeof val === 'string' && val.trim() === '') ? null : typeof val === 'string' ? parseInt(val) || null : val).optional().nullable(),
          sequencia_cadastro: z.union([z.number(), z.string(), z.null()]).transform(val => val === null || val === undefined || (typeof val === 'string' && val.trim() === '') ? null : typeof val === 'string' ? parseInt(val) || null : val).optional().nullable(),
          polygon: z.string().optional(),
          proxima_previsao: z.union([z.string(), z.null()]).optional().nullable(),
          ultima_rocagem: z.union([z.string(), z.null()]).optional().nullable(),
          manual_schedule: z.union([z.boolean(), z.string()]).transform(val => typeof val === 'string' ? val === 'true' : val).optional(),
          data_registro: z.union([z.string(), z.null()]).optional().nullable(),
          responsavel: z.string().optional()
        }))
      });

      console.log(`📊 Validando ${req.body.data?.length || 0} itens...`);
      const { data } = importSchema.parse(req.body);
      let imported = 0;
      let updated = 0;
      let errors = 0;

      console.log(`📥 Importando lote com ${data.length} registros...`);
      
      // Log detalhado dos primeiros 5 itens para debug
      console.log(`📋 Amostra dos primeiros 5 itens:`, data.slice(0, 5).map(item => ({
        id: item.id,
        endereco: item.endereco?.substring(0, 50),
        bairro: item.bairro,
        status: item.status,
        tipo: item.tipo
      })));

      for (const item of data) {
        try {
          console.log(`🔍 Processando item ID: ${item.id}`);
          
          // Validar dados obrigatórios
          if (!item.id || !item.endereco || !item.bairro) {
            console.warn(`⚠️ Item ${item.id} tem dados incompletos:`, {
              id: item.id,
              endereco: item.endereco,
              bairro: item.bairro,
              status: item.status
            });
            errors++;
            continue;
          }
          
          // Log detalhado dos dados do item
          console.log(`📋 Dados do item ${item.id}:`, {
            endereco: item.endereco,
            bairro: item.bairro,
            status: item.status,
            tipo: item.tipo,
            metragem_m2: item.metragem_m2,
            lat: item.lat,
            lng: item.lng,
            ordem: item.ordem,
            lote: item.lote,
            sequencia_cadastro: item.sequencia_cadastro
          });
          
          // Verificar se já existe
          const existingArea = await storage.getArea(item.id);
          console.log(`📍 Área ${item.id} existe? ${existingArea ? 'Sim' : 'Não'}`);
          
          // Se o ID já existe e é um ID pequeno (dos dados iniciais), atualizar
          // Se for um ID grande (dos dados importados), criar novo com ID diferente
          const shouldUpdate = existingArea && item.id < 1000; // IDs menores que 1000 são dos dados iniciais
          
          // Parsear histórico se existir
          let historicoArray = [];
          if (item.history && item.history !== '[]') {
            try {
              historicoArray = JSON.parse(item.history);
            } catch (e) {
              console.warn(`⚠️ Erro ao parsear histórico da área ${item.id}:`, e);
            }
          }

          const areaData = {
            endereco: item.endereco,
            bairro: item.bairro,
            status: item.status,
            tipo: item.tipo,
            metragem_m2: item.metragem_m2,
            lat: item.lat,
            lng: item.lng,
            ordem: item.ordem,
            observacao: item.observacao,
            scheduled_date: item.scheduled_date,
            days_to_complete: item.days_to_complete,
            servico: item.servico,
            registrado_por: item.registrado_por,
            history: historicoArray,
            lote: item.lote,
            sequencia_cadastro: item.sequencia_cadastro,
            polygon: item.polygon,
            proxima_previsao: item.proxima_previsao,
            ultima_rocagem: item.ultima_rocagem,
            manual_schedule: item.manual_schedule,
            data_registro: item.data_registro,
            responsavel: item.responsavel || '',
            ativo: item.ativo
          };

          if (shouldUpdate) {
            // Atualizar área existente (dados iniciais)
            console.log(`🔄 Atualizando área existente ${item.id}`);
            await storage.updateArea(item.id, areaData);
            updated++;
            console.log(`✅ Área ${item.id} atualizada com sucesso`);
          } else {
            // Criar nova área (dados importados)
            console.log(`➕ Criando nova área ${item.id}`);
            await storage.createArea(areaData);
            imported++;
            console.log(`✅ Área ${item.id} criada com sucesso`);
          }

        } catch (error) {
          console.error(`❌ Erro ao importar área ${item.id}:`, error);
          console.error(`📋 Detalhes do erro:`, {
            message: error.message,
            stack: error.stack,
            name: error.name
          });
          errors++;
        }
      }

      console.log(`✅ Lote processado: ${imported} novas, ${updated} atualizadas, ${errors} erros`);
      
      res.json({ 
        success: true, 
        imported,
        updated,
        errors,
        total: data.length
      });
    } catch (error) {
      console.error("💥 ERRO CRÍTICO ao importar lote:");
      console.error("📋 Tipo do erro:", error.constructor.name);
      console.error("📋 Mensagem:", error.message);
      console.error("📋 Stack:", error.stack?.substring(0, 500));
      
      // Log detalhado dos erros de validação Zod
      if (error instanceof z.ZodError) {
        console.error("📋 Erros de validação detalhados:");
        error.errors.forEach((err, index) => {
          console.error(`  ${index + 1}. Caminho: ${err.path.join('.')}, Mensagem: ${err.message}, Código: ${err.code}`);
        });
      }
      
      res.status(500).json({ 
        success: false,
        error: "Falha ao importar dados", 
        details: error instanceof z.ZodError ? error.errors : error.message
      });
    }
  });

  // Rotas otimizadas do mapa (adicionadas para performance)
  app.use("/api/map", mapRoutes);
  
  // API pública de consulta de coleta
  app.use("/api/coleta", coletaRoutes);
  
  // Páginas HTML - Rotas principais
  app.use("/dashboard-eficiencia", dashboardHtmlRouter);
  app.use("/ocr-import", ocrImportHtmlRouter);
  app.use("/map-performance", mapPerformanceRouter);
  app.use("/consulta-coleta", coletaHtmlRouter);

  const httpServer = createServer(app);

  return httpServer;
}
