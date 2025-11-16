-- Tabelas de Analytics e Métricas para Dashboard de Eficiência Operacional

-- Tabela de Métricas Diárias por Equipe
CREATE TABLE IF NOT EXISTS public.equipe_metricas_diarias (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    equipe_id UUID NOT NULL,
    data DATE NOT NULL,
    
    -- Métricas de Produtividade
    servicos_concluidos INTEGER DEFAULT 0,
    servicos_pendentes INTEGER DEFAULT 0,
    servicos_atrasados INTEGER DEFAULT 0,
    total_servicos INTEGER DEFAULT 0,
    
    -- Métricas de Tempo
    tempo_medio_execucao_minutos INTEGER DEFAULT 0,
    tempo_total_trabalhado_minutos INTEGER DEFAULT 0,
    horas_produtivas DECIMAL(5,2) DEFAULT 0,
    horas_improdutivas DECIMAL(5,2) DEFAULT 0,
    
    -- Métricas de Qualidade
    taxa_conclusao DECIMAL(5,2) DEFAULT 0, -- Percentual
    taxa_atraso DECIMAL(5,2) DEFAULT 0, -- Percentual
    servicos_reabertos INTEGER DEFAULT 0,
    reclamacoes INTEGER DEFAULT 0,
    
    -- Métricas de Recursos
    km_percorridos DECIMAL(8,2) DEFAULT 0,
    combustivel_litros DECIMAL(8,2) DEFAULT 0,
    material_utilizado_quantidade INTEGER DEFAULT 0,
    material_utilizado_custo DECIMAL(10,2) DEFAULT 0,
    
    -- Métricas de Eficiência
    eficiencia_geral DECIMAL(5,2) DEFAULT 0, -- Score 0-100
    produtividade_por_hora DECIMAL(8,2) DEFAULT 0,
    custo_por_servico DECIMAL(10,2) DEFAULT 0,
    
    -- Status e Metadados
    status VARCHAR(20) DEFAULT 'ATIVA',
    observacoes TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT equipe_metricas_diarias_unique UNIQUE (equipe_id, data)
);

-- Tabela de Métricas por Tipo de Serviço
CREATE TABLE IF NOT EXISTS public.servico_metricas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    servico_tipo VARCHAR(100) NOT NULL,
    data DATE NOT NULL,
    
    -- Quantidade e Status
    total_servicos INTEGER DEFAULT 0,
    concluidos INTEGER DEFAULT 0,
    pendentes INTEGER DEFAULT 0,
    atrasados INTEGER DEFAULT 0,
    cancelados INTEGER DEFAULT 0,
    
    -- Tempos
    tempo_medio_minutos INTEGER DEFAULT 0,
    tempo_minimo_minutos INTEGER DEFAULT 0,
    tempo_maximo_minutos INTEGER DEFAULT 0,
    tempo_padrao_minutos INTEGER DEFAULT 0,
    
    -- Eficiência e Qualidade
    taxa_conclusao DECIMAL(5,2) DEFAULT 0,
    taxa_atraso DECIMAL(5,2) DEFAULT 0,
    taxa_cancelamento DECIMAL(5,2) DEFAULT 0,
    satisfacao_media DECIMAL(3,2) DEFAULT 0, -- 0-5 estrelas
    
    -- Recursos e Custos
    custo_medio DECIMAL(10,2) DEFAULT 0,
    custo_total DECIMAL(10,2) DEFAULT 0,
    material_medio_por_servico DECIMAL(8,2) DEFAULT 0,
    
    -- Complexidade e Prioridade
    complexidade_media VARCHAR(20) DEFAULT 'MEDIA',
    prioridade_alta_quantidade INTEGER DEFAULT 0,
    prioridade_media_quantidade INTEGER DEFAULT 0,
    prioridade_baixa_quantidade INTEGER DEFAULT 0,
    
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT servico_metricas_unique UNIQUE (servico_tipo, data)
);

