<?php
// ARCHIVO TEMPORAL - Eliminar después de usar
require __DIR__.'/../vendor/autoload.php';

$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

echo "<h1>Ejecutando migraciones faltantes...</h1>";
echo "<pre>";

try {
    // Ejecutar TODAS las migraciones
    $status = $kernel->call('migrate', [
        '--force' => true,
    ]);
    
    echo "\n\n✅ Migraciones completadas!\n\n";
    echo "Estado: " . ($status === 0 ? 'ÉXITO' : 'ERROR') . "\n";
    
    // Mostrar tablas creadas
    echo "\n--- Verificando tablas ---\n";
    $tables = DB::select('SHOW TABLES');
    foreach ($tables as $table) {
        $tableName = array_values((array)$table)[0];
        echo "✓ $tableName\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString();
}

echo "</pre>";
echo "<p><strong>⚠️ ELIMINA ESTE ARCHIVO INMEDIATAMENTE</strong></p>";
