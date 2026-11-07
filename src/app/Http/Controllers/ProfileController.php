<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileRequest;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Services\FileService;

class ProfileController extends Controller
{
    public function __construct(private FileService $fileService)
    {
    }

    private function userId(): ?int
    {
        return optional(Auth::guard('api')->user())->id;
    }

    public function getProfile()
    {
        $userId = Auth::id();
        $profile = $this->getUserWithReviews($userId);

        if ($profile?->reviews) {
            $profile->reviews->each(fn($review) =>
                $review->is_liked = $review->likes->contains('user_id', $userId)
            );
        }

        $profile?->append(['reviews_count', 'liked_reviews_count']);

        return response()->json([
            'success' => true,
            'data' => ['profile' => $profile]
        ]);
    }

    public function update(ProfileRequest $request)
    {
        $profile = User::findOrFail(Auth::id());

        return DB::transaction(function () use ($profile, $request) {
            if ($request->hasFile('profileImage')) {
                $image = $request->file('profileImage');
                $fileName = time() . '_' . bin2hex(random_bytes(8)) . '.' . $image->getClientOriginalExtension();
                $path = $this->fileService->upload($image, 'profileImage', $fileName);
                $profile->image_path = $this->fileService->getUrl($path);
            }

            $profile->name = $request->name;
            $profile->comment = $request->comment;
            $profile->save();

            return response()->json([
                'success' => true,
                'data' => ['message' => 'プロフィールを更新しました']
            ]);
        });
    }

    public function detail(int $id)
    {
        $profile = $this->getUserWithReviews($id);
        $userId = $this->userId();

        if ($profile?->reviews) {
            $profile->reviews->each(fn($review) =>
                $review->is_liked = $userId ? $review->likes->contains('user_id', $userId) : false
            );
        }

        $profile?->append(['reviews_count', 'liked_reviews_count']);

        return response()->json([
            'success' => true,
            'data' => ['profile' => $profile]
        ]);
    }

    private function getUserWithReviews(int $id): ?User
    {
        return User::with([
            'reviews.user',
            'reviews.city',
            'reviews.prefecture',
            'reviews.rating',
            'reviews.photos',
            'reviews.likes',
            'likedReviews' => fn($query) => $query->with([
                'user', 'city', 'prefecture', 'rating', 'photos', 'likes'
            ])->withCount('likes'),
        ])
        ->where('id', $id)
        ->with(['reviews' => fn($query) => $query->withCount('likes')])
        ->first();
    }
}
