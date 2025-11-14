-- Verificar a contagem real de registros
SELECT 
  COUNT(*) as total_registros,
  MAX(id) as max_id,
  MIN(id) as min_id
FROM service_areas;

-- Ver os últimos registros inseridos
SELECT id, endereco, bairro 
FROM service_areas 
ORDER BY id DESC 
LIMIT 10;