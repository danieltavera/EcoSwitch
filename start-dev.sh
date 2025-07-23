#!/bin/bash

# Script para ejecutar EcoSwitch completo con QR visible
echo "🚀 Iniciando EcoSwitch - Backend + Frontend + Expo"
echo "================================================"

# Ir al directorio del proyecto
cd "$(dirname "$0")"

# Función para limpiar procesos al salir
cleanup() {
    echo "🧹 Limpiando procesos..."
    pkill -f "nodemon\|expo" 2>/dev/null || true
    exit 0
}

# Capturar Ctrl+C para limpiar
trap cleanup SIGINT

# Verificar si los puertos están libres
if lsof -i:3000 >/dev/null 2>&1; then
    echo "⚠️  Puerto 3000 ocupado, liberando..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

if lsof -i:8081 >/dev/null 2>&1; then
    echo "⚠️  Puerto 8081 ocupado, liberando..."
    lsof -ti:8081 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

echo "🔧 Iniciando backend..."
cd backend && npm run dev &
BACKEND_PID=$!

# Esperar un poco para que el backend se inicie
sleep 3

echo "📱 Iniciando Expo (deberías ver el QR en unos segundos)..."
cd ..
npm start

# Si llegamos aquí, limpiamos
cleanup
