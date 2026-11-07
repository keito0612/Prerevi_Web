<?php

namespace App\Http\Controllers;

use App\Exceptions\ApiException;
use App\Http\Requests\ReviewRequest;
use App\Http\Requests\AnonymousReviewRequest;
use App\Models\Like;
use App\Models\Photo;
use App\Models\Rating;
use App\Models\Review;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Services\FileService;
use App\Notifications\InformationNotification;
use Symfony\Component\HttpFoundation\Response;

class ReviewController extends Controller
{


    private FileService $fileService;

    public function __construct(FileService $fileService)
    {
        $this->fileService = $fileService;
    }

    private function userId(){
        return optional(Auth::guard('api')->user())->id;
    }

    public function getPrefectureReviews(int $prefectureId)
    {
        $userId = $this->userId();

        $reviews = Review::where('prefecture_id', $prefectureId)
            ->with(['user', 'city', 'rating', 'photos.review.user', 'prefecture', 'likes'])
            ->withCount('likes')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($review) => $this->appendIsLiked($review, $userId));

        $photos = Photo::whereHas('review', fn($query) =>
            $query->where('prefecture_id', $prefectureId)
        )->with('review.user')->get();

        return response()->json([
            'success' => true,
            'data' => [
                'reviews' => $reviews,
                'photos' => $photos
            ]
        ]);
    }

    public function getCityReviews(int $prefectureId, int $cityId)
    {
        $userId = $this->userId();

        $reviews = Review::where(['prefecture_id' => $prefectureId, 'city_id' => $cityId])
            ->with(['user', 'city', 'rating', 'photos.review.user', 'prefecture', 'likes'])
            ->withCount('likes')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($review) => $this->appendIsLiked($review, $userId));

        $photos = Photo::whereHas('review', fn($query) =>
            $query->where(['prefecture_id' => $prefectureId, 'city_id' => $cityId])
        )->with('review.user')->get();

        return response()->json([
            'success' => true,
            'data' => [
                'reviews' => $reviews,
                'photos' => $photos
            ]
        ]);
    }

    private function appendIsLiked(Review $review, ?int $userId): Review
    {
        $review->is_liked = $userId
            ? $review->likes->contains('user_id', $userId)
            : false;
        return $review;
    }

    public function postCityReview(int $prefecture_id, int $city_id, ReviewRequest $request)
    {
        return DB::transaction(function () use ($prefecture_id, $city_id, $request) {
            $review = Review::create([
                'user_id' => Auth::id(),
                'prefecture_id' => $prefecture_id,
                'city_id' => $city_id,
                'town_name' => $request->townName,
                'good_comment' => $request->goodComment,
                'bad_comment' => $request->badComment,
            ]);

            $this->createRating($review->id, $request);

            if ($request->hasFile('photos')) {
                $this->storePhotos($request->file('photos'), $review->id);
            }

            return response()->json([
                'success' => true,
                'data' => ['message' => 'レビューを投稿しました']
            ], Response::HTTP_CREATED);
        });
    }

    public function postAnonymousReview(int $prefecture_id, int $city_id, AnonymousReviewRequest $request)
    {
        $ipHash = hash('sha256', $request->ip() . config('app.key'));

        // 同一IP・同一市の重複チェック
        if (Review::where('ip_hash', $ipHash)->where('city_id', $city_id)->exists()) {
            throw ApiException::conflict('この市にはすでにレビューを投稿済みです');
        }

        return DB::transaction(function () use ($prefecture_id, $city_id, $request, $ipHash) {
            $review = Review::create([
                'user_id' => null,
                'prefecture_id' => $prefecture_id,
                'city_id' => $city_id,
                'town_name' => $request->townName,
                'good_comment' => $request->goodComment,
                'bad_comment' => $request->badComment,
                'is_anonymous' => true,
                'ip_hash' => $ipHash,
            ]);

            $this->createRating($review->id, $request);

            if ($request->hasFile('photos')) {
                $this->storePhotos($request->file('photos'), $review->id);
            }

            return response()->json([
                'success' => true,
                'data' => ['message' => 'レビューを投稿しました']
            ], Response::HTTP_CREATED);
        });
    }

    private function createRating(int $reviewId, ReviewRequest|AnonymousReviewRequest $request): void
    {
        Rating::create([
            'review_id' => $reviewId,
            'livability' => $request->livability,
            'city_policies' => $request->cityPolicies,
            'child_rearing' => $request->childRearing,
            'safety' => $request->safety,
            'public_transportation' => $request->publicTransportation,
            'average_rating' => $request->averageRating,
        ]);
    }

    public function getReview(int $id)
    {
        $review = Review::with(['user', 'city', 'rating', 'photos', 'prefecture', 'likes'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => ['review' => $review]
        ]);
    }

    public function updateReview(int $id, ReviewRequest $request)
    {
        $review = Review::findOrFail($id);

        return DB::transaction(function () use ($review, $request) {
            $review->update([
                'town_name' => $request->townName,
                'good_comment' => $request->goodComment,
                'bad_comment' => $request->badComment,
            ]);

            $review->rating->update([
                'livability' => $request->livability,
                'city_policies' => $request->cityPolicies,
                'safety' => $request->safety,
                'public_transportation' => $request->publicTransportation,
                'child_rearing' => $request->childRearing,
                'average_rating' => $request->averageRating,
            ]);

            if ($request->has('deletePhotos')) {
                $this->deletePhotos($request->deletePhotos);
            }

            if ($request->hasFile('photos')) {
                $this->storePhotos($request->file('photos'), $review->id);
            }

            return response()->json([
                'success' => true,
                'data' => ['message' => 'レビューを更新しました']
            ]);
        });
    }

    public function deleteReview(int $id)
    {
        $review = Review::with('photos')->findOrFail($id);

        return DB::transaction(function () use ($review) {
            foreach ($review->photos as $photo) {
                $this->fileService->deleteByUrl($photo->photo_url);
                $photo->delete();
            }

            $review->delete();

            return response()->json([
                'success' => true,
                'data' => ['message' => 'レビューを削除しました']
            ]);
        });
    }

    private function storePhotos($photos,$reviewId)
    {
        $photoData = [];
        foreach ($photos as $photo) {
            // 空または無効なファイルをスキップ
            if (!$photo instanceof \Illuminate\Http\UploadedFile || !$photo->isValid()) {
                continue;
            }
            $extension = $photo->getClientOriginalExtension();
            // 英数字＋タイムスタンプのファイル名生成
            $fileName = time() . '_' . bin2hex(random_bytes(8)) . '.' . $extension;
            $directory = 'reviewImage';
            $path = $this->fileService->upload($photo, $directory,$fileName);
            $url  = $this->fileService->getUrl($path);
            $photoData[] = [
                "review_id" => $reviewId,
                "photo_url" => $url
            ];
        }
        Photo::insert($photoData);
    }

    private function deletePhotos($deletePhotos)
    {
        $photosToDelete = Photo::whereIn('photo_url', $deletePhotos)->get();
        foreach ($photosToDelete as $photo) {
            $this->fileService->deleteByUrl($photo->photo_url);
            $photo->delete();
        }
    }

    public function like(int $reviewId)
    {
        $user = Auth::user();

        return DB::transaction(function () use ($reviewId, $user) {
            Like::create([
                'user_id' => $user->id,
                'review_id' => $reviewId,
            ]);

            // 投稿者を取得（匿名投稿の場合はnull）
            $postedBy = User::whereHas('reviews', fn($query) =>
                $query->where('id', $reviewId)
            )->first();

            // 匿名投稿でない場合のみ通知を送信
            if ($postedBy) {
                $postedBy->notify(new InformationNotification([
                    'title' => 'あなたの投稿にいいねされました！',
                    'content' => "{$user->name} さんがあなたの投稿にいいねしました。",
                    'url' => config('app.frontend_url') . '/home',
                    'liked_by_user' => $user,
                    'type' => \App\Consts\NotificationType::LIKE,
                    'date' => now()->toDateString(),
                ]));
            }

            return response()->json([
                'success' => true,
                'data' => ['message' => 'いいねしました']
            ], Response::HTTP_CREATED);
        });
    }

    public function unlike(int $reviewId)
    {
        $like = Like::where('review_id', $reviewId)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        $like->delete();

        return response()->json([
            'success' => true,
            'data' => ['message' => 'いいねを取り消しました']
        ]);
    }
}
