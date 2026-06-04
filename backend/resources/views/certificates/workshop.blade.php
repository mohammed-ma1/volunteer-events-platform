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

    /* Brand navy from the template (#2E2A7B) is reused for all overlays so
       the dynamic text reads as part of the original design. */
    .overlay {
      position: absolute;
      color: #2E2A7B;
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
    }

    /* Workshop title — centred under "قد حضر الورشة التدريبية بعنوان".
       Direction is forced to RTL so multi-word Arabic titles wrap correctly. */
    .field-workshop {
      top: 140mm;
      left: 30mm;
      width: 237mm;
      font-size: 17pt;
      font-weight: bold;
      direction: rtl;
      line-height: 1.35;
    }

    /* Issue date — sits over the "بتاريخ / /" form line. A small white
       backdrop blocks the original slashes from showing through. */
    .field-date-wrap {
      top: 161mm;
      left: 0;
      width: 297mm;
    }
    .field-date {
      display: inline-block;
      background: #ffffff;
      padding: 1mm 3mm;
      font-size: 13pt;
      font-weight: bold;
      direction: rtl;
    }

    /* Verification line tucked just inside the bottom navy border, small
       enough to not visually clash with the gold ornament. */
    .verify {
      position: absolute;
      bottom: 4mm;
      left: 0;
      width: 297mm;
      text-align: center;
      font-family: 'tajawal', sans-serif;
      font-size: 7pt;
      color: #6b7280;
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
    @endphp
    <span class="field-date">بتاريخ {{ $issued->format('d / m / Y') }}</span>
  </div>

  <div class="verify">Certificate No. {{ $certNo }}</div>

</body>
</html>
