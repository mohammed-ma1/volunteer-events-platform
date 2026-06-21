import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EnrolledWorkshop, WorkshopDetail } from '../models/learn.types';

export interface EventCompletionState {
  completed: boolean;
  completed_at: string | null;
  /** Cloudflare Stream iframe URL or direct mp4 URL; only present for enrolled viewers. */
  recording_url: string | null;
}

/**
 * Eligibility + progress for the dashboard "Request BITA Cert" tile.
 *
 * - `eligible_purchase` — the learner has a paid order with `has_bita_addon=true`.
 *   When false, the tile is hidden on the dashboard.
 * - `completed_count` / `required_count` — drives the locked-modal progress
 *   ring + numeric counter.
 * - `can_request` — true when eligible AND completed >= required. The frontend
 *   POSTs to `/bita-request` when this is true.
 * - `requested_at` — non-null once the request was successfully submitted; the
 *   tile flips to its "Requested" emerald state.
 */
export interface BitaStatus {
  eligible_purchase: boolean;
  completed_count: number;
  required_count: number;
  can_request: boolean;
  requested_at: string | null;
}

/**
 * BITA paper-certificate eligibility + progress for the dashboard tile and the
 * workshop detail card. `eligible_purchase` is only true when the learner bought
 * the optional BITA add-on at checkout — the UI hides the feature otherwise.
 */
export interface BitaStatus {
  eligible_purchase: boolean;
  completed_count: number;
  required_count: number;
  can_request: boolean;
  requested_at: string | null;
}

@Injectable({ providedIn: 'root' })
export class LearnService {
  constructor(private http: HttpClient) {}

  getMyWorkshops(): Observable<{ data: EnrolledWorkshop[] }> {
    return this.http.get<{ data: EnrolledWorkshop[] }>('/v1/learn/my-workshops');
  }

  getWorkshopDetail(eventId: number): Observable<{ data: WorkshopDetail }> {
    return this.http.get<{ data: WorkshopDetail }>(`/v1/learn/workshops/${eventId}`);
  }

  updateProgress(lessonId: number, watchedSeconds: number, completed: boolean): Observable<unknown> {
    return this.http.post('/v1/learn/progress', {
      lesson_id: lessonId,
      watched_seconds: watchedSeconds,
      completed,
    });
  }

  /** Fetches the user's "I finished watching" flag + the recording URL for an enrolled event. */
  getEventCompletion(eventId: number): Observable<{ data: EventCompletionState }> {
    return this.http.get<{ data: EventCompletionState }>(`/v1/learn/events/${eventId}/completion`);
  }

  /** Marks the workshop recording as watched (idempotent). */
  markEventCompleted(eventId: number): Observable<{ data: EventCompletionState }> {
    return this.http.post<{ data: EventCompletionState }>(
      `/v1/learn/events/${eventId}/complete`,
      {},
    );
  }

  /** Undoes the "I finished watching" flag so the user can flip it back (idempotent). */
  unmarkEventCompleted(eventId: number): Observable<{ data: EventCompletionState }> {
    return this.http.delete<{ data: EventCompletionState }>(
      `/v1/learn/events/${eventId}/complete`,
    );
  }

  /**
   * Downloads the workshop certificate as a PDF Blob. The interceptor attaches
   * the Bearer token to /v1/learn/* automatically.
   */
  downloadCertificate(eventId: number): Observable<HttpResponse<Blob>> {
    return this.http.get(`/v1/learn/events/${eventId}/certificate`, {
      responseType: 'blob',
      observe: 'response',
    });
  }

  /** Eligibility + progress for the BITA paper-certificate request. */
  getBitaStatus(): Observable<{ data: BitaStatus }> {
    return this.http.get<{ data: BitaStatus }>('/v1/learn/bita-status');
  }

  /** Submits the BITA paper-certificate request (idempotent server-side). */
  requestBitaCertificate(): Observable<{ data: BitaStatus }> {
    return this.http.post<{ data: BitaStatus }>('/v1/learn/bita-request', {});
  }
}
