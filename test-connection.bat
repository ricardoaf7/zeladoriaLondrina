@echo off
echo Testando conexao simples...
curl -X GET http://localhost:5000/api/config
echo.
echo Teste concluido!