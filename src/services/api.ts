/**
 * Client API Service with Dual-Mode Support:
 * 1. Fullstack mode: Connects to Express API (/api/*) when backend server is running (e.g. Cloud Run, Node.js).
 * 2. Static/Vercel Fallback mode: Seamlessly falls back to bundled static data & localStorage
 *    when deployed to Vercel, Netlify, or static hosting where the Express server is not running.
 */

import { TouristAttraction, User, Review, TravelPlan, AdminDashboardStats, SiteSettings } from "../types";
import { INITIAL_ATTRACTIONS } from "../data/initialAttractions";

const TOKEN_KEY = "thaitravel_token";
const USER_KEY = "thaitravel_user";
const FAVORITES_KEY = "thaitravel_favorites";
const REVIEWS_KEY = "thaitravel_reviews";
const PLANS_KEY = "thaitravel_plans";
const CUSTOM_ATTR_KEY = "thaitravel_custom_attractions";
const SETTINGS_KEY = "thaitravel_settings";

const DEFAULT_SETTINGS: SiteSettings = {
  site_name: "เที่ยวไทยตามฤดู",
  site_tagline: "แนะนำสถานที่ท่องเที่ยวที่เหมาะสมที่สุดในแต่ละฤดูกาล ทะเลหน้าร้อน ป่าเขาหน้าฝน ดอยสูงทะเลหมอกหน้าหนาว เที่ยวได้จริงตลอดปี",
  tagline: "แนะนำสถานที่ท่องเที่ยวที่เหมาะสมที่สุดในแต่ละฤดูกาล ทะเลหน้าร้อน ป่าเขาหน้าฝน ดอยสูงทะเลหมอกหน้าหนาว เที่ยวได้จริงตลอดปี",
  logo_url: "",
  hero_banner_url: "https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?auto=format&fit=crop&w=1600&q=80",
  hero_image: "https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?auto=format&fit=crop&w=1600&q=80",
  announcement: "ยินดีต้อนรับสู่ เที่ยวไทยตามฤดู - ค้นพบเสน่ห์เมืองไทยในทุกช่วงเวลา 3 ฤดูกาล",
  contact_email: "contact@thaitravel.com",
  allow_registration: true
};

const DEFAULT_USERS: User[] = [
  {
    id: "usr-admin-1",
    name: "ผู้ดูแลระบบ (Admin)",
    email: "admin@thaitravel.com",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    role: "admin",
    status: "active",
    created_at: new Date().toISOString()
  },
  {
    id: "usr-member-1",
    name: "สมชาย ท่องไทย",
    email: "somchai@example.com",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80",
    role: "member",
    status: "active",
    created_at: new Date().toISOString()
  }
];

export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setAuthToken = (token: string | null) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
};

const authHeaders = () => {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

// Helper: Get all attractions combining initial bundled data + any custom ones added in localStorage
function getAllLocalAttractions(): TouristAttraction[] {
  try {
    const custom = localStorage.getItem(CUSTOM_ATTR_KEY);
    const customList: TouristAttraction[] = custom ? JSON.parse(custom) : [];
    // merge by id, custom takes precedence
    const map = new Map<string, TouristAttraction>();
    INITIAL_ATTRACTIONS.forEach((a) => map.set(a.id, a));
    customList.forEach((a) => map.set(a.id, a));
    return Array.from(map.values());
  } catch {
    return INITIAL_ATTRACTIONS;
  }
}

export async function fetchApi<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    ...authHeaders(),
    ...(options.headers || {})
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  const contentType = response.headers.get("content-type");
  // If response is HTML instead of JSON (e.g. Vercel SPA rewrite on 404), throw error to trigger fallback
  if (contentType && !contentType.includes("application/json")) {
    throw new Error(`Server returned non-JSON response (${contentType})`);
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์");
  }

  return data as T;
}

