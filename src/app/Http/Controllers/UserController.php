<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    public function getUser()
    {
        return response()->json([
            'success' => true,
            'data' => ['user' => Auth::user()]
        ]);
    }
}
