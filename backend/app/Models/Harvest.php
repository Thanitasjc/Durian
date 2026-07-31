<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Harvest extends Model
{
    protected $fillable = [
        'farm_id', 'plot_id', 'lot_id', 'harvest_date', 'variety',
        'quantity', 'total_weight', 'harvest_team', 'status', 'notes',
    ];

    protected function casts(): array
    {
        return [
            'harvest_date' => 'date',
            'total_weight' => 'float',
        ];
    }

    public function farm(): BelongsTo
    {
        return $this->belongsTo(Farm::class);
    }

    public function plot(): BelongsTo
    {
        return $this->belongsTo(Plot::class);
    }

    public function lot(): BelongsTo
    {
        return $this->belongsTo(Lot::class);
    }
}
