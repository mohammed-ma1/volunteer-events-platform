<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Coupon;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class CouponController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Coupon::query();

        if ($q = $request->query('q')) {
            $query->where('code', 'like', '%'.strtoupper($q).'%');
        }

        if ($request->has('is_active')) {
            $query->where('is_active', filter_var($request->query('is_active'), FILTER_VALIDATE_BOOLEAN));
        }

        $perPage = min((int) $request->query('per_page', 15), 100);

        return response()->json($query->latest()->paginate($perPage));
    }

    public function show(int $id): JsonResponse
    {
        return response()->json(['data' => Coupon::findOrFail($id)]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:64', Rule::unique('coupons')],
            'discount_percent' => ['sometimes', 'numeric', 'min:0', 'max:100'],
            'is_active' => ['sometimes', 'boolean'],
            'expires_at' => ['sometimes', 'nullable', 'date'],
            'description' => ['sometimes', 'nullable', 'string', 'max:255'],
        ]);
        $validated['discount_percent'] = $validated['discount_percent'] ?? 5;

        $coupon = Coupon::create($validated);

        ActivityLog::record(Auth::guard('api')->id(), 'coupon.created', 'Coupon', $coupon->id, ['code' => $coupon->code]);

        return response()->json(['data' => $coupon], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $coupon = Coupon::findOrFail($id);

        $validated = $request->validate([
            'code' => ['sometimes', 'string', 'max:64', Rule::unique('coupons')->ignore($coupon->id)],
            'discount_percent' => ['sometimes', 'numeric', 'min:0', 'max:100'],
            'is_active' => ['sometimes', 'boolean'],
            'expires_at' => ['sometimes', 'nullable', 'date'],
            'description' => ['sometimes', 'nullable', 'string', 'max:255'],
        ]);

        $coupon->update($validated);

        ActivityLog::record(Auth::guard('api')->id(), 'coupon.updated', 'Coupon', $coupon->id, ['changes' => array_keys($validated)]);

        return response()->json(['data' => $coupon->fresh()]);
    }

    public function destroy(int $id): JsonResponse
    {
        $coupon = Coupon::findOrFail($id);

        ActivityLog::record(Auth::guard('api')->id(), 'coupon.deleted', 'Coupon', $coupon->id, ['code' => $coupon->code]);

        $coupon->delete();

        return response()->json(null, 204);
    }

    /**
     * Sales attributed to each coupon code: number of PAID orders, total
     * discount given, and total revenue. Includes coupons with zero sales and
     * any codes used by paid orders whose coupon was later deleted.
     */
    public function salesReport(): JsonResponse
    {
        $stats = Order::query()
            ->where('status', Order::STATUS_PAID)
            ->whereNotNull('coupon_code')
            ->selectRaw('UPPER(coupon_code) as code, COUNT(*) as orders_count, SUM(discount_amount) as total_discount, SUM(total) as total_revenue')
            ->groupByRaw('UPPER(coupon_code)')
            ->get()
            ->keyBy('code');

        $rows = [];
        foreach (Coupon::query()->orderBy('code')->get() as $coupon) {
            $s = $stats->get($coupon->code);
            $rows[$coupon->code] = [
                'code' => $coupon->code,
                'discount_percent' => (float) $coupon->discount_percent,
                'is_active' => (bool) $coupon->is_active,
                'orders_count' => (int) ($s->orders_count ?? 0),
                'total_discount' => (float) ($s->total_discount ?? 0),
                'total_revenue' => (float) ($s->total_revenue ?? 0),
            ];
        }

        // Orphan codes: used on paid orders but the coupon row was deleted.
        foreach ($stats as $code => $s) {
            if (! isset($rows[$code])) {
                $rows[$code] = [
                    'code' => $code,
                    'discount_percent' => null,
                    'is_active' => false,
                    'orders_count' => (int) $s->orders_count,
                    'total_discount' => (float) $s->total_discount,
                    'total_revenue' => (float) $s->total_revenue,
                ];
            }
        }

        return response()->json(['data' => array_values($rows)]);
    }
}
