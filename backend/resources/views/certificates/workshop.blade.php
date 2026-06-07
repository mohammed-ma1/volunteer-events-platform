{{-- Workshop attendance certificate.

     The full visual design (ornamental gold border, NEXT LEVELS logos, the
     static Arabic body lines, the signature and "CEO & Founder" label) lives in
     resources/certificates/cert2-template.pdf, which LearnController imports as
     the page background via mpdf/FPDI (SetSourceFile + ImportPage + UseTemplate).

     This view only overlays the two dynamic fields on top of that template:

       1. Trainee name    — in the gap between "بأن المتدرب" and "قد حضر الورشة"
       2. Workshop title  — under "قد حضر الورشة التدريبيه بعنوان"

     Page: A4 landscape (297mm × 210mm), zero margins so the overlay coordinates
     line up with the imported template. mpdf shapes Arabic correctly and renders
     the Tajawal family (configured in LearnController::downloadCertificate).

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

    /* Navy that matches the headline + body text in the Cert2 template, so the
       overlaid dynamic text reads as a seamless part of the original design. */
    .overlay {
      position: absolute;
      color: #1a2447;
      font-family: 'bahijthesansarabic', sans-serif;
      text-align: center;
      z-index: 1;
    }

    /* Trainee name — centred in the gap under "بأن المتدرب". */
    .field-name {
      top: 101mm;
      left: 0;
      width: 297mm;
      font-size: 24pt;
      font-weight: bold;
      letter-spacing: 0.3pt;
    }

    /* Workshop title — centred under "قد حضر الورشة التدريبيه بعنوان".
       RTL so multi-word Arabic titles wrap correctly. */
    .field-workshop {
      top: 147mm;
      left: 25mm;
      width: 247mm;
      font-size: 19pt;
      font-weight: bold;
      direction: rtl;
      line-height: 1.4;
    }

    /* Issue date — centred just under the workshop title. */
    .field-date {
      top: 162mm;
      left: 0;
      width: 297mm;
      font-size: 13pt;
      font-weight: bold;
      direction: rtl;
      letter-spacing: 0.3pt;
    }

    /* Verification line — discreet, above the bottom gold ornament strip. */
    .verify {
      position: absolute;
      top: 196mm;
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

  <div class="overlay field-name">{{ $user->name }}</div>

  <div class="overlay field-workshop">{{ $event->title }}</div>

  @php
      $issued = $completion?->completed_at?->timezone(config('app.timezone')) ?? now();
  @endphp
  <div class="overlay field-date">بتاريخ {{ $issued->format('d/m/Y') }}</div>

  <div class="verify">Certificate No. {{ $certNo }}</div>

</body>
</html>
