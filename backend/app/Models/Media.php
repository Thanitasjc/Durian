<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Media extends Model
{
    protected $table = 'media';

    protected $fillable = [
        'disk', 'path', 'filename', 'mime', 'size',
        'collection', 'mediable_type', 'mediable_id', 'uploaded_by',
    ];

    public function mediable(): MorphTo
    {
        return $this->morphTo();
    }
}