-- Tabela de KPIs Gerais (Resumo Executivo)
CREATE TABLE IF NOT EXISTS public.kpi_gerais (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    data DATE NOT NULL,
    periodo VARCHAR(20) NOT NULL, -- DIARIO, SEMANAL, MENSAL, ANUAL
    
    -- KPIs de Produtividade
    kpi_produtividade_geral DECIMAL(5,2) DEFAULT 0, -- Score 0-100
    kpi_taxa_conclusao DECIMAL(5,2) DEFAULT 0,
    kpi_servicos_por_dia DECIMAL(8,2) DEFAULT 0,
    kpi_equipes_ativas INTEGER DEFAULT 0,
    
    -- KPIs de Tempo e Eficiência
    kpi_tempo_medio_execucao DECIMAL(8,2) DEFAULT 0,
    kpi_taxa_atraso DECIMAL(5,2) DEFAULT 0,
    kpi_tempo_utilizacao DECIMAL(5,2) DEFAULT 0, -- % de tempo produtivo
    
    -- KPIs de Qualidade
    kpi_satisfacao_geral DECIMAL(3,2) DEFAULT 0,
    kpi_taxa_reabertura DECIMAL(5,2) DEFAULT 0,
    kpi_taxa_reclamacao DECIMAL(5,2) DEFAULT 0,
    
    -- KPIs Financeiros
    kpi_custo_total DECIMAL(12,2) DEFAULT 0,
    kpi_custo_por_servico DECIMAL(10,2) DEFAULT 0,
    kpi_custo_por_equipe DECIMAL(12,2) DEFAULT 0,
    kpi_roi DECIMAL(5,2) DEFAULT 0, -- Return on Investment
    
    -- KPIs de Recursos
    kpi_utilizacao_recursos DECIMAL(5,2) DEFAULT 0,
    kpi_eficiencia_combustivel DECIMAL(5,2) DEFAULT 0,
    kpi_manutencao_prevista_vs_realizada DECIMAL(5,2) DEFAULT 0,
    
    -- KPIs Ambientais e Sociais
    kpi_sustentabilidade DECIMAL(5,2) DEFAULT 0,
    kpi_reciclagem_percentual DECIMAL(5,2) DEFAULT 0,
    kpi_reducao_residuos DECIMAL(8,2) DEFAULT 0,
    
    -- Benchmarking
    kpi_benchmark_interno DECIMAL(5,2) DEFAULT 0,
    kpi_benchmark_externo DECIMAL(5,2) DEFAULT 0,
    kpi_ranking_posicao INTEGER DEFAULT 0,
    
    -- Status e Tendência
    status VARCHAR(20) DEFAULT 'NEUTRO', -- BOM, RUIM, NEUTRO
    tendencia VARCHAR(20) DEFAULT 'ESTAVEL', -- CRESCENTE, DECRESCENTE, ESTAVEL
    variacao_percentual DECIMAL(5,2) DEFAULT 0,
    
    observacoes TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT kpi_gerais_unique UNIQUE (data, periodo)
);

-- Tabela de Eventos e Incidentes (para análise de causas)
CREATE TABLE IF NOT EXISTS public.eventos_incidentes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL, -- INCIDENTE, MANUTENCAO, FALHA, SUCESSO
    categoria VARCHAR(100) NOT NULL, -- EQUIPAMENTO, PESSOAL, CLIMA, LOGISTICA
    
    -- Identificação
    equipe_id UUID,
    servico_id UUID,
    area_id UUID,
    
    -- Descrição
    titulo VARCHAR(200) NOT NULL,
    descricao TEXT,
    gravidade VARCHAR(20) DEFAULT 'MEDIA', -- BAIXA, MEDIA, ALTA, CRITICA
    
    -- Impacto
    impacto_produtividade DECIMAL(5,2) DEFAULT 0,
    impacto_custo DECIMAL(10,2) DEFAULT 0,
    tempo_perdido_minutos INTEGER DEFAULT 0,
    servicos_afetados INTEGER DEFAULT 0,
    
    -- Datas e Status
    data_ocorrencia DATE NOT NULL,
    hora_ocorrencia TIME,
    data_resolucao DATE,
    status_resolucao VARCHAR(50) DEFAULT 'PENDENTE',
    
    -- Causas e Ações
    causa_provavel VARCHAR(200),
    acao_corretiva TEXT,
    acao_preventiva TEXT,
    responsavel VARCHAR(100),
    
    -- Custo e Recursos
    custo_total DECIMAL(10,2) DEFAULT 0,
    recursos_necessarios TEXT[],
    
    -- Aprendizado
    licoes_aprendidas TEXT,
    melhorias_identificadas TEXT[],
    
    criado_por VARCHAR(100),
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Benchmarking e Metas
CREATE TABLE IF NOT EXISTS public.benchmarking_metas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Identificação
    nome VARCHAR(200) NOT NULL,
    descricao TEXT,
    categoria VARCHAR(100) NOT NULL, -- PRODUTIVIDADE, QUALIDADE, CUSTO, TEMPO
    
    -- Métrica
    metrica VARCHAR(100) NOT NULL,
    unidade_medida VARCHAR(50),
    valor_meta DECIMAL(10,2) NOT NULL,
    valor_atual DECIMAL(10,2) DEFAULT 0,
    valor_benchmark DECIMAL(10,2), -- Melhor do mercado
    
    -- Período e Vigência
    periodo_tipo VARCHAR(20) NOT NULL, -- DIARIO, SEMANAL, MENSAL, TRIMESTRAL, ANUAL
    data_inicio DATE NOT NULL,
    data_fim DATE,
    
    -- Status e Progresso
    status VARCHAR(20) DEFAULT 'ATIVA', -- ATIVA, INATIVA, CONCLUIDA
    progresso_percentual DECIMAL(5,2) DEFAULT 0,
    alcancada BOOLEAN DEFAULT FALSE,
    data_alcancada DATE,
    
    -- Responsáveis
    responsavel_tipo VARCHAR(50), -- EQUIPE, INDIVIDUAL, GERAL
    responsavel_id UUID,
    responsavel_nome VARCHAR(100),
    
    -- Ações e Observações
    acoes_necessarias TEXT[],
    observacoes TEXT,
    
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para Performance
CREATE INDEX IF NOT EXISTS idx_equipe_metricas_diarias_data ON public.equipe_metricas_diarias(data);
CREATE INDEX IF NOT EXISTS idx_equipe_metricas_diarias_equipe ON public.equipe_metricas_diarias(equipe_id);
CREATE INDEX IF NOT EXISTS idx_servico_metricas_data ON public.servico_metricas(data);
CREATE INDEX IF NOT EXISTS idx_servico_metricas_tipo ON public.servico_metricas(servico_tipo);
CREATE INDEX IF NOT EXISTS idx_kpi_gerais_data ON public.kpi_gerais(data);
CREATE INDEX IF NOT EXISTS idx_kpi_gerais_periodo ON public.kpi_gerais(periodo);
CREATE INDEX IF NOT EXISTS idx_eventos_data ON public.eventos_incidentes(data_ocorrencia);
CREATE INDEX IF NOT EXISTS idx_eventos_tipo ON public.eventos_incidentes(tipo);
CREATE INDEX IF NOT EXISTS idx_benchmarking_ativa ON public.benchmarking_metas(status) WHERE status = 'ATIVA';

