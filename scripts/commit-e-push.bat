@echo off
echo 🚀 Preparando commit e push...
echo.

:: Verificar se há mudanças
 echo 📊 Verificando mudanças...
git status --porcelain > temp_changes.txt
set /p changes=<temp_changes.txt
del temp_changes.txt

if "%changes%"=="" (
    echo ⚠️  Nenhuma mudança detectada!
    echo.
    echo 📋 Arquivos preparados para amanhã:
    echo   - ESTADO_ATUAL.md
    echo   - CHECKLIST_AMANHA.md  
    echo   - INSTRUCOES_TRABALHO_AMANHA.md
    echo   - Componentes SimpleDashboard, SimpleMap, SimpleImport
    echo   - Dados de teste (areas-simples.json)
    echo   - Configuração simplificada do Vercel
    echo.
    echo ✅ Tudo pronto para continuar amanhã!
    pause
    exit /b
)

echo 📁 Mudanças detectadas:
echo %changes%
echo.

:: Adicionar todas as mudanças
echo ➕ Adicionando mudanças...
git add .

:: Criar mensagem de commit
echo 📝 Criando commit...
set "mensagem=feat: preparacao para simplificacao - componentes e documentacao criados"
git commit -m "%mensagem%"

:: Fazer push
echo 📤 Fazendo push...
git push origin main

echo.
echo ✅ Commit e push concluídos com sucesso!
echo.
echo 📋 Resumo do que foi enviado:
echo   - Documentação completa (ESTADO_ATUAL.md, CHECKLIST_AMANHA.md, INSTRUCOES_TRABALHO_AMANHA.md)
echo   - Componentes React simplificados (SimpleDashboard, SimpleMap, SimpleImport)
echo   - Dados de teste (areas-simples.json)
echo   - Configurações e scripts de preparação
echo.
echo 🎯 Tudo pronto para você continuar amanhã no trabalho!
echo 💪 Boa sorte! Você vai conseguir!
echo.
pause