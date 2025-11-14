import { pgTable, serial, text, integer, jsonb, boolean, timestamp, doublePrecision } from "drizzle-orm/pg-core";

export const serviceAreas = pgTable("service_areas", {
  id: serial("id").primaryKey(),
  ordem: integer("ordem"),
  sequenciaCadastro: integer("sequencia_cadastro"),
  tipo: text("tipo").notNull(),
  endereco: text("endereco").notNull(),
  bairro: text("bairro"),
  metragem_m2: doublePrecision("metragem_m2"),
  lat: doublePrecision("lat").notNull(),
  lng: doublePrecision("lng").notNull(),
  lote: integer("lote"),
  status: text("status").notNull().default("Pendente"),
  history: jsonb("history").notNull().default([]),
  polygon: jsonb("polygon"),
  scheduledDate: text("scheduled_date"),
  proximaPrevisao: text("proxima_previsao"),
  ultimaRocagem: text("ultima_rocagem"),
  manualSchedule: boolean("manual_schedule").default(false),
  daysToComplete: integer("days_to_complete"),
  servico: text("servico"),
  registradoPor: text("registrado_por"),
  dataRegistro: timestamp("data_registro"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  service: text("service").notNull(),
  type: text("type").notNull(),
  lote: integer("lote"),
  status: text("status").notNull().default("Idle"),
  currentAreaId: integer("current_area_id"),
  location: jsonb("location").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const appConfig = pgTable("app_config", {
  id: serial("id").primaryKey(),
  mowingProductionRate: jsonb("mowing_production_rate").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const mowingEvents = pgTable("mowing_events", {
  id: serial("id").primaryKey(),
  areaId: integer("area_id").notNull(),
  date: timestamp("date").notNull(),
  type: text("type").notNull(),
  status: text("status").notNull(),
  observation: text("observation"),
  registradoPor: text("registrado_por"),
  dataRegistro: timestamp("data_registro").defaultNow(),
  proximaPrevisao: text("proxima_previsao"),
  daysToComplete: integer("days_to_complete"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const eventPhotos = pgTable("event_photos", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  kind: text("kind").notNull(),
  storagePath: text("storage_path").notNull(),
  takenAt: timestamp("taken_at"),
  uploadedBy: text("uploaded_by"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
