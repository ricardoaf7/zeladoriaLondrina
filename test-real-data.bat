@echo off
echo Testando com dados reais do CSV...
curl -X POST http://localhost:5000/api/import-batch ^
  -H "Content-Type: application/json" ^
  -d "{\"data\": [{\"id\": 16, \"endereco\": \"icós\", \"bairro\": \"são caetano\", \"status\": \"Pendente\", \"tipo\": \"Roçagem\", \"metragem_m2\": 438.56, \"lat\": -23.3014941, \"lng\": -51.1550653, \"ordem\": 1, \"servico\": \"rocagem\", \"ativo\": true, \"lote\": 1, \"sequencia_cadastro\": null, \"history\": \"[]\", \"scheduled_date\": null, \"proxima_previsao\": \"2025-11-06\", \"ultima_rocagem\": null, \"manual_schedule\": false, \"days_to_complete\": 1, \"registrado_por\": \"\", \"data_registro\": null}]}"
echo.
echo Teste concluido!