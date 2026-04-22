{{-- Workshop completion certificate. Rendered via mpdf — uses simple flow
     layout (no nested bordered tables) because mpdf paginated each row to a
     new page on previous attempts. The decorative gold + navy double frame
     is drawn via @page borders so it never interferes with pagination.
     Variables: $user, $event, $completion, $certNo --}}
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Certificate {{ $certNo }}</title>
  <style>
    /* mpdf paints the page background but ignores `@page { border }` — the
       gold/navy double frame is drawn separately via absolute-positioned
       divs below (using width/height, NOT right/bottom, which break mpdf's
       single-page pagination). */
    @page {
      sheet-size: A4-L;
      margin: 0;
      background: #fdfaf2;
    }

    /* ── Palette ─────────────────────────────────────────────
         navy  #0c2340   gold #b58c2a   dark-gold #7a5a10
         ivory #fdfaf2   muted #6b7280
       ───────────────────────────────────────────────────────── */

    body {
      font-family: 'dejavusans', sans-serif;
      color: #0c2340;
      margin: 0;
      padding: 0;
      text-align: center;
    }

    /* Decorative double frame — absolute layer rendered before the content.
       Coordinates use positive values from the page origin (top-left) so
       mpdf places them where we expect. Using width/height (not right/
       bottom) avoids the multi-page pagination bug we hit earlier. */
    .frame-gold {
      position: absolute;
      top: 10mm; left: 10mm;
      width: 277mm; height: 190mm;
      border: 2.5pt solid #b58c2a;
    }
    .frame-navy {
      position: absolute;
      top: 14mm; left: 14mm;
      width: 269mm; height: 182mm;
      border: 0.5pt solid #0c2340;
    }
    /* Gold diamond ornaments at each gold-frame corner (centred on it). */
    .corner {
      position: absolute;
      width: 3.4mm; height: 3.4mm;
      background: #b58c2a;
    }
    .corner.tl { top: 8.3mm;   left: 8.3mm; }
    .corner.tr { top: 8.3mm;   left: 285.3mm; }
    .corner.bl { top: 198.3mm; left: 8.3mm; }
    .corner.br { top: 198.3mm; left: 285.3mm; }

    /* Content sits inside the navy frame with comfortable inset. */
    .pad {
      padding: 22mm 30mm 18mm;
    }

    /* ── Header row: institution names with central gold rule ── */
    table.header {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 6mm;
    }
    table.header td {
      vertical-align: middle;
      font-family: 'dejavusans', sans-serif;
      font-size: 8.5pt;
      letter-spacing: 1.5pt;
      color: #6b7280;
      text-transform: uppercase;
      font-weight: bold;
      line-height: 1.35;
    }
    table.header td.left  { width: 32%; text-align: left; }
    table.header td.center { width: 36%; text-align: center; }
    table.header td.right { width: 32%; text-align: right; }
    table.header hr {
      border: none;
      border-top: 0.7pt solid #b58c2a;
      margin: 0 auto;
      width: 80%;
    }

    /* ── Eyebrow + main headlines ─────────────────────────────── */
    .eyebrow {
      font-family: 'dejavusans', sans-serif;
      font-size: 8.5pt;
      letter-spacing: 4pt;
      color: #b58c2a;
      text-transform: uppercase;
      font-weight: bold;
      margin: 4mm 0 4mm;
    }

    .headline {
      font-family: 'dejavuserif', serif;
      font-size: 36pt;
      font-weight: normal;
      color: #0c2340;
      margin: 0;
      line-height: 1;
    }
    .headline-rule {
      width: 22mm;
      height: 1.2pt;
      background: #b58c2a;
      margin: 4mm auto 3mm;
    }
    .headline-ar {
      font-size: 15pt;
      color: #0c2340;
      margin: 0;
      direction: rtl;
    }

    /* ── Recipient ────────────────────────────────────────────── */
    .awarded {
      font-family: 'dejavusans', sans-serif;
      font-size: 9pt;
      color: #6b7280;
      letter-spacing: 2pt;
      text-transform: uppercase;
      margin: 8mm 0 4mm;
    }
    .recipient {
      font-family: 'dejavuserif', serif;
      font-size: 28pt;
      font-style: italic;
      color: #0c2340;
      margin: 0 auto;
      line-height: 1.1;
    }
    .recipient-rule {
      width: 130mm;
      height: 0.6pt;
      background: #b58c2a;
      margin: 3mm auto 0;
    }

    /* ── Workshop title ───────────────────────────────────────── */
    .for-completing {
      font-family: 'dejavusans', sans-serif;
      font-size: 9pt;
      color: #6b7280;
      letter-spacing: 1pt;
      margin: 6mm 0 3mm;
    }
    .workshop-en {
      font-family: 'dejavuserif', serif;
      font-size: 15pt;
      font-weight: bold;
      color: #0c2340;
      margin: 0 0 1.5mm;
      line-height: 1.25;
    }
    .workshop-ar {
      font-family: 'dejavusans', sans-serif;
      font-size: 13pt;
      font-weight: bold;
      color: #0c2340;
      margin: 0;
      direction: rtl;
      line-height: 1.4;
    }

    /* ── Footer: 3-column table (date · seal · signature) ─────── */
    table.footer {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10mm;
    }
    table.footer td {
      width: 33.33%;
      vertical-align: top;
      padding: 6mm 6mm 0;
      text-align: center;
    }
    /* Push the centre seal cell up so it visually anchors at the same line
       as the signature lines either side. */
    table.footer td.middle {
      vertical-align: top;
      padding-top: 0;
    }
    hr.sig-line {
      width: 60mm;
      border: none;
      border-top: 1pt solid #0c2340;
      margin: 0 auto 2.5mm;
    }
    .meta-value {
      font-family: 'dejavuserif', serif;
      font-size: 11pt;
      color: #0c2340;
      font-weight: bold;
    }
    .meta-label {
      font-family: 'dejavusans', sans-serif;
      font-size: 7.5pt;
      letter-spacing: 1.4pt;
      color: #6b7280;
      text-transform: uppercase;
      margin-top: 1.5mm;
    }

    /* ── Embossed gold seal (centre footer cell) ──────────────── */
    /* Seal: drawn as inline SVG (mpdf can't reliably round-corner a div via
       border-radius). The SVG produces a real circular medallion with a
       darker outer ring, a lighter inner ring with a thin white inset, a
       star, and the institution year — vector-crisp at any zoom. */
    .seal-wrap {
      text-align: center;
      width: 100%;
    }
    /* Tiny gold ribbon strip below the seal. */
    hr.seal-ribbon {
      width: 16mm;
      border: none;
      border-top: 1.4pt solid #b58c2a;
      margin: 1.5mm auto 0;
    }

    /* ── Verification strip ───────────────────────────────────── */
    .verify {
      text-align: center;
      font-family: 'dejavusans', sans-serif;
      font-size: 7.5pt;
      letter-spacing: 1.4pt;
      color: #6b7280;
      text-transform: uppercase;
      margin-top: 6mm;
    }
    .verify strong {
      color: #0c2340;
      letter-spacing: 0.6pt;
    }
  </style>
