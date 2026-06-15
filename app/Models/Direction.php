<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Direction extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'name', 'slug'];

    public function tracks()
    {

        return $this->hasMany(Track::class);
    }
}
