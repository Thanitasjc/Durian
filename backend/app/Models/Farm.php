<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Farm extends Model
{
    protected $fillable = [
        'code',
        'name',
        'location',
        'area_rai',
        'notes',
        'map_image_url',
        'map_provider',
        'map_lat',
        'map_lng',
        'map_zoom',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'area_rai' => 'float',
            'map_lat' => 'float',
            'map_lng' => 'float',
            'map_zoom' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function plots(): HasMany
    {
        return $this->hasMany(Plot::class);
    }
}
