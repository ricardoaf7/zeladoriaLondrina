-- Criar tabelas para o sistema de roçagem com fotos

-- Tabela de áreas de serviço (já deve existir, mas vou incluir para referência)
CREATE TABLE IF NOT EXISTS service_areas (
    id SERIAL PRIMARY KEY,
    ordem INTEGER,
    sequencia_cadastro INTEGER,
    tipo TEXT NOT NULL,
    endereco TEXT NOT NULL,
    bairro TEXT,
    metragem_m2 DOUBLE PRECISION,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    lote INTEGER,
    status TEXT NOT NULL DEFAULT 'Pendente',
    history JSONB NOT NULL DEFAULT '[]',
    polygon JSONB,
    scheduled_date TEXT,
    proxima_previsao TEXT,
    ultima_rocagem TEXT,
    manual_schedule BOOLEAN DEFAULT false,
    days_to_complete INTEGER,
    servico TEXT,
    registrado_por TEXT,
    data_registro TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de equipes (já deve existir)
CREATE TABLE IF NOT EXISTS teams (
    id SERIAL PRIMARY KEY,
    service TEXT NOT NULL,
    type TEXT NOT NULL,
    lote INTEGER,
    status TEXT NOT NULL DEFAULT 'Idle',
    current_area_id INTEGER,
    location JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de configuração do app (já deve existir)
CREATE TABLE IF NOT EXISTS app_config (
    id SERIAL PRIMARY KEY,
    mowing_production_rate JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de eventos de roçagem (NOVA - para histórico)
CREATE TABLE IF NOT EXISTS mowing_events (
    id SERIAL PRIMARY KEY,
    area_id INTEGER NOT NULL REFERENCES service_areas(id),
    date TIMESTAMP NOT NULL,
    type TEXT NOT NULL, -- 'completed' ou 'forecast'
    status TEXT NOT NULL,
    observation TEXT,
    registrado_por TEXT,
    data_registro TIMESTAMP DEFAULT NOW(),
    proxima_previsao TEXT,
    days_to_complete INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de fotos dos eventos (NOVA - para antes/depois)
CREATE TABLE IF NOT EXISTS event_photos (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL REFERENCES mowing_events(id),
    kind TEXT NOT NULL, -- 'before', 'after', ou 'extra'
    storage_path TEXT NOT NULL,
    taken_at TIMESTAMP,
    uploaded_by TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_mowing_events_area_id ON mowing_events(area_id);
CREATE INDEX IF NOT EXISTS idx_mowing_events_date ON mowing_events(date);
CREATE INDEX IF NOT EXISTS idx_mowing_events_type ON mowing_events(type);
CREATE INDEX IF NOT EXISTS idx_event_photos_event_id ON event_photos(event_id);
CREATE INDEX IF NOT EXISTS idx_event_photos_kind ON event_photos(kind);

-- Conceder permissões para anon e authenticated (necessário para o Supabase)
GRANT ALL ON TABLE mowing_events TO anon;
GRANT ALL ON TABLE mowing_events TO authenticated;
GRANT ALL ON TABLE event_photos TO anon;
GRANT ALL ON TABLE event_photos TO authenticated;
GRANT ALL ON SEQUENCE mowing_events_id_seq TO anon;
GRANT ALL ON SEQUENCE mowing_events_id_seq TO authenticated;
GRANT ALL ON SEQUENCE event_photos_id_seq TO anon;
GRANT ALL ON SEQUENCE event_photos_id_seq TO authenticated;

-- Conceder permissões nas tabelas existentes também
GRANT ALL ON TABLE service_areas TO anon;
GRANT ALL ON TABLE service_areas TO authenticated;
GRANT ALL ON TABLE teams TO anon;
GRANT ALL ON TABLE teams TO authenticated;