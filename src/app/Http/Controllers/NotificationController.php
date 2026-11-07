<?php

namespace App\Http\Controllers;

use App\Consts\NotificationType;
use App\Exceptions\ApiException;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class NotificationController extends Controller
{
    private function user(): User
    {
        return Auth::user();
    }

    public function getNotifications()
    {
        $this->user()->notifications->markAsRead();
        $paginated = $this->user()->notifications()->paginate(15);

        $items = collect($paginated->items())->map(fn($notification) => [
            'id' => $notification->id,
            'title' => $notification->data['title'] ?? '通知',
            'content' => $notification->data['content'] ?? '',
            'liked_by_user' => $notification->data['liked_by_user'] ?? null,
            'time' => $notification->created_at->diffForHumans(),
            'type' => $notification->data['type'] ?? NotificationType::POST,
            'read_at' => $notification->read_at,
        ]);

        return response()->json([
            'success' => true,
            'data' => [
                'notifications' => $items,
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'per_page' => $paginated->perPage(),
                'total' => $paginated->total(),
            ]
        ]);
    }

    public function detail(string $id)
    {
        $notification = $this->user()->notifications()->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => [
                'notification' => [
                    'id' => $notification->id,
                    'title' => $notification->data['title'] ?? '通知',
                    'content' => $notification->data['content'] ?? '',
                    'userImage' => $notification->data['userImage'] ?? null,
                    'liked_by_user' => $notification->data['liked_by_user'] ?? null,
                    'time' => $notification->created_at->diffForHumans(),
                    'type' => $notification->data['type'] ?? NotificationType::POST,
                    'read_at' => $notification->read_at,
                ]
            ]
        ]);
    }

    public function unreadCount()
    {
        return response()->json([
            'success' => true,
            'data' => ['unread_count' => $this->user()->unreadNotifications->count()]
        ]);
    }

    public function allDeleteNotification()
    {
        return DB::transaction(function () {
            $this->user()->notifications()->delete();

            return response()->json([
                'success' => true,
                'data' => ['message' => '全ての通知を削除しました']
            ]);
        });
    }

    public function deleteNotification(string $id)
    {
        return DB::transaction(function () use ($id) {
            $notification = $this->user()->notifications()->findOrFail($id);
            $notification->delete();

            return response()->json([
                'success' => true,
                'data' => ['message' => '通知を削除しました']
            ]);
        });
    }
}
