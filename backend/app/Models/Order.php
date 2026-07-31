<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Order extends Model
{
    protected $fillable = [
        'order_number', 'customer_id', 'customer_name', 'product_id', 'inventory_item_id',
        'product_name', 'product_type', 'quantity', 'unit', 'total_amount', 'status',
        'delivery_status', 'order_date', 'delivery_date', 'notes',
        'stock_deducted', 'stock_qty_deducted',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'float',
            'stock_qty_deducted' => 'float',
            'stock_deducted' => 'boolean',
            'order_date' => 'date',
            'delivery_date' => 'date',
        ];
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function inventoryItem(): BelongsTo
    {
        return $this->belongsTo(InventoryItem::class);
    }
}
