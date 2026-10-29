<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            // user_id を nullable に変更
            $table->unsignedBigInteger('user_id')->nullable()->change();

            // 匿名投稿フラグ
            $table->boolean('is_anonymous')->default(false)->after('bad_comment');

            // IPハッシュ（重複投稿防止用）
            $table->string('ip_hash', 64)->nullable()->after('is_anonymous');

            // IP + city_id の複合インデックス
            $table->index(['ip_hash', 'city_id'], 'idx_reviews_ip_city');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            $table->dropIndex('idx_reviews_ip_city');
            $table->dropColumn(['is_anonymous', 'ip_hash']);
            // user_id を NOT NULL に戻す
            $table->unsignedBigInteger('user_id')->nullable(false)->change();
        });
    }
};
