<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use App\Models\Event;
use App\Models\EventCompletion;
use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Models\Order;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Mpdf\Mpdf;

class LearnController extends Controller
{
    public function myWorkshops(): JsonResponse
    {
        $userId = Auth::guard('api')->id();

        $enrollments = Enrollment::with(['event' => fn ($q) => $q->withCount('lessons')])
            ->where('user_id', $userId)
            ->latest('enrolled_at')
            ->get();

        $eventIds = $enrollments->pluck('event_id')->filter();

        $completedByEvent = [];
        if ($eventIds->isNotEmpty()) {
            $completedByEvent = LessonProgress::where('user_id', $userId)
                ->where('completed', true)
                ->whereHas('lesson', fn ($q) => $q->whereIn('event_id', $eventIds))
                ->join('lessons', 'lesson_progress.lesson_id', '=', 'lessons.id')
                ->selectRaw('lessons.event_id, COUNT(*) as cnt')
                ->groupBy('lessons.event_id')
                ->pluck('cnt', 'event_id')
                ->toArray();
        }

        $data = $enrollments->map(function (Enrollment $e) use ($completedByEvent) {
            $event = $e->event;
            if (! $event) {
                return null;
            }

            $totalLessons = $event->lessons_count ?? 0;
            $completedLessons = (int) ($completedByEvent[$event->id] ?? 0);
            $progress = $totalLessons > 0 ? round(($completedLessons / $totalLessons) * 100) : 0;

            return [
                'id' => $e->id,
                'event' => [
                    'id' => $event->id,
                    'title' => $event->title,
                    'title_en' => $event->title_en,
                    'slug' => $event->slug,
                    'image_url' => $event->image_url,
                    'summary' => $event->summary,
                    'summary_en' => $event->summary_en,
                    'description' => $event->description,
                    'description_en' => $event->description_en,
                    'starts_at' => $event->starts_at?->toIso8601String(),
                    'ends_at' => $event->ends_at?->toIso8601String(),
                    'location' => $event->location,
                    'location_en' => $event->location_en,
                    'zoom_link' => $event->zoom_link,
                    'host_name' => $event->host_name,
                    'price' => $event->price,
                    'currency' => $event->currency,
                    'status' => $this->computeWorkshopStatus($event),
                ],
                'lessons_count' => $totalLessons,
                'completed_lessons_count' => $completedLessons,
                'progress_percent' => $progress,
                'enrolled_at' => $e->enrolled_at->toIso8601String(),
                'completed_at' => $e->completed_at?->toIso8601String(),
            ];
        })->filter()->values();

        return response()->json(['data' => $data]);
    }

    public function workshopDetail(int $id): JsonResponse
    {
        $userId = Auth::guard('api')->id();

        $enrollment = Enrollment::where('user_id', $userId)
            ->where('event_id', $id)
            ->firstOrFail();

        $event = $enrollment->event;
        $event->load(['lessons' => fn ($q) => $q->orderBy('sort_order')]);

        $progressMap = LessonProgress::where('user_id', $userId)
            ->whereIn('lesson_id', $event->lessons->pluck('id'))
            ->get()
            ->keyBy('lesson_id');

        $lessons = $event->lessons->map(fn ($lesson) => [
            'id' => $lesson->id,
            'title' => $lesson->title,
            'title_en' => $lesson->title_en,
            'description' => $lesson->description,
            'video_url' => $lesson->video_url,
            'duration_seconds' => $lesson->duration_seconds,
            'sort_order' => $lesson->sort_order,
            'is_preview' => $lesson->is_preview,
            'progress' => $progressMap->has($lesson->id) ? [
                'watched_seconds' => $progressMap[$lesson->id]->watched_seconds,
                'completed' => $progressMap[$lesson->id]->completed,
            ] : null,
        ]);

        return response()->json([
            'data' => [
                'event' => [
                    'id' => $event->id,
                    'title' => $event->title,
                    'title_en' => $event->title_en,
                    'slug' => $event->slug,
                    'image_url' => $event->image_url,
                    'description' => $event->description,
                    'description_en' => $event->description_en,
                    'summary' => $event->summary,
                    'summary_en' => $event->summary_en,
                    'starts_at' => $event->starts_at?->toIso8601String(),
                    'ends_at' => $event->ends_at?->toIso8601String(),
                    'location' => $event->location,
                    'location_en' => $event->location_en,
                    'zoom_link' => $event->zoom_link,
                    'host_name' => $event->host_name,
                    'status' => $this->computeWorkshopStatus($event),
                ],
                'lessons' => $lessons,
                'enrolled_at' => $enrollment->enrolled_at->toIso8601String(),
            ],
        ]);
    }

    public function updateProgress(Request $request): JsonResponse
    {
        $userId = Auth::guard('api')->id();

        $validated = $request->validate([
            'lesson_id' => 'required|exists:lessons,id',
            'watched_seconds' => 'required|integer|min:0',
            'completed' => 'required|boolean',
        ]);

        $lesson = Lesson::findOrFail($validated['lesson_id']);

        Enrollment::where('user_id', $userId)
            ->where('event_id', $lesson->event_id)
            ->firstOrFail();

        $progress = LessonProgress::updateOrCreate(
            ['user_id' => $userId, 'lesson_id' => $validated['lesson_id']],
            [
                'watched_seconds' => $validated['watched_seconds'],
                'completed' => $validated['completed'],
                'last_watched_at' => now(),
            ]
        );

        return response()->json(['data' => $progress]);
    }

