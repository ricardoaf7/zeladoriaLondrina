@echo off
echo Testando conexão com servidor...
curl -X GET http://localhost:5000/api/config
echo.
echo Testando importação...
curl -X POST http://localhost:5000/api/import-batch ^
  -H "Content-Type: application/json" ^
  -d "{\"data\": [{\"id\": 9999, \"endereco\": \"Teste Rua\", \"bairro\": \"Teste Bairro\", \"status\": \"Pendente\", \"tipo\": \"Roçagem\", \"metragem_m2\": 100, \"lat\": -23.3, \"lng\": -51.1, \"ordem\": 1, \"servico\": \"rocagem\", \"ativo\": true}]}"
echo.
echo Teste concluido!