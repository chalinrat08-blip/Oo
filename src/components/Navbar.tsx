import React from "react";
import { Compass, Heart, MapPin, Calendar, Search, User as UserIcon, ShieldAlert, LogOut, Sparkles } from "lucide-react";
import { User, SiteSettings } from "../types";

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentUser: User | null;
  favoritesCount: number;
  onOpenAuth: () => void;
  onLogout: () => void;
  settings?: SiteSettings;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  currentUser,
  favoritesCount,
  onOpenAuth,
  onLogout,
  settings
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs">
      {settings?.announcement && (
        <div className="bg-emerald-800 text-white text-xs py-1.5 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
          <span>{settings.announcement}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <button
            id="brand-logo-btn"
            onClick={() => setCurrentTab("home")}
            className="flex items-center gap-2.5 text-left group focus:outline-hidden"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform">
              <Compass className="w-5 h-5 animate-[spin_10s_linear_infinite]" />
            </div>
            <div>
              <span className="text-xl font-bold font-['Kanit',sans-serif] tracking-tight bg-gradient-to-r from-emerald-800 via-teal-700 to-emerald-900 bg-clip-text text-transparent">
                {settings?.site_name || "เที่ยวไทยตามฤดู"}
              </span>
              <span className="block text-[11px] text-stone-500 font-medium -mt-0.5">
                Thai Seasonal Travel
              </span>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              id="nav-home-btn"
              onClick={() => setCurrentTab("home")}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentTab === "home"
                  ? "bg-emerald-50 text-emerald-700 font-semibold"
                  : "text-stone-600 hover:text-emerald-700 hover:bg-stone-50"
              }`}
            >
              หน้าแรก
            </button>

            <button
              id="nav-search-btn"
              onClick={() => setCurrentTab("search")}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentTab === "search"
                  ? "bg-emerald-50 text-emerald-700 font-semibold"
                  : "text-stone-600 hover:text-emerald-700 hover:bg-stone-50"
              }`}
            >
              <Search className="w-4 h-4" />
              ค้นหาที่เที่ยว
            </button>

            <button
              id="nav-seasons-btn"
              onClick={() => setCurrentTab("seasons")}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentTab === "seasons"
                  ? "bg-emerald-50 text-emerald-700 font-semibold"
                  : "text-stone-600 hover:text-emerald-700 hover:bg-stone-50"
              }`}
            >
              <Calendar className="w-4 h-4" />
              เที่ยวตามฤดูกาล
            </button>

            <button
              id="nav-planner-btn"
              onClick={() => setCurrentTab("planner")}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentTab === "planner"
                  ? "bg-emerald-50 text-emerald-700 font-semibold"
                  : "text-stone-600 hover:text-emerald-700 hover:bg-stone-50"
              }`}
            >
              <MapPin className="w-4 h-4" />
              วางแผนเที่ยว
            </button>

            <button
              id="nav-favorites-btn"
              onClick={() => setCurrentTab("favorites")}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 relative ${
                currentTab === "favorites"
                  ? "bg-emerald-50 text-emerald-700 font-semibold"
                  : "text-stone-600 hover:text-emerald-700 hover:bg-stone-50"
              }`}
            >
              <Heart className={`w-4 h-4 ${favoritesCount > 0 ? "text-rose-500 fill-rose-500" : ""}`} />
              รายการโปรด
              {favoritesCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[10px] font-bold">
                  {favoritesCount}
                </span>
              )}
            </button>
          </nav>

          {/* Right Action: Auth & Admin */}
          <div className="flex items-center gap-3">
            <button
              id="nav-admin-btn"
              onClick={() => setCurrentTab("admin")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                currentTab === "admin"
                  ? "bg-stone-900 text-amber-300 border-stone-900 shadow-xs"
                  : "bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100"
              }`}
              title="เปิดระบบจัดการหลังบ้านและแดชบอร์ด"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
              <span>แดชบอร์ด (Dashboard)</span>
            </button>

            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  id="nav-user-profile-btn"
                  onClick={() => setCurrentTab("profile")}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-stone-100 border border-stone-200/80 transition-colors focus:outline-hidden"
                  title="โปรไฟล์ของฉัน"
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-lg object-cover bg-emerald-100 border border-emerald-200"
                    referrerPolicy="no-referrer"
                  />
                  <div className="text-left hidden lg:block pr-1">
                    <p className="text-xs font-semibold text-stone-800 line-clamp-1">{currentUser.name}</p>
                    <p className="text-[10px] text-stone-500 capitalize">{currentUser.role}</p>
                  </div>
                </button>
                <button
                  id="nav-logout-btn"
                  onClick={onLogout}
                  className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="ออกจากระบบ"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                id="nav-login-modal-btn"
                onClick={onOpenAuth}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm hover:shadow transition-all"
              >
                <UserIcon className="w-4 h-4" />
                <span>เข้าสู่ระบบ / สมาชิก</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
