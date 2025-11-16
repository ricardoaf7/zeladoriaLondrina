-- ========================================
-- TABELAS PARA IMPORTAÇÃO OCR - ROÇAGEM
-- Zeladoria Londrina
-- ========================================

-- 1. TABELA DE LOGS DE IMPORTAÇÃO
-- ========================================
CREATE TABLE IF NOT EXISTS public.import_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    source_type VARCHAR(50) NOT NULL, -- 'OCR', 'CSV', 'MANUAL'
    source_data JSONB,
    supabase_id UUID,
    status VARCHAR(20) NOT NULL, -- 'success', 'error', 'skipped'
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABELA DE CONFIGURAÇÕES DE IMPORTAÇÃO
-- ========================================
CREATE TABLE IF NOT EXISTS public.import_configs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    config_type VARCHAR(50) NOT NULL, -- 'OCR_TEMPLATE', 'CSV_MAPPING', 'FIELD_MAPPING'
    config_data JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABELA DE HISTÓRICO DE IMPORTAÇÕES
-- ========================================
CREATE TABLE IF NOT EXISTS public.import_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    import_type VARCHAR(50) NOT NULL, -- 'OCR', 'CSV', 'API'
    filename VARCHAR(255),
    total_records INTEGER DEFAULT 0,
    processed_records INTEGER DEFAULT 0,
    imported_records INTEGER DEFAULT 0,
    error_records INTEGER DEFAULT 0,
    skipped_records INTEGER DEFAULT 0,
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    status VARCHAR(20) NOT NULL, -- 'running', 'completed', 'failed', 'cancelled'
    error_summary JSONB,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABELA DE MAPEAMENTO DE CAMPOS
-- ========================================
CREATE TABLE IF NOT EXISTS public.field_mappings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    mapping_name VARCHAR(100) NOT NULL,
    source_field VARCHAR(100) NOT NULL,
    target_field VARCHAR(100) NOT NULL,
    field_type VARCHAR(50) NOT NULL,
    transformation_rule TEXT,
    default_value TEXT,
    is_required BOOLEAN DEFAULT false,
    validation_pattern TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. CONFIGURAÇÕES PADRÃO PARA ROÇAGEM
-- ========================================
INSERT INTO public.import_configs (name, description, config_type, config_data) VALUES 
('Roçagem Londrina Padrão', 'Configuração padrão para importação de áreas de roçagem de Londrina', 'OCR_TEMPLATE', '{
  "source_fields": [
    {"name": "tipo_item", "type": "string", "required": true},
    {"name": "endereco", "type": "string", "required": true},
    {"name": "bairro", "type": "string", "required": false},
    {"name": "metragem_m2", "type": "number", "required": true},
    {"name": "latitude", "type": "number", "required": false},
    {"name": "longitude", "type": "number", "required": false},
    {"name": "lote", "type": "number", "required": false},
    {"name": "observacoes", "type": "string", "required": false}
  ],
  "target_table": "service_areas",
  "service_type_mapping": {
    "area publica": "ROCAGEM",
    "praça": "MANUTENCAO_PRAÇA", 
    "canteiros": "ROCAGEM_CANTEIROS",
    "viela": "ROCAGEM_VIELA",
    "lote público": "ROCAGEM_LOTE",
    "lotes": "ROCAGEM_LOTES",
    "fundo de vale": "ROCAGEM_FUNDO_VALE"
  },
  "default_values": {
    "priority": "MEDIA",
    "status": "PENDENTE",
    "estimated_duration": 60,
    "cost_estimate": 0.5
  },
  "validation_rules": {
    "metragem_m2": {"min": 1, "max": 100000},
    "latitude": {"min": -23.5, "max": -23.0},
    "longitude": {"min": -51.5, "max": -51.0}
  }
}'),
('CSV Roçagem Simples', 'Configuração simplificada para CSV com campos básicos', 'CSV_MAPPING', '{
  "required_fields": ["endereco", "bairro", "metragem_m2"],
  "optional_fields": ["tipo", "latitude", "longitude"],
  "default_service_type": "ROCAGEM",
  "coordinate_radius": 0.0001
}');

