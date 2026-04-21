import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Paginated } from '../models/api.types';
import { normalizePresenterName } from '../data/home-experts';

/** Public expert payload returned by `GET /v1/experts`. */
export interface PublicExpert {
  id: number;
  name: string;
  avatar_url: string | null;
  bio: string | null;
  specialization: string | null;
  title: string | null;
}

/**
 * Loads the public experts feed (admin-portal-managed) and exposes
 * normalized-name → avatar_url overrides so static `HOME_EXPERTS` entries can
 * be enriched at runtime without a frontend rebuild.
 *
 * The fetch is fire-and-forget on first access; failures fall back to the
 * static defaults so the home page keeps rendering offline.
 */
@Injectable({ providedIn: 'root' })
export class ExpertsService {
  private readonly http = inject(HttpClient);
  private fetched = false;

  private readonly _experts = signal<PublicExpert[]>([]);
  readonly experts = this._experts.asReadonly();

  /** Lookup map: normalized Arabic name → avatar URL. */
  readonly avatarOverrides = computed<Record<string, string>>(() => {
    const out: Record<string, string> = {};
    for (const e of this._experts()) {
      if (!e.avatar_url) continue;
      const key = normalizePresenterName(e.name);
      if (key) out[key] = e.avatar_url;
    }
    return out;
  });

  /** Lazy fetch — safe to call from multiple consumers. */
  ensureLoaded(): void {
    if (this.fetched) return;
    this.fetched = true;
    this.http.get<Paginated<PublicExpert>>('v1/experts', {
      params: { per_page: '200' },
    }).subscribe({
      next: (res) => this._experts.set(res?.data ?? []),
      error: () => {
        // Reset so a future call can retry; the home page already has static
        // fallbacks, so we silently degrade.
        this.fetched = false;
      },
    });
  }
}
