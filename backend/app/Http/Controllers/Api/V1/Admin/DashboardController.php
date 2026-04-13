<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Event;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function stats(): JsonResponse
    {
        $now = now();
        $thirtyDaysAgo = $now->copy()->subDays(30);
        $sixtyDaysAgo = $now->copy()->subDays(60);

        $totalUsers = User::count();
        $prevUsers = User::where('created_at', '<', $thirtyDaysAgo)->count();

        $activeEvents = Event::where('status', Event::STATUS_PUBLISHED)->count();
        $prevActiveEvents = Event::where('status', Event::STATUS_PUBLISHED)
            ->where('created_at', '<', $thirtyDaysAgo)->count();

        $totalOrders = Order::count();
        $prevOrders = Order::where('created_at', '<', $thirtyDaysAgo)->count();

        $revenue = (float) Order::where('status', Order::STATUS_PAID)->sum('total');
        $prevRevenue = (float) Order::where('status', Order::STATUS_PAID)
            ->where('paid_at', '<', $thirtyDaysAgo)->sum('total');

        return response()->json([
            'total_users' => $totalUsers,
            'users_change' => $this->percentChange($prevUsers, $totalUsers),
            'active_events' => $activeEvents,
            'events_change' => $this->percentChange($prevActiveEvents, $activeEvents),
            'total_orders' => $totalOrders,
            'orders_change' => $this->percentChange($prevOrders, $totalOrders),
            'revenue' => $revenue,
            'revenue_change' => $this->percentChange($prevRevenue, $revenue),
            'currency' => 'KWD',
        ]);
    }

    public function recentActivity(): JsonResponse
    {
        $logs = ActivityLog::with('user:id,name,avatar_url')
            ->latest()
            ->take(15)
            ->get()
            ->map(fn (ActivityLog $log) => [
                'id' => $log->id,
                'action' => $log->action,
                'target_type' => $log->target_type,
                'target_id' => $log->target_id,
                'metadata' => $log->metadata,
                'user' => $log->user ? [
                    'id' => $log->user->id,
                    'name' => $log->user->name,
                    'avatar_url' => $log->user->avatar_url,
                ] : null,
                'created_at' => $log->created_at->toIso8601String(),
            ]);

        return response()->json(['data' => $logs]);
    }

    public function revenueChart(Request $request): JsonResponse
    {
        $days = (int) $request->query('days', 30);
        $days = min($days, 365);

        $from = now()->subDays($days)->startOfDay();

        $rows = Order::where('status', Order::STATUS_PAID)
            ->where('paid_at', '>=', $from)
            ->select(DB::raw('DATE(paid_at) as date'), DB::raw('SUM(total) as total'), DB::raw('COUNT(*) as count'))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json([
            'labels' => $rows->pluck('date'),
            'revenue' => $rows->pluck('total')->map(fn ($v) => (float) $v),
            'orders' => $rows->pluck('count'),
        ]);
    }

    public function eventsChart(): JsonResponse
    {
        $statuses = [Event::STATUS_DRAFT, Event::STATUS_PENDING_REVIEW, Event::STATUS_PUBLISHED, Event::STATUS_ARCHIVED];

        $counts = Event::select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status');

        $data = collect($statuses)->map(fn (string $s) => [
            'status' => $s,
            'count' => (int) ($counts[$s] ?? 0),
        ]);

        return response()->json(['data' => $data]);
    }

    private function percentChange(float $previous, float $current): float
    {
        if ($previous == 0) {
            return $current > 0 ? 100.0 : 0.0;
        }

        return round((($current - $previous) / $previous) * 100, 1);
    }
}
