<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('farms', function (Blueprint $table) {
            $table->string('map_image_url', 500)->nullable()->after('notes');
        });

        Schema::table('plots', function (Blueprint $table) {
            // Position as % of map image (0–100)
            $table->decimal('map_x', 6, 2)->nullable()->after('notes');
            $table->decimal('map_y', 6, 2)->nullable()->after('map_x');
            $table->decimal('map_w', 6, 2)->nullable()->after('map_y');
            $table->decimal('map_h', 6, 2)->nullable()->after('map_w');
            $table->unsignedTinyInteger('soil_moisture')->nullable()->after('map_h');
            $table->string('alert_level', 20)->default('none')->after('soil_moisture'); // none|warning|critical
        });
    }

    public function down(): void
    {
        Schema::table('farms', function (Blueprint $table) {
            $table->dropColumn('map_image_url');
        });

        Schema::table('plots', function (Blueprint $table) {
            $table->dropColumn([
                'map_x',
                'map_y',
                'map_w',
                'map_h',
                'soil_moisture',
                'alert_level',
            ]);
        });
    }
};
