# Configuración de Railway para Agroveterinaria

## Problema Actual
- La aplicación muestra error de conexión a base de datos MySQL
- No hay tablas en la base de datos
- Credenciales incorrectas

## Solución Paso a Paso

### 1. Conectar MySQL en Railway

En el panel de Railway:

1. Asegúrate de tener el servicio MySQL agregado
2. Si no lo tienes, agrégalo:
   - Click en "+ New"
   - Selecciona "Database" → "Add MySQL"

### 2. Configurar Variables de Entorno

Ve a tu servicio "web" en Railway → pestaña "Variables" y agrega/verifica:

#### Variables de Base de Datos
Si Railway ya tiene MySQL configurado, verás variables como:
- `MYSQLHOST`
- `MYSQLPORT`
- `MYSQLDATABASE`
- `MYSQLUSER`
- `MYSQLPASSWORD`

Agrega estas variables adicionales usando los valores de arriba:

```env
DB_CONNECTION=mysql
DB_HOST=${MYSQLHOST}
DB_PORT=${MYSQLPORT}
DB_DATABASE=${MYSQLDATABASE}
DB_USERNAME=${MYSQLUSER}
DB_PASSWORD=${MYSQLPASSWORD}
```

#### Variables de Caché y Sesión
```env
CACHE_STORE=file
SESSION_DRIVER=file
QUEUE_CONNECTION=sync
```

#### Variables de Aplicación
```env
APP_ENV=production
APP_DEBUG=false
APP_KEY=<tu-app-key-actual>
APP_URL=https://web-production-597d2.up.railway.app
```

**IMPORTANTE:** No cambies tu `APP_KEY` existente, o perderás datos encriptados.

### 3. Re-desplegar la Aplicación

Una vez configuradas las variables:

1. El archivo `nixpacks.toml` ya está actualizado para ejecutar migraciones automáticamente
2. Haz un commit y push de los cambios:
   ```bash
   git add nixpacks.toml RAILWAY_SETUP.md
   git commit -m "Configurar migraciones automáticas para Railway"
   git push
   ```

3. Railway detectará el cambio y re-desplegará automáticamente

### 4. Verificar el Despliegue

En Railway, ve a la pestaña "Deployments":
- Verifica que el despliegue sea exitoso
- Revisa los logs para confirmar que las migraciones se ejecutaron
- Busca mensajes como "Migration table created successfully"

### 5. Ejecutar Migraciones Manualmente (Si es necesario)

Si las migraciones no se ejecutan automáticamente:

1. En Railway, ve a tu servicio web
2. Click en los tres puntos (⋯) → "Connect to Terminal"
3. Ejecuta:
   ```bash
   php artisan migrate --force
   ```

### 6. Poblar la Base de Datos (Opcional)

Si necesitas datos de prueba:
```bash
php artisan db:seed --force
```

## Verificación Final

1. Visita tu sitio en Railway
2. Intenta iniciar sesión
3. Si necesitas crear un usuario administrador:
   ```bash
   php artisan tinker
   >>> User::create([
       'name' => 'Admin',
       'email' => 'admin@example.com',
       'password' => Hash::make('password123'),
       'role' => 'admin'
   ]);
   ```

## Comandos Útiles para Railway Terminal

```bash
# Ver el estado de la base de datos
php artisan migrate:status

# Limpiar caché
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Ver información de la aplicación
php artisan about
```

## Notas Importantes

- **SQLite localmente, MySQL en producción:** Tu aplicación usa SQLite localmente pero MySQL en Railway
- **No subas el archivo .env:** Railway usa variables de entorno, no el archivo .env
- **APP_KEY:** No regeneres la APP_KEY en producción o perderás datos encriptados

## Solución de Problemas

### Error: "Access denied for user"
- Verifica que las variables `DB_*` estén correctamente configuradas
- Asegúrate de que el servicio MySQL esté en el mismo proyecto de Railway

### Error: "Table not found"
- Las migraciones no se han ejecutado
- Ejecuta manualmente: `php artisan migrate --force`

### Error 500 en producción
- Revisa los logs en Railway: Deployments → tu deployment → Logs
- Ejecuta: `php artisan log:show` (si está disponible)
