<?php

namespace App\Http\Controllers\api;

use App\Exceptions\ApiException;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class SupabaseAuthController extends Controller
{
    /**
     * Google OAuth URLを生成してリダイレクト
     */
    public function redirectToGoogle(Request $request)
    {
        $supabaseUrl = config('services.supabase.url');
        $redirectUrl = $request->input('redirect_url', config('app.frontend_url') . '/auth/callback');

        $authUrl = "{$supabaseUrl}/auth/v1/authorize?" . http_build_query([
            'provider' => 'google',
            'redirect_to' => $redirectUrl,
        ]);

        return response()->json([
            'success' => true,
            'data' => ['url' => $authUrl]
        ]);
    }

    /**
     * Supabase OAuth認証後のコールバック処理
     * フロントエンドからSupabaseのアクセストークンを受け取り、
     * ユーザー情報を取得してLaravel Sanctumトークンを発行
     */
    public function handleCallback(Request $request)
    {
        $request->validate([
            'access_token' => 'required|string',
        ]);

        // Supabaseからユーザー情報を取得
        $supabaseUrl = config('services.supabase.url');
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $request->access_token,
            'apikey' => config('services.supabase.key'),
        ])->get("{$supabaseUrl}/auth/v1/user");

        if (!$response->successful()) {
            throw ApiException::unauthorized('認証に失敗しました');
        }

        $supabaseUser = $response->json();

        // ユーザー情報を取得
        $email = $supabaseUser['email'] ?? null;
        $supabaseId = $supabaseUser['id'] ?? null;
        $name = $supabaseUser['user_metadata']['full_name']
            ?? $supabaseUser['user_metadata']['name']
            ?? explode('@', $email)[0];
        $avatarUrl = $supabaseUser['user_metadata']['avatar_url']
            ?? $supabaseUser['user_metadata']['picture']
            ?? null;
        $provider = $supabaseUser['app_metadata']['provider'] ?? 'google';

        if (!$email || !$supabaseId) {
            throw ApiException::badRequest('ユーザー情報の取得に失敗しました');
        }

        return DB::transaction(function () use ($supabaseId, $email, $name, $avatarUrl, $provider) {
            // 既存ユーザーを検索（supabase_idまたはemail）
            $user = User::where('supabase_id', $supabaseId)
                ->orWhere('email', $email)
                ->first();

            if ($user) {
                // 既存ユーザーの場合、supabase_idとプロバイダーを更新
                $user->update([
                    'supabase_id' => $supabaseId,
                    'oauth_provider' => $provider,
                ]);
            } else {
                // 新規ユーザーの場合
                $user = User::create([
                    'name' => $name,
                    'email' => $email,
                    'supabase_id' => $supabaseId,
                    'oauth_provider' => $provider,
                    'image_path' => $avatarUrl,
                    'password' => bcrypt(Str::random(32)),
                ]);

                // ユーザー設定を作成
                UserSetting::create([
                    'user_id' => $user->id
                ]);
            }

            // 既存トークンを削除して新しいトークンを発行
            $user->tokens()->delete();
            $token = $user->createToken("login:user{$user->id}")->plainTextToken;

            return response()->json([
                'success' => true,
                'data' => [
                    'message' => 'ログインしました',
                    'token' => $token,
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'image_path' => $user->image_path,
                    ]
                ]
            ]);
        });
    }
}
