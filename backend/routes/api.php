<?php

use App\Http\Controllers\Api\V1\CartController;
use App\Http\Controllers\Api\V1\CheckoutController;
use App\Http\Controllers\Api\V1\EventController;
use App\Http\Controllers\Api\V1\TapWebhookController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::get('/events', [EventController::class, 'index']);
    Route::get('/events/{slug}', [EventController::class, 'show']);

    Route::post('/carts', [CartController::class, 'store']);

    Route::middleware('cart')->group(function () {
        Route::get('/cart', [CartController::class, 'show']);
        Route::post('/cart/items', [CartController::class, 'addItem']);
        Route::patch('/cart/items/{itemId}', [CartController::class, 'updateItem']);
        Route::delete('/cart/items/{itemId}', [CartController::class, 'removeItem']);
        Route::delete('/cart', [CartController::class, 'clear']);
        Route::post('/checkout', [CheckoutController::class, 'store']);
    });

    Route::get('/orders/{uuid}', [CheckoutController::class, 'show']);
    Route::post('/orders/{uuid}/sync-tap', [CheckoutController::class, 'syncFromTap'])
        ->middleware('throttle:60,1');

    if (config('services.tap.mock')) {
        Route::post('/orders/{uuid}/mock-complete', [CheckoutController::class, 'mockComplete']);
    }

    Route::post('/webhooks/tap', [TapWebhookController::class, 'handle'])
        ->middleware('throttle:120,1')
        ->name('tap.webhook');
});
