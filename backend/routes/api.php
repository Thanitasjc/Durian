<?php

use App\Http\Controllers\Api\Admin\AuthController;
use App\Http\Controllers\Api\Admin\ContactInquiryController;
use App\Http\Controllers\Api\Admin\CustomerController;
use App\Http\Controllers\Api\Admin\DashboardController;
use App\Http\Controllers\Api\Admin\FarmActivityController;
use App\Http\Controllers\Api\Admin\FarmController;
use App\Http\Controllers\Api\Admin\HarvestController;
use App\Http\Controllers\Api\Admin\HeroSlideController;
use App\Http\Controllers\Api\Admin\InventoryItemController;
use App\Http\Controllers\Api\Admin\LotController;
use App\Http\Controllers\Api\Admin\MediaController;
use App\Http\Controllers\Api\Admin\NavItemController;
use App\Http\Controllers\Api\Admin\OrderController;
use App\Http\Controllers\Api\Admin\PlotController;
use App\Http\Controllers\Api\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Api\Admin\ProductionBatchController;
use App\Http\Controllers\Api\Admin\QualityInspectionController;
use App\Http\Controllers\Api\Admin\ReceivingController;
use App\Http\Controllers\Api\Admin\SettingController;
use App\Http\Controllers\Api\Admin\TraceController as AdminTraceController;
use App\Http\Controllers\Api\Admin\TreeController;
use App\Http\Controllers\Api\Admin\SiteSectionController;
use App\Http\Controllers\Api\Public\BrandingController;
use App\Http\Controllers\Api\Public\CheckoutController;
use App\Http\Controllers\Api\Public\ContactController;
use App\Http\Controllers\Api\Public\HeaderController;
use App\Http\Controllers\Api\Public\HomeController;
use App\Http\Controllers\Api\Public\ProductController;
use App\Http\Controllers\Api\Public\TraceController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1/public')->group(function () {
    Route::get('/health', fn () => response()->json([
        'status' => 'ok',
        'app' => config('app.name'),
        'time' => now()->toIso8601String(),
    ]));

    Route::get('/home', HomeController::class);
    Route::get('/branding', BrandingController::class);
    Route::get('/header', HeaderController::class);
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/{product:slug}', [ProductController::class, 'show']);
    Route::post('/checkout', [CheckoutController::class, 'store']);
    Route::get('/trace', [TraceController::class, 'search']);
    Route::post('/contact', [ContactController::class, 'store']);
});

Route::prefix('v1/admin')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/dashboard', DashboardController::class);

        Route::apiResource('farms', FarmController::class);
        Route::apiResource('plots', PlotController::class);
        Route::apiResource('trees', TreeController::class);
        Route::apiResource('farm-activities', FarmActivityController::class);
        Route::apiResource('harvests', HarvestController::class);
        Route::get('lots', [LotController::class, 'index']);
        Route::get('lots/{lot}', [LotController::class, 'show']);
        Route::put('lots/{lot}', [LotController::class, 'update']);
        Route::apiResource('receivings', ReceivingController::class);
        Route::apiResource('quality-inspections', QualityInspectionController::class);
        Route::apiResource('production-batches', ProductionBatchController::class);
        Route::apiResource('inventory-items', InventoryItemController::class);
        Route::post('inventory-items/{inventory_item}/move', [InventoryItemController::class, 'move']);
        Route::apiResource('customers', CustomerController::class);
        Route::apiResource('orders', OrderController::class);
        Route::apiResource('products', AdminProductController::class);
        Route::get('contact-inquiries', [ContactInquiryController::class, 'index']);
        Route::get('contact-inquiries/{contact_inquiry}', [ContactInquiryController::class, 'show']);
        Route::delete('contact-inquiries/{contact_inquiry}', [ContactInquiryController::class, 'destroy']);
        Route::get('settings', [SettingController::class, 'index']);
        Route::put('settings', [SettingController::class, 'upsert']);
        Route::apiResource('site-sections', SiteSectionController::class);
        Route::apiResource('hero-slides', HeroSlideController::class);
        Route::apiResource('nav-items', NavItemController::class);
        Route::get('trace', [AdminTraceController::class, 'search']);
        Route::post('media', [MediaController::class, 'store']);
        Route::delete('media/{medium}', [MediaController::class, 'destroy']);
    });
});
