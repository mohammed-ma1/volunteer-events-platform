<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title>Payment confirmed</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#f0f2f7;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
    Your payment was successful. Order {{ $order->uuid }} — total {{ number_format((float) $order->total, 3) }} {{ $order->currency }}.
  </div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f0f2f7;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;margin:0 auto;">
          <tr>
            <td style="background:linear-gradient(135deg,#0b1221 0%,#1e3a5f 100%);border-radius:16px 16px 0 0;padding:28px 32px;text-align:left;">
              <p style="margin:0 0 4px 0;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:rgba(255,255,255,0.65);">Kuwait University</p>
              <h1 style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.02em;">Student development platform</h1>
              <p style="margin:12px 0 0 0;font-size:14px;line-height:1.5;color:rgba(255,255,255,0.88);">Payment confirmed — here is your official receipt.</p>
            </td>
          </tr>
          <tr>
            <td style="background-color:#ffffff;padding:32px;border-radius:0 0 16px 16px;box-shadow:0 12px 40px -20px rgba(11,18,33,0.25);">
              <p style="margin:0 0 8px 0;font-size:15px;color:#0b1221;">Hello <strong>{{ $order->customer_name }}</strong>,</p>
              <p style="margin:0 0 24px 0;font-size:14px;line-height:1.6;color:#4a5670;">Thank you for registering. Your payment has been captured successfully. A summary of your order is below for your records.</p>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f8fafc;border-radius:12px;border:1px solid #e8ecf6;margin-bottom:24px;">
                <tr>
                  <td style="padding:20px 22px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="padding:0 0 8px 0;font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#6a7899;">Order reference</td>
                      </tr>
                      <tr>
                        <td style="padding:0 0 16px 0;font-size:15px;font-family:ui-monospace,Consolas,monospace;color:#0b1221;word-break:break-all;">{{ $order->uuid }}</td>
                      </tr>
                      <tr>
                        <td style="padding:0 0 8px 0;font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#6a7899;">Paid on</td>
                      </tr>
                      <tr>
                        <td style="padding:0;font-size:14px;color:#323a4d;">{{ $order->paid_at?->timezone(config('app.timezone'))->format('l, F j, Y \a\t g:i A') ?? now()->timezone(config('app.timezone'))->format('l, F j, Y \a\t g:i A') }}</td>
                      </tr>
                      @if($order->phone)
                      <tr>
                        <td style="padding:16px 0 0 0;font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#6a7899;">Phone on file</td>
                      </tr>
                      <tr>
                        <td style="padding:0 0 8px 0;font-size:14px;color:#323a4d;">{{ $order->phone }}</td>
                      </tr>
                      @endif
                      @if($order->tap_charge_id)
                      <tr>
                        <td style="padding:16px 0 0 0;font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#6a7899;">Payment reference (Tap)</td>
                      </tr>
                      <tr>
                        <td style="padding:0;font-size:13px;font-family:ui-monospace,Consolas,monospace;color:#323a4d;word-break:break-all;">{{ $order->tap_charge_id }}</td>
                      </tr>
                      @endif
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 12px 0;font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#6a7899;">Workshops</p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;border-radius:12px;overflow:hidden;border:1px solid #e8ecf6;">
                <thead>
                  <tr style="background-color:#0b1221;">
                    <th align="left" style="padding:12px 14px;font-size:11px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:rgba(255,255,255,0.9);">Item</th>
                    <th align="center" style="padding:12px 10px;font-size:11px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:rgba(255,255,255,0.9);width:48px;">Qty</th>
                    <th align="right" style="padding:12px 14px;font-size:11px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:rgba(255,255,255,0.9);width:88px;">Unit</th>
                    <th align="right" style="padding:12px 14px;font-size:11px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:rgba(255,255,255,0.9);width:96px;">Line</th>
                  </tr>
                </thead>
                <tbody>
                  @foreach($order->items as $line)
                  <tr style="background-color:{{ $loop->even ? '#f8fafc' : '#ffffff' }};">
                    <td style="padding:14px;font-size:14px;color:#0b1221;border-bottom:1px solid #eef1f6;">{{ $line->event_title }}</td>
                    <td align="center" style="padding:14px 10px;font-size:14px;color:#4a5670;border-bottom:1px solid #eef1f6;">{{ $line->quantity }}</td>
                    <td align="right" style="padding:14px;font-size:14px;color:#4a5670;border-bottom:1px solid #eef1f6;">{{ number_format((float) $line->unit_price, 3) }}</td>
                    <td align="right" style="padding:14px;font-size:14px;font-weight:600;color:#0b1221;border-bottom:1px solid #eef1f6;">{{ number_format((float) $line->unit_price * (int) $line->quantity, 3) }}</td>
                  </tr>
                  @endforeach
                </tbody>
              </table>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:20px;">
                <tr>
                  <td align="right" style="padding:8px 0;font-size:14px;color:#4a5670;">Subtotal</td>
                  <td align="right" style="padding:8px 0 8px 24px;font-size:14px;color:#0b1221;width:120px;">{{ number_format((float) $order->subtotal, 3) }} {{ $order->currency }}</td>
                </tr>
                <tr>
                  <td align="right" style="padding:12px 0 0 0;font-size:16px;font-weight:700;color:#0b1221;">Total paid</td>
                  <td align="right" style="padding:12px 0 0 24px;font-size:18px;font-weight:700;color:#0f766e;">{{ number_format((float) $order->total, 3) }} {{ $order->currency }}</td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:28px;padding-top:24px;border-top:1px solid #e8ecf6;">
                <tr>
                  <td style="font-size:13px;line-height:1.6;color:#6a7899;">
                    This message was sent to <strong style="color:#323a4d;">{{ $order->email }}</strong> because a successful payment was recorded for this order. If you did not make this purchase, please contact support immediately.
                  </td>
                </tr>
              </table>

              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-top:28px;">
                <tr>
                  <td style="border-radius:10px;background-color:#0b1221;">
                    <a href="{{ $frontendUrl }}/" style="display:inline-block;padding:14px 28px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;">View workshops</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 8px;text-align:center;">
              <p style="margin:0;font-size:12px;line-height:1.5;color:#9aa8cc;">© {{ date('Y') }} {{ config('app.name') }} — Student development platform</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
