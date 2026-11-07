<?php

namespace App\Http\Controllers\api;

use App\Exceptions\ApiException;
use App\Http\Controllers\Controller;
use App\Http\Requests\RegisterRequest;
use App\Mail\ResetPasswordMail;
use App\Mail\WelcomeMail;
use App\Models\User;
use App\Models\UserSetting;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class AuthController extends Controller
{
    public function register(RegisterRequest $request)
    {
        return DB::transaction(function () use ($request) {
            $user = User::create([
                'name' => $request->input('name'),
                'email' => $request->input('email'),
                'password' => Hash::make($request->input('password')),
            ]);

            UserSetting::create(['user_id' => $user->id]);

            $token = $user->createToken("login:user{$user->id}")->plainTextToken;
            Mail::to($user->email)->send(new WelcomeMail($user));

            return response()->json([
                'success' => true,
                'data' => [
                    'message' => 'ユーザー登録が完了しました',
                    'token' => $token,
                ]
            ], Response::HTTP_CREATED);
        });
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required']
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            throw ApiException::notFound('アカウントが存在していません');
        }

        if (!Hash::check($request->password, $user->password)) {
            throw ApiException::unauthorized('無効なメールアドレスまたはパスワードです');
        }

        $user->tokens()->delete();
        $token = $user->createToken("login:user{$user->id}")->plainTextToken;

        return response()->json([
            'success' => true,
            'data' => ['token' => $token]
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json([
            'success' => true,
            'data' => ['message' => 'ログアウトしました']
        ]);
    }

    public function sendPasswordResetEmail(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
        ], [
            'email.required' => 'メールアドレスは必須です。',
            'email.email' => '有効なメールアドレスを入力してください。',
            'email.exists' => 'このメールアドレスは登録されていません。',
        ]);

        $user = User::where('email', $request->email)->firstOrFail();
        $token = Str::random(60);

        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $user->email],
            [
                'token' => Hash::make($token),
                'created_at' => now(),
            ]
        );

        $resetUrl = config('app.frontend_url') . "/reset-password?token=$token&email={$user->email}";
        Mail::to($user->email)->send(new ResetPasswordMail($resetUrl));

        return response()->json([
            'success' => true,
            'data' => ['message' => 'パスワードリセットメールを送信しました']
        ]);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'token' => 'required',
            'password' => 'required|string|min:8|confirmed',
        ], [
            'email.required' => 'メールアドレスは必須です。',
            'email.email' => '有効なメールアドレスを入力してください。',
            'email.exists' => 'このメールアドレスは登録されていません。',
            'token.required' => 'トークンが見つかりません。',
            'password.required' => '新しいパスワードを入力してください。',
            'password.min' => 'パスワードは8文字以上で入力してください。',
            'password.confirmed' => 'パスワード確認が一致しません。',
        ]);

        $resetData = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (!$resetData) {
            throw ApiException::unauthorized('無効なトークンです');
        }

        if (now()->diffInMinutes($resetData->created_at) > 60) {
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();
            throw ApiException::unauthorized('トークンの有効期限が切れています');
        }

        if (!Hash::check($request->token, $resetData->token)) {
            throw ApiException::unauthorized('無効なトークンです');
        }

        $user = User::where('email', $request->email)->firstOrFail();
        $user->password = Hash::make($request->password);
        $user->save();

        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        return response()->json([
            'success' => true,
            'data' => ['message' => 'パスワードが更新されました']
        ]);
    }
}
