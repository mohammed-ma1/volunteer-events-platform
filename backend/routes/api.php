<?php

use App\Http\Controllers\Api\V1\Admin\AuthController as AdminAuthController;
use App\Http\Controllers\Api\V1\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Api\V1\Admin\EventController as AdminEventController;
use App\Http\Controllers\Api\V1\Admin\EnrollmentController as AdminEnrollmentController;
use App\Http\Controllers\Api\V1\Admin\ExpertController as AdminExpertController;
use App\Http\Controllers\Api\V1\Admin\LessonController as AdminLessonController;
use App\Http\Controllers\Api\V1\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Api\V1\Admin\UserController as AdminUserController;
use App\Http\Controllers\Api\V1\CartController;
use App\Http\Controllers\Api\V1\CheckoutController;
use App\Http\Controllers\Api\V1\EventController;
use App\Http\Controllers\Api\V1\LearnController;
use App\Http\Controllers\Api\V1\LearnerAuthController;
use App\Http\Controllers\Api\V1\TapWebhookController;
use Illuminate\Support\Facades\Route;

// ── Admin Portal ─────────────────────────────────────────────────
Route::prefix('v1/admin')->group(function () {

    // Auth (no admin middleware — login must be accessible pre-auth)
    Route::prefix('auth')->group(function () {
        Route::post('/login', [AdminAuthController::class, 'login']);

        Route::middleware('auth:api')->group(function () {
            Route::post('/logout', [AdminAuthController::class, 'logout']);
            Route::post('/refresh', [AdminAuthController::class, 'refresh']);
            Route::get('/me', [AdminAuthController::class, 'me']);
        });
    });

    // Protected admin routes
    Route::middleware(['auth:api', 'admin'])->group(function () {

        // Dashboard
        Route::prefix('dashboard')->group(function () {
            Route::get('/stats', [AdminDashboardController::class, 'stats']);
            Route::get('/recent-activity', [AdminDashboardController::class, 'recentActivity']);
            Route::get('/revenue-chart', [AdminDashboardController::class, 'revenueChart']);
            Route::get('/events-chart', [AdminDashboardController::class, 'eventsChart']);
        });

        // Users
        Route::get('/users', [AdminUserController::class, 'index']);
        Route::get('/users/{id}', [AdminUserController::class, 'show']);
        Route::patch('/users/{id}', [AdminUserController::class, 'update']);
        Route::patch('/users/{id}/toggle-active', [AdminUserController::class, 'toggleActive']);
        Route::patch('/users/{id}/role', [AdminUserController::class, 'changeRole']);

        // Events
        Route::get('/events', [AdminEventController::class, 'index']);
        Route::get('/events/{id}', [AdminEventController::class, 'show']);
        Route::post('/events', [AdminEventController::class, 'store']);
        Route::put('/events/{id}', [AdminEventController::class, 'update']);
        Route::delete('/events/{id}', [AdminEventController::class, 'destroy']);
        Route::patch('/events/{id}/status', [AdminEventController::class, 'changeStatus']);

        // Event Lessons
        Route::get('/events/{eventId}/lessons', [AdminLessonController::class, 'index']);
        Route::post('/events/{eventId}/lessons', [AdminLessonController::class, 'store']);
        Route::put('/events/{eventId}/lessons/{lessonId}', [AdminLessonController::class, 'update']);
        Route::delete('/events/{eventId}/lessons/{lessonId}', [AdminLessonController::class, 'destroy']);

        // Event Enrollments
        Route::get('/events/{eventId}/enrollments', [AdminEnrollmentController::class, 'index']);
        Route::post('/events/{eventId}/enrollments', [AdminEnrollmentController::class, 'store']);
        Route::delete('/events/{eventId}/enrollments/{enrollmentId}', [AdminEnrollmentController::class, 'destroy']);

        // Package Enrollment Sync (idempotent bulk enroll of paid package buyers)
        Route::post('/packages/{slug}/sync-enrollments', [AdminEnrollmentController::class, 'syncPackage']);

        // Experts — `specializations` must be registered before `{id}` to win the match.
        Route::get('/experts/specializations', [AdminExpertController::class, 'specializations']);
        Route::get('/experts', [AdminExpertController::class, 'index']);
        Route::get('/experts/{id}', [AdminExpertController::class, 'show']);
        Route::post('/experts', [AdminExpertController::class, 'store']);
        Route::patch('/experts/{id}', [AdminExpertController::class, 'update']);
        Route::patch('/experts/{id}/toggle-active', [AdminExpertController::class, 'toggleActive']);
        Route::delete('/experts/{id}', [AdminExpertController::class, 'destroy']);

        // Orders
        Route::get('/orders', [AdminOrderController::class, 'index']);
        Route::get('/orders/export', [AdminOrderController::class, 'export']);
        Route::get('/orders/{uuid}', [AdminOrderController::class, 'show']);
        Route::post('/orders/{uuid}/sync-tap', [AdminOrderController::class, 'syncTap']);
        Route::get('/orders/{uuid}/tap-details', [AdminOrderController::class, 'tapDetails']);
        Route::post('/orders/{uuid}/refund', [AdminOrderController::class, 'refund']);
    });
});

// ── Learner Auth ─────────────────────────────────────────────────
Route::prefix('v1/auth')->group(function () {
    Route::post('/login', [LearnerAuthController::class, 'login']);

    // Logout must remain reachable even when token_version is stale (single-session
    // invalidation), otherwise the frontend ends up in an infinite refresh/logout loop.
    Route::middleware('auth:api')->group(function () {
        Route::post('/logout', [LearnerAuthController::class, 'logout']);
    });

    Route::middleware(['auth:api', 'token.version'])->group(function () {
        Route::post('/refresh', [LearnerAuthController::class, 'refresh']);
        Route::get('/me', [LearnerAuthController::class, 'me']);
        Route::patch('/me', [LearnerAuthController::class, 'updateProfile']);
        Route::put('/password', [LearnerAuthController::class, 'changePassword']);
    });
});

// ── Learner Platform ─────────────────────────────────────────────
Route::prefix('v1/learn')->middleware(['auth:api', 'token.version'])->group(function () {
    Route::get('/my-workshops', [LearnController::class, 'myWorkshops']);
    Route::get('/workshops/{id}', [LearnController::class, 'workshopDetail']);
    Route::post('/progress', [LearnController::class, 'updateProgress']);
});

// ── Public API ───────────────────────────────────────────────────
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
    Route::get('/orders/{uuid}/invoice', [CheckoutController::class, 'invoice'])
        ->middleware('throttle:30,1');
    Route::post('/orders/{uuid}/sync-tap', [CheckoutController::class, 'syncFromTap'])
        ->middleware('throttle:60,1');

    // Always register so `route:cache` does not drop the dev-only route.
    // mockComplete: 403 if TAP_MOCK is false, 404 if order uuid is missing in DB.
    Route::post('/orders/{uuid}/mock-complete', [CheckoutController::class, 'mockComplete']);

    Route::post('/webhooks/tap', [TapWebhookController::class, 'handle'])
        ->middleware('throttle:120,1')
        ->name('tap.webhook');
});
