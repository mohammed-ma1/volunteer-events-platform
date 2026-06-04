{{-- Workshop attendance certificate. Uses resources/images/certificate-template.png
     as a full-page background (the ornamental border, brand logos, watermark,
     signature and "CEO & Founder" label are all baked into that image), and
     overlays three dynamic fields on top:

       1. Trainee name           — between "بأن المتدرب" and "قد حضر الورشة"
       2. Workshop title         — under "قد حضر الورشة التدريبية بعنوان"
       3. Issue date             — replaces the "بتاريخ / /" form line

     Page: A4 landscape (297mm × 210mm), zero margins so the template image
     fills edge-to-edge. mpdf renders Tajawal for Arabic text (configured in
     LearnController::downloadCertificate).

     Variables: $user, $event, $completion, $certNo --}}
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Certificate {{ $certNo }}</title>
  <style>
    @page {
      sheet-size: A4-L;
      margin: 0;
    }

    /* The template image is the entire visual design — letting mpdf paint
       it as a normal block element at 297×210mm (matching A4-L) gives the
       sharpest result. Everything else is layered on top via z-index. */
    .bg {
      position: absolute;
      top: 0; left: 0;
      width: 297mm;
      height: 210mm;
      z-index: 0;
    }

    /* Deep navy that matches the headline + body text baked into the
       template image (slightly darker than the brand-900 to compensate
       for mpdf's blended rendering). Reused for every overlay so the
       dynamic text reads as a seamless part of the original design. */
    .overlay {
      position: absolute;
      color: #1a2447;
      font-family: 'tajawal', sans-serif;
      text-align: center;
      z-index: 1;
    }

    /* Trainee name — centred between the two body lines. */
    .field-name {
      top: 95mm;
      left: 0;
      width: 297mm;
      font-size: 24pt;
      font-weight: bold;
      letter-spacing: 0.3pt;
    }

    /* Workshop title — centred under "قد حضر الورشة التدريبية بعنوان".
       Direction is forced to RTL so multi-word Arabic titles wrap correctly. */
    .field-workshop {
      top: 138mm;
      left: 25mm;
      width: 247mm;
      font-size: 19pt;
      font-weight: bold;
      direction: rtl;
      line-height: 1.4;
    }

    /* Issue date — sits cleanly over the watermark band. The placeholder
       "بتاريخ / /" was redacted from the template PNG (donor-band patch),
       so no white backdrop is needed and the watermark reads through. */
    .field-date-wrap {
      top: 159mm;
      left: 0;
      width: 297mm;
    }
    .field-date {
      display: inline-block;
      font-size: 14pt;
      font-weight: bold;
      direction: rtl;
      letter-spacing: 0.5pt;
    }

    /* Verification line — sits above the gold ornament strip so it never
       gets clipped by the bottom border. */
    .verify {
      position: absolute;
      top: 192mm;
      left: 0;
      width: 297mm;
      text-align: center;
      font-family: 'tajawal', sans-serif;
      font-size: 6.5pt;
      color: #9ca3af;
      letter-spacing: 0.6pt;
      z-index: 1;
    }
  </style>
</head>
<body>

  <img class="bg" src="{{ resource_path('images/certificate-template.png') }}" alt="">

  <div class="overlay field-name">{{ $user->name }}</div>

  <div class="overlay field-workshop">{{ $event->title }}</div>

  <div class="overlay field-date-wrap">
    @php
        $issued = $completion?->completed_at?->timezone(config('app.timezone')) ?? now();
        // Render the date in Arabic-Indic numerals so it visually
        // matches the rest of the Arabic certificate body.
        $arabicDate = strtr(
            $issued->format('d / m / Y'),
            ['0'=>'٠','1'=>'١','2'=>'٢','3'=>'٣','4'=>'٤','5'=>'٥','6'=>'٦','7'=>'٧','8'=>'٨','9'=>'٩']
        );
    @endphp
    <span class="field-date">بتاريخ&nbsp;&nbsp;{{ $arabicDate }}</span>
  </div>

  <div class="verify">Certificate No. {{ $certNo }}</div>

</body>
</html>
