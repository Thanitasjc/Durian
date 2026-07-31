<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('farms', function (Blueprint $table) {
            $table->string('map_provider', 20)->default('image')->after('map_image_url'); // image|google
            $table->decimal('map_lat', 10, 7)->nullable()->after('map_provider');
            $table->decimal('map_lng', 10, 7)->nullable()->after('map_lat');
            $table->unsignedTinyInteger('map_zoom')->default(16)->after('map_lng');
        });
    }

    public function down(): void
    {
        Schema::table('farms', function (Blueprint $table) {
            $table->dropColumn(['map_provider', 'map_lat', 'map_lng', 'map_zoom']);
        });
    }
};
