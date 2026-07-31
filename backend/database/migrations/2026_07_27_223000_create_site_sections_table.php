<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('site_sections', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique(); // hero, story, sustainability, products, tours, cta
            $table->string('title')->nullable();
            $table->string('eyebrow')->nullable();
            $table->text('subtitle')->nullable();
            $table->text('body')->nullable();
            $table->string('image_url')->nullable();
            $table->string('cta_label')->nullable();
            $table->string('cta_link')->nullable();
            $table->string('cta_label_2')->nullable();
            $table->string('cta_link_2')->nullable();
            $table->json('meta')->nullable(); // stats, cards, etc.
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('site_sections');
    }
};
