<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Tree extends Model
{
    protected $fillable = [
        'plot_id', 'code', 'variety', 'age_years', 'health_status', 'notes',
    ];

    protected function casts(): array
    {
        return ['age_years' => 'float'];
    }

    public function plot(): BelongsTo
    {
        return $this->belongsTo(Plot::class);
    }
}
