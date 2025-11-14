-- Script para importar dados do CSV e corrigir caracteres especiais
-- Copie este SQL e execute no SQL Editor do Supabase

-- Função para corrigir caracteres especiais
CREATE OR REPLACE FUNCTION corrigir_texto(texto TEXT)
RETURNS TEXT AS $$
BEGIN
    IF texto IS NULL THEN
        RETURN texto;
    END IF;
    
    -- Substituir caracteres com problemas comuns
    texto := REPLACE(texto, 'Ã§', 'ç');
    texto := REPLACE(texto, 'Ã£', 'ã');
    texto := REPLACE(texto, 'Ã³', 'ó');
    texto := REPLACE(texto, 'Ã©', 'é');
    texto := REPLACE(texto, 'Ã', 'í');
    texto := REPLACE(texto, 'Ã¢', 'â');
    texto := REPLACE(texto, 'Ã´', 'ô');
    texto := REPLACE(texto, 'Ãª', 'ê');
    texto := REPLACE(texto, 'Ã¹', 'ú');
    texto := REPLACE(texto, 'Ã¼', 'ü');
    texto := REPLACE(texto, 'Ã±', 'ñ');
    texto := REPLACE(texto, 'Ã¡', 'á');
    texto := REPLACE(texto, 'Ã ', 'à');
    texto := REPLACE(texto, 'Ã£', 'ã');
    texto := REPLACE(texto, 'Ã§', 'ç');
    texto := REPLACE(texto, 'Ã‰', 'É');
    texto := REPLACE(texto, 'Ã“', 'Ó');
    texto := REPLACE(texto, 'Ã', 'Í');
    texto := REPLACE(texto, 'Ã', 'Ã');
    texto := REPLACE(texto, 'Âº', 'º');
    texto := REPLACE(texto, 'Âª', 'ª');
    texto := REPLACE(texto, 'Â°', '°');
    
    RETURN texto;
END;
$$ LANGUAGE plpgsql;

-- Inserir os dados do CSV (copie e cole aqui os valores que você me enviou)
-- Exemplo com as primeiras linhas que você me mostrou:

INSERT INTO service_areas (
    id, ordem, sequencia_cadastro, tipo, endereco, bairro, metragem_m2, 
    lat, lng, lote, status, history, polygon, scheduled_date, 
    proxima_previsao, ultima_rocagem, manual_schedule, days_to_complete, 
    servico, registrado_por, data_registro, created_at, updated_at
) VALUES 
-- Linha 16
(16, NULL, NULL, 'Roçagem', corrigir_texto('icós'), corrigir_texto('são caetano'), 438.56, 
 -23.3014941, -51.1550653, 1, 'Pendente', '[]', NULL, '2025-11-06', 
 NULL, NULL, false, 1, 'rocagem', 'importacao_csv', NOW(), NOW(), NOW()),

-- Linha 23  
(23, NULL, NULL, 'Roçagem', corrigir_texto('nilo cairo c matheus leme'), corrigir_texto('jd. paulista'), 874.57, 
 -23.2904896, -51.1587728, 1, 'Pendente', '[]', NULL, '2025-12-18', 
 NULL, '2025-11-03', false, 1, 'rocagem', 'importacao_csv', NOW(), NOW(), NOW()),

-- Linha 17
(17, NULL, NULL, 'Roçagem', corrigir_texto('tembés'), corrigir_texto('portuguesa'), 348, 
 -23.3023949, -51.154633, 1, 'Pendente', '[]', NULL, '2025-11-06', 
 NULL, NULL, false, 1, 'rocagem', 'importacao_csv', NOW(), NOW(), NOW()),

-- Linha 18
(18, NULL, NULL, 'Roçagem', corrigir_texto('tiete c john kennedy'), corrigir_texto('recreio'), 1915.41, 
 -23.2953414, -51.1589755, 1, 'Pendente', '[]', NULL, '2025-11-06', 
 NULL, NULL, false, 1, 'rocagem', 'importacao_csv', NOW(), NOW(), NOW()),

-- Linha 635
(635, NULL, NULL, 'Roçagem', corrigir_texto('rua gustavo barroso c/ av. tiradentes'), corrigir_texto('shangri - la a'), 6371.05, 
 -23.3013172, -51.1774531, 2, 'Pendente', '[]', NULL, '2025-11-06', 
 NULL, NULL, false, 1, 'rocagem', 'importacao_csv', NOW(), NOW(), NOW()),

-- Linha 19
(19, NULL, NULL, 'Roçagem', corrigir_texto('tietê c duque de caxias 2 praças'), corrigir_texto('recreio'), 2457, 
 -23.3272806, -51.1540579, 1, 'Pendente', '[]', NULL, '2025-11-06', 
 NULL, NULL, false, 1, 'rocagem', 'importacao_csv', NOW(), NOW(), NOW()),

-- Linha 637
(637, NULL, NULL, 'Roçagem', corrigir_texto('porto alegre em frente ao nº 120'), corrigir_texto('vila agari'), 170.01, 
 -30.0368176, -51.2089887, 2, 'Pendente', '[]', NULL, '2025-11-06', 
 NULL, NULL, false, 1, 'rocagem', 'importacao_csv', NOW(), NOW(), NOW()),

-- Linha 641
(641, NULL, NULL, 'Roçagem', corrigir_texto('trav. farroupilha / rua castro alves'), corrigir_texto('shangri - la a'), 6358.13, 
 -23.2990914, -51.1860962, 2, 'Pendente', '[]', NULL, '2025-11-06', 
 NULL, NULL, false, 1, 'rocagem', 'importacao_csv', NOW(), NOW(), NOW()),

-- Linha 657
(657, NULL, NULL, 'Roçagem', corrigir_texto('mercurio c/ marte / capricornio'), corrigir_texto('do sol'), 1825.27, 
 -23.2740063, -51.1861348, 2, 'Pendente', '[]', NULL, '2025-11-06', 
 NULL, NULL, false, 1, 'rocagem', 'importacao_csv', NOW(), NOW(), NOW()),

-- Linha 664
(664, NULL, NULL, 'Roçagem', corrigir_texto('rua sergio cardoso quadra 18a lotes 08, 09 e 10'), corrigir_texto('são francisco de assis'), 1303.16, 
 -23.3197305, -51.1662008, 2, 'Pendente', '[]', NULL, '2025-11-06', 
 NULL, NULL, false, 1, 'rocagem', 'importacao_csv', NOW(), NOW(), NOW());

-- Continue com o restante dos dados...
-- Para adicionar mais linhas, copie o padrão acima e altere os valores
-- OU me envie mais partes do CSV que eu continuo o script

-- Após importar, atualizar os dados com a função de correção
UPDATE service_areas 
SET 
    endereco = corrigir_texto(endereco),
    bairro = corrigir_texto(bairro),
    tipo = corrigir_texto(tipo)
WHERE registrado_por = 'importacao_csv';

-- Verificar a importação
SELECT 
    id,
    endereco,
    bairro,
    metragem_m2,
    lat,
    lng,
    status
FROM service_areas 
WHERE registrado_por = 'importacao_csv' 
ORDER BY id 
LIMIT 20;