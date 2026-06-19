<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    /**
     * Public coupon validation for the checkout page. Returns the discount
     * percentage when the code is active and not expired; otherwise valid=false
     * (drives the "invalid code" message). The discount is re-validated and
     * applied authoritatively in CheckoutController::store on payment.
     */
    public function validateCode(Request $request): JsonResponse
    {
        $data = $request->validate([
            'code' => ['required', 'string', 'max:64'],
        ]);

        $coupon = Coupon::findByCode($data['code']);

        if ($coupon === null || ! $coupon->isRedeemable()) {
            return response()->json(['valid' => false], 200);
        }

        return response()->json([
            'valid' => true,
            'code' => $coupon->code,
            'discount_percent' => (float) $coupon->discount_percent,
        ], 200);
    }
}
