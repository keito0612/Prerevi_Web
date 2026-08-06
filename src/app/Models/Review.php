<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Review extends Model
{
    use HasFactory;
    protected $fillable = [
        'user_id',
        'prefecture_id',
        'city_id',
        'town_name',
        'good_comment',
        'bad_comment'
    ];

    protected $appends = ['posted_at_human'];

    public function getPostedAtHumanAttribute()
    {
        return $this->created_at->diffForHumans();
    }
    public function likes()
    {
        return $this->hasMany(Like::class, 'review_id');
    }
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function rating()
    {
        return $this->hasOne(Rating::class,'review_id');
    }
    public function prefecture()
    {
        return $this->belongsTo(Prefecture::class, 'prefecture_id');
    }
    public function city()
    {
        return $this->belongsTo(City::class);
    }

    public function photos()
    {
        return $this->hasMany(Photo::class)->orderBy('id', 'asc');
    }
}
