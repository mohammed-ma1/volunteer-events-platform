import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EnrolledWorkshop, WorkshopDetail } from '../models/learn.types';

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
}
