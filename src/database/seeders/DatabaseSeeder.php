<?php

namespace Database\Seeders;

use App\Models\City;
use App\Models\Rating;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        if(!(app()->isProduction())){
            $seeders = [
                PrefecturesSeeder::class,
                CitySeeder::class,
                UserSeeder::class,
                ReviewSeeder::class,
                RatingSeeder::class
            ];
        }else{
            $seeders = [
                PrefecturesSeeder::class,
                CitySeeder::class,
            ];
        }

        $this->call($seeders);
        Schema::enableForeignKeyConstraints();
    }
}
