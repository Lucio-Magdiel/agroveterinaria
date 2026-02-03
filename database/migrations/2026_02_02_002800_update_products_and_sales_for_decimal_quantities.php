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
        // Actualizar tabla products para permitir stock decimal
        Schema::table('products', function (Blueprint $table) {
            $table->decimal('stock', 10, 2)->default(0)->change();
            $table->decimal('min_stock', 10, 2)->default(0)->change();
        });

        // Actualizar tabla sale_details para permitir cantidades decimales
        Schema::table('sale_details', function (Blueprint $table) {
            $table->decimal('quantity', 10, 2)->change();
        });

        // Actualizar tabla inventory_movements para permitir cantidades decimales
        Schema::table('inventory_movements', function (Blueprint $table) {
            $table->decimal('quantity', 10, 2)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->integer('stock')->default(0)->change();
            $table->integer('min_stock')->default(0)->change();
        });

        Schema::table('sale_details', function (Blueprint $table) {
            $table->integer('quantity')->change();
        });

        Schema::table('inventory_movements', function (Blueprint $table) {
            $table->integer('quantity')->change();
        });
    }
};
