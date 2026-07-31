<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Plot extends Model
{
    protected $fillable = [
        'farm_id', 'code', 'name', 'variety', 'tree_count', 'avg_tree_age',
        'flowering_date', 'fruit_status', 'expected_harvest_date',
        'development_percent', 'notes',
        'map_x', 'map_y', 'map_w', 'map_h',
        'map_geometry',
        'soil_moisture', 'alert_level',
    ];

    protected function casts(): array
    {
        return [
            'flowering_date' => 'date',
            'expected_harvest_date' => 'date',
            'avg_tree_age' => 'float',
            'map_x' => 'float',
            'map_y' => 'float',
            'map_w' => 'float',
            'map_h' => 'float',
            'map_geometry' => 'array',
            'soil_moisture' => 'integer',
        ];
    }

    public function farm(): BelongsTo
    {
        return $this->belongsTo(Farm::class);
    }

    public function trees(): HasMany
    {
        return $this->hasMany(Tree::class);
    }
}
