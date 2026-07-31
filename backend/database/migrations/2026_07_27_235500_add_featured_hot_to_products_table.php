<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->boolean('is_featured')->default(false)->after('is_published');
            $table->boolean('is_hot')->default(false)->after('is_featured');
        });

        // Keep homepage populated for existing published products
        DB::table('products')
            ->where('is_published', true)
            ->update([
                'is_featured' => true,
                'is_hot' => true,
            ]);
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['is_featured', 'is_hot']);
        });
    }
};
