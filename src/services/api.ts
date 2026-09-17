/**
 * Client API Service connecting to the fullstack Express backend
 */

import { TouristAttraction, User, Review, TravelPlan, AdminDashboardStats, SiteSettings } from "../types";

const TOKEN_KEY = "thaitravel_token";

export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setAuthToken = (token: string | null) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
};

const authHeaders = () => {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export async function fetchApi<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    ...authHeaders(),
    ...(options.headers || {})
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

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
    const res = await fetchApi<{ user: User; token: string }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
    setAuthToken(res.token);
    return res;
  },

  async register(name: string, email: string, password: string): Promise<{ user: User; token: string }> {
    const res = await fetchApi<{ user: User; token: string }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password })
    });
    setAuthToken(res.token);
    return res;
  },

  async getMe(): Promise<{ user: User }> {
    return fetchApi<{ user: User }>("/api/auth/me");
  },

  async updateProfile(data: { name?: string; avatar?: string }): Promise<{ user: User; message: string }> {
    return fetchApi<{ user: User; message: string }>("/api/auth/profile", {
      method: "PUT",
      body: JSON.stringify(data)
    });
  },

  async updatePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    return fetchApi<{ message: string }>("/api/auth/password", {
      method: "PUT",
      body: JSON.stringify({ currentPassword, newPassword })
    });
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
    const query = new URLSearchParams();
    if (params.search) query.set("search", params.search);
    if (params.season) query.set("season", params.season);
    if (params.region) query.set("region", params.region);
    if (params.category) query.set("category", params.category);
    if (params.province) query.set("province", params.province);
    if (params.sort) query.set("sort", params.sort);

    const queryString = query.toString();
    return fetchApi<{ attractions: TouristAttraction[]; total: number }>(
      `/api/attractions${queryString ? `?${queryString}` : ""}`
    );
  },

  async getAttractionById(id: string): Promise<{
    attraction: TouristAttraction & {
      reviews: Review[];
      related: TouristAttraction[];
    };
  }> {
    return fetchApi<{
      attraction: TouristAttraction & {
        reviews: Review[];
        related: TouristAttraction[];
      };
    }>(`/api/attractions/${id}`);
  },

  // Favorites
  async getFavorites(): Promise<{ favorites: TouristAttraction[]; total: number }> {
    return fetchApi<{ favorites: TouristAttraction[]; total: number }>("/api/favorites");
  },

  async toggleFavorite(attractionId: string): Promise<{ is_favorite: boolean; message: string }> {
    return fetchApi<{ is_favorite: boolean; message: string }>(`/api/favorites/${attractionId}`, {
      method: "POST"
    });
  },

  // Reviews
  async addReview(attractionId: string, rating: number, comment: string): Promise<{ review: Review; message: string }> {
    return fetchApi<{ review: Review; message: string }>(`/api/attractions/${attractionId}/reviews`, {
      method: "POST",
      body: JSON.stringify({ rating, comment })
    });
  },

  async deleteReview(reviewId: string): Promise<{ message: string }> {
    return fetchApi<{ message: string }>(`/api/reviews/${reviewId}`, {
      method: "DELETE"
    });
  },

  // Travel Plans
  async getTravelPlans(): Promise<{ plans: TravelPlan[] }> {
    return fetchApi<{ plans: TravelPlan[] }>("/api/travel-plans");
  },

  async createTravelPlan(plan: {
    name: string;
    province?: string;
    description?: string;
    items?: any[];
  }): Promise<{ plan: TravelPlan; message: string }> {
    return fetchApi<{ plan: TravelPlan; message: string }>("/api/travel-plans", {
      method: "POST",
      body: JSON.stringify(plan)
    });
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
    return fetchApi<{ plan: TravelPlan; message: string }>(`/api/travel-plans/${id}`, {
      method: "PUT",
      body: JSON.stringify(plan)
    });
  },

  async deleteTravelPlan(id: string): Promise<{ message: string }> {
    return fetchApi<{ message: string }>(`/api/travel-plans/${id}`, {
      method: "DELETE"
    });
  },

  // Settings
  async getSettings(): Promise<{ settings: SiteSettings }> {
    return fetchApi<{ settings: SiteSettings }>("/api/settings");
  },

  // Admin APIs
  async getAdminDashboard(): Promise<{ stats: AdminDashboardStats }> {
    return fetchApi<{ stats: AdminDashboardStats }>("/api/admin/dashboard");
  },

  async getAdminUsers(): Promise<{ users: User[] }> {
    return fetchApi<{ users: User[] }>("/api/admin/users");
  },

  async updateAdminUserStatus(id: string, status: "active" | "suspended"): Promise<{ user: User; message: string }> {
    return fetchApi<{ user: User; message: string }>(`/api/admin/users/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status })
    });
  },

  async updateAdminUserRole(id: string, role: "member" | "admin"): Promise<{ user: User; message: string }> {
    return fetchApi<{ user: User; message: string }>(`/api/admin/users/${id}/role`, {
      method: "PUT",
      body: JSON.stringify({ role })
    });
  },

  async deleteAdminUser(id: string): Promise<{ message: string }> {
    return fetchApi<{ message: string }>(`/api/admin/users/${id}`, {
      method: "DELETE"
    });
  },

  async createAdminAttraction(attraction: Partial<TouristAttraction>): Promise<{ attraction: TouristAttraction; message: string }> {
    return fetchApi<{ attraction: TouristAttraction; message: string }>("/api/attractions", {
      method: "POST",
      body: JSON.stringify(attraction)
    });
  },

  async updateAdminAttraction(id: string, attraction: Partial<TouristAttraction>): Promise<{ attraction: TouristAttraction; message: string }> {
    return fetchApi<{ attraction: TouristAttraction; message: string }>(`/api/attractions/${id}`, {
      method: "PUT",
      body: JSON.stringify(attraction)
    });
  },

  async deleteAdminAttraction(id: string): Promise<{ message: string }> {
    return fetchApi<{ message: string }>(`/api/attractions/${id}`, {
      method: "DELETE"
    });
  },

  async getAdminReviews(): Promise<{ reviews: any[] }> {
    return fetchApi<{ reviews: any[] }>("/api/admin/reviews");
  },

  async importAttractionsData(attractions: any[]): Promise<{
    success: boolean;
    imported: number;
    updated: number;
    errors: string[];
    message: string;
  }> {
    return fetchApi<{
      success: boolean;
      imported: number;
      updated: number;
      errors: string[];
      message: string;
    }>("/api/admin/import-data", {
      method: "POST",
      body: JSON.stringify({ attractions })
    });
  },

  async updateAdminSettings(settings: Partial<SiteSettings>): Promise<{ settings: SiteSettings; message: string }> {
    return fetchApi<{ settings: SiteSettings; message: string }>("/api/admin/settings", {
      method: "PUT",
      body: JSON.stringify(settings)
    });
  }
};