</head>
<body>

  <div class="frame-gold"></div>
  <div class="frame-navy"></div>
  <div class="corner tl"></div>
  <div class="corner tr"></div>
  <div class="corner bl"></div>
  <div class="corner br"></div>

  <div class="pad">

    <table class="header">
      <tr>
        <td class="left">Kuwait University<br>Student Development</td>
        <td class="center"><hr></td>
        <td class="right">Next Levels<br>Education</td>
      </tr>
    </table>

    <div class="eyebrow">Awarded by Kuwait University</div>
    <div class="headline">Certificate of Completion</div>
    <div class="headline-rule"></div>
    <div class="headline-ar" dir="rtl" lang="ar">شهادة إتمام الورشة</div>

    <div class="awarded">This certificate is proudly presented to</div>
    <div class="recipient">{{ $user->name }}</div>
    <div class="recipient-rule"></div>

    <div class="for-completing">
      For successfully completing the workshop &middot;
      <span dir="rtl" lang="ar">لإتمام ورشة</span>
    </div>
    <div class="workshop-en">{{ $event->title_en ?: $event->title }}</div>
    @php
        $titleAr = trim($event->title ?? '');
        $titleEn = trim($event->title_en ?? '');
        $showAr = $titleAr !== '' && $titleAr !== $titleEn;
    @endphp
    @if ($showAr)
      <div class="workshop-ar" dir="rtl" lang="ar">{{ $titleAr }}</div>
    @endif

    <table class="footer">
      <tr>
        <td>
          <hr class="sig-line">
          <div class="meta-value">
            {{ $completion->completed_at?->timezone(config('app.timezone'))->format('d M Y') ?? now()->format('d M Y') }}
          </div>
          <div class="meta-label">Date Issued</div>
        </td>
        <td class="middle">
          <div class="seal-wrap">
            <svg width="32mm" height="32mm" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="49" fill="#7a5a10"/>
              <circle cx="50" cy="50" r="46" fill="#d4ad3f"/>
              <circle cx="50" cy="50" r="42" fill="none" stroke="#fdfaf2" stroke-width="0.6"/>
              <polygon points="50,28 53.5,38.5 64.5,38.5 55.5,45 59,55.5 50,49 41,55.5 44.5,45 35.5,38.5 46.5,38.5" fill="#fdfaf2"/>
              <text x="50" y="68" text-anchor="middle" font-family="sans-serif" font-size="9" font-weight="bold" fill="#fdfaf2">KU</text>
              <text x="50" y="78" text-anchor="middle" font-family="sans-serif" font-size="7" font-weight="bold" fill="#fdfaf2">2026</text>
            </svg>
          </div>
          <hr class="seal-ribbon">
        </td>
        <td>
          <hr class="sig-line">
          <div class="meta-value">{{ $event->host_name ?: 'KU Student Development' }}</div>
          <div class="meta-label">{{ $event->host_name ? 'Workshop Presenter' : 'Authorised Signature' }}</div>
        </td>
      </tr>
    </table>

    <div class="verify">
      Certificate No. <strong>{{ $certNo }}</strong>
    </div>

  </div>
</body>
</html>
