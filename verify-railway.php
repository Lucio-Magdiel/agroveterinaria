#!/usr/bin/env php
<?php

/**
 * Script de verificación para Railway
 * Verifica que todas las configuraciones necesarias estén presentes
 */

echo "🔍 Verificando configuración para Railway...\n\n";

// Verificar archivo nixpacks.toml
echo "✓ Checkeando nixpacks.toml...\n";
if (file_exists(__DIR__ . '/nixpacks.toml')) {
    $content = file_get_contents(__DIR__ . '/nixpacks.toml');
    if (strpos($content, 'php artisan migrate') !== false) {
        echo "  ✅ Las migraciones están configuradas en nixpacks.toml\n";
    } else {
        echo "  ⚠️  Las migraciones NO están en nixpacks.toml\n";
    }
} else {
    echo "  ❌ nixpacks.toml no encontrado\n";
}

echo "\n✓ Checkeando Procfile...\n";
if (file_exists(__DIR__ . '/Procfile')) {
    $content = file_get_contents(__DIR__ . '/Procfile');
    if (strpos($content, 'php artisan migrate') !== false) {
        echo "  ✅ Las migraciones están configuradas en Procfile\n";
    } else {
        echo "  ⚠️  Las migraciones NO están en Procfile\n";
    }
} else {
    echo "  ❌ Procfile no encontrado\n";
}

echo "\n✓ Checkeando migraciones...\n";
$migrations = glob(__DIR__ . '/database/migrations/*.php');
echo "  📁 " . count($migrations) . " archivos de migración encontrados\n";

echo "\n✓ Variables de entorno necesarias para Railway:\n";
$requiredVars = [
    'DB_CONNECTION' => 'mysql',
    'DB_HOST' => '${MYSQLHOST} o tu host MySQL',
    'DB_PORT' => '${MYSQLPORT} o 3306',
    'DB_DATABASE' => '${MYSQLDATABASE} o nombre de tu BD',
    'DB_USERNAME' => '${MYSQLUSER} o tu usuario',
    'DB_PASSWORD' => '${MYSQLPASSWORD} o tu password',
    'CACHE_STORE' => 'file',
    'SESSION_DRIVER' => 'file',
    'APP_ENV' => 'production',
    'APP_DEBUG' => 'false',
    'APP_URL' => 'https://tu-app.up.railway.app',
];

foreach ($requiredVars as $var => $value) {
    echo "  • $var = $value\n";
}

echo "\n✓ Checkeando modelos Eloquent...\n";
$models = glob(__DIR__ . '/app/Models/*.php');
foreach ($models as $model) {
    $modelName = basename($model, '.php');
    echo "  📦 Modelo: $modelName\n";
}

echo "\n" . str_repeat('=', 60) . "\n";
echo "📋 RESUMEN\n";
echo str_repeat('=', 60) . "\n\n";

echo "Para desplegar en Railway:\n\n";
echo "1. Asegúrate de que el servicio MySQL esté agregado\n";
echo "2. Configura las variables de entorno listadas arriba\n";
echo "3. Haz push de tus cambios:\n";
echo "   git add .\n";
echo "   git commit -m \"Configurar para Railway\"\n";
echo "   git push\n\n";

echo "4. Railway automáticamente:\n";
echo "   • Instalará dependencias\n";
echo "   • Ejecutará las migraciones\n";
echo "   • Iniciará la aplicación\n\n";

echo "5. Para crear un usuario administrador, usa el terminal de Railway:\n";
echo "   php artisan tinker\n";
echo "   User::create([\n";
echo "       'name' => 'Admin',\n";
echo "       'email' => 'admin@example.com',\n";
echo "       'password' => Hash::make('tu-password'),\n";
echo "   ]);\n\n";

echo "✅ Listo! Revisa RAILWAY_SETUP.md para más detalles.\n";
