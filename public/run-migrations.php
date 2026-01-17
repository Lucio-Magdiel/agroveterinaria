<?php
// ADVERTENCIA: Elimina este archivo después de usarlo por seguridad

require __DIR__.'/../vendor/autoload.php';

$app = require_once __DIR__.'/../bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

echo "<h1>Ejecutando migraciones...</h1>";
echo "<pre>";

$status = $kernel->call('migrate', [
    '--force' => true,
]);

echo "</pre>";
echo "<h2>Estado: " . ($status === 0 ? 'ÉXITO' : 'ERROR') . "</h2>";
echo "<p>Ahora elimina este archivo por seguridad.</p>";