    /**
     * GET /v1/learn/events/{event}/completion
     * Returns whether the current user has marked this workshop's recording as
     * watched, plus the recording URL (only exposed to enrolled viewers; the
     * public /v1/events/{slug} payload never includes it).
     */
    public function getEventCompletion(int $event): JsonResponse
    {
        $userId = Auth::guard('api')->id();

        $enrollment = Enrollment::where('user_id', $userId)
            ->where('event_id', $event)
            ->first();

        if (! $enrollment) {
            return response()->json(['message' => 'Not enrolled in this workshop.'], 404);
        }

        $eventModel = Event::findOrFail($event);

        $completion = EventCompletion::where('user_id', $userId)
            ->where('event_id', $event)
            ->first();

        return response()->json([
            'data' => [
                'completed' => (bool) $completion,
                'completed_at' => $completion?->completed_at?->toIso8601String(),
                'recording_url' => $eventModel->recording_url,
            ],
        ]);
    }

    /**
     * POST /v1/learn/events/{event}/complete
     * Honor-system "I finished watching" toggle. Idempotent — re-clicking returns
     * the same row.
     */
    public function markEventCompleted(int $event): JsonResponse
    {
        $userId = Auth::guard('api')->id();

        $enrollment = Enrollment::where('user_id', $userId)
            ->where('event_id', $event)
            ->first();

        if (! $enrollment) {
            return response()->json(['message' => 'Not enrolled in this workshop.'], 404);
        }

        $completion = EventCompletion::firstOrCreate(
            ['user_id' => $userId, 'event_id' => $event],
            ['completed_at' => now()],
        );

        return response()->json([
            'data' => [
                'completed' => true,
                'completed_at' => $completion->completed_at->toIso8601String(),
            ],
        ]);
    }

