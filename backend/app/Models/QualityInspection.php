<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QualityInspection extends Model
{
    protected $fillable = [
        'lot_id', 'receiving_id', 'inspected_at', 'inspector',
        'grade_a_weight', 'grade_b_weight', 'processing_weight', 'reject_weight',
        'brix', 'defects', 'allocation_path', 'status', 'notes',
    ];

    protected function casts(): array
    {
        return [
            'inspected_at' => 'datetime',
            'grade_a_weight' => 'float',
            'grade_b_weight' => 'float',
            'processing_weight' => 'float',
            'reject_weight' => 'float',
        ];
    }

    public function lot(): BelongsTo
    {
        return $this->belongsTo(Lot::class);
    }

    public function receiving(): BelongsTo
    {
        return $this->belongsTo(Receiving::class);
    }
}
