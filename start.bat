@echo off
REM Vai para o diretório onde este arquivo .bat está localizado
cd /d %~dp0

echo Iniciando o projeto com npm start...

REM Executa o comando npm start
npm start

REM Impede que a janela feche imediatamente se o npm falhar
pause