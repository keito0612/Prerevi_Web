<?php

namespace App\Http\Controllers;

use App\Exceptions\ApiException;
use App\Models\City;
use App\Models\Prefecture;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class CityController extends Controller
{
    public function getCitys(int $prefecture_id)
    {
        $prefecture = Prefecture::findOrFail($prefecture_id);

        return response()->json([
            'success' => true,
            'data' => [
                'prefecture' => $prefecture->name,
                'citys' => $prefecture->citys
            ]
        ]);
    }

    public function getTowns(int $city_id)
    {
        $city = City::findOrFail($city_id);

        $cacheKey = "towns_{$city_id}";
        $cacheDay = 60 * 60 * 24;

        $towns = Cache::remember($cacheKey, $cacheDay, function () use ($city) {
            try {
                $response = Http::get('https://geoapi.heartrails.com/api/json', [
                    'method' => 'getTowns',
                    'city' => $city->name
                ]);

                if ($response->successful()) {
                    $data = $response->json();
                    $locations = $data['response']['location'] ?? [];

                    return array_values(array_filter($locations, fn($location) =>
                        !str_contains($location['town'], 'その他')
                    ));
                }

                return [];
            } catch (\Exception $e) {
                Log::error('Failed to fetch towns from HeartRails API', [
                    'city' => $city->name,
                    'error' => $e->getMessage()
                ]);
                return [];
            }
        });

        return response()->json([
            'success' => true,
            'data' => [
                'city' => $city->name,
                'towns' => $towns
            ]
        ]);
    }
}