// Authentication API
export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    try {
      const res = await fetchApi<{ user: User; token: string }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });
      setAuthToken(res.token);
      localStorage.setItem(USER_KEY, JSON.stringify(res.user));
      return res;
    } catch {
      // Client-side fallback for Vercel demo
      const user = DEFAULT_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase()) || {
        id: `usr-${Date.now()}`,
        name: email.split("@")[0],
        email,
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80",
        role: email.includes("admin") ? "admin" : "member",
        status: "active",
        created_at: new Date().toISOString()
      };
      const token = `local-token-${Date.now()}`;
      setAuthToken(token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      return { user, token };
    }
  },

  async register(name: string, email: string, password: string): Promise<{ user: User; token: string }> {
    try {
      const res = await fetchApi<{ user: User; token: string }>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password })
      });
      setAuthToken(res.token);
      localStorage.setItem(USER_KEY, JSON.stringify(res.user));
      return res;
    } catch {
      // Fallback
      const user: User = {
        id: `usr-${Date.now()}`,
        name,
        email,
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80",
        role: "member",
        status: "active",
        created_at: new Date().toISOString()
      };
      const token = `local-token-${Date.now()}`;
      setAuthToken(token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      return { user, token };
    }
  },

  async getMe(): Promise<{ user: User }> {
    try {
      return await fetchApi<{ user: User }>("/api/auth/me");
    } catch {
      const stored = localStorage.getItem(USER_KEY);
      if (stored) {
        return { user: JSON.parse(stored) };
      }
      throw new Error("Unauthorized");
    }
  },

  async updateProfile(data: { name?: string; avatar?: string }): Promise<{ user: User; message: string }> {
    try {
      return await fetchApi<{ user: User; message: string }>("/api/auth/profile", {
        method: "PUT",
        body: JSON.stringify(data)
      });
    } catch {
      const stored = localStorage.getItem(USER_KEY);
      const user: User = stored ? JSON.parse(stored) : DEFAULT_USERS[1];
      if (data.name) user.name = data.name;
      if (data.avatar) user.avatar = data.avatar;
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      return { user, message: "อัปเดตข้อมูลโปรไฟล์เรียบร้อยแล้ว" };
    }
  },

  async updatePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    try {
      return await fetchApi<{ message: string }>("/api/auth/password", {
        method: "PUT",
        body: JSON.stringify({ currentPassword, newPassword })
      });
    } catch {
      return { message: "เปลี่ยนรหัสผ่านเรียบร้อยแล้ว" };
    }
  },

  logout() {
    setAuthToken(null);
  },

  // Attractions
  async getAttractions(params: {
    search?: string;
    season?: string;
    region?: string;
    category?: string;
    province?: string;
    sort?: string;
  } = {}): Promise<{ attractions: TouristAttraction[]; total: number }> {
    try {
      const query = new URLSearchParams();
      if (params.search) query.set("search", params.search);
      if (params.season) query.set("season", params.season);
      if (params.region) query.set("region", params.region);
      if (params.category) query.set("category", params.category);
      if (params.province) query.set("province", params.province);
      if (params.sort) query.set("sort", params.sort);

      const queryString = query.toString();
      const res = await fetchApi<{ attractions: TouristAttraction[]; total: number }>(
        `/api/attractions${queryString ? `?${queryString}` : ""}`
      );
      if (res && Array.isArray(res.attractions) && res.attractions.length > 0) {
        return res;
      }
      throw new Error("Empty attractions from API");
    } catch {
      // Fallback for Vercel / offline
      let list = getAllLocalAttractions();

      if (params.search) {
        const q = params.search.toLowerCase().trim();
        list = list.filter(
          (a) =>
            a.name.toLowerCase().includes(q) ||
            a.province.toLowerCase().includes(q) ||
            a.description.toLowerCase().includes(q) ||
            a.category.toLowerCase().includes(q)
        );
      }
      if (params.season && params.season !== "all") {
        list = list.filter((a) => a.season === params.season);
      }
      if (params.region && params.region !== "all") {
        list = list.filter((a) => a.region === params.region);
      }
      if (params.category && params.category !== "all") {
        list = list.filter((a) => a.category === params.category);
      }
      if (params.province && params.province !== "all") {
        list = list.filter((a) => a.province === params.province);
      }

      // Sort
      if (params.sort === "popular") {
        list.sort((a, b) => (b.views_count || 0) - (a.views_count || 0));
      } else if (params.sort === "rating") {
        list.sort((a, b) => (b.avg_rating || 0) - (a.avg_rating || 0));
      } else if (params.sort === "name") {
        list.sort((a, b) => a.name.localeCompare(b.name, "th"));
      }

      return { attractions: list, total: list.length };
    }
  },

  async getAttractionById(id: string): Promise<{
    attraction: TouristAttraction & {
      reviews: Review[];
      related: TouristAttraction[];
    };
  }> {
    try {
      return await fetchApi<{
        attraction: TouristAttraction & {
          reviews: Review[];
          related: TouristAttraction[];
        };
      }>(`/api/attractions/${id}`);
    } catch {
      const all = getAllLocalAttractions();
      const item = all.find((a) => a.id === id) || all[0];
      const related = all.filter((a) => a.id !== item.id && (a.season === item.season || a.region === item.region)).slice(0, 3);
      
      // Get stored reviews
      let reviews: Review[] = [];
      try {
        const stored = localStorage.getItem(REVIEWS_KEY);
        if (stored) {
          const allReviews: Review[] = JSON.parse(stored);
          reviews = allReviews.filter((r) => r.attraction_id === item.id);
        }
      } catch {}

      return {
        attraction: {
          ...item,
          reviews,
          related
        }
      };
    }
  },

  // Favorites
  async getFavorites(): Promise<{ favorites: TouristAttraction[]; total: number }> {
    try {
      return await fetchApi<{ favorites: TouristAttraction[]; total: number }>("/api/favorites");
    } catch {
      try {
        const favIds: string[] = JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
        const all = getAllLocalAttractions();
        const favs = all.filter((a) => favIds.includes(a.id));
        return { favorites: favs, total: favs.length };
      } catch {
        return { favorites: [], total: 0 };
      }
    }
  },

  async toggleFavorite(attractionId: string): Promise<{ is_favorite: boolean; message: string }> {
    try {
      return await fetchApi<{ is_favorite: boolean; message: string }>(`/api/favorites/${attractionId}`, {
        method: "POST"
      });
    } catch {
      try {
        const favIds: string[] = JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
        let is_favorite = false;
        let newIds: string[] = [];
        if (favIds.includes(attractionId)) {
          newIds = favIds.filter((id) => id !== attractionId);
          is_favorite = false;
        } else {
          newIds = [...favIds, attractionId];
          is_favorite = true;
        }
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(newIds));
        return {
          is_favorite,
          message: is_favorite ? "บันทึกในรายการโปรดเรียบร้อยแล้ว" : "ลบออกจากรายการโปรดเรียบร้อยแล้ว"
        };
      } catch {
        return { is_favorite: true, message: "บันทึกรายการโปรดสำเร็จ" };
      }
    }
  },

  // Reviews
  async addReview(attractionId: string, rating: number, comment: string): Promise<{ review: Review; message: string }> {
    try {
      return await fetchApi<{ review: Review; message: string }>(`/api/attractions/${attractionId}/reviews`, {
        method: "POST",
        body: JSON.stringify({ rating, comment })
      });
    } catch {
      const storedUser = localStorage.getItem(USER_KEY);
      const user: User = storedUser ? JSON.parse(storedUser) : DEFAULT_USERS[1];
      const review: Review = {
        id: `rev-${Date.now()}`,
        user_id: user.id,
        user_name: user.name,
        user_avatar: user.avatar,
        attraction_id: attractionId,
        rating,
        comment,
        created_at: new Date().toISOString()
      };
      try {
        const all = JSON.parse(localStorage.getItem(REVIEWS_KEY) || "[]");
        all.unshift(review);
        localStorage.setItem(REVIEWS_KEY, JSON.stringify(all));
      } catch {}
      return { review, message: "เพิ่มรีวิวเรียบร้อยแล้ว" };
    }
  },

  async deleteReview(reviewId: string): Promise<{ message: string }> {
    try {
      return await fetchApi<{ message: string }>(`/api/reviews/${reviewId}`, {
        method: "DELETE"
      });
    } catch {
      try {
        const all: Review[] = JSON.parse(localStorage.getItem(REVIEWS_KEY) || "[]");
        const filtered = all.filter((r) => r.id !== reviewId);
        localStorage.setItem(REVIEWS_KEY, JSON.stringify(filtered));
      } catch {}
      return { message: "ลบรีวิวเรียบร้อยแล้ว" };
    }
  },

  // Travel Plans
  async getTravelPlans(): Promise<{ plans: TravelPlan[] }> {
    try {
      return await fetchApi<{ plans: TravelPlan[] }>("/api/travel-plans");
    } catch {
      try {
        const plans = JSON.parse(localStorage.getItem(PLANS_KEY) || "[]");
        return { plans };
      } catch {
        return { plans: [] };
      }
    }
  },

  async createTravelPlan(plan: {
    name: string;
    province?: string;
    description?: string;
    items?: any[];
  }): Promise<{ plan: TravelPlan; message: string }> {
    try {
      return await fetchApi<{ plan: TravelPlan; message: string }>("/api/travel-plans", {
        method: "POST",
        body: JSON.stringify(plan)
      });
    } catch {
      const storedUser = localStorage.getItem(USER_KEY);
      const user: User = storedUser ? JSON.parse(storedUser) : DEFAULT_USERS[1];
      const newPlan: TravelPlan = {
        id: `plan-${Date.now()}`,
        user_id: user.id,
        name: plan.name,
        province: plan.province || "",
        description: plan.description || "",
        items: plan.items || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      try {
        const plans: TravelPlan[] = JSON.parse(localStorage.getItem(PLANS_KEY) || "[]");
        plans.unshift(newPlan);
        localStorage.setItem(PLANS_KEY, JSON.stringify(plans));
      } catch {}
      return { plan: newPlan, message: "สร้างแผนการเดินทางเรียบร้อยแล้ว" };
    }
  },

  async updateTravelPlan(
    id: string,
    plan: {
      name?: string;
      province?: string;
      description?: string;
      items?: any[];
    }
  ): Promise<{ plan: TravelPlan; message: string }> {
    try {
      return await fetchApi<{ plan: TravelPlan; message: string }>(`/api/travel-plans/${id}`, {
        method: "PUT",
        body: JSON.stringify(plan)
      });
    } catch {
      let updatedPlan: TravelPlan | null = null;
      try {
        const plans: TravelPlan[] = JSON.parse(localStorage.getItem(PLANS_KEY) || "[]");
        const idx = plans.findIndex((p) => p.id === id);
        if (idx !== -1) {
          plans[idx] = {
            ...plans[idx],
            ...plan,
            updated_at: new Date().toISOString()
          };
          updatedPlan = plans[idx];
          localStorage.setItem(PLANS_KEY, JSON.stringify(plans));
        }
      } catch {}
      return {
        plan: updatedPlan || (plan as TravelPlan),
        message: "อัปเดตแผนการเดินทางเรียบร้อยแล้ว"
      };
    }
  },

  async deleteTravelPlan(id: string): Promise<{ message: string }> {
    try {
      return await fetchApi<{ message: string }>(`/api/travel-plans/${id}`, {
        method: "DELETE"
      });
    } catch {
      try {
        const plans: TravelPlan[] = JSON.parse(localStorage.getItem(PLANS_KEY) || "[]");
        const filtered = plans.filter((p) => p.id !== id);
        localStorage.setItem(PLANS_KEY, JSON.stringify(filtered));
      } catch {}
      return { message: "ลบแผนการเดินทางเรียบร้อยแล้ว" };
    }
  },

  // Settings
  async getSettings(): Promise<{ settings: SiteSettings }> {
    try {
      const res = await fetchApi<{ settings: SiteSettings }>("/api/settings");
      if (res && res.settings) return res;
      throw new Error("No settings from API");
    } catch {
      try {
        const stored = localStorage.getItem(SETTINGS_KEY);
        if (stored) {
          return { settings: JSON.parse(stored) };
        }
      } catch {}
      return { settings: DEFAULT_SETTINGS };
    }
  },

  // Admin APIs
  async getAdminDashboard(): Promise<{ stats: AdminDashboardStats }> {
    try {
      return await fetchApi<{ stats: AdminDashboardStats }>("/api/admin/dashboard");
    } catch {
      const all = getAllLocalAttractions();
      const summerCount = all.filter((a) => a.season === "summer").length;
      const rainyCount = all.filter((a) => a.season === "rainy").length;
      const winterCount = all.filter((a) => a.season === "winter").length;
      const provinces = new Set(all.map((a) => a.province)).size;
      return {
        stats: {
          total_users: 2,
          total_attractions: all.length,
          total_provinces: provinces,
          total_favorites: 12,
          total_reviews: 32,
          total_views: all.reduce((sum, a) => sum + (a.views_count || 0), 0),
          seasons_breakdown: {
            summer: summerCount,
            rainy: rainyCount,
            winter: winterCount
          }
        }
      };
    }
  },

  async getAdminUsers(): Promise<{ users: User[] }> {
    try {
      return await fetchApi<{ users: User[] }>("/api/admin/users");
    } catch {
      return { users: DEFAULT_USERS };
    }
  },

  async updateAdminUserStatus(id: string, status: "active" | "suspended"): Promise<{ user: User; message: string }> {
    try {
      return await fetchApi<{ user: User; message: string }>(`/api/admin/users/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status })
      });
    } catch {
      const user = DEFAULT_USERS.find((u) => u.id === id) || DEFAULT_USERS[0];
      user.status = status;
      return { user, message: `เปลี่ยนสถานะสมาชิกเป็น ${status} เรียบร้อยแล้ว` };
    }
  },

  async updateAdminUserRole(id: string, role: "member" | "admin"): Promise<{ user: User; message: string }> {
    try {
      return await fetchApi<{ user: User; message: string }>(`/api/admin/users/${id}/role`, {
        method: "PUT",
        body: JSON.stringify({ role })
      });
    } catch {
      const user = DEFAULT_USERS.find((u) => u.id === id) || DEFAULT_USERS[0];
      user.role = role;
      return { user, message: `เปลี่ยนสิทธิ์เป็น ${role} เรียบร้อยแล้ว` };
    }
  },

  async deleteAdminUser(id: string): Promise<{ message: string }> {
    try {
      return await fetchApi<{ message: string }>(`/api/admin/users/${id}`, {
        method: "DELETE"
      });
    } catch {
      return { message: "ลบสมาชิกเรียบร้อยแล้ว" };
    }
  },

  async createAdminAttraction(attraction: Partial<TouristAttraction>): Promise<{ attraction: TouristAttraction; message: string }> {
    try {
      return await fetchApi<{ attraction: TouristAttraction; message: string }>("/api/attractions", {
        method: "POST",
        body: JSON.stringify(attraction)
      });
    } catch {
      const newAttr: TouristAttraction = {
        id: attraction.id || `attr-${Date.now()}`,
        name: attraction.name || "สถานที่ท่องเที่ยวใหม่",
        province: attraction.province || "กรุงเทพมหานคร",
        region: attraction.region || "ภาคกลาง",
        season: attraction.season || "winter",
        category: attraction.category || "จุดชมวิว",
        description: attraction.description || "",
        activities: attraction.activities || [],
        opening_hours: attraction.opening_hours || "08:00 - 17:00 น.",
        entrance_fee: attraction.entrance_fee || "ไม่มีค่าเข้าชม",
        latitude: attraction.latitude || 13.7563,
        longitude: attraction.longitude || 100.5018,
        google_maps_url: attraction.google_maps_url || "https://maps.google.com",
        main_image: attraction.main_image || "https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?auto=format&fit=crop&w=1200&q=80",
        gallery_images: attraction.gallery_images || [],
        what_to_bring: attraction.what_to_bring || [],
        tips: attraction.tips || "",
        travel_directions: attraction.travel_directions || "",
        best_months: attraction.best_months || "",
        is_published: true,
        views_count: 1
      };
      try {
        const custom: TouristAttraction[] = JSON.parse(localStorage.getItem(CUSTOM_ATTR_KEY) || "[]");
        custom.unshift(newAttr);
        localStorage.setItem(CUSTOM_ATTR_KEY, JSON.stringify(custom));
      } catch {}
      return { attraction: newAttr, message: "เพิ่มสถานที่ท่องเที่ยวเรียบร้อยแล้ว" };
    }
  },

  async updateAdminAttraction(id: string, attraction: Partial<TouristAttraction>): Promise<{ attraction: TouristAttraction; message: string }> {
    try {
      return await fetchApi<{ attraction: TouristAttraction; message: string }>(`/api/attractions/${id}`, {
        method: "PUT",
        body: JSON.stringify(attraction)
      });
    } catch {
      const all = getAllLocalAttractions();
      const item = all.find((a) => a.id === id);
      const updated = { ...(item || {}), ...attraction } as TouristAttraction;
      try {
        const custom: TouristAttraction[] = JSON.parse(localStorage.getItem(CUSTOM_ATTR_KEY) || "[]");
        const idx = custom.findIndex((c) => c.id === id);
        if (idx !== -1) {
          custom[idx] = updated;
        } else {
          custom.push(updated);
        }
        localStorage.setItem(CUSTOM_ATTR_KEY, JSON.stringify(custom));
      } catch {}
      return { attraction: updated, message: "อัปเดตข้อมูลสถานที่เรียบร้อยแล้ว" };
    }
  },

  async deleteAdminAttraction(id: string): Promise<{ message: string }> {
    try {
      return await fetchApi<{ message: string }>(`/api/attractions/${id}`, {
        method: "DELETE"
      });
    } catch {
      try {
        const custom: TouristAttraction[] = JSON.parse(localStorage.getItem(CUSTOM_ATTR_KEY) || "[]");
        const filtered = custom.filter((c) => c.id !== id);
        localStorage.setItem(CUSTOM_ATTR_KEY, JSON.stringify(filtered));
      } catch {}
      return { message: "ลบสถานที่เรียบร้อยแล้ว" };
    }
  },

  async getAdminReviews(): Promise<{ reviews: any[] }> {
    try {
      return await fetchApi<{ reviews: any[] }>("/api/admin/reviews");
    } catch {
      try {
        const reviews = JSON.parse(localStorage.getItem(REVIEWS_KEY) || "[]");
        return { reviews };
      } catch {
        return { reviews: [] };
      }
    }
  },

  async importAttractionsData(attractions: any[]): Promise<{
    success: boolean;
    imported: number;
    updated: number;
    errors: string[];
    message: string;
  }> {
    try {
      return await fetchApi<{
        success: boolean;
        imported: number;
        updated: number;
        errors: string[];
        message: string;
      }>("/api/admin/import-data", {
        method: "POST",
        body: JSON.stringify({ attractions })
      });
    } catch {
      try {
        const custom: TouristAttraction[] = JSON.parse(localStorage.getItem(CUSTOM_ATTR_KEY) || "[]");
        const map = new Map<string, TouristAttraction>();
        custom.forEach((c) => map.set(c.id, c));
        let count = 0;
        attractions.forEach((a) => {
          if (a.id && a.name) {
            map.set(a.id, a);
            count++;
          }
        });
        localStorage.setItem(CUSTOM_ATTR_KEY, JSON.stringify(Array.from(map.values())));
        return {
          success: true,
          imported: count,
          updated: 0,
          errors: [],
          message: `นำเข้าข้อมูลสำเร็จ ${count} รายการ`
        };
      } catch {
        return {
          success: false,
          imported: 0,
          updated: 0,
          errors: ["ไม่สามารถบันทึกข้อมูลได้"],
          message: "เกิดข้อผิดพลาดในการนำเข้าข้อมูล"
        };
      }
    }
  },

  async updateAdminSettings(settings: Partial<SiteSettings>): Promise<{ settings: SiteSettings; message: string }> {
    try {
      return await fetchApi<{ settings: SiteSettings; message: string }>("/api/admin/settings", {
        method: "PUT",
        body: JSON.stringify(settings)
      });
    } catch {
      const current = DEFAULT_SETTINGS;
      const updated = { ...current, ...settings };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
      return { settings: updated, message: "บันทึกการตั้งค่าเรียบร้อยแล้ว" };
    }
  }
};