    /**
     * GET /v1/learn/events/{event}/certificate
     * Streams a PDF certificate to any enrolled user. The "watched the
     * recording" gate is intentionally disabled for now — we'll re-enable it
     * once we wire real video-completion tracking. The completion row is
     * still surfaced if it exists so the certificate carries the real
     * completion date; otherwise we use today's date.
     */
    public function downloadCertificate(int $event): JsonResponse|Response
    {
        $userId = Auth::guard('api')->id();
        $user = Auth::guard('api')->user();

        $enrollment = Enrollment::where('user_id', $userId)
            ->where('event_id', $event)
            ->first();

        if (! $enrollment) {
            return response()->json(['message' => 'Not enrolled in this workshop.'], 404);
        }

        $completion = EventCompletion::where('user_id', $userId)
            ->where('event_id', $event)
            ->first();

        $eventModel = Event::findOrFail($event);
        $certNo = sprintf('NL-%d-%d', $eventModel->id, $userId);

        $html = view('certificates.workshop', [
            'user' => $user,
            'event' => $eventModel,
            'completion' => $completion,
            'certNo' => $certNo,
        ])->render();

        // mpdf is used (not DomPDF) because it shapes Arabic glyphs correctly
        // and supports proper bidi text — DomPDF renders RTL strings as
        // disconnected, reversed letters which is unacceptable for an
        // official certificate.
        $tmpDir = storage_path('app/mpdf');
        if (! is_dir($tmpDir)) {
            mkdir($tmpDir, 0775, true);
        }

        // Margins / borders are controlled by the @page rules in the Blade
        // template — the constructor only sets format, fonts, and the temp
        // directory mpdf needs for its font cache.
        //
        // We register Tajawal (Google Fonts, OFL-licensed) so the certificate
        // uses the same Arabic typeface as the rest of the platform. mpdf's
        // default font search dirs are merged with the extra one we point at
        // resources/fonts/, and `fontdata` maps the family name `tajawal` to
        // the TTF files so CSS like `font-family: tajawal;` resolves.
        $defaultConfig = (new \Mpdf\Config\ConfigVariables())->getDefaults();
        $defaultFontConfig = (new \Mpdf\Config\FontVariables())->getDefaults();
        // NOTE: autoScriptToLang / autoLangToFont are intentionally NOT enabled.
        // They auto-substitute mpdf's default font for Latin-script runs, which
        // overrode the certificate's Bahij font for English trainee names. With
        // them off and default_font = Bahij, every overlay run (Arabic names,
        // Latin names, the date) uses the template's typeface; Arabic shaping
        // still works via the font's OTL tables (useOTL).
        $mpdf = new Mpdf([
            'mode' => 'utf-8',
            'format' => 'A4-L',
            'default_font' => 'bahijthesansarabic',
            'tempDir' => $tmpDir,
            'fontDir' => array_merge($defaultConfig['fontDir'], [
                resource_path('fonts'),
            ]),
            'fontdata' => $defaultFontConfig['fontdata'] + [
                'tajawal' => [
                    'R' => 'Tajawal-Regular.ttf',
                    'B' => 'Tajawal-Bold.ttf',
                    'M' => 'Tajawal-Medium.ttf',
                    'useOTL' => 0xFF,
                    'useKashida' => 75,
                ],
                // Bahij TheSansArabic matches the Cert2 template's typeface.
                // Only the Bold weight was provided, so every style maps to it
                // (the overlaid name/title/date are all bold anyway).
                'bahijthesansarabic' => [
                    'R' => 'Bahij_TheSansArabic-Bold.ttf',
                    'B' => 'Bahij_TheSansArabic-Bold.ttf',
                    'M' => 'Bahij_TheSansArabic-Bold.ttf',
                    'useOTL' => 0xFF,
                    'useKashida' => 75,
                ],
            ],
        ]);

        $mpdf->SetTitle("Certificate {$certNo}");
        $mpdf->SetAuthor('Next Levels Education');

        // Use the Cert2 design PDF directly as the certificate background. mpdf
        // (via FPDI) imports the page as a vector template, so the border, logos,
        // signature and body text stay crisp at any zoom — no rasterised PNG.
        // The dynamic fields (name + workshop title) are then written on top.
        $mpdf->SetSourceFile(resource_path('certificates/cert2-template.pdf'));
        $tplId = $mpdf->ImportPage(1);
        $mpdf->UseTemplate($tplId);

        $mpdf->WriteHTML($html);

        $slug = $eventModel->slug ?: 'workshop';
        $filename = "certificate-{$slug}.pdf";

        return response($mpdf->Output($filename, 'S'), 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'Cache-Control' => 'private, no-store',
        ]);
    }

    /**
     * Number of completed workshops a learner must reach before the BITA
     * paper certificate can be requested.
     */
    private const BITA_REQUIRED_WORKSHOPS = 100;

    /**
     * GET /v1/learn/bita-status
     * Eligibility + progress for the dashboard "Request BITA Certificate" tile.
     * `eligible_purchase` is only true when the learner bought the optional BITA
     * add-on at checkout; otherwise the tile stays hidden on the frontend.
     */
    public function bitaStatus(): JsonResponse
    {
        /** @var User $user */
        $user = Auth::guard('api')->user();

        return response()->json(['data' => $this->bitaStatusPayload($user)]);
    }

    /**
     * POST /v1/learn/bita-request
     * Records the learner's certificate request (idempotent). Gated behind both
     * the paid add-on and completing the required number of workshops; the
     * frontend mirrors this gate with an animated "almost there" modal.
     */
    public function requestBitaCertificate(): JsonResponse
    {
        /** @var User $user */
        $user = Auth::guard('api')->user();

        if (! $this->bitaEligible($user)) {
            return response()->json(
                ['message' => 'The BITA paper certificate add-on is not part of your purchase.'],
                403,
            );
        }

        if ($this->bitaCompletedCount($user->id) < self::BITA_REQUIRED_WORKSHOPS) {
            return response()->json([
                'message' => 'Complete all workshops before requesting the certificate.',
                'data' => $this->bitaStatusPayload($user),
            ], 422);
        }

        if (! $user->bita_requested_at) {
            $user->forceFill(['bita_requested_at' => now()])->save();
        }

        return response()->json(['data' => $this->bitaStatusPayload($user->refresh())]);
    }

    /** Assembles the shared BITA status shape used by both endpoints. */
    private function bitaStatusPayload(User $user): array
    {
        $eligible = $this->bitaEligible($user);
        $completed = $this->bitaCompletedCount($user->id);
        $required = self::BITA_REQUIRED_WORKSHOPS;

        return [
            // Kept as `eligible_purchase` for frontend compatibility; it now means
            // "the BITA request entry point should be shown to this learner".
            'eligible_purchase' => $eligible,
            'completed_count' => $completed,
            'required_count' => $required,
            'can_request' => $eligible && $completed >= $required,
            'requested_at' => $user->bita_requested_at?->toIso8601String(),
        ];
    }

    /**
     * Whether the BITA request entry point is shown to the learner. Only learners
     * who purchased the paid BITA paper-certificate add-on at checkout qualify
     * (matched by buyer email on a paid order). The actual request gate (watching
     * all required workshops) is enforced separately via `can_request`.
     */
    private function bitaEligible(User $user): bool
    {
        if (! $user->email) {
            return false;
        }

        return Order::query()
            ->where('email', $user->email)
            ->where('status', Order::STATUS_PAID)
            ->where('has_bita_addon', true)
            ->exists();
    }

    /** Count of workshops the learner has marked as fully watched. */
    private function bitaCompletedCount(int $userId): int
    {
        return EventCompletion::where('user_id', $userId)->count();
    }

    private function computeWorkshopStatus(Event $event): string
    {
        $now = Carbon::now();

        if ($event->ends_at && $now->isAfter($event->ends_at)) {
            return 'completed';
        }

        if ($event->starts_at && $now->isAfter($event->starts_at)) {
            return 'ongoing';
        }

        return 'upcoming';
    }
}
