<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Track;


class Direction extends Model
{
    use HasFactory;
    protected $fillable = ['user_id', 'name', 'slug'];

    public function tracks(){

        return $this->hasMany(Track::class);
    }
}
