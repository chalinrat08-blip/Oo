/**
 * Core Type Definitions for เที่ยวไทยตามฤดู (Thai Seasonal Travel)
 */

export type Season = 'summer' | 'rainy' | 'winter';

export type Region = 
  | 'ภาคเหนือ' 
  | 'ภาคกลาง' 
  | 'ภาคตะวันออก' 
  | 'ภาคตะวันตก' 
  | 'ภาคตะวันออกเฉียงเหนือ' 
  | 'ภาคใต้';

export type Category = 
  | 'ทะเล' 
  | 'ภูเขา' 
  | 'น้ำตก' 
  | 'วัด' 
  | 'อุทยาน' 
  | 'คาเฟ่' 
  | 'ตลาด' 
  | 'พิพิธภัณฑ์' 
  | 'จุดชมวิว' 
  | 'แหล่งวัฒนธรรม';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'member' | 'admin';
  status: 'active' | 'suspended';
  created_at: string;
}

export interface TouristAttraction {
  id: string;
  name: string;
  province: string;
  region: Region;
  season: Season;
  category: Category;
  description: string;
  activities: string[];
  opening_hours: string;
  entrance_fee: string;
  latitude: number;
  longitude: number;
  google_maps_url: string;
  main_image: string;
  gallery_images: string[];
  what_to_bring: string[];
  tips: string;
  travel_directions: string;
  best_months: string;
  is_published: boolean;
  views_count: number;
  created_at: string;
  updated_at?: string;
  avg_rating?: number;
  reviews_count?: number;
  is_favorite?: boolean;
}

export interface Review {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar: string;
  attraction_id: string;
  attraction_name?: string;
  rating: number; // 1 to 5
  comment: string;
  created_at: string;
  updated_at?: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  attraction_id: string;
  created_at: string;
}

export interface TravelPlanItem {
  id: string;
  travel_plan_id: string;
  attraction_id: string;
  attraction_name?: string;
  attraction_province?: string;
  attraction_image?: string;
  day_number: number;
  sort_order: number;
  travel_date?: string;
  notes?: string;
}

export interface TravelPlan {
  id: string;
  user_id: string;
  name: string;
  province?: string;
  description?: string;
  items: TravelPlanItem[];
  created_at: string;
  updated_at: string;
}

export interface SiteSettings {
  site_name: string;
  tagline?: string;
  site_tagline?: string;
  logo_url?: string;
  hero_banner_url?: string;
  hero_image?: string;
  announcement?: string;
  contact_email?: string;
  allow_registration?: boolean;
}

export interface AdminDashboardStats {
  total_users: number;
  total_attractions: number;
  total_provinces: number;
  total_favorites: number;
  total_reviews: number;
  total_views: number;
  seasons_breakdown: {
    summer: number;
    rainy: number;
    winter: number;
  };
  recentActivities?: {
    id: string;
    type: 'user_register' | 'new_attraction' | 'new_review' | 'favorite';
    title: string;
    timestamp: string;
  }[];
}
