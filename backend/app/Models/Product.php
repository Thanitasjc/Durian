<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Product extends Model
{
    protected $fillable = [
        'slug',
        'name',
        'name_en',
        'description',
        'tagline',
        'seller_name',
        'seller_phone',
        'product_type',
        'badge',
        'price',
        'unit',
        'stock_qty',
        'inventory_item_id',
        'weight_kg',
        'image_url',
        'gallery_images',
        'rating',
        'review_count',
        'is_published',
        'is_featured',
        'is_hot',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'is_published' => 'boolean',
            'is_featured' => 'boolean',
            'is_hot' => 'boolean',
            'price' => 'integer',
            'stock_qty' => 'integer',
            'weight_kg' => 'float',
            'rating' => 'float',
            'gallery_images' => 'array',
        ];
    }

    public function inventoryItem(): BelongsTo
    {
        return $this->belongsTo(InventoryItem::class);
    }

    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    public function scopeHot($query)
    {
        return $query->where('is_hot', true);
    }
}
