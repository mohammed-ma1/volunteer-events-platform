import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Paginated, VolunteerEvent } from '../models/api.types';

@Injectable({ providedIn: 'root' })
export class EventsService {
  private readonly http = inject(HttpClient);

  list(
    page = 1,
    options?: { featured?: boolean; q?: string; perPage?: number },
  ): Observable<Paginated<VolunteerEvent>> {
    let params = new HttpParams().set('page', String(page));
    if (options?.featured) {
      params = params.set('featured', '1');
    }
    if (options?.q) {
      params = params.set('q', options.q);
    }
    if (options?.perPage) {
      params = params.set('per_page', String(options.perPage));
    }
    return this.http.get<Paginated<VolunteerEvent>>('v1/events', { params });
  }

  featured(): Observable<Paginated<VolunteerEvent>> {
    return this.list(1, { featured: true, perPage: 8 });
  }

  bySlug(slug: string): Observable<VolunteerEvent> {
    return this.http.get<VolunteerEvent>(`v1/events/${slug}`);
  }
}
