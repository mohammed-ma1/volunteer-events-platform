<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Your account is ready</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f2f7;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
    Your workshop account is ready. Log in with your email and password to access your workshops.
  </div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f0f2f7;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;margin:0 auto;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0b1221 0%,#1e3a5f 100%);border-radius:16px 16px 0 0;padding:28px 32px;text-align:left;">
              <p style="margin:0 0 4px 0;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:rgba(255,255,255,0.65);">Kuwait University</p>
              <h1 style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.02em;">Welcome to the platform!</h1>
              <p style="margin:12px 0 0 0;font-size:14px;line-height:1.5;color:rgba(255,255,255,0.88);">Your account has been created. You can now access your workshops.</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background-color:#ffffff;padding:32px;border-radius:0 0 16px 16px;box-shadow:0 12px 40px -20px rgba(11,18,33,0.25);">
              <p style="margin:0 0 8px 0;font-size:15px;color:#0b1221;">Hello <strong>{{ $user->name }}</strong>,</p>
              <p style="margin:0 0 24px 0;font-size:14px;line-height:1.6;color:#4a5670;">Thank you for your purchase! We've created an account for you so you can access your workshop details, session schedules, and Zoom links.</p>

              <!-- Credentials Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:linear-gradient(135deg,#f0fdf4 0%,#ecfdf5 100%);border-radius:12px;border:1px solid #bbf7d0;margin-bottom:24px;">
                <tr>
                  <td style="padding:24px;">
                    <p style="margin:0 0 16px 0;font-size:13px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#15803d;">Your Login Credentials</p>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="padding:0 0 4px 0;font-size:12px;font-weight:600;color:#6a7899;">Email</td>
                      </tr>
                      <tr>
                        <td style="padding:0 0 16px 0;font-size:16px;font-weight:700;color:#0b1221;font-family:ui-monospace,Consolas,monospace;">{{ $user->email }}</td>
                      </tr>
                      <tr>
                        <td style="padding:0 0 4px 0;font-size:12px;font-weight:600;color:#6a7899;">Password</td>
                      </tr>
                      <tr>
                        <td style="padding:0;font-size:16px;font-weight:700;color:#0b1221;font-family:ui-monospace,Consolas,monospace;letter-spacing:0.05em;">{{ $password }}</td>
                      </tr>
                    </table>
                    <p style="margin:16px 0 0 0;font-size:12px;color:#6a7899;line-height:1.5;">We recommend changing your password after your first login for security.</p>
                  </td>
                </tr>
              </table>

              <!-- Workshops List -->
              @if($order->items->isNotEmpty())
              <p style="margin:0 0 12px 0;font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#6a7899;">Your Workshops</p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;border-radius:12px;overflow:hidden;border:1px solid #e8ecf6;margin-bottom:24px;">
                @foreach($order->items as $line)
                <tr style="background-color:{{ $loop->even ? '#f8fafc' : '#ffffff' }};">
                  <td style="padding:14px 16px;border-bottom:1px solid #eef1f6;">
                    <p style="margin:0 0 2px 0;font-size:14px;font-weight:600;color:#0b1221;">{{ $line->event_title }}</p>
                    @if($line->event && $line->event->starts_at)
                    <p style="margin:0;font-size:12px;color:#6a7899;">{{ $line->event->starts_at->format('l, M j, Y \a\t g:i A') }}</p>
                    @endif
                  </td>
                </tr>
                @endforeach
              </table>
              @endif

              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 auto;">
                <tr>
                  <td style="border-radius:12px;background:linear-gradient(135deg,#0b1221 0%,#1e3a5f 100%);">
                    <a href="{{ $frontendUrl }}/login" style="display:inline-block;padding:16px 36px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;letter-spacing:0.02em;">Log In Now</a>
                  </td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:28px;padding-top:24px;border-top:1px solid #e8ecf6;">
                <tr>
                  <td style="font-size:13px;line-height:1.6;color:#6a7899;">
                    This message was sent to <strong style="color:#323a4d;">{{ $user->email }}</strong> because a workshop purchase was completed. If you did not make this purchase, please contact support.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 8px;text-align:center;">
              <p style="margin:0;font-size:12px;line-height:1.5;color:#9aa8cc;">&copy; {{ date('Y') }} {{ config('app.name') }} &mdash; Student development platform</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
