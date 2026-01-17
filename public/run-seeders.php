<?php
// ARCHIVO TEMPORAL - Eliminar después de usar
require __DIR__.'/../vendor/autoload.php';

$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

echo "<h1>Ejecutando Seeders...</h1>";
echo "<pre>";

try {
    $status = $kernel->call('db:seed', [
        '--force' => true,
    ]);
    
    echo "\n\n";
    echo "✅ Seeders ejecutados exitosamente!\n\n";
    echo "Credenciales de acceso:\n";
    echo "Email: admin@agroveterinaria.com\n";
    echo "Password: password\n\n";
    echo "Estado: " . ($status === 0 ? 'ÉXITO' : 'ERROR') . "\n";
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

echo "</pre>";
echo "<p><strong>⚠️ IMPORTANTE: Elimina este archivo inmediatamente por seguridad.</strong></p>";
