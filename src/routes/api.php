<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\api\AuthController;
use App\Http\Controllers\api\GoogleAuthController;
use App\Http\Controllers\api\SupabaseAuthController;
use App\Http\Controllers\CityController;
use App\Http\Controllers\FcmController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\UserSettingController;
use App\Models\Review;
use Illuminate\Container\Attributes\Auth;
use Symfony\Component\HttpKernel\Profiler\Profile;


Route::get( '/some_url', function () {
    return response()->json(['error' => 'User not authenticated'], 401);
}
)->name('login');

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// Supabase OAuth
Route::prefix('/auth/supabase')->group(function () {
    Route::get('/google', [SupabaseAuthController::class, 'redirectToGoogle']);
    Route::post('/callback', [SupabaseAuthController::class, 'handleCallback']);
});

// Google OAuth (Laravel Socialite)
Route::prefix('/auth/google')->group(function () {
    Route::get('/', [GoogleAuthController::class, 'redirectToGoogle']);
    Route::get('/callback', [GoogleAuthController::class, 'handleGoogleCallback']);
    Route::get('/url', [GoogleAuthController::class, 'getGoogleAuthUrl']);
});
Route::get('/{prefecture_id}/citys/', [CityController::class, 'getCitys']);
Route::get('/city/{city_id}/towns/', [CityController::class, 'getTowns']);
Route::get('/prefecture_reviews/{prefecture_id}',[ReviewController::class, 'getPrefectureReviews']);
Route::get('/city_reviews/{prefecture_id}/{city_id}',[ReviewController::class, 'getCityReviews']);
Route::post('/password/email', [AuthController::class, 'sendPasswordResetEmail']);
Route::post('/password/reset', [AuthController::class, 'resetPassword']);
Route::prefix('profile')->group(function () {
    Route::get('/detail/{id}', [ProfileController::class, 'detail']);
});

// 匿名投稿（認証不要）
Route::post('/guest/city_review/{prefecture_id}/{city_id}', [ReviewController::class, 'postAnonymousReview']);

Route::group(['middleware' => ['auth:sanctum']], function () {
    Route::prefix('/post')->group(function () {
        Route::post('/city_review/{prefecture_id}/{city_id}',[ReviewController::class,'postCityReview']);
        Route::get('/review/{id}',[ReviewController::class,'getReview']);
        Route::post('/review/{id}/update',[ReviewController::class,'updateReview']);
        Route::post('/review/like/{review_id}',[ReviewController::class,'like']);
        Route::post('/review/unlike/{review_id}',[ReviewController::class,'unlike']);
        Route::post('/review/delete/{id}/',[ReviewController::class,'deleteReview']);
    });
    Route::prefix('/notifications')->group(function () {
        Route::get('/',[NotificationController::class,'getNotifications']);
        Route::get('/unread_count', [NotificationController::class, 'unreadCount']);
        Route::get('/detail/{id}',[NotificationController::class,'detail']);
        Route::delete('/all_delete',[NotificationController::class,'allDeleteNotification']);
        Route::delete('/delete/{id}',[NotificationController::class,'deleteNotification']);
    });
    Route::get('/user', [UserController::class, 'getUser']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::prefix('profile')->group(function () {
        Route::get('/', [ProfileController::class, 'getProfile']);
        Route::post('/update', [ProfileController::class, 'update']);
    });
    Route::prefix('/user_setting')->group(function(){
        Route::get('/', [UserSettingController::class,'index']);
        Route::post('/email_notification', [UserSettingController::class,'emailNotification']);
    });
    Route::prefix('/fcm')->group(function(){
        Route::post('/token', [FcmController::class, 'updateToken']);
        Route::delete('/token', [FcmController::class, 'deleteToken']);
    });
});

