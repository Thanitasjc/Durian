<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Receiving extends Model
{
    protected $fillable = [
        'receiving_number', 'lot_id', 'farm_id', 'plot_id', 'harvest_date',
        'received_at', 'quantity', 'total_weight', 'receiver', 'status', 'notes',
    ];

    protected function casts(): array
    {
        return [
            'harvest_date' => 'date',
            'received_at' => 'datetime',
            'total_weight' => 'float',
        ];
    }

    public function lot(): BelongsTo
    {
        return $this->belongsTo(Lot::class);
    }

    public function farm(): BelongsTo
    {
        return $this->belongsTo(Farm::class);
    }

    public function plot(): BelongsTo
    {
        return $this->belongsTo(Plot::class);
    }
}
