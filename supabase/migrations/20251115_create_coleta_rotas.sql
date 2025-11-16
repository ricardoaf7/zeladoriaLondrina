-- Tabela de Rotas de Coleta Pública
-- Armazena informações sobre dias e horários de coleta por região

CREATE TABLE IF NOT EXISTS public.coleta_rotas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Informações da Rua/Região
    rua_nome VARCHAR(255) NOT NULL,
    rua_tipo VARCHAR(50) DEFAULT 'Rua', -- Rua, Avenida, Travessa, etc
    bairro VARCHAR(100) NOT NULL,
    cep VARCHAR(9), -- Formato: 86000-000
    
    -- Coordenadas geográficas (para busca por proximidade)
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Coleta de Resíduos Orgânicos (restos de comida, podas, etc)
    organico_dia_semana VARCHAR(20), -- Segunda, Terça, Quarta, etc
    organico_horario_inicio TIME,
    organico_horario_fim TIME,
    organico_frequencia VARCHAR(50) DEFAULT 'Semanal', -- Semanal, Quinzenal, Mensal
    organico_observacao TEXT,
    
    -- Coleta de Resíduos Recicláveis (papel, plástico, metal, vidro)
    reciclavel_dia_semana VARCHAR(20),
    reciclavel_horario_inicio TIME,
    reciclavel_horario_fim TIME,
    reciclavel_frequencia VARCHAR(50) DEFAULT 'Semanal',
    reciclavel_observacao TEXT,
    
    -- Coleta de Rejeitos (lixo comum, fraldas, etc)
    rejeito_dia_semana VARCHAR(20),
    rejeito_horario_inicio TIME,
    rejeito_horario_fim TIME,
    rejeito_frequencia VARCHAR(50) DEFAULT 'Semanal',
    rejeito_observacao TEXT,
    
    -- Coleta Seletiva Especial (pilhas, baterias, eletrônicos, etc)
    especial_dia_semana VARCHAR(20),
    especial_horario_inicio TIME,
    especial_horario_fim TIME,
    especial_frequencia VARCHAR(50) DEFAULT 'Mensal',
    especial_observacao TEXT,
    especial_tipos TEXT[], -- ['pilhas', 'baterias', 'eletronicos', 'lampadas']
    
    -- Status e Vigência
    ativo BOOLEAN DEFAULT true,
    data_inicio_vigencia DATE DEFAULT CURRENT_DATE,
    data_fim_vigencia DATE,
    
    -- Metadados
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    criado_por VARCHAR(100),
    atualizado_por VARCHAR(100),
    
    -- Índices para performance
    CONSTRAINT coleta_rotas_rua_bairro_unique UNIQUE (rua_nome, bairro, cep),
    CONSTRAINT coleta_rotas_cep_check CHECK (cep ~ '^[0-9]{5}-[0-9]{3}$' OR cep IS NULL)
);

-- Índices para buscas rápidas
CREATE INDEX IF NOT EXISTS idx_coleta_rotas_rua ON public.coleta_rotas(rua_nome);
CREATE INDEX IF NOT EXISTS idx_coleta_rotas_bairro ON public.coleta_rotas(bairro);
CREATE INDEX IF NOT EXISTS idx_coleta_rotas_cep ON public.coleta_rotas(cep);
CREATE INDEX IF NOT EXISTS idx_coleta_rotas_ativo ON public.coleta_rotas(ativo);
CREATE INDEX IF NOT EXISTS idx_coleta_rotas_localizacao ON public.coleta_rotas(latitude, longitude);

-- Índices para busca por dia da semana
CREATE INDEX IF NOT EXISTS idx_coleta_organico_dia ON public.coleta_rotas(organico_dia_semana) WHERE organico_dia_semana IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_coleta_reciclavel_dia ON public.coleta_rotas(reciclavel_dia_semana) WHERE reciclavel_dia_semana IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_coleta_rejeito_dia ON public.coleta_rotas(rejeito_dia_semana) WHERE rejeito_dia_semana IS NOT NULL;

-- Função para atualizar timestamp
CREATE OR REPLACE FUNCTION update_coleta_rotas_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar timestamp
DROP TRIGGER IF EXISTS update_coleta_rotas_timestamp ON public.coleta_rotas;
CREATE TRIGGER update_coleta_rotas_timestamp
    BEFORE UPDATE ON public.coleta_rotas
    FOR EACH ROW
    EXECUTE FUNCTION update_coleta_rotas_timestamp();

