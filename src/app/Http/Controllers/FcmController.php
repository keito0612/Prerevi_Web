<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FcmController extends Controller
{
    public function updateToken(Request $request)
    {
        $request->validate([
            'fcm_token' => 'required|string',
        ]);

        $user = Auth::user();
        $user->fcm_token = $request->fcm_token;
        $user->save();

        return response()->json([
            'success' => true,
            'data' => ['message' => 'FCMトークンを更新しました']
        ]);
    }

    public function deleteToken()
    {
        $user = Auth::user();
        $user->fcm_token = null;
        $user->save();

        return response()->json([
            'success' => true,
            'data' => ['message' => 'FCMトークンを削除しました']
        ]);
    }
}
