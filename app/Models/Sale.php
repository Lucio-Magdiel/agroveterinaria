<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Sale extends Model
{
    protected $fillable = [
        'sale_number',
        'user_id',
        'subtotal',
        'tax',
        'total',
        'payment_method',
        'payment_reference',
        'status',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'subtotal' => 'decimal:2',
            'tax' => 'decimal:2',
            'total' => 'decimal:2',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function details(): HasMany
    {
        return $this->hasMany(SaleDetail::class);
    }

    public function inventoryMovements(): HasMany
    {
        return $this->hasMany(InventoryMovement::class);
    }

    public static function generateSaleNumber(): string
    {
        $date = now()->format('Ymd');
        $lastSale = self::whereDate('created_at', today())->latest()->first();
        $sequence = $lastSale ? (int)substr($lastSale->sale_number, -4) + 1 : 1;
        return $date . str_pad($sequence, 4, '0', STR_PAD_LEFT);
    }
}
