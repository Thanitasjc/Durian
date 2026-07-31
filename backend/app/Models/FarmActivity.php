<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FarmActivity extends Model
{
    protected $fillable = [
        'farm_id', 'plot_id', 'activity_date', 'activity_type',
        'title', 'detail', 'quantity', 'recorded_by',
    ];

    protected function casts(): array
    {
        return ['activity_date' => 'date'];
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
