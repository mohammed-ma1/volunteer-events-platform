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
}
