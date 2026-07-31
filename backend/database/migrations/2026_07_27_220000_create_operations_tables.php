<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('farms', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->string('location')->nullable();
            $table->decimal('area_rai', 10, 2)->nullable();
            $table->text('notes')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('plots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('farm_id')->constrained()->cascadeOnDelete();
            $table->string('code');
            $table->string('name');
            $table->string('variety')->nullable();
            $table->unsignedInteger('tree_count')->default(0);
            $table->decimal('avg_tree_age', 5, 1)->nullable();
            $table->date('flowering_date')->nullable();
            $table->string('fruit_status')->nullable();
            $table->date('expected_harvest_date')->nullable();
            $table->unsignedTinyInteger('development_percent')->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->unique(['farm_id', 'code']);
        });

        Schema::create('trees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('plot_id')->constrained()->cascadeOnDelete();
            $table->string('code');
            $table->string('variety')->nullable();
            $table->decimal('age_years', 5, 1)->nullable();
            $table->string('health_status')->default('healthy');
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->unique(['plot_id', 'code']);
        });

        Schema::create('farm_activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('farm_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('plot_id')->nullable()->constrained()->nullOnDelete();
            $table->date('activity_date');
            $table->string('activity_type'); // fertilizer, watering, pest, prune, other
            $table->string('title');
            $table->text('detail')->nullable();
            $table->string('quantity')->nullable();
            $table->string('recorded_by')->nullable();
            $table->timestamps();
        });

        Schema::create('lots', function (Blueprint $table) {
            $table->id();
            $table->string('lot_number')->unique();
            $table->foreignId('farm_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('plot_id')->nullable()->constrained()->nullOnDelete();
            $table->string('variety')->nullable();
            $table->date('harvest_date')->nullable();
            $table->unsignedInteger('quantity')->nullable();
            $table->decimal('total_weight', 12, 2)->default(0);
            $table->string('status')->default('created');
            $table->timestamps();
        });

        Schema::create('harvests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('farm_id')->constrained()->cascadeOnDelete();
            $table->foreignId('plot_id')->constrained()->cascadeOnDelete();
            $table->foreignId('lot_id')->nullable()->constrained()->nullOnDelete();
            $table->date('harvest_date');
            $table->string('variety')->nullable();
            $table->unsignedInteger('quantity')->default(0);
            $table->decimal('total_weight', 12, 2)->default(0);
            $table->string('harvest_team')->nullable();
            $table->string('status')->default('รอเข้าคลังรับ');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('receivings', function (Blueprint $table) {
            $table->id();
            $table->string('receiving_number')->unique();
            $table->foreignId('lot_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('farm_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('plot_id')->nullable()->constrained()->nullOnDelete();
            $table->date('harvest_date')->nullable();
            $table->dateTime('received_at')->nullable();
            $table->unsignedInteger('quantity')->nullable();
            $table->decimal('total_weight', 12, 2)->default(0);
            $table->string('receiver')->nullable();
            $table->string('status')->default('รอตรวจรับ');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('quality_inspections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lot_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('receiving_id')->nullable()->constrained()->nullOnDelete();
            $table->dateTime('inspected_at')->nullable();
            $table->string('inspector')->nullable();
            $table->decimal('grade_a_weight', 12, 2)->default(0);
            $table->decimal('grade_b_weight', 12, 2)->default(0);
            $table->decimal('processing_weight', 12, 2)->default(0);
            $table->decimal('reject_weight', 12, 2)->default(0);
            $table->string('brix')->nullable();
            $table->text('defects')->nullable();
            $table->string('allocation_path')->nullable(); // fresh, flesh, frozen, dried
            $table->string('status')->default('รอตรวจ');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('production_batches', function (Blueprint $table) {
            $table->id();
            $table->string('batch_number')->unique();
            $table->foreignId('lot_id')->nullable()->constrained()->nullOnDelete();
            $table->string('product_type'); // fresh, flesh, frozen, dried
            $table->decimal('input_weight', 12, 2)->default(0);
            $table->decimal('output_weight', 12, 2)->default(0);
            $table->decimal('yield_percent', 8, 2)->nullable();
            $table->date('production_date')->nullable();
            $table->string('operator')->nullable();
            $table->string('current_step')->nullable();
            $table->string('status')->default('รอเริ่ม');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('inventory_items', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('category'); // raw, finished, packaging
            $table->string('product_type')->nullable();
            $table->string('lot_number')->nullable();
            $table->string('batch_number')->nullable();
            $table->decimal('quantity', 12, 2)->default(0);
            $table->string('unit')->default('kg');
            $table->string('storage_zone')->nullable(); // fresh, chilled, frozen, dry
            $table->string('location')->nullable();
            $table->date('production_date')->nullable();
            $table->date('expiry_date')->nullable();
            $table->string('rotation_method')->default('FEFO');
            $table->timestamps();
        });

        Schema::create('stock_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inventory_item_id')->constrained()->cascadeOnDelete();
            $table->string('movement_type'); // in, out, adjust, transfer
            $table->decimal('quantity', 12, 2);
            $table->string('reference')->nullable();
            $table->string('note')->nullable();
            $table->string('created_by')->nullable();
            $table->timestamps();
        });

        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('address')->nullable();
            $table->string('type')->default('retail'); // retail, wholesale, export
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->foreignId('customer_id')->nullable()->constrained()->nullOnDelete();
            $table->string('customer_name')->nullable();
            $table->string('product_name')->nullable();
            $table->string('product_type')->nullable();
            $table->decimal('quantity', 12, 2)->default(0);
            $table->string('unit')->default('kg');
            $table->unsignedInteger('total_amount')->default(0);
            $table->string('status')->default('รอชำระเงิน');
            $table->string('delivery_status')->nullable();
            $table->date('order_date')->nullable();
            $table->date('delivery_date')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('media', function (Blueprint $table) {
            $table->id();
            $table->string('disk')->default('public');
            $table->string('path');
            $table->string('filename')->nullable();
            $table->string('mime')->nullable();
            $table->unsignedBigInteger('size')->default(0);
            $table->string('collection')->default('default');
            $table->nullableMorphs('mediable');
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->string('group')->default('general');
            $table->timestamps();
        });

        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('admin')->after('email');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('role');
        });

        Schema::dropIfExists('settings');
        Schema::dropIfExists('media');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('customers');
        Schema::dropIfExists('stock_movements');
        Schema::dropIfExists('inventory_items');
        Schema::dropIfExists('production_batches');
        Schema::dropIfExists('quality_inspections');
        Schema::dropIfExists('receivings');
        Schema::dropIfExists('harvests');
        Schema::dropIfExists('lots');
        Schema::dropIfExists('farm_activities');
        Schema::dropIfExists('trees');
        Schema::dropIfExists('plots');
        Schema::dropIfExists('farms');
    }
};
