<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Invoice {{ $reference }}</title>
  <style>
    body { font-family: DejaVu Sans, sans-serif; margin: 0; padding: 24px; color: #0a1628; background: #f8fafc; font-size: 12px; }
    .card { max-width: 640px; margin: 0 auto; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 28px; }
    h1 { font-size: 1.25rem; margin: 0 0 8px; }
    .muted { color: #64748b; font-size: 0.875rem; margin: 0 0 24px; }
    .ref { font-family: DejaVu Sans, sans-serif; font-size: 13px; font-weight: 700; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 0.875rem; }
    th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid #e2e8f0; }
    th { background: #0b1221; color: #fff; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.05em; }
    td.item-title { unicode-bidi: embed; }
    .total { margin-top: 20px; font-size: 1.25rem; font-weight: 700; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Payment receipt</h1>
    <p class="muted">Order reference: <span class="ref">{{ $reference }}</span></p>
    <p><strong>{{ $order->customer_name }}</strong><br>{{ $order->email }}</p>
    @if($order->phone)
      <p class="muted">{{ $order->phone }}</p>
    @endif
    <p class="muted">Paid: {{ $order->paid_at?->timezone(config('app.timezone'))->format('Y-m-d H:i') ?? '—' }}</p>
    @if($order->tap_charge_id)
      <p class="muted">Tap charge: {{ $order->tap_charge_id }}</p>
    @endif

    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th style="text-align:center;width:48px;">Qty</th>
          <th style="text-align:right;">Unit</th>
          <th style="text-align:right;">Line</th>
        </tr>
      </thead>
      <tbody>
        @foreach($order->items as $line)
          @php $isAr = (bool) preg_match('/[\x{0600}-\x{06FF}]/u', $line->event_title); @endphp
          <tr>
            <td class="item-title" dir="{{ $isAr ? 'rtl' : 'ltr' }}" style="{{ $isAr ? 'text-align:right;' : '' }}">{{ $line->event_title }}</td>
            <td style="text-align:center;">{{ $line->quantity }}</td>
            <td style="text-align:right;">{{ number_format((float) $line->unit_price, 3) }} {{ $order->currency }}</td>
            <td style="text-align:right;">{{ number_format((float) $line->unit_price * $line->quantity, 3) }} {{ $order->currency }}</td>
          </tr>
        @endforeach
      </tbody>
    </table>
    <p class="total">Total: {{ number_format((float) $order->total, 3) }} {{ $order->currency }}</p>
  </div>
</body>
</html>
