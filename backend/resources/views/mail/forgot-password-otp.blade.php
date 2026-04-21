<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password reset</title>
</head>
<body style="margin:0;padding:0;background:#f4f6fb;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f6fb;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(15,23,42,0.08);">
          <tr>
            <td style="padding:28px 28px 8px 28px;">
              <p style="margin:0;font-size:15px;line-height:1.6;color:#334155;">Hi {{ $user->name }},</p>
              <p style="margin:16px 0 0 0;font-size:15px;line-height:1.6;color:#334155;">Use this code to reset your password. It expires in <strong>15 minutes</strong>.</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:8px 28px 24px 28px;">
              <p style="margin:0;font-size:32px;font-weight:800;letter-spacing:0.35em;color:#0f172a;font-family:ui-monospace,Consolas,monospace;">{{ $otpPlain }}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 28px 28px;">
              <p style="margin:0;font-size:12px;line-height:1.5;color:#64748b;">If you did not request a reset, you can ignore this email.</p>
              <p style="margin:16px 0 0 0;">
                <a href="{{ $frontendUrl }}/login" style="display:inline-block;padding:12px 24px;font-size:14px;font-weight:700;color:#ffffff;background:#1e1b4b;text-decoration:none;border-radius:10px;">Go to login</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
