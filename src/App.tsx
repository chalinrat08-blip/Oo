import React, { useState, useEffect, useCallback } from "react";
import { TouristAttraction, User, SiteSettings, Season } from "./types";
import { api, getAuthToken } from "./services/api";
import { INITIAL_ATTRACTIONS } from "./data/initialAttractions";
import { Navbar } from "./components/Navbar";
import { BottomNav } from "./components/BottomNav";
import { HomeView } from "./components/HomeView";
import { SearchView } from "./components/SearchView";
import { SeasonalView } from "./components/SeasonalView";
import { TravelPlannerView } from "./components/TravelPlannerView";
import { FavoritesView } from "./components/FavoritesView";
import { ProfileView } from "./components/ProfileView";
import { AdminPanel } from "./components/AdminPanel";
import { AttractionDetailModal } from "./components/AttractionDetailModal";
import { AuthModal } from "./components/AuthModal";
import { Footer } from "./components/Footer";

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>("home");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [attractions, setAttractions] = useState<TouristAttraction[]>(INITIAL_ATTRACTIONS);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [favoritesList, setFavoritesList] = useState<TouristAttraction[]>([]);
  const [settings, setSettings] = useState<SiteSettings | undefined>(undefined);
  const [plansCount, setPlansCount] = useState<number>(0);

  // Search parameters when navigated from hero or popular provinces
  const [searchParams, setSearchParams] = useState<{
    query?: string;
    province?: string;
    season?: string;
  }>({});

  // Seasonal view initial season
  const [seasonalViewSeason, setSeasonalViewSeason] = useState<Season>("winter");

  // Detail Modal
  const [detailAttractionId, setDetailAttractionId] = useState<string | null>(null);

  // Auth Modal
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Loading state
  const [initialLoading, setInitialLoading] = useState(true);

  // Load all initial data
  const loadInitialData = useCallback(async () => {
    try {
      // 1. Fetch site settings
      const settingsRes = await api.getSettings().catch(() => ({ settings: undefined }));
      if (settingsRes?.settings) {
        setSettings(settingsRes.settings);
      }

      // 2. Fetch all attractions
      try {
        const attrRes = await api.getAttractions();
        if (attrRes && Array.isArray(attrRes.attractions) && attrRes.attractions.length > 0) {
          setAttractions(attrRes.attractions);
        } else {
          setAttractions(INITIAL_ATTRACTIONS);
        }
      } catch (err) {
        console.warn("Could not fetch attractions from API, using bundled fallback:", err);
        setAttractions(INITIAL_ATTRACTIONS);
      }

      // 3. Fetch user if token exists
      const token = getAuthToken();
      if (token) {
        try {
          const meRes = await api.getMe();
          setCurrentUser(meRes.user);

          // Fetch user favorites
          const favRes = await api.getFavorites();
          const favs = favRes.favorites || [];
          setFavoritesList(favs);
          setFavoriteIds(new Set(favs.map((f) => f.id)));

          // Fetch travel plans count
          const planRes = await api.getTravelPlans();
          setPlansCount(planRes.plans?.length || 0);
        } catch {
          // Token invalid or expired
          api.logout();
          setCurrentUser(null);
          setFavoriteIds(new Set());
          setFavoritesList([]);
        }
      }
    } catch (err) {
      console.error("Initial data loading error:", err);
    } finally {
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Scroll to top on tab change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentTab]);

  // Favorite toggle handler
  const handleToggleFavorite = async (attractionId: string): Promise<boolean> => {
    if (!currentUser) {
      setAuthModalOpen(true);
      return false;
    }

    try {
      const res = await api.toggleFavorite(attractionId);
      const newIds = new Set(favoriteIds);
      if (res.is_favorite) {
        newIds.add(attractionId);
        const added = attractions.find((a) => a.id === attractionId);
        if (added && !favoritesList.some((f) => f.id === attractionId)) {
          setFavoritesList([added, ...favoritesList]);
        }
      } else {
        newIds.delete(attractionId);
        setFavoritesList(favoritesList.filter((f) => f.id !== attractionId));
      }
      setFavoriteIds(newIds);
      return res.is_favorite;
    } catch (err: any) {
      alert(err.message || "ไม่สามารถบันทึกรายการโปรดได้");
      return favoriteIds.has(attractionId);
    }
  };

  // Logout handler
  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    setFavoriteIds(new Set());
    setFavoritesList([]);
    setPlansCount(0);
    if (currentTab === "admin" || currentTab === "profile") {
      setCurrentTab("home");
    }
  };

  // Navigate to Season
  const handleNavigateToSeason = (season: Season) => {
    setSeasonalViewSeason(season);
    setCurrentTab("seasons");
  };

  // Navigate to Search with filters
  const handleNavigateToSearch = (options?: { query?: string; province?: string; season?: string }) => {
    if (options) {
      setSearchParams(options);
    } else {
      setSearchParams({});
    }
    setCurrentTab("search");
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-xl font-bold font-['Kanit',sans-serif] text-stone-900">
          เที่ยวไทยตามฤดู
        </h2>
        <p className="text-xs text-stone-500 mt-1">กำลังโหลดข้อมูลระบบและสถานที่ท่องเที่ยว...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-['Prompt',sans-serif]">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentUser={currentUser}
        favoritesCount={favoriteIds.size}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
        settings={settings}
      />

      {/* Main Content View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {currentTab === "home" && (
          <HomeView
            attractions={attractions}
            onSelectAttraction={(attr) => setDetailAttractionId(attr.id)}
            onToggleFavorite={handleToggleFavorite}
            favoriteIds={favoriteIds}
            onNavigateToSeason={handleNavigateToSeason}
            onNavigateToSearch={handleNavigateToSearch}
            onNavigateToPlanner={() => setCurrentTab("planner")}
            settings={settings}
          />
        )}

        {currentTab === "search" && (
          <SearchView
            attractions={attractions}
            onSelectAttraction={(attr) => setDetailAttractionId(attr.id)}
            onToggleFavorite={handleToggleFavorite}
            favoriteIds={favoriteIds}
            initialQuery={searchParams.query || ""}
            initialProvince={searchParams.province || "all"}
            initialSeason={searchParams.season || "all"}
          />
        )}

        {currentTab === "seasons" && (
          <SeasonalView
            initialSeason={seasonalViewSeason}
            attractions={attractions}
            onSelectAttraction={(attr) => setDetailAttractionId(attr.id)}
            onToggleFavorite={handleToggleFavorite}
            favoriteIds={favoriteIds}
          />
        )}

        {currentTab === "planner" && (
          <TravelPlannerView
            currentUser={currentUser}
            onOpenAuth={() => setAuthModalOpen(true)}
            attractions={attractions}
            onSelectAttraction={(attr) => setDetailAttractionId(attr.id)}
          />
        )}

        {currentTab === "favorites" && (
          <FavoritesView
            currentUser={currentUser}
            onOpenAuth={() => setAuthModalOpen(true)}
            favorites={favoritesList}
            onSelectAttraction={(attr) => setDetailAttractionId(attr.id)}
            onToggleFavorite={handleToggleFavorite}
            favoriteIds={favoriteIds}
            onExplore={() => setCurrentTab("search")}
          />
        )}

        {currentTab === "profile" && currentUser && (
          <ProfileView
            currentUser={currentUser}
            onUpdateUser={(updated) => setCurrentUser(updated)}
            favoritesCount={favoriteIds.size}
            plansCount={plansCount}
            onNavigateTab={(tab) => setCurrentTab(tab)}
          />
        )}

        {currentTab === "admin" && currentUser?.role === "admin" && (
          <AdminPanel
            currentUser={currentUser}
            onRefreshAllData={loadInitialData}
            siteSettings={settings}
          />
        )}

        {/* Access Denied Fallback for Admin */}
        {currentTab === "admin" && currentUser?.role !== "admin" && (
          <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 max-w-md mx-auto my-12">
            <h2 className="text-xl font-bold text-stone-900">สงวนสิทธิ์สำหรับผู้ดูแลระบบ</h2>
            <p className="text-xs text-stone-500 mt-2">
              คุณต้องเข้าสู่ระบบด้วยบัญชีผู้ดูแลระบบ (Admin) เพื่อเข้าถึงส่วนนี้
            </p>
            <button
              onClick={() => setAuthModalOpen(true)}
              className="mt-6 px-5 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-bold"
            >
              เข้าสู่ระบบ Admin
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer onNavigateTab={setCurrentTab} settings={settings} />

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentUser={currentUser}
        favoritesCount={favoriteIds.size}
        onOpenAuth={() => setAuthModalOpen(true)}
      />

      {/* Attraction Detail Modal */}
      {detailAttractionId && (
        <AttractionDetailModal
          attractionId={detailAttractionId}
          onClose={() => setDetailAttractionId(null)}
          currentUser={currentUser}
          onOpenAuth={() => setAuthModalOpen(true)}
          onToggleFavorite={handleToggleFavorite}
          onSelectRelated={(attr) => setDetailAttractionId(attr.id)}
        />
      )}

      {/* Authentication & Registration Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
          loadInitialData();
        }}
      />
    </div>
  );
}
