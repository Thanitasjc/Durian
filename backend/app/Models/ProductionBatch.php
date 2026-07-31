<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductionBatch extends Model
{
    protected $fillable = [
        'batch_number', 'lot_id', 'product_type', 'input_weight', 'output_weight',
        'yield_percent', 'production_date', 'operator', 'current_step', 'status', 'notes',
    ];

    protected function casts(): array
    {
        return [
            'production_date' => 'date',
            'input_weight' => 'float',
            'output_weight' => 'float',
            'yield_percent' => 'float',
        ];
    }

    public function lot(): BelongsTo
    {
        return $this->belongsTo(Lot::class);
    }
}
