<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Auth;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens;
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'image_path',
        'comment',
        'fcm_token',
        'supabase_id',
        'google_id',
        'oauth_provider',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function likes()
    {
        return $this->hasMany(Like::class);
    }
    public function reviews()
    {
        return $this->hasMany(Review::class);
    }


    public function likedReviews()
    {
        return $this->hasMany(Review::class, 'user_id')
        ->whereHas('likes', function ($query) {
            $query->where('user_id', '!=', $this->id);
        });
    }

    public function userSetting()
    {
        return $this->hasOne(UserSetting::class, 'user_id');
    }

    public function getReviewsCountAttribute(): int
    {
        return $this->reviews()->count();
    }

    public function getLikedReviewsCountAttribute(): int
    {
        return $this->hasMany(Review::class, 'user_id')
        ->withCount('likes')
        ->get()
        ->sum('likes_count');
    }

    /**
     * FCM通知のルーティング（NotiFire用）
     */
    public function routeNotificationForFcm(): ?string
    {
        return $this->fcm_token;
    }
}