-- Funções para Atualização de Timestamps
CREATE OR REPLACE FUNCTION update_analytics_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar timestamps
DROP TRIGGER IF EXISTS update_equipe_metricas_diarias_timestamp ON public.equipe_metricas_diarias;
CREATE TRIGGER update_equipe_metricas_diarias_timestamp
    BEFORE UPDATE ON public.equipe_metricas_diarias
    FOR EACH ROW
    EXECUTE FUNCTION update_analytics_timestamp();

DROP TRIGGER IF EXISTS update_servico_metricas_timestamp ON public.servico_metricas;
CREATE TRIGGER update_servico_metricas_timestamp
    BEFORE UPDATE ON public.servico_metricas
    FOR EACH ROW
    EXECUTE FUNCTION update_analytics_timestamp();

DROP TRIGGER IF EXISTS update_kpi_gerais_timestamp ON public.kpi_gerais;
CREATE TRIGGER update_kpi_gerais_timestamp
    BEFORE UPDATE ON public.kpi_gerais
    FOR EACH ROW
    EXECUTE FUNCTION update_analytics_timestamp();

DROP TRIGGER IF EXISTS update_eventos_incidentes_timestamp ON public.eventos_incidentes;
CREATE TRIGGER update_eventos_incidentes_timestamp
    BEFORE UPDATE ON public.eventos_incidentes
    FOR EACH ROW
    EXECUTE FUNCTION update_analytics_timestamp();

DROP TRIGGER IF EXISTS update_benchmarking_metas_timestamp ON public.benchmarking_metas;
CREATE TRIGGER update_benchmarking_metas_timestamp
    BEFORE UPDATE ON public.benchmarking_metas
    FOR EACH ROW
    EXECUTE FUNCTION update_analytics_timestamp();

-- Permissões
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;

-- Dados de Exemplo para KPIs
INSERT INTO public.kpi_gerais (
    data, periodo, kpi_produtividade_geral, kpi_taxa_conclusao, kpi_servicos_por_dia,
    kpi_equipes_ativas, kpi_tempo_medio_execucao, kpi_taxa_atraso, kpi_satisfacao_geral,
    status, tendencia
) VALUES 
(CURRENT_DATE, 'DIARIO', 85.5, 92.3, 45.2, 12, 3.5, 7.8, 4.2, 'BOM', 'CRESCENTE'),
(CURRENT_DATE - INTERVAL '1 day', 'DIARIO', 82.1, 89.7, 42.8, 12, 4.1, 10.2, 4.0, 'BOM', 'NEUTRO'),
(CURRENT_DATE - INTERVAL '2 days', 'DIARIO', 78.9, 85.4, 38.5, 11, 4.8, 14.5, 3.8, 'NEUTRO', 'DECRESCENTE');

-- Dados de Exemplo para Benchmarking
INSERT INTO public.benchmarking_metas (
    nome, descricao, categoria, metrica, unidade_medida, valor_meta, valor_atual,
    valor_benchmark, periodo_tipo, data_inicio, status, progresso_percentual
) VALUES 
('Taxa de Conclusão', 'Percentual de serviços concluídos no prazo', 'PRODUTIVIDADE', 'taxa_conclusao', '%', 95.0, 92.3, 98.5, 'MENSAL', CURRENT_DATE, 'ATIVA', 97.2),
('Tempo Médio de Execução', 'Tempo médio para conclusão de serviços', 'TEMPO', 'tempo_medio_execucao', 'horas', 3.0, 3.5, 2.5, 'MENSAL', CURRENT_DATE, 'ATIVA', 85.7),
('Satisfação do Cidadão', 'Avaliação média dos serviços', 'QUALIDADE', 'satisfacao_media', 'estrelas', 4.5, 4.2, 4.8, 'MENSAL', CURRENT_DATE, 'ATIVA', 93.3),
('Custo por Serviço', 'Custo médio por serviço realizado', 'CUSTO', 'custo_por_servico', 'reais', 150.0, 165.5, 120.0, 'MENSAL', CURRENT_DATE, 'ATIVA', 90.9);