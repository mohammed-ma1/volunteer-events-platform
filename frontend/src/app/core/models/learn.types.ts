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
    summary?: string;
    summary_en?: string;
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
