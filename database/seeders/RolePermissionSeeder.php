<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Crear permisos
        $permissions = [
            // Categorías
            'categories.view',
            'categories.create',
            'categories.edit',
            'categories.delete',

            // Productos
            'products.view',
            'products.create',
            'products.edit',
            'products.delete',

            // Inventario
            'inventory.view',
            'inventory.entry',
            'inventory.adjust',

            // Ventas
            'sales.view',
            'sales.create',
            'sales.cancel',

            // Reportes
            'reports.view',
            'reports.export',

            // Usuarios y Roles
            'users.view',
            'users.create',
            'users.edit',
            'users.delete',
            'roles.manage',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Crear roles y asignar permisos
        $adminRole = Role::firstOrCreate(['name' => 'Administrador']);
        $adminRole->givePermissionTo(Permission::all());

        $vendedorRole = Role::firstOrCreate(['name' => 'Vendedor']);
        $vendedorRole->givePermissionTo([
            'products.view',
            'sales.view',
            'sales.create',
            'reports.view',
        ]);

        $almaceneroRole = Role::firstOrCreate(['name' => 'Almacenero']);
        $almaceneroRole->givePermissionTo([
            'categories.view',
            'categories.create',
            'categories.edit',
            'products.view',
            'products.create',
            'products.edit',
            'inventory.view',
            'inventory.entry',
            'inventory.adjust',
            'reports.view',
        ]);

        $consultaRole = Role::firstOrCreate(['name' => 'Solo Consulta']);
        $consultaRole->givePermissionTo([
            'categories.view',
            'products.view',
            'inventory.view',
            'sales.view',
            'reports.view',
        ]);
    }
}
