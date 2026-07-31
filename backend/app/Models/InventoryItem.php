<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InventoryItem extends Model
{
    protected $fillable = [
        'name', 'category', 'product_type', 'lot_number', 'batch_number',
        'quantity', 'unit', 'storage_zone', 'location',
        'production_date', 'expiry_date', 'rotation_method',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'float',
            'production_date' => 'date',
            'expiry_date' => 'date',
        ];
    }

    public function movements(): HasMany
    {
        return $this->hasMany(StockMovement::class);
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }
}
