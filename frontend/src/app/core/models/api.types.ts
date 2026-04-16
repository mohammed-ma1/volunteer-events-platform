export interface VolunteerEvent {
  id: number;
  title: string;
  title_en?: string | null;
  slug: string;
  summary: string | null;
  summary_en?: string | null;
  description: string | null;
  description_en?: string | null;
  image_url: string | null;
  starts_at: string;
  ends_at: string | null;
  location: string | null;
  location_en?: string | null;
  price: number;
  currency: string;
  capacity: number;
  is_featured: boolean;
  is_published: boolean;
}

export interface Paginated<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface CartLine {
  id: number;
  quantity: number;
  line_total: number;
  event: {
    id: number;
    title: string;
    slug: string;
    image_url: string | null;
    price: number;
    currency: string;
    starts_at: string;
  } | null;
}

export interface CartSnapshot {
  token: string;
  items: CartLine[];
  currency: string;
  subtotal: number;
  item_count: number;
}

export interface CheckoutResponse {
  order_uuid: string;
  status: string;
  payment_url: string | null;
  total: number;
  currency: string;
}

export interface OrderSummary {
  uuid: string;
  /** Display reference e.g. KW-000471 */
  reference_code?: string;
  status: string;
  total: number;
  currency: string;
  email: string;
  customer_name: string;
  items: { event_title: string; quantity: number; unit_price: number }[];
}
