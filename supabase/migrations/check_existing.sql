-- Verificar quantos registros existem e qual o maior ID
SELECT 
  COUNT(*) as total_registros,
  MAX(id) as max_id,
  MIN(id) as min_id
FROM service_areas;