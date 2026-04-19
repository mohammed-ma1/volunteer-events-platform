<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment completed</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f2f7;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <div style="display:none;max-height:0;overflow:hidden;">
    A customer completed payment. Order {{ $order->invoiceReference() }} — {{ number_format((float) $order->total, 3) }} {{ $order->currency }}.
  </div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f0f2f7;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;margin:0 auto;">
          <tr>
            <td style="background:linear-gradient(135deg,#0b1221 0%,#1e3a5f 100%);border-radius:16px 16px 0 0;padding:28px 32px;text-align:left;">
              <p style="margin:0 0 4px 0;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:rgba(255,255,255,0.65);">Internal notification</p>
              <h1 style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.02em;">Payment completed</h1>
              <p style="margin:12px 0 0 0;font-size:14px;line-height:1.5;color:rgba(255,255,255,0.88);">A customer has successfully completed checkout. Summary below for your records.</p>
            </td>
          </tr>
          <tr>
            <td style="background-color:#ffffff;padding:32px;border-radius:0 0 16px 16px;box-shadow:0 12px 40px -20px rgba(11,18,33,0.25);">
              <p style="margin:0 0 20px 0;font-size:14px;line-height:1.6;color:#4a5670;">This is an automated message from {{ config('app.name') }}. Please do not forward customer credentials from this thread; use your normal processes for follow-up.</p>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f8fafc;border-radius:12px;border:1px solid #e8ecf6;margin-bottom:24px;">
                <tr>
                  <td style="padding:20px 22px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="padding:0 0 8px 0;font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#6a7899;">Invoice reference</td>
                      </tr>
                      <tr>
                        <td style="padding:0 0 16px 0;font-size:15px;font-weight:600;color:#0b1221;">{{ $order->invoiceReference() }}</td>
                      </tr>
                      <tr>
                        <td style="padding:0 0 8px 0;font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#6a7899;">Customer</td>
                      </tr>
                      <tr>
                        <td style="padding:0 0 4px 0;font-size:15px;color:#0b1221;"><strong>{{ $order->customer_name }}</strong></td>
                      </tr>
                      <tr>
                        <td style="padding:0 0 16px 0;font-size:14px;color:#323a4d;"><a href="mailto:{{ $order->email }}" style="color:#1e3a5f;text-decoration:none;">{{ $order->email }}</a></td>
                      </tr>
                      @if($order->phone)
                      <tr>
                        <td style="padding:0 0 8px 0;font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#6a7899;">Phone</td>
                      </tr>
                      <tr>
                        <td style="padding:0 0 16px 0;font-size:14px;color:#323a4d;">{{ $order->phone }}</td>
                      </tr>
                      @endif
                      <tr>
                        <td style="padding:0 0 8px 0;font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#6a7899;">Order ID (system)</td>
                      </tr>
                      <tr>
                        <td style="padding:0 0 16px 0;font-size:13px;font-family:ui-monospace,Consolas,monospace;color:#323a4d;word-break:break-all;">{{ $order->uuid }}</td>
                      </tr>
                      <tr>
                        <td style="padding:0 0 8px 0;font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#6a7899;">Paid on</td>
                      </tr>
                      <tr>
                        <td style="padding:0 0 16px 0;font-size:14px;color:#323a4d;">{{ $order->paid_at?->timezone(config('app.timezone'))->format('l, F j, Y \a\t g:i A') ?? now()->timezone(config('app.timezone'))->format('l, F j, Y \a\t g:i A') }}</td>
                      </tr>
                      <tr>
                        <td style="padding:0 0 8px 0;font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#6a7899;">Amount</td>
                      </tr>
                      <tr>
                        <td style="padding:0 0 16px 0;font-size:18px;font-weight:700;color:#0b1221;">{{ number_format((float) $order->total, 3) }} {{ $order->currency }}</td>
                      </tr>
                      @if($order->tap_charge_id)
                      <tr>
                        <td style="padding:0 0 8px 0;font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#6a7899;">Tap charge ID</td>
                      </tr>
                      <tr>
                        <td style="padding:0;font-size:13px;font-family:ui-monospace,Consolas,monospace;color:#323a4d;word-break:break-all;">{{ $order->tap_charge_id }}</td>
                      </tr>
                      @endif
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 12px 0;font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#6a7899;">Line items</p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;border-radius:12px;overflow:hidden;border:1px solid #e8ecf6;">
                <thead>
                  <tr style="background-color:#0b1221;">
                    <th align="left" style="padding:12px 14px;font-size:11px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:rgba(255,255,255,0.9);">Workshop</th>
                    <th align="center" style="padding:12px 10px;font-size:11px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:rgba(255,255,255,0.9);width:48px;">Qty</th>
                    <th align="right" style="padding:12px 14px;font-size:11px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:rgba(255,255,255,0.9);width:96px;">Line total</th>
                  </tr>
                </thead>
                <tbody>
                  @foreach($order->items as $line)
                  <tr style="background-color:{{ $loop->even ? '#f8fafc' : '#ffffff' }};">
                    <td style="padding:12px 14px;font-size:14px;color:#0b1221;border-bottom:1px solid #e8ecf6;">{{ $line->event_title }}</td>
                    <td align="center" style="padding:12px 10px;font-size:14px;color:#323a4d;border-bottom:1px solid #e8ecf6;">{{ $line->quantity }}</td>
                    <td align="right" style="padding:12px 14px;font-size:14px;color:#323a4d;border-bottom:1px solid #e8ecf6;">{{ number_format((float) $line->unit_price * (int) $line->quantity, 3) }} {{ $order->currency }}</td>
                  </tr>
                  @endforeach
                </tbody>
              </table>

              @if($frontendUrl !== '')
              <p style="margin:24px 0 0 0;font-size:13px;color:#6a7899;">Public site: <a href="{{ $frontendUrl }}" style="color:#1e3a5f;">{{ $frontendUrl }}</a></p>
              @endif
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
