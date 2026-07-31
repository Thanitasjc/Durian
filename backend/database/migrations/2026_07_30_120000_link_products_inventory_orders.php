<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->foreignId('inventory_item_id')
                ->nullable()
                ->after('stock_qty')
                ->constrained('inventory_items')
                ->nullOnDelete();
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->foreignId('product_id')
                ->nullable()
                ->after('customer_name')
                ->constrained('products')
                ->nullOnDelete();
            $table->foreignId('inventory_item_id')
                ->nullable()
                ->after('product_id')
                ->constrained('inventory_items')
                ->nullOnDelete();
            $table->boolean('stock_deducted')->default(false)->after('notes');
            $table->decimal('stock_qty_deducted', 12, 2)->nullable()->after('stock_deducted');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropConstrainedForeignId('product_id');
            $table->dropConstrainedForeignId('inventory_item_id');
            $table->dropColumn(['stock_deducted', 'stock_qty_deducted']);
        });

        Schema::table('products', function (Blueprint $table) {
            $table->dropConstrainedForeignId('inventory_item_id');
        });
    }
};
