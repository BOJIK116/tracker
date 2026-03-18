<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Track extends Model
{
    use HasFactory;
    protected $fillable = [
        'user_id',
        'direction_id',
        'iso_year',
        'iso_week',
        'iso_weekday',
        'completed',
    ];

    protected $casts = ['completed' => 'boolean'];

    public function direction()
    {
        return $this->belongsTo(Direction::class);
    }
}
