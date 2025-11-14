@echo off
echo Testando endpoint de importacao...
curl -X POST http://localhost:5000/api/import-batch ^
  -H "Content-Type: application/json" ^
  -d "{\"data\": [{\"id\": 9999, \"endereco\": \"Teste Rua\", \"bairro\": \"Teste Bairro\", \"status\": \"Pendente\", \"tipo\": \"Teste\", \"metragem_m2\": 100, \"lat\": -23.3, \"lng\": -51.1, \"ordem\": 1, \"servico\": \"rocagem\", \"ativo\": true}]}"
echo.
echo Teste concluido!