-- 6. MAPEAMENTOS DE CAMPOS PADRÃO
-- ========================================
INSERT INTO public.field_mappings (mapping_name, source_field, target_field, field_type, transformation_rule, default_value, is_required, validation_pattern) VALUES 
('Roçagem - Tipo Item', 'tipo_item', 'service_type', 'string', 'map_service_type', 'ROCAGEM', true, NULL),
('Roçagem - Endereço', 'endereco', 'name', 'string', 'concat_with_type', NULL, true, NULL),
('Roçagem - Bairro', 'bairro', 'bairro', 'string', NULL, 'Não especificado', false, NULL),
('Roçagem - Metragem', 'metragem_m2', 'estimated_duration', 'number', 'calculate_duration', NULL, true, '^[0-9]+([,.][0-9]+)?$'),
('Roçagem - Coordenadas', 'latitude,longitude', 'coordinates', 'geojson', 'create_polygon', NULL, false, NULL),
('Roçagem - Lote', 'lote', 'lote', 'number', NULL, '1', false, '^[0-9]+$'),
('Roçagem - Observações', 'observacoes', 'notes', 'string', NULL, NULL, false, NULL);

-- 7. ÍNDICES PARA PERFORMANCE
-- ========================================
CREATE INDEX IF NOT EXISTS idx_import_logs_source_type ON public.import_logs(source_type);
CREATE INDEX IF NOT EXISTS idx_import_logs_status ON public.import_logs(status);
CREATE INDEX IF NOT EXISTS idx_import_logs_created_at ON public.import_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_import_history_status ON public.import_history(status);
CREATE INDEX IF NOT EXISTS idx_import_history_created_at ON public.import_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_field_mappings_mapping_name ON public.field_mappings(mapping_name);

-- 8. FUNÇÃO PARA ATUALIZAR TIMESTAMPS
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 9. TRIGGERS PARA ATUALIZAR UPDATED_AT
-- ========================================
CREATE TRIGGER update_import_logs_updated_at BEFORE UPDATE ON public.import_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_import_configs_updated_at BEFORE UPDATE ON public.import_configs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. PERMISSÕES RLS (ROW LEVEL SECURITY)
-- ========================================
ALTER TABLE public.import_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.field_mappings ENABLE ROW LEVEL SECURITY;

-- Permissões para leitura pública
CREATE POLICY "Permitir leitura pública de logs" ON public.import_logs FOR SELECT TO anon USING (true);
CREATE POLICY "Permitir leitura pública de configs" ON public.import_configs FOR SELECT TO anon USING (true);
CREATE POLICY "Permitir leitura pública de histórico" ON public.import_history FOR SELECT TO anon USING (true);
CREATE POLICY "Permitir leitura pública de mapeamentos" ON public.field_mappings FOR SELECT TO anon USING (true);

-- Permissões para usuários autenticados (CRUD completo)
CREATE POLICY "Permitir CRUD autenticado de logs" ON public.import_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Permitir CRUD autenticado de configs" ON public.import_configs FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Permitir CRUD autenticado de histórico" ON public.import_history FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Permitir CRUD autenticado de mapeamentos" ON public.field_mappings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 11. PERMISSÕES FINAIS
-- ========================================
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 12. COMENTÁRIOS DE DOCUMENTAÇÃO
-- ========================================
COMMENT ON TABLE public.import_logs IS 'Logs detalhados de cada registro importado';
COMMENT ON TABLE public.import_configs IS 'Configurações de importação por tipo de dado';
COMMENT ON TABLE public.import_history IS 'Histórico geral de importações com estatísticas';
COMMENT ON TABLE public.field_mappings IS 'Mapeamento de campos entre fonte e destino';

-- 13. VERIFICAÇÃO FINAL
-- ========================================
SELECT table_name, 
       CASE 
         WHEN table_name IS NOT NULL THEN '✅ TABELA CRIADA'
         ELSE '❌ TABELA NÃO ENCONTRADA'
       END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('import_logs', 'import_configs', 'import_history', 'field_mappings')
ORDER BY table_name;

-- Mensagem de sucesso
SELECT '✅ TABELAS DE IMPORTAÇÃO OCR CRIADAS COM SUCESSO!' as status,
       'Sistema pronto para importar áreas de roçagem via OCR!' as mensagem,
       CURRENT_TIMESTAMP as timestamp;