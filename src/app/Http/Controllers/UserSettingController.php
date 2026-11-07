<?php

namespace App\Http\Controllers;

use App\Models\UserSetting;
use Illuminate\Support\Facades\Auth;

class UserSettingController extends Controller
{
    public function index()
    {
        $userSetting = UserSetting::where('user_id', Auth::id())->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => ['user_setting' => $userSetting]
        ]);
    }

    public function emailNotification()
    {
        $userSetting = UserSetting::where('user_id', Auth::id())->firstOrFail();

        $userSetting->update([
            'email_notification' => !$userSetting->email_notification
        ]);

        return response()->json([
            'success' => true,
            'data' => ['message' => 'メール通知を更新しました']
        ]);
    }
}
