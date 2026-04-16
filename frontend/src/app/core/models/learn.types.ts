export type WorkshopStatus = 'upcoming' | 'ongoing' | 'completed';

export interface EnrolledWorkshop {
  id: number;
  event: {
    id: number;
    title: string;
    title_en?: string;
    slug: string;
    image_url?: string;
    summary?: string;
    summary_en?: string;
    description?: string;
    description_en?: string;
    starts_at?: string;
    ends_at?: string;
    location?: string;
    location_en?: string;
    zoom_link?: string;
    price?: number;
    currency?: string;
    status: WorkshopStatus;
  };
  lessons_count: number;
  completed_lessons_count: number;
  progress_percent: number;
  enrolled_at: string;
  completed_at?: string;
}

export interface WorkshopDetail {
  event: {
    id: number;
    title: string;
    title_en?: string;
    slug: string;
    image_url?: string;
    description?: string;
    description_en?: string;
    summary?: string;
    summary_en?: string;
    starts_at?: string;
    ends_at?: string;
    location?: string;
    location_en?: string;
    zoom_link?: string;
    status: WorkshopStatus;
  };
  lessons: Lesson[];
  enrolled_at: string;
}

export interface Lesson {
  id: number;
  title: string;
  title_en?: string;
  description?: string;
  video_url: string;
  duration_seconds?: number;
  sort_order: number;
  is_preview: boolean;
  progress?: {
    watched_seconds: number;
    completed: boolean;
  };
}
