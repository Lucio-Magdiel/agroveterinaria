<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;

class TestDataSeeder extends Seeder
{
    public function run(): void
    {
        // Crear categorías
        $categories = [
            'alimentos' => ['name' => 'Alimentos para Animales', 'description' => 'Alimentos balanceados y suplementos', 'is_active' => true],
            'medicamentos' => ['name' => 'Medicamentos Veterinarios', 'description' => 'Medicinas y tratamientos para animales', 'is_active' => true],
            'herramientas' => ['name' => 'Herramientas Agrícolas', 'description' => 'Herramientas para el campo', 'is_active' => true],
            'fertilizantes' => ['name' => 'Fertilizantes', 'description' => 'Fertilizantes y abonos', 'is_active' => true],
        ];

        $createdCategories = [];
        foreach ($categories as $key => $categoryData) {
            $createdCategories[$key] = Category::firstOrCreate(
                ['name' => $categoryData['name']],
                $categoryData
            );
        }
    }
}
