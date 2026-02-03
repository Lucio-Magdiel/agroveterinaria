<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->decimal('kg_per_unit', 10, 2)->nullable()->after('unit')->comment('Kilos por unidad (para productos por peso)');
            $table->boolean('allow_fractional_sale')->default(false)->after('kg_per_unit')->comment('Permitir venta fraccionada en kilos');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['kg_per_unit', 'allow_fractional_sale']);
        });
    }
};
