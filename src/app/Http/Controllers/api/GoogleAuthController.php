<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{
    /**
     * Google認証ページへリダイレクト
     */
    public function redirectToGoogle(Request $request)
    {
        return Socialite::driver('google')
            ->stateless()
            ->redirect();
    }

    /**
     * Googleからのコールバック処理
     */
    public function handleGoogleCallback(Request $request)
    {
        $frontendCallback = config('app.frontend_url') . '/auth/callback';

        try {
            // Googleからユーザー情報を取得
            $googleUser = Socialite::driver('google')->stateless()->user();

            DB::beginTransaction();

            // 既存ユーザーを検索（google_idまたはemail）
            $user = User::where('google_id', $googleUser->getId())
                ->orWhere('email', $googleUser->getEmail())
                ->first();

            $isNew = false;

            if ($user) {
                // 既存ユーザーの場合、google_idを更新
                $user->update([
                    'google_id' => $googleUser->getId(),
                    'oauth_provider' => 'google'
                ]);
            } else {
                // 新規ユーザーを作成
                $isNew = true;
                $user = User::create([
                    'name' => $googleUser->getName(),
                    'email' => $googleUser->getEmail(),
                    'google_id' => $googleUser->getId(),
                    'oauth_provider' => 'google',
                    'password' => bcrypt(Str::random(32)),
                ]);

                // ユーザー設定を作成
                UserSetting::create([
                    'user_id' => $user->id
                ]);
            }

            // Sanctumトークンを発行
            $user->tokens()->delete();
            $token = $user->createToken("login:user{$user->id}")->plainTextToken;

            DB::commit();

            // フロントエンドにリダイレクト（トークン・新規フラグをクエリパラメータで渡す）
            $query = http_build_query([
                'token' => $token,
                'is_new' => $isNew ? '1' : '0',
            ]);

            return redirect()->to($frontendCallback . '?' . $query);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Google auth error', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);

            return redirect()->to($frontendCallback . '?error=' . urlencode('認証に失敗しました'));
        }
    }

    /**
     * APIからGoogle認証URLを取得（SPAフロントエンド用）
     */
    public function getGoogleAuthUrl(Request $request)
    {
        $redirectUrl = Socialite::driver('google')
            ->stateless()
            ->redirect()
            ->getTargetUrl();

        return response()->json([
            'success' => true,
            'data' => ['url' => $redirectUrl]
        ]);
    }
}
