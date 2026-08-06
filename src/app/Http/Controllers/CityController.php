<?php

namespace App\Http\Controllers;

use App\Http\Requests\CityRequest;
use App\Models\City;
use App\Models\Prefecture;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class CityController extends Controller
{
    function getCitys($prefecture_id)
    {
        $prefecture = Prefecture::where('id', $prefecture_id)->first();
        if (!$prefecture) {
            return response()->json(['error' => 'Prefecture not found'], 404);
        }

        return response()->json([
            'prefecture' => $prefecture->name,
            'citys' => $prefecture->citys
        ], 200);
    }

    function getTowns($city_id)
    {
        $city = City::find($city_id);
        if (!$city) {
            return response()->json(['error' => 'City not found'], 404);
        }

        // キャッシュキー（市区町村IDごとに1日キャッシュ）
        $cacheKey = "towns_{$city_id}";

        $towns = Cache::remember($cacheKey, 60 * 60 * 24, function () use ($city) {
            try {
                $response = Http::get('https://geoapi.heartrails.com/api/json', [
                    'method' => 'getTowns',
                    'city' => $city->name
                ]);

                if ($response->successful()) {
                    $data = $response->json();
                    $locations = $data['response']['location'] ?? [];

                    // 「その他」を含む町名を除外
                    return array_values(array_filter($locations, fn($location) =>
                        !str_contains($location['town'], 'その他')
                    ));
                }

                return [];
            } catch (Exception $e) {
                Log::error('Failed to fetch towns from HeartRails API: ' . $e->getMessage());
                return [];
            }
        });

        return response()->json([
            'city' => $city->name,
            'towns' => $towns
        ], 200);
    }
}