-- Comentários para documentação
COMMENT ON TABLE public.coleta_rotas IS 'Tabela de rotas de coleta de lixo para consulta pública';
COMMENT ON COLUMN public.coleta_rotas.rua_nome IS 'Nome da rua/avenida/travessa';
COMMENT ON COLUMN public.coleta_rotas.bairro IS 'Nome do bairro';
COMMENT ON COLUMN public.coleta_rotas.cep IS 'CEP no formato 86000-000';
COMMENT ON COLUMN public.coleta_rotas.latitude IS 'Latitude para busca por proximidade';
COMMENT ON COLUMN public.coleta_rotas.longitude IS 'Longitude para busca por proximidade';
COMMENT ON COLUMN public.coleta_rotas.organico_dia_semana IS 'Dia da semana da coleta orgânica';
COMMENT ON COLUMN public.coleta_rotas.reciclavel_dia_semana IS 'Dia da semana da coleta reciclável';
COMMENT ON COLUMN public.coleta_rotas.rejeito_dia_semana IS 'Dia da semana da coleta de rejeitos';
COMMENT ON COLUMN public.coleta_rotas.especial_dia_semana IS 'Dia da semana da coleta especial (pilhas, etc)';

-- Permissões para consulta pública (leitura apenas)
GRANT SELECT ON public.coleta_rotas TO anon;
GRANT SELECT ON public.coleta_rotas TO authenticated;

-- Dados de exemplo para Londrina (bairros principais)
INSERT INTO public.coleta_rotas (
    rua_nome, rua_tipo, bairro, cep, latitude, longitude,
    organico_dia_semana, organico_horario_inicio, organico_horario_fim,
    reciclavel_dia_semana, reciclavel_horario_inicio, reciclavel_horario_fim,
    rejeito_dia_semana, rejeito_horario_inicio, rejeito_horario_fim,
    especial_dia_semana, especial_horario_inicio, especial_horario_fim, especial_tipos
) VALUES 
-- Centro
('Rua Paraná', 'Rua', 'Centro', '86010-610', -23.3045, -51.1692,
 'Terça-feira', '06:00', '08:00',
 'Segunda-feira', '06:00', '08:00',
 'Quinta-feira', '06:00', '08:00',
 'Sábado', '08:00', '12:00', ARRAY['pilhas', 'baterias', 'lampadas']),

('Avenida Maringá', 'Avenida', 'Centro', '86010-900', -23.3098, -51.1587,
 'Quinta-feira', '06:00', '08:00',
 'Quarta-feira', '06:00', '08:00',
 'Segunda-feira', '06:00', '08:00',
 'Sábado', '08:00', '12:00', ARRAY['pilhas', 'baterias', 'eletronicos']),

-- Zona 1
('Rua Espírito Santo', 'Rua', 'Zona 1', '86031-540', -23.2854, -51.1423,
 'Segunda-feira', '06:00', '08:00',
 'Sexta-feira', '06:00', '08:00',
 'Terça-feira', '06:00', '08:00',
 'Sábado', '08:00', '12:00', ARRAY['pilhas', 'lampadas']),

-- Zona 2
('Rua Goiás', 'Rua', 'Zona 2', '86032-240', -23.2956, -51.1356,
 'Quarta-feira', '06:00', '08:00',
 'Segunda-feira', '06:00', '08:00',
 'Sexta-feira', '06:00', '08:00',
 'Sábado', '08:00', '12:00', ARRAY['baterias', 'eletronicos']),

-- Jardim América
('Rua Araribóia', 'Rua', 'Jardim América', '86050-000', -23.3256, -51.1456,
 'Sexta-feira', '06:00', '08:00',
 'Terça-feira', '06:00', '08:00',
 'Quarta-feira', '06:00', '08:00',
 'Sábado', '08:00', '12:00', ARRAY['pilhas', 'baterias', 'lampadas', 'eletronicos']);

-- View materializada para consultas rápidas por CEP
CREATE MATERIALIZED VIEW IF NOT EXISTS public.coleta_rotas_por_cep AS
SELECT 
    cep,
    bairro,
    COUNT(*) as total_rotas,
    array_agg(DISTINCT organico_dia_semana) as dias_organico,
    array_agg(DISTINCT reciclavel_dia_semana) as dias_reciclavel,
    array_agg(DISTINCT rejeito_dia_semana) as dias_rejeito
FROM public.coleta_rotas
WHERE ativo = true AND cep IS NOT NULL
GROUP BY cep, bairro;

-- Índice na view
CREATE INDEX IF NOT EXISTS idx_mv_coleta_cep ON public.coleta_rotas_por_cep(cep